<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Stripe Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration for Stripe payment integration
    |
    */

    'public_key' => env('STRIPE_PUBLIC_KEY', 'pk_test_your_publishable_key_here'),
    'secret_key' => env('STRIPE_SECRET_KEY', 'sk_test_your_secret_key_here'),
    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET', 'whsec_your_webhook_secret_here'),

    'currency' => env('STRIPE_CURRENCY', 'usd'),

    'payment_methods' => [
        'card' => true,
        'apple_pay' => false,
        'google_pay' => false,
    ],

    'options' => [
        'capture_method' => 'automatic', // or 'manual'
        'confirmation_method' => 'automatic',
    ],
];
