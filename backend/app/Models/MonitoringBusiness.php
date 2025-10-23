<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MonitoringBusiness extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'metric_type',
        'metric_value',
        'metric_data',
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
        'metric_value' => 'decimal:2',
        'metric_data' => 'array',
        'timestamp' => 'datetime',
    ];

    /**
     * Get the user that owns the business metric.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for specific metric type.
     */
    public function scopeMetricType($query, $metricType)
    {
        return $query->where('metric_type', $metricType);
    }

    /**
     * Scope for date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('timestamp', [$startDate, $endDate]);
    }

    /**
     * Get business metrics summary.
     */
    public static function getBusinessMetricsSummary($startDate = null, $endDate = null)
    {
        $query = static::query();
        
        if ($startDate && $endDate) {
            $query->dateRange($startDate, $endDate);
        }
        
        return $query->selectRaw('metric_type, AVG(metric_value) as avg_value, SUM(metric_value) as total_value, COUNT(*) as count')
                    ->groupBy('metric_type')
                    ->get();
    }

    /**
     * Get conversion rate.
     */
    public static function getConversionRate($startDate = null, $endDate = null)
    {
        $query = static::query();
        
        if ($startDate && $endDate) {
            $query->dateRange($startDate, $endDate);
        }
        
        $visitors = $query->clone()->distinct('user_id')->count('user_id');
        $conversions = $query->clone()->where('metric_type', 'conversion')->count();
        
        return $visitors > 0 ? ($conversions / $visitors) * 100 : 0;
    }
}
