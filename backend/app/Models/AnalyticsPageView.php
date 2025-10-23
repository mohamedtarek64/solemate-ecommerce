<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalyticsPageView extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'page_url',
        'page_title',
        'referrer',
        'user_agent',
        'ip_address',
        'country',
        'city',
        'device_type',
        'browser',
        'os',
        'viewport_width',
        'viewport_height',
        'time_on_page',
        'timestamp',
    ];

    protected $casts = [
        'viewport_width' => 'integer',
        'viewport_height' => 'integer',
        'time_on_page' => 'integer',
        'timestamp' => 'datetime',
    ];

    /**
     * Get the user that owns the page view.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for specific page.
     */
    public function scopePage($query, $pageUrl)
    {
        return $query->where('page_url', $pageUrl);
    }

    /**
     * Scope for specific device type.
     */
    public function scopeDeviceType($query, $deviceType)
    {
        return $query->where('device_type', $deviceType);
    }

    /**
     * Scope for specific country.
     */
    public function scopeCountry($query, $country)
    {
        return $query->where('country', $country);
    }

    /**
     * Scope for date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('timestamp', [$startDate, $endDate]);
    }

    /**
     * Get page views count for a specific page.
     */
    public static function getPageViewsCount($pageUrl, $startDate = null, $endDate = null)
    {
        $query = static::where('page_url', $pageUrl);
        
        if ($startDate && $endDate) {
            $query->dateRange($startDate, $endDate);
        }
        
        return $query->count();
    }
}
