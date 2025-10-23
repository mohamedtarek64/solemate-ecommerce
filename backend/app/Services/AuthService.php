<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

class AuthService
{
    /**
     * Register a new user.
     */
    public function register(array $data): array
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'phone' => $data['phone'] ?? null,
            'date_of_birth' => $data['date_of_birth'] ?? null,
            'gender' => $data['gender'] ?? null,
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * Login user.
     */
    public function login(array $credentials): array
    {
        if (!Auth::attempt($credentials)) {
            throw new \Exception('Invalid credentials');
        }

        $user = Auth::user();
        $token = $user->createToken('auth-token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * Logout user.
     */
    public function logout(): bool
    {
        $user = Auth::user();
        
        if ($user) {
            $user->tokens()->delete();
            return true;
        }

        return false;
    }

    /**
     * Refresh user token.
     */
    public function refreshToken(): array
    {
        $user = Auth::user();
        
        if (!$user) {
            throw new \Exception('User not authenticated');
        }

        // Delete current token
        $user->tokens()->delete();
        
        // Create new token
        $token = $user->createToken('auth-token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * Get authenticated user.
     */
    public function getAuthenticatedUser(): ?User
    {
        return Auth::user();
    }

    /**
     * Change user password.
     */
    public function changePassword(User $user, string $currentPassword, string $newPassword): bool
    {
        if (!Hash::check($currentPassword, $user->password)) {
            throw new \Exception('Current password is incorrect');
        }

        $user->update([
            'password' => Hash::make($newPassword),
        ]);

        return true;
    }

    /**
     * Reset user password.
     */
    public function resetPassword(string $email, string $token, string $newPassword): bool
    {
        // Implementation for password reset
        // This would typically involve verifying the reset token
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            throw new \Exception('User not found');
        }

        $user->update([
            'password' => Hash::make($newPassword),
        ]);

        return true;
    }

    /**
     * Verify user email.
     */
    public function verifyEmail(User $user): bool
    {
        $user->update([
            'email_verified_at' => now(),
        ]);

        return true;
    }
}
