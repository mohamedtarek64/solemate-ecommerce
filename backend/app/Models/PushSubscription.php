<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PushSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'endpoint',
        'public_key',
        'auth_token',
        'device_type',
        'device_id',
        'user_agent',
        'is_active',
        'last_used_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_used_at' => 'datetime',
    ];

    /**
     * Get the user that owns the push subscription.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for active subscriptions.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for specific device type.
     */
    public function scopeDeviceType($query, $deviceType)
    {
        return $query->where('device_type', $deviceType);
    }

    /**
     * Activate subscription.
     */
    public function activate()
    {
        $this->update(['is_active' => true, 'last_used_at' => now()]);
    }

    /**
     * Deactivate subscription.
     */
    public function deactivate()
    {
        $this->update(['is_active' => false]);
    }

    /**
     * Update last used timestamp.
     */
    public function updateLastUsed()
    {
        $this->update(['last_used_at' => now()]);
    }

    /**
     * Check if subscription is recent.
     */
    public function isRecent($days = 30)
    {
        return $this->last_used_at && $this->last_used_at->diffInDays(now()) <= $days;
    }
}
