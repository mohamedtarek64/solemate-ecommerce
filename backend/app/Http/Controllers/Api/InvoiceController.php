<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class InvoiceController extends Controller
{
    /**
     * Create a new invoice
     */
    public function create(Request $request)
    {
        try {
            // Manual authentication check
            $token = $request->bearerToken();
            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication token required'
                ], 401);
            }

            // Manual token validation
            $user = null;
            try {
                $user = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
                if ($user) {
                    $user = $user->tokenable;
                }
            } catch (\Exception $e) {
                \Log::error('Token validation error: ' . $e->getMessage());
            }

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired token'
                ], 401);
            }

            // Validate request data
            $validator = Validator::make($request->all(), [
                'order_id' => 'required|exists:orders,id',
                'due_date' => 'nullable|date|after:today',
                'notes' => 'nullable|string|max:1000'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Get the order
            $order = Order::with('orderItems')->find($request->order_id);
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Check if invoice already exists for this order
            $existingInvoice = Invoice::where('order_id', $request->order_id)->first();
            if ($existingInvoice) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invoice already exists for this order',
                    'invoice_id' => $existingInvoice->id
                ], 409);
            }

            // Create invoice
                $invoice = Invoice::create([
                    'user_id' => $user->id,
                    'order_id' => $order->id,
                    'invoice_number' => 'INV-' . date('Y') . '-' . str_pad(Invoice::count() + 1, 6, '0', STR_PAD_LEFT),
                    'status' => 'draft',
                    'type' => 'sale',
                    'subtotal' => $order->total_amount,
                    'tax_amount' => 0,
                    'discount_amount' => 0,
                    'total_amount' => $order->total_amount,
                    'due_date' => $request->due_date ?? now()->addDays(30),
                    'notes' => $request->notes
                ]);

            // Create invoice items from order items
            foreach ($order->orderItems as $orderItem) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'product_name' => $orderItem->product_name,
                    'description' => $orderItem->description ?? '',
                    'quantity' => $orderItem->quantity,
                    'unit_price' => $orderItem->product_price,
                    'total_price' => $orderItem->subtotal
                ]);
            }

            // Load the created invoice with items
                $invoice->load('items');


            return response()->json([
                'success' => true,
                'message' => 'Invoice created successfully',
                'data' => $invoice
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Error creating invoice: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create invoice'
            ], 500);
        }
    }

    public function index(Request $request)
    {
        try {
            // Manual authentication check since routes don't use auth:sanctum middleware
            $token = $request->bearerToken();
            if (!$token) {
                \Log::error('No bearer token provided in invoices request');
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication token required'
                ], 401);
            }

            // Manual token validation since we don't use auth:sanctum middleware
            $user = null;
            try {
                $user = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
                if ($user) {
                    $user = $user->tokenable;
                }
            } catch (\Exception $e) {
                \Log::error('Token validation error: ' . $e->getMessage());
            }

            if (!$user) {
                \Log::error('Invalid or expired token for invoices request');
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired token'
                ], 401);
            }

            $userId = $user->id;
            $isAdmin = $user->role === 'admin' || $user->is_admin === true;
            \Log::info('User authenticated for invoices request: ' . $userId . ', isAdmin: ' . ($isAdmin ? 'true' : 'false'));
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 20);
            $status = $request->get('status');
            $type = $request->get('type');

            // Admin can see all invoices, regular users only see their own
            $query = Invoice::with(['items', 'order', 'user']);
            if (!$isAdmin) {
                $query->where('user_id', $userId);
            }

            if ($status) {
                $query->where('status', $status);
            }

            if ($type) {
                $query->ofType($type);
            }

            $invoices = $query->orderBy('created_at', 'desc')
                ->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data' => $invoices
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get invoices: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Request $request, $id)
    {
        try {
            // Manual authentication check since routes don't use auth:sanctum middleware
            $token = $request->bearerToken();
            if (!$token) {
                \Log::error('No bearer token provided in invoice show request');
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication token required'
                ], 401);
            }

            // Manual token validation since we don't use auth:sanctum middleware
            $user = null;
            try {
                $user = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
                if ($user) {
                    $user = $user->tokenable;
                }
            } catch (\Exception $e) {
                \Log::error('Token validation error in show: ' . $e->getMessage());
            }

            if (!$user) {
                \Log::error('Invalid or expired token for invoice show request');
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired token'
                ], 401);
            }

            $userId = $user->id;
            \Log::info('User authenticated for invoice show request: ' . $userId . ', Invoice ID: ' . $id);

            $invoice = Invoice::where('id', $id)
                ->where('user_id', $userId)
                ->with(['items', 'order'])
                ->first();

            \Log::info('Invoice query result:', [
                'invoice_id' => $id,
                'user_id' => $userId,
                'invoice_found' => $invoice ? 'yes' : 'no',
                'invoice_data' => $invoice
            ]);

            if (!$invoice) {
                \Log::error('Invoice not found for user: ' . $userId . ', Invoice ID: ' . $id);
                return response()->json([
                    'success' => false,
                    'message' => 'Invoice not found'
                ], 404);
            }

            \Log::info('Returning invoice data successfully');
            return response()->json([
                'success' => true,
                'data' => $invoice
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get invoice: ' . $e->getMessage()
            ], 500);
        }
    }

    public function createFromOrder(Request $request, $orderId)
    {
        try {
            // Manual authentication check
            $token = $request->bearerToken();
            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication token required'
                ], 401);
            }

            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $userId = $user->id;

            $order = Order::where('id', $orderId)
                ->where('user_id', $userId)
                ->with('orderItems')
                ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            $existingInvoice = Invoice::where('order_id', $orderId)->first();
            if ($existingInvoice) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invoice already exists for this order'
                ], 400);
            }

            $invoice = Invoice::createFromOrder($order);

            return response()->json([
                'success' => true,
                'data' => $invoice,
                'message' => 'Invoice created successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create invoice: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'type' => 'required|in:sale,return,partial,supplier,expense',
                'subtotal' => 'required|numeric|min:0',
                'tax_amount' => 'required|numeric|min:0',
                'discount_amount' => 'nullable|numeric|min:0',
                'total_amount' => 'required|numeric|min:0',
                'due_date' => 'nullable|date|after:today',
                'notes' => 'nullable|string',
                'items' => 'required|array|min:1',
                'items.*.product_name' => 'required|string',
                'items.*.description' => 'nullable|string',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.unit_price' => 'required|numeric|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Manual authentication check
            $token = $request->bearerToken();
            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication token required'
                ], 401);
            }

            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $userId = $user->id;

            $invoice = Invoice::create([
                'invoice_number' => Invoice::generateInvoiceNumber(),
                'user_id' => $userId,
                'type' => $request->type,
                'status' => 'draft',
                'subtotal' => $request->subtotal,
                'tax_amount' => $request->tax_amount,
                'discount_amount' => $request->discount_amount ?? 0,
                'total_amount' => $request->total_amount,
                'due_date' => $request->due_date,
                'notes' => $request->notes,
            ]);

            foreach ($request->items as $item) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'product_name' => $item['product_name'],
                    'description' => $item['description'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                ]);
            }

            $invoice->load('items');

            return response()->json([
                'success' => true,
                'data' => $invoice,
                'message' => 'Invoice created successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create invoice: ' . $e->getMessage()
            ], 500);
        }
    }

    public function markAsPaid(Request $request, $id)
    {
        try {
            // Manual authentication check using Sanctum
            $token = $request->bearerToken();
            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication token required'
                ], 401);
            }

            $user = null;
            try {
                $user = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
                if ($user) {
                    $user = $user->tokenable;
                }
            } catch (\Exception $e) {
                \Log::error('Token validation error in markAsPaid: ' . $e->getMessage());
            }

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired token'
                ], 401);
            }

            $userId = $user->id;

            $invoice = Invoice::where('id', $id)
                ->where('user_id', $userId)
                ->first();

            if (!$invoice) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invoice not found'
                ], 404);
            }

            $invoice->markAsPaid();

            return response()->json([
                'success' => true,
                'data' => $invoice,
                'message' => 'Invoice marked as paid'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark invoice as paid: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getStatistics(Request $request)
    {
        try {
            // Manual authentication check since routes don't use auth:sanctum middleware
            $token = $request->bearerToken();
            if (!$token) {
                \Log::error('No bearer token provided in invoice statistics request');
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication token required'
                ], 401);
            }

            // Manual token validation since we don't use auth:sanctum middleware
            $user = null;
            try {
                $user = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
                if ($user) {
                    $user = $user->tokenable;
                }
            } catch (\Exception $e) {
                \Log::error('Token validation error in statistics: ' . $e->getMessage());
            }

            if (!$user) {
                \Log::error('Invalid or expired token for invoice statistics request');
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired token'
                ], 401);
            }

            $userId = $user->id;
            \Log::info('User authenticated for invoice statistics request: ' . $userId);

            $stats = [
                'total_invoices' => Invoice::where('user_id', $userId)->count(),
                'paid_invoices' => Invoice::where('user_id', $userId)->paid()->count(),
                'unpaid_invoices' => Invoice::where('user_id', $userId)->unpaid()->count(),
                'overdue_invoices' => Invoice::where('user_id', $userId)->overdue()->count(),
                'total_amount' => Invoice::where('user_id', $userId)->sum('total_amount'),
                'paid_amount' => Invoice::where('user_id', $userId)->paid()->sum('total_amount'),
                'unpaid_amount' => Invoice::where('user_id', $userId)->unpaid()->sum('total_amount'),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get invoice statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            // Manual authentication check using Sanctum
            $token = $request->bearerToken();
            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication token required'
                ], 401);
            }

            $user = null;
            try {
                $user = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
                if ($user) {
                    $user = $user->tokenable;
                }
            } catch (\Exception $e) {
                \Log::error('Token validation error in destroy: ' . $e->getMessage());
            }

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired token'
                ], 401);
            }

            $userId = $user->id;

            $invoice = Invoice::where('id', $id)
                ->where('user_id', $userId)
                ->first();

            if (!$invoice) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invoice not found'
                ], 404);
            }

            // Delete associated invoice items first
            $invoice->items()->delete();

            // Delete the invoice
            $invoice->delete();

            return response()->json([
                'success' => true,
                'message' => 'Invoice deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete invoice: ' . $e->getMessage()
            ], 500);
        }
    }
}
