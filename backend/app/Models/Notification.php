<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'read_at'
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
    ];

    /**
     * Get the user that owns the notification.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead()
    {
        $this->update(['read_at' => now()]);
    }

    /**
     * Check if notification is read.
     */
    public function isRead()
    {
        return !is_null($this->read_at);
    }

    /**
     * Scope for unread notifications.
     */
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    /**
     * Scope for read notifications.
     */
    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    /**
     * Scope for specific type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Create a new notification.
     */
    public static function createNotification($userId, $type, $title, $message, $data = null)
    {
        return self::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }

    /**
     * Create order notification.
     */
    public static function createOrderNotification($userId, $orderNumber, $status)
    {
        $messages = [
            'pending' => "Your order #{$orderNumber} has been confirmed and will be processed soon",
            'confirmed' => "Your order #{$orderNumber} has been confirmed",
            'shipped' => "Your order #{$orderNumber} has been shipped",
            'delivered' => "Your order #{$orderNumber} has been delivered",
            'cancelled' => "Your order #{$orderNumber} has been cancelled",
        ];

        $titles = [
            'pending' => "Order Confirmation #{$orderNumber}",
            'confirmed' => "Order Confirmed #{$orderNumber}",
            'shipped' => "Order Shipped #{$orderNumber}",
            'delivered' => "Order Delivered #{$orderNumber}",
            'cancelled' => "Order Cancelled #{$orderNumber}",
        ];

        return self::createNotification(
            $userId,
            'order',
            $titles[$status] ?? "Order Update #{$orderNumber}",
            $messages[$status] ?? "Your order #{$orderNumber} status has been updated",
            ['order_number' => $orderNumber, 'status' => $status]
        );
    }

    /**
     * Create promotion notification.
     */
    public static function createPromotionNotification($userId, $title, $message, $promotionData = null)
    {
        return self::createNotification(
            $userId,
            'promotion',
            $title,
            $message,
            $promotionData
        );
    }

    /**
     * Create stock notification.
     */
    public static function createStockNotification($userId, $productName, $message)
    {
        return self::createNotification(
            $userId,
            'stock',
            "Stock Alert - {$productName}",
            $message,
            ['product_name' => $productName]
        );
    }
}
