<?php

namespace App\Traits;

use Laravel\Sanctum\HasApiTokens as SanctumHasApiTokens;

trait HasApiTokens
{
    use SanctumHasApiTokens;

    /**
     * Create a new personal access token for the user.
     */
    public function createToken(string $name, array $abilities = ['*'], \DateTimeInterface $expiresAt = null): \Laravel\Sanctum\NewAccessToken
    {
        return $this->tokens()->create([
            'name' => $name,
            'token' => hash('sha256', $plainTextToken = \Str::random(40)),
            'abilities' => $abilities,
            'expires_at' => $expiresAt,
        ]);
    }

    /**
     * Get the current access token being used by the user.
     */
    public function currentAccessToken(): ?\Laravel\Sanctum\Contracts\HasAbilities
    {
        return $this->accessToken;
    }

    /**
     * Determine if the current access token has a given ability.
     */
    public function tokenCan(string $ability): bool
    {
        return $this->currentAccessToken()?->can($ability) ?? false;
    }

    /**
     * Revoke all tokens for the user.
     */
    public function revokeAllTokens(): void
    {
        $this->tokens()->delete();
    }

    /**
     * Revoke the current access token.
     */
    public function revokeCurrentToken(): void
    {
        $this->currentAccessToken()?->delete();
    }

    /**
     * Get all active tokens for the user.
     */
    public function getActiveTokens()
    {
        return $this->tokens()->where('expires_at', '>', now())->get();
    }

    /**
     * Check if user has any active tokens.
     */
    public function hasActiveTokens(): bool
    {
        return $this->getActiveTokens()->isNotEmpty();
    }
}