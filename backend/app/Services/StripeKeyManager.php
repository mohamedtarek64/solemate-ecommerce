<?php

namespace App\Services;

use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;

class StripeKeyManager
{
    private static $publishableKey = null;
    private static $secretKey = null;

    /**
     * Get encrypted Stripe publishable key
     */
    public static function getPublishableKey(): string
    {
        if (self::$publishableKey === null) {
            try {
                // Try to read from encrypted config first
                $encryptedKey = config('stripe_encrypted.publishable_key');
                
                // If not found, try to read from stripe-config.example.env
                if (!$encryptedKey) {
                    $envContent = file_get_contents(base_path('stripe-config.example.env'));
                    if (preg_match('/STRIPE_PUBLISHABLE_KEY=(.+)/', $envContent, $matches)) {
                        $encryptedKey = trim($matches[1]);
                    }
                }
                
                if (!$encryptedKey) {
                    throw new \Exception('Stripe publishable key not found in encrypted config or env file');
                }
                self::$publishableKey = Crypt::decryptString($encryptedKey);
            } catch (\Exception $e) {
                Log::error('Failed to decrypt Stripe publishable key: ' . $e->getMessage());
                throw new \Exception('Unable to decrypt Stripe publishable key');
            }
        }
        return self::$publishableKey;
    }

    /**
     * Get encrypted Stripe secret key
     */
    public static function getSecretKey(): string
    {
        if (self::$secretKey === null) {
            try {
                // Try to read from encrypted config first
                $encryptedKey = config('stripe_encrypted.secret_key');
                
                // If not found, try to read from stripe-config.example.env
                if (!$encryptedKey) {
                    $envContent = file_get_contents(base_path('stripe-config.example.env'));
                    if (preg_match('/STRIPE_SECRET_KEY=(.+)/', $envContent, $matches)) {
                        $encryptedKey = trim($matches[1]);
                    }
                }
                
                if (!$encryptedKey) {
                    throw new \Exception('Stripe secret key not found in encrypted config or env file');
                }
                self::$secretKey = Crypt::decryptString($encryptedKey);
            } catch (\Exception $e) {
                Log::error('Failed to decrypt Stripe secret key: ' . $e->getMessage());
                throw new \Exception('Unable to decrypt Stripe secret key');
            }
        }
        return self::$secretKey;
    }

    /**
     * Check if keys are properly encrypted and available
     */
    public static function isConfigured(): bool
    {
        try {
            self::getPublishableKey();
            self::getSecretKey();
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get key type (test/live) from publishable key
     */
    public static function getKeyType(): string
    {
        try {
            $key = self::getPublishableKey();
            return str_starts_with($key, 'pk_live_') ? 'live' : 'test';
        } catch (\Exception $e) {
            return 'unknown';
        }
    }

    /**
     * Validate key format
     */
    public static function validateKeys(): array
    {
        $errors = [];

        try {
            $publishableKey = self::getPublishableKey();
            if (!str_starts_with($publishableKey, 'pk_test_') && !str_starts_with($publishableKey, 'pk_live_')) {
                $errors[] = 'Invalid publishable key format';
            }
        } catch (\Exception $e) {
            $errors[] = 'Publishable key error: ' . $e->getMessage();
        }

        try {
            $secretKey = self::getSecretKey();
            if (!str_starts_with($secretKey, 'sk_test_') && !str_starts_with($secretKey, 'sk_live_')) {
                $errors[] = 'Invalid secret key format';
            }
        } catch (\Exception $e) {
            $errors[] = 'Secret key error: ' . $e->getMessage();
        }

        return $errors;
    }
}
