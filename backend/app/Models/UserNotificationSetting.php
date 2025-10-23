<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserNotificationSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'notification_type',
        'email_enabled',
        'push_enabled',
        'sms_enabled',
        'frequency',
        'quiet_hours_start',
        'quiet_hours_end',
        'timezone',
    ];

    protected $casts = [
        'email_enabled' => 'boolean',
        'push_enabled' => 'boolean',
        'sms_enabled' => 'boolean',
        'quiet_hours_start' => 'time',
        'quiet_hours_end' => 'time',
    ];

    /**
     * Get the user that owns the notification setting.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for specific notification type.
     */
    public function scopeNotificationType($query, $notificationType)
    {
        return $query->where('notification_type', $notificationType);
    }

    /**
     * Scope for enabled notifications.
     */
    public function scopeEnabled($query, $channel = null)
    {
        if ($channel) {
            return $query->where("{$channel}_enabled", true);
        }
        
        return $query->where(function($q) {
            $q->where('email_enabled', true)
              ->orWhere('push_enabled', true)
              ->orWhere('sms_enabled', true);
        });
    }

    /**
     * Check if notification is enabled for channel.
     */
    public function isEnabledForChannel($channel)
    {
        return $this->{"{$channel}_enabled"};
    }

    /**
     * Check if it's quiet hours.
     */
    public function isQuietHours()
    {
        if (!$this->quiet_hours_start || !$this->quiet_hours_end) {
            return false;
        }
        
        $now = now()->setTimezone($this->timezone);
        $currentTime = $now->format('H:i:s');
        
        $start = $this->quiet_hours_start->format('H:i:s');
        $end = $this->quiet_hours_end->format('H:i:s');
        
        if ($start <= $end) {
            return $currentTime >= $start && $currentTime <= $end;
        } else {
            return $currentTime >= $start || $currentTime <= $end;
        }
    }

    /**
     * Get user's notification preferences.
     */
    public static function getUserPreferences($userId)
    {
        return static::where('user_id', $userId)
                    ->get()
                    ->keyBy('notification_type');
    }
}
