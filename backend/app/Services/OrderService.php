<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class OrderService
{
    /**
     * Create a new order.
     */
    public function createOrder(User $user, array $orderData): Order
    {
        $order = Order::create([
            'user_id' => $user->id,
            'order_number' => $this->generateOrderNumber(),
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_method' => $orderData['payment_method'] ?? 'stripe',
            'subtotal' => $orderData['subtotal'],
            'tax_amount' => $orderData['tax_amount'] ?? 0,
            'shipping_amount' => $orderData['shipping_amount'] ?? 0,
            'discount_amount' => $orderData['discount_amount'] ?? 0,
            'total_amount' => $orderData['total_amount'],
            'currency' => $orderData['currency'] ?? 'USD',
            'shipping_address' => json_encode($orderData['shipping_address']),
            'billing_address' => json_encode($orderData['billing_address']),
            'notes' => $orderData['notes'] ?? null,
        ]);

        // Create order items
        foreach ($orderData['items'] as $item) {
            $product = Product::find($item['product_id']);
            
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'unit_price' => $product->price,
                'total_price' => $product->price * $item['quantity'],
                'product_name' => $product->name,
                'product_sku' => $product->sku,
                'product_image' => $product->image,
                'product_data' => json_encode($product->toArray()),
            ]);

            // Decrease product stock
            $product->decrement('stock_quantity', $item['quantity']);
        }

        return $order->load(['items', 'items.product']);
    }

    /**
     * Get user orders.
     */
    public function getUserOrders(User $user, int $perPage = 15): LengthAwarePaginator
    {
        return Order::with(['items', 'items.product'])
                   ->where('user_id', $user->id)
                   ->orderBy('created_at', 'desc')
                   ->paginate($perPage);
    }

    /**
     * Get order by ID.
     */
    public function getOrderById(int $id): ?Order
    {
        return Order::with(['user', 'items', 'items.product'])
                   ->find($id);
    }

    /**
     * Update order status.
     */
    public function updateOrderStatus(Order $order, string $status): bool
    {
        $order->update(['status' => $status]);

        // Update shipped_at if status is shipped
        if ($status === 'shipped') {
            $order->update(['shipped_at' => now()]);
        }

        // Update delivered_at if status is delivered
        if ($status === 'delivered') {
            $order->update(['delivered_at' => now()]);
        }

        return true;
    }

    /**
     * Update payment status.
     */
    public function updatePaymentStatus(Order $order, string $status): bool
    {
        $order->update(['payment_status' => $status]);

        return true;
    }

    /**
     * Cancel order.
     */
    public function cancelOrder(Order $order): bool
    {
        if (!in_array($order->status, ['pending', 'processing'])) {
            throw new \Exception('Order cannot be cancelled');
        }

        $order->update(['status' => 'cancelled']);

        // Restore product stock
        foreach ($order->items as $item) {
            $product = Product::find($item->product_id);
            if ($product) {
                $product->increment('stock_quantity', $item->quantity);
            }
        }

        return true;
    }

    /**
     * Get order statistics.
     */
    public function getOrderStatistics(): array
    {
        return [
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'processing_orders' => Order::where('status', 'processing')->count(),
            'shipped_orders' => Order::where('status', 'shipped')->count(),
            'delivered_orders' => Order::where('status', 'delivered')->count(),
            'cancelled_orders' => Order::where('status', 'cancelled')->count(),
            'total_revenue' => Order::where('payment_status', 'paid')->sum('total_amount'),
        ];
    }

    /**
     * Get recent orders.
     */
    public function getRecentOrders(int $limit = 10): Collection
    {
        return Order::with(['user', 'items'])
                   ->orderBy('created_at', 'desc')
                   ->limit($limit)
                   ->get();
    }

    /**
     * Generate unique order number.
     */
    private function generateOrderNumber(): string
    {
        do {
            $orderNumber = 'ORD-' . strtoupper(uniqid());
        } while (Order::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }

    /**
     * Duplicate order.
     */
    public function duplicateOrder(Order $order): Order
    {
        $newOrder = $order->replicate();
        $newOrder->order_number = $this->generateOrderNumber();
        $newOrder->status = 'pending';
        $newOrder->payment_status = 'pending';
        $newOrder->shipped_at = null;
        $newOrder->delivered_at = null;
        $newOrder->tracking_number = null;
        $newOrder->save();

        // Duplicate order items
        foreach ($order->items as $item) {
            $newItem = $item->replicate();
            $newItem->order_id = $newOrder->id;
            $newItem->save();
        }

        return $newOrder->load(['items', 'items.product']);
    }
}
