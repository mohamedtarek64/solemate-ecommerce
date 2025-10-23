<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'language',
        'currency',
        'timezone',
        'date_format',
        'time_format',
        'theme',
        'notifications_email',
        'notifications_push',
        'notifications_sms',
        'marketing_emails',
        'privacy_level',
        'search_preferences',
        'display_preferences',
    ];

    protected $casts = [
        'notifications_email' => 'boolean',
        'notifications_push' => 'boolean',
        'notifications_sms' => 'boolean',
        'marketing_emails' => 'boolean',
        'search_preferences' => 'array',
        'display_preferences' => 'array',
    ];

    /**
     * Get the user that owns the preferences.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get notification preferences.
     */
    public function getNotificationPreferences()
    {
        return [
            'email' => $this->notifications_email,
            'push' => $this->notifications_push,
            'sms' => $this->notifications_sms,
            'marketing' => $this->marketing_emails,
        ];
    }

    /**
     * Update notification preferences.
     */
    public function updateNotificationPreferences(array $preferences)
    {
        $this->update([
            'notifications_email' => $preferences['email'] ?? $this->notifications_email,
            'notifications_push' => $preferences['push'] ?? $this->notifications_push,
            'notifications_sms' => $preferences['sms'] ?? $this->notifications_sms,
            'marketing_emails' => $preferences['marketing'] ?? $this->marketing_emails,
        ]);
    }

    /**
     * Get display preferences.
     */
    public function getDisplayPreferences()
    {
        return [
            'theme' => $this->theme,
            'language' => $this->language,
            'currency' => $this->currency,
            'timezone' => $this->timezone,
            'date_format' => $this->date_format,
            'time_format' => $this->time_format,
        ];
    }
}
