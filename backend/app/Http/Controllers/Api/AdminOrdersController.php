<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminOrdersController extends Controller
{
    public function index(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 15);
            $search = $request->get('search');
            $status = $request->get('status');
            $sort = $request->get('sort', 'created_at');
            $order = $request->get('order', 'desc');

            $query = DB::table('orders')
                ->join('users', 'orders.user_id', '=', 'users.id')
                ->select('orders.*', 'users.name as customer_name', 'users.email as customer_email');

            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('orders.order_number', 'like', "%{$search}%")
                      ->orWhere('users.name', 'like', "%{$search}%")
                      ->orWhere('users.email', 'like', "%{$search}%");
                });
            }

            if ($status) {
                $query->where('orders.status', $status);
            }

            $orders = $query->orderBy($sort, $order)
                ->paginate($perPage, ['*'], 'page', $page);

            // Add order items to each order
            foreach ($orders as $order) {
                $order->items = DB::table('order_items')
                    ->join('products', 'order_items.product_id', '=', 'products.id')
                    ->select('order_items.*', 'products.name as product_name', 'products.image_url')
                    ->where('order_items.order_id', $order->id)
                    ->get();
            }

            return response()->json([
                'success' => true,
                'data' => $orders
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get orders: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Request $request, $id)
    {
        try {
            $order = DB::table('orders')
                ->join('users', 'orders.user_id', '=', 'users.id')
                ->select('orders.*', 'users.name as customer_name', 'users.email as customer_email', 'users.phone as customer_phone')
                ->where('orders.id', $id)
                ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Get order items
            $order->items = DB::table('order_items')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->select('order_items.*', 'products.name as product_name', 'products.image_url', 'products.sku')
                ->where('order_items.order_id', $id)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $order
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get order: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'required|string|in:pending,processing,shipped,delivered,cancelled',
                'notes' => 'nullable|string|max:1000'
            ]);

            $updated = DB::table('orders')
                ->where('id', $id)
                ->update([
                    'status' => $request->status,
                    'notes' => $request->notes,
                    'updated_at' => now()
                ]);

            if ($updated) {
                return response()->json([
                    'success' => true,
                    'message' => 'Order updated successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            // First delete all order items
            $deletedItems = DB::table('order_items')
                ->where('order_id', $id)
                ->delete();

            // Then delete the order
            $deletedOrder = DB::table('orders')
                ->where('id', $id)
                ->delete();

            if ($deletedOrder) {
                DB::commit();
                return response()->json([
                    'success' => true,
                    'message' => 'Order deleted successfully'
                ]);
            } else {
                DB::rollback();
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete order: ' . $e->getMessage()
            ], 500);
        }
    }

    public function export(Request $request)
    {
        try {
            $format = $request->get('format', 'csv');
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');

            $query = DB::table('orders')
                ->join('users', 'orders.user_id', '=', 'users.id')
                ->select('orders.*', 'users.name as customer_name', 'users.email as customer_email');

            if ($startDate) {
                $query->where('orders.created_at', '>=', $startDate);
            }

            if ($endDate) {
                $query->where('orders.created_at', '<=', $endDate);
            }

            $orders = $query->orderBy('created_at', 'desc')->get();

            if ($format === 'csv') {
                $csv = "Order ID,Order Number,Customer Name,Customer Email,Total Amount,Status,Created At\n";
                
                foreach ($orders as $order) {
                    $csv .= "{$order->id},{$order->order_number},{$order->customer_name},{$order->customer_email},{$order->total_amount},{$order->status},{$order->created_at}\n";
                }

                return response($csv)
                    ->header('Content-Type', 'text/csv')
                    ->header('Content-Disposition', 'attachment; filename="orders.csv"');
            }

            return response()->json([
                'success' => true,
                'data' => $orders
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export orders: ' . $e->getMessage()
            ], 500);
        }
    }

    public function duplicate(Request $request, $id)
    {
        try {
            $originalOrder = DB::table('orders')->where('id', $id)->first();

            if (!$originalOrder) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Create new order
            $newOrderId = DB::table('orders')->insertGetId([
                'user_id' => $originalOrder->user_id,
                'order_number' => 'ORD-' . time(),
                'total_amount' => $originalOrder->total_amount,
                'status' => 'pending',
                'shipping_address' => $originalOrder->shipping_address,
                'billing_address' => $originalOrder->billing_address,
                'payment_method' => $originalOrder->payment_method,
                'payment_status' => 'pending',
                'notes' => 'Duplicated from order #' . $originalOrder->order_number,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Copy order items
            $orderItems = DB::table('order_items')->where('order_id', $id)->get();
            
            foreach ($orderItems as $item) {
                DB::table('order_items')->insert([
                    'order_id' => $newOrderId,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'subtotal' => $item->subtotal,
                    'metadata' => $item->metadata,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => ['new_order_id' => $newOrderId],
                'message' => 'Order duplicated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to duplicate order: ' . $e->getMessage()
            ], 500);
        }
    }

    public function exportOrder(Request $request, $id)
    {
        try {
            $order = DB::table('orders')
                ->join('users', 'orders.user_id', '=', 'users.id')
                ->select('orders.*', 'users.name as customer_name', 'users.email as customer_email')
                ->where('orders.id', $id)
                ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Get order items
            $order->items = DB::table('order_items')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->select('order_items.*', 'products.name as product_name')
                ->where('order_items.order_id', $id)
                ->get();

            $csv = "Order Details\n";
            $csv .= "Order ID: {$order->id}\n";
            $csv .= "Order Number: {$order->order_number}\n";
            $csv .= "Customer: {$order->customer_name}\n";
            $csv .= "Email: {$order->customer_email}\n";
            $csv .= "Total Amount: {$order->total_amount}\n";
            $csv .= "Status: {$order->status}\n";
            $csv .= "Created At: {$order->created_at}\n\n";
            $csv .= "Items:\n";
            $csv .= "Product Name,Quantity,Price,Subtotal\n";

            foreach ($order->items as $item) {
                $csv .= "{$item->product_name},{$item->quantity},{$item->price},{$item->subtotal}\n";
            }

            return response($csv)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', 'attachment; filename="order-' . $order->order_number . '.csv"');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export order: ' . $e->getMessage()
            ], 500);
        }
    }
}
