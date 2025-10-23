<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MonitoringBehavior extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'event_type',
        'event_data',
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
        'event_data' => 'array',
        'timestamp' => 'datetime',
    ];

    /**
     * Get the user that owns the behavior.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for specific event type.
     */
    public function scopeEventType($query, $eventType)
    {
        return $query->where('event_type', $eventType);
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
     * Get behavior patterns.
     */
    public static function getBehaviorPatterns($eventType, $startDate = null, $endDate = null)
    {
        $query = static::where('event_type', $eventType);
        
        if ($startDate && $endDate) {
            $query->dateRange($startDate, $endDate);
        }
        
        return $query->selectRaw('event_data, COUNT(*) as frequency')
                    ->groupBy('event_data')
                    ->orderBy('frequency', 'desc')
                    ->get();
    }
}
