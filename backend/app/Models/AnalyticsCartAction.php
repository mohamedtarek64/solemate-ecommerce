<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalyticsCartAction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'session_id',
        'action_type',
        'quantity',
        'product_price',
        'cart_total',
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
        'product_price' => 'decimal:2',
        'cart_total' => 'decimal:2',
        'timestamp' => 'datetime',
    ];

    /**
     * Get the user that owns the cart action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product for the cart action.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Scope for specific action type.
     */
    public function scopeActionType($query, $actionType)
    {
        return $query->where('action_type', $actionType);
    }

    /**
     * Scope for add to cart actions.
     */
    public function scopeAddToCart($query)
    {
        return $query->where('action_type', 'add');
    }

    /**
     * Scope for remove from cart actions.
     */
    public function scopeRemoveFromCart($query)
    {
        return $query->where('action_type', 'remove');
    }

    /**
     * Scope for date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('timestamp', [$startDate, $endDate]);
    }

    /**
     * Get cart abandonment rate.
     */
    public static function getCartAbandonmentRate($startDate = null, $endDate = null)
    {
        $query = static::query();
        
        if ($startDate && $endDate) {
            $query->dateRange($startDate, $endDate);
        }
        
        $addToCartCount = $query->clone()->addToCart()->count();
        $removeFromCartCount = $query->clone()->removeFromCart()->count();
        
        return $addToCartCount > 0 ? ($removeFromCartCount / $addToCartCount) * 100 : 0;
    }
}
