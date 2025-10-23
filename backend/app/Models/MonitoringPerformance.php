<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MonitoringPerformance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'page_url',
        'load_time',
        'dom_content_loaded',
        'first_contentful_paint',
        'largest_contentful_paint',
        'first_input_delay',
        'cumulative_layout_shift',
        'user_agent',
        'ip_address',
        'country',
        'city',
        'device_type',
        'browser',
        'os',
        'connection_type',
        'timestamp',
    ];

    protected $casts = [
        'load_time' => 'decimal:3',
        'dom_content_loaded' => 'decimal:3',
        'first_contentful_paint' => 'decimal:3',
        'largest_contentful_paint' => 'decimal:3',
        'first_input_delay' => 'decimal:3',
        'cumulative_layout_shift' => 'decimal:3',
        'timestamp' => 'datetime',
    ];

    /**
     * Get the user that owns the performance data.
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
     * Scope for slow pages.
     */
    public function scopeSlowPages($query, $threshold = 3.0)
    {
        return $query->where('load_time', '>', $threshold);
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
     * Get average load time for a page.
     */
    public static function getAverageLoadTime($pageUrl, $startDate = null, $endDate = null)
    {
        $query = static::where('page_url', $pageUrl);
        
        if ($startDate && $endDate) {
            $query->dateRange($startDate, $endDate);
        }
        
        return $query->avg('load_time');
    }

    /**
     * Get performance score.
     */
    public function getPerformanceScore()
    {
        $score = 100;
        
        // Deduct points for slow metrics
        if ($this->load_time > 3.0) $score -= 20;
        if ($this->first_contentful_paint > 1.8) $score -= 15;
        if ($this->largest_contentful_paint > 2.5) $score -= 15;
        if ($this->first_input_delay > 100) $score -= 10;
        if ($this->cumulative_layout_shift > 0.1) $score -= 10;
        
        return max(0, $score);
    }
}
