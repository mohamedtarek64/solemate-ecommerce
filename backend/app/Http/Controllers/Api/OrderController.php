<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseController;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;

class OrderController extends BaseController
{
    public function index(Request $request)
    {
        try {
            // Get the ACTUAL logged-in user using token validation
            $validation = $this->validateUserAndToken($request);
            if (!$validation['valid']) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'data' => [],
                        'total' => 0
                    ],
                    'message' => 'Please log in to view your orders'
                ]);
            }

            $userId = $validation['user_id'];
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 15);
            $status = $request->get('status');

            // Optimized query with selective fields
            $query = Order::with(['orderItems' => function($query) {
                    $query->select([
                        'id', 'order_id', 'product_id', 'product_name',
                        'product_image', 'quantity', 'size', 'color',
                        'price', 'product_price', 'subtotal'
                    ]);
                }])
                ->select([
                    'id', 'user_id', 'order_number', 'status', 'total_amount',
                    'shipping_address', 'payment_method', 'created_at', 'updated_at'
                ])
                ->where('user_id', $userId);

            if ($status) {
                $query->where('status', $status);
            }

            $orders = $query->orderBy('created_at', 'desc')
                ->paginate($perPage, ['*'], 'page', $page);

            // Add product images to order items if not present
            foreach ($orders as $order) {
                if ($order->orderItems) {
                    foreach ($order->orderItems as $item) {
                        // Product image is already stored in order_items table
                        // No need to fetch from products table
                    }
                }
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
            // Get the ACTUAL logged-in user using token validation
            $validation = $this->validateUserAndToken($request);
            if (!$validation['valid']) {
                return $validation['response'];
            }

            $userId = $validation['user_id'];

            $order = Order::with([
                'orderItems',
                'user:id,name,first_name,last_name,email,avatar,phone,role,address,created_at'
            ])
                ->where('id', $id)
                ->where('user_id', $userId)
                ->first();

            // Product image is already stored in order_items table
            // No need to fetch from products table

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

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

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'items' => 'required|array|min:1',
                'items.*.id' => 'required|integer|min:1',
                'items.*.name' => 'required|string',
                'items.*.price' => 'required|numeric|min:0',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.image' => 'nullable|string',
                'items.*.size' => 'nullable|string',
                'items.*.color' => 'nullable|string',
                'items.*.variant' => 'nullable|string',
                'shipping' => 'required|array',
                'shipping.firstName' => 'required|string',
                'shipping.lastName' => 'required|string',
                'shipping.address' => 'required|string',
                'shipping.city' => 'required|string',
                'shipping.state' => 'required|string',
                'shipping.zipCode' => 'required|string',
                'shipping.phone' => 'required|string',
                'shipping.email' => 'required|email',
                'shipping_method' => 'required|string',
                'subtotal' => 'required|numeric|min:0',
                'shipping_cost' => 'required|numeric|min:0',
                'tax' => 'required|numeric|min:0',
                'total' => 'required|numeric|min:0',
                'payment_method' => 'required|string',
                'stripe_payment_intent_id' => 'nullable|string',
                'stripe_charge_id' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Get the ACTUAL logged-in user using token validation
            $validation = $this->validateUserAndToken($request);
            if (!$validation['valid']) {
                return $validation['response'];
            }

            $userId = $validation['user_id'];

            DB::beginTransaction();

            try {
                // Generate unique order number
                $orderNumber = Order::generateOrderNumber();

                // Create order
                $order = Order::create([
                'user_id' => $userId,
                'order_number' => $orderNumber,
                'status' => 'pending',
                    'total_amount' => $request->total,
                    'subtotal' => $request->subtotal,
                    'shipping_cost' => $request->shipping_cost,
                    'tax_amount' => $request->tax,
                'payment_method' => $request->payment_method,
                'payment_status' => 'pending',
                    'shipping_method' => $request->shipping_method,
                    'customer_email' => $request->shipping['email'],
                    'customer_phone' => $request->shipping['phone'],
                    'stripe_payment_intent_id' => $request->stripe_payment_intent_id,
                    'stripe_charge_id' => $request->stripe_charge_id,
                    'shipping_address' => $request->shipping,
                    'billing_address' => $request->shipping, // Same as shipping for now
            ]);

            // Create order items
            foreach ($request->items as $item) {
                    \Log::info('Creating order item:', [
                        'item_data' => $item,
                        'product_id' => $item['id'] ?? 'NOT_SET'
                    ]);

                    // Store the product info - use the actual product_id from the request
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item['id'], // Use actual product ID from request
                        'product_name' => $item['name'],
                        'product_price' => $item['price'],
                        'product_image' => $item['image'] ?? null,
                        'quantity' => $item['quantity'],
                        'size' => $item['size'] ?? null,
                        'color' => $item['color'] ?? null,
                        'variant' => $item['variant'] ?? null,
                        'subtotal' => $item['price'] * $item['quantity'],
                        'price' => $item['price'],
                        'total' => $item['price'] * $item['quantity'],
                    ]);
                }

                // Create notification for order confirmation
                \App\Models\Notification::createOrderNotification(
                    $userId,
                    $order->order_number,
                    'pending'
                );

                DB::commit();


                return response()->json([
                    'success' => true,
                    'data' => [
                        'id' => $order->id,
                        'order_number' => $order->order_number,
                        'total_amount' => $order->total_amount,
                        'status' => $order->status
                    ],
                    'message' => 'Order created successfully'
                ]);

        } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }

        } catch (\Exception $e) {
            \Log::error('Failed to create order: ' . $e->getMessage(), ['exception' => $e, 'request' => $request->all(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage()
            ], 500);
        }
    }


    public function showByOrderNumber(Request $request, $orderNumber)
    {
        try {
            // Get the ACTUAL logged-in user using token validation
            $validation = $this->validateUserAndToken($request);
            if (!$validation['valid']) {
                return $validation['response'];
            }

            $userId = $validation['user_id'];

            $order = Order::with(['orderItems', 'user'])
                ->where('order_number', $orderNumber)
                ->where('user_id', $userId)
                ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

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

    public function cancel(Request $request, $id)
    {
        try {
            // Get the ACTUAL logged-in user using token validation
            $validation = $this->validateUserAndToken($request);
            if (!$validation['valid']) {
                // Fallback: try to get user_id from query parameter
                $userId = $request->input('user_id');
                if (!$userId) {
                    return $validation['response'];
                }
                \Log::info('Cancel order using fallback user_id: ' . $userId);
            } else {
                $userId = $validation['user_id'];
                \Log::info('Cancel order using token validation user_id: ' . $userId);
            }

            \Log::info('Looking for order to cancel:', ['order_id' => $id, 'user_id' => $userId]);

            $order = Order::where('id', $id)
                ->where('user_id', $userId)
                ->where('status', 'pending')
                ->first();

            if (!$order) {
                \Log::warning('Order not found for cancellation:', ['order_id' => $id, 'user_id' => $userId]);
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found or cannot be cancelled'
                ], 404);
            }

            \Log::info('Cancelling order:', ['order_id' => $order->id, 'order_number' => $order->order_number, 'user_id' => $userId]);
            $order->update(['status' => 'cancelled']);
            \Log::info('Order cancelled successfully:', ['order_id' => $order->id]);

            // Create notification for order cancellation
            \App\Models\Notification::createOrderNotification(
                $userId,
                $order->order_number,
                'cancelled'
            );

            return response()->json([
                'success' => true,
                'message' => 'Order cancelled successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel order: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        try {
            // Get the ACTUAL logged-in user
            if (!$request->user()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please log in to update order status'
                ], 401);
            }

            $userId = $request->user()->id;

            $validator = Validator::make($request->all(), [
                'status' => 'required|in:pending,confirmed,shipped,delivered,cancelled'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $order = Order::where('id', $id)
                ->where('user_id', $userId)
                ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            $oldStatus = $order->status;
            $newStatus = $request->status;

            $order->update(['status' => $newStatus]);

            // Create notification for status change
            \App\Models\Notification::createOrderNotification(
                $userId,
                $order->order_number,
                $newStatus
            );

            return response()->json([
                'success' => true,
                'data' => $order,
                'message' => 'Order status updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getTracking(Request $request, $id)
    {
        try {
            // Get the ACTUAL logged-in user
            if (!$request->user()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please log in to view tracking information'
                ], 401);
            }

            $userId = $request->user()->id;

            $order = Order::where('id', $id)
                ->where('user_id', $userId)
                ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Mock tracking data
            $trackingData = [
                'order_number' => $order->order_number,
                'status' => $order->status,
                'tracking_number' => 'TRK' . $id . rand(100000, 999999),
                'carrier' => 'DHL Express',
                'estimated_delivery' => now()->addDays(3)->format('Y-m-d'),
                'tracking_events' => [
                    [
                        'status' => 'Order Placed',
                        'date' => $order->created_at,
                        'location' => 'Warehouse'
                    ],
                    [
                        'status' => 'Processing',
                        'date' => now()->subDays(1)->format('Y-m-d H:i:s'),
                        'location' => 'Distribution Center'
                    ]
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $trackingData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get tracking: ' . $e->getMessage()
            ], 500);
        }
    }
}
