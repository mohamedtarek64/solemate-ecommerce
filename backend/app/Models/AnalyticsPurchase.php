<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalyticsPurchase extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_id',
        'product_id',
        'session_id',
        'quantity',
        'unit_price',
        'total_price',
        'discount_amount',
        'tax_amount',
        'payment_method',
        'page_url',
        'user_agent',
        'ip_address',
        'country',
        'city',
        'device_type',
        'browser',
        'os',
        'timestamp',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'timestamp' => 'datetime',
    ];

    /**
     * Get the user that owns the purchase.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the order for the purchase.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the product for the purchase.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Scope for specific payment method.
     */
    public function scopePaymentMethod($query, $paymentMethod)
    {
        return $query->where('payment_method', $paymentMethod);
    }

    /**
     * Scope for date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('timestamp', [$startDate, $endDate]);
    }

    /**
     * Get total revenue.
     */
    public static function getTotalRevenue($startDate = null, $endDate = null)
    {
        $query = static::query();
        
        if ($startDate && $endDate) {
            $query->dateRange($startDate, $endDate);
        }
        
        return $query->sum('total_price');
    }

    /**
     * Get average order value.
     */
    public static function getAverageOrderValue($startDate = null, $endDate = null)
    {
        $query = static::query();
        
        if ($startDate && $endDate) {
            $query->dateRange($startDate, $endDate);
        }
        
        $totalRevenue = $query->sum('total_price');
        $orderCount = $query->distinct('order_id')->count('order_id');
        
        return $orderCount > 0 ? $totalRevenue / $orderCount : 0;
    }
}
