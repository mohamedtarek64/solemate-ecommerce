<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_number',
        'status',
        'total_amount',
        'subtotal',
        'shipping_cost',
        'tax_amount',
        'shipping_address',
        'billing_address',
        'payment_method',
        'payment_status',
        'shipping_method',
        'customer_email',
        'customer_phone',
        'stripe_payment_intent_id',
        'stripe_charge_id',
        'notes',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'shipping_address' => 'array',
        'billing_address' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Generate unique order number
     */
    public static function generateOrderNumber()
    {
        do {
            $orderNumber = 'ORD-' . date('Ymd') . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
        } while (static::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }
}
