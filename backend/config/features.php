<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Feature Flags Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains feature flags for the application
    |
    */

    'enabled' => env('FEATURE_FLAGS_ENABLED', true),

    'flags' => [
        // Authentication features
        'two_factor_authentication' => env('FEATURE_TWO_FACTOR_AUTH', false),
        'social_login' => env('FEATURE_SOCIAL_LOGIN', false),
        'password_reset' => env('FEATURE_PASSWORD_RESET', true),
        'email_verification' => env('FEATURE_EMAIL_VERIFICATION', false),

        // Product features
        'product_reviews' => env('FEATURE_PRODUCT_REVIEWS', true),
        'product_ratings' => env('FEATURE_PRODUCT_RATINGS', true),
        'product_wishlist' => env('FEATURE_PRODUCT_WISHLIST', true),
        'product_comparison' => env('FEATURE_PRODUCT_COMPARISON', false),
        'product_recommendations' => env('FEATURE_PRODUCT_RECOMMENDATIONS', false),

        // Shopping features
        'shopping_cart' => env('FEATURE_SHOPPING_CART', true),
        'checkout' => env('FEATURE_CHECKOUT', true),
        'order_tracking' => env('FEATURE_ORDER_TRACKING', true),
        'order_history' => env('FEATURE_ORDER_HISTORY', true),
        'order_returns' => env('FEATURE_ORDER_RETURNS', false),

        // Payment features
        'stripe_payment' => env('FEATURE_STRIPE_PAYMENT', false),
        'paypal_payment' => env('FEATURE_PAYPAL_PAYMENT', false),
        'apple_pay' => env('FEATURE_APPLE_PAY', false),
        'google_pay' => env('FEATURE_GOOGLE_PAY', false),

        // User features
        'user_profiles' => env('FEATURE_USER_PROFILES', true),
        'user_addresses' => env('FEATURE_USER_ADDRESSES', true),
        'user_preferences' => env('FEATURE_USER_PREFERENCES', false),
        'user_notifications' => env('FEATURE_USER_NOTIFICATIONS', true),

        // Admin features
        'admin_dashboard' => env('FEATURE_ADMIN_DASHBOARD', true),
        'admin_analytics' => env('FEATURE_ADMIN_ANALYTICS', false),
        'admin_reports' => env('FEATURE_ADMIN_REPORTS', false),
        'admin_bulk_operations' => env('FEATURE_ADMIN_BULK_OPERATIONS', false),

        // Performance features
        'lazy_loading' => env('FEATURE_LAZY_LOADING', true),
        'image_optimization' => env('FEATURE_IMAGE_OPTIMIZATION', false),
        'cdn_integration' => env('FEATURE_CDN_INTEGRATION', false),
        'caching' => env('FEATURE_CACHING', true),

        // Security features
        'rate_limiting' => env('FEATURE_RATE_LIMITING', true),
        'ip_whitelisting' => env('FEATURE_IP_WHITELISTING', false),
        'security_headers' => env('FEATURE_SECURITY_HEADERS', true),
        'audit_logging' => env('FEATURE_AUDIT_LOGGING', false),

        // Integration features
        'google_analytics' => env('FEATURE_GOOGLE_ANALYTICS', false),
        'facebook_pixel' => env('FEATURE_FACEBOOK_PIXEL', false),
        'mailchimp_integration' => env('FEATURE_MAILCHIMP_INTEGRATION', false),
        'zapier_integration' => env('FEATURE_ZAPIER_INTEGRATION', false),

        // Mobile features
        'pwa_support' => env('FEATURE_PWA_SUPPORT', false),
        'offline_mode' => env('FEATURE_OFFLINE_MODE', false),
        'push_notifications' => env('FEATURE_PUSH_NOTIFICATIONS', false),
        'mobile_app' => env('FEATURE_MOBILE_APP', false),
    ],

    'environments' => [
        'local' => [
            'two_factor_authentication' => false,
            'social_login' => false,
            'stripe_payment' => false,
            'paypal_payment' => false,
            'google_analytics' => false,
            'facebook_pixel' => false,
        ],
        'staging' => [
            'two_factor_authentication' => true,
            'social_login' => true,
            'stripe_payment' => true,
            'paypal_payment' => true,
            'google_analytics' => true,
            'facebook_pixel' => true,
        ],
        'production' => [
            'two_factor_authentication' => true,
            'social_login' => true,
            'stripe_payment' => true,
            'paypal_payment' => true,
            'google_analytics' => true,
            'facebook_pixel' => true,
            'rate_limiting' => true,
            'security_headers' => true,
            'audit_logging' => true,
        ],
    ],
];
