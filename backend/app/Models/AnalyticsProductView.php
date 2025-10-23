<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalyticsProductView extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'session_id',
        'page_url',
        'referrer',
        'user_agent',
        'ip_address',
        'country',
        'city',
        'device_type',
        'browser',
        'os',
        'time_on_page',
        'timestamp',
    ];

    protected $casts = [
        'time_on_page' => 'integer',
        'timestamp' => 'datetime',
    ];

    /**
     * Get the user that owns the product view.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product that was viewed.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Scope for specific product.
     */
    public function scopeProduct($query, $productId)
    {
        return $query->where('product_id', $productId);
    }

    /**
     * Scope for specific device type.
     */
    public function scopeDeviceType($query, $deviceType)
    {
        return $query->where('device_type', $deviceType);
    }

    /**
     * Scope for date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('timestamp', [$startDate, $endDate]);
    }

    /**
     * Get product views count.
     */
    public static function getProductViewsCount($productId, $startDate = null, $endDate = null)
    {
        $query = static::where('product_id', $productId);
        
        if ($startDate && $endDate) {
            $query->dateRange($startDate, $endDate);
        }
        
        return $query->count();
    }

    /**
     * Get unique product views count.
     */
    public static function getUniqueProductViewsCount($productId, $startDate = null, $endDate = null)
    {
        $query = static::where('product_id', $productId);
        
        if ($startDate && $endDate) {
            $query->dateRange($startDate, $endDate);
        }
        
        return $query->distinct('user_id')->count('user_id');
    }
}
