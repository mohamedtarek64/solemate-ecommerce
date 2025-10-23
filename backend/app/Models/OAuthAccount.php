<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OAuthAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'provider',
        'provider_id',
        'provider_token',
        'provider_refresh_token',
        'provider_expires_at',
        'provider_data',
        'is_active',
    ];

    protected $casts = [
        'provider_data' => 'array',
        'provider_expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    protected $hidden = [
        'provider_token',
        'provider_refresh_token',
    ];

    /**
     * Get the user that owns the OAuth account.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for active OAuth accounts.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for specific provider.
     */
    public function scopeProvider($query, $provider)
    {
        return $query->where('provider', $provider);
    }

    /**
     * Check if token is expired.
     */
    public function isTokenExpired()
    {
        return $this->provider_expires_at && $this->provider_expires_at->isPast();
    }

    /**
     * Update provider token.
     */
    public function updateToken($token, $refreshToken = null, $expiresAt = null)
    {
        $this->update([
            'provider_token' => $token,
            'provider_refresh_token' => $refreshToken,
            'provider_expires_at' => $expiresAt,
        ]);
    }
}
