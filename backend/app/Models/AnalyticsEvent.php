<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalyticsEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'event_name',
        'event_category',
        'event_action',
        'event_label',
        'event_value',
        'page_url',
        'user_agent',
        'ip_address',
        'country',
        'city',
        'device_type',
        'browser',
        'os',
        'custom_data',
        'timestamp',
    ];

    protected $casts = [
        'event_value' => 'integer',
        'custom_data' => 'array',
        'timestamp' => 'datetime',
    ];

    /**
     * Get the user that owns the event.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for specific event name.
     */
    public function scopeEventName($query, $eventName)
    {
        return $query->where('event_name', $eventName);
    }

    /**
     * Scope for specific event category.
     */
    public function scopeEventCategory($query, $category)
    {
        return $query->where('event_category', $category);
    }

    /**
     * Scope for specific event action.
     */
    public function scopeEventAction($query, $action)
    {
        return $query->where('event_action', $action);
    }

    /**
     * Scope for date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('timestamp', [$startDate, $endDate]);
    }

    /**
     * Get events count by name.
     */
    public static function getEventsCount($eventName, $startDate = null, $endDate = null)
    {
        $query = static::where('event_name', $eventName);
        
        if ($startDate && $endDate) {
            $query->dateRange($startDate, $endDate);
        }
        
        return $query->count();
    }

    /**
     * Get events value sum.
     */
    public static function getEventsValueSum($eventName, $startDate = null, $endDate = null)
    {
        $query = static::where('event_name', $eventName);
        
        if ($startDate && $endDate) {
            $query->dateRange($startDate, $endDate);
        }
        
        return $query->sum('event_value');
    }
}
