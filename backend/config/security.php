<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Security Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains security settings for the application
    |
    */

    'authentication' => [
        'jwt' => [
            'secret' => env('JWT_SECRET', 'your-jwt-secret-key'),
            'ttl' => env('JWT_TTL', 900), // 15 minutes
            'refresh_ttl' => env('JWT_REFRESH_TTL', 20160), // 2 weeks
            'algo' => 'HS256',
        ],
        'bcrypt' => [
            'rounds' => env('BCRYPT_ROUNDS', 12),
        ],
        'password_reset' => [
            'expire' => 60, // minutes
            'throttle' => 60, // seconds
        ],
    ],

    'rate_limiting' => [
        'enabled' => true,
        'default' => [
            'per_minute' => env('RATE_LIMIT_PER_MINUTE', 60),
            'per_hour' => env('RATE_LIMIT_PER_HOUR', 1000),
        ],
        'api' => [
            'per_minute' => 100,
            'per_hour' => 2000,
        ],
        'auth' => [
            'per_minute' => 5,
            'per_hour' => 20,
        ],
    ],

    'cors' => [
        'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:3001')),
        'allowed_methods' => explode(',', env('CORS_ALLOWED_METHODS', 'GET,POST,PUT,DELETE,OPTIONS')),
        'allowed_headers' => explode(',', env('CORS_ALLOWED_HEADERS', 'Content-Type,Authorization,X-Requested-With')),
        'exposed_headers' => [],
        'max_age' => 0,
        'supports_credentials' => true,
    ],

    'headers' => [
        'x_frame_options' => 'SAMEORIGIN',
        'x_content_type_options' => 'nosniff',
        'x_xss_protection' => '1; mode=block',
        'referrer_policy' => 'strict-origin-when-cross-origin',
        'content_security_policy' => "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com;",
    ],

    'file_upload' => [
        'max_size' => env('MAX_FILE_SIZE', 10485760), // 10MB
        'allowed_types' => explode(',', env('ALLOWED_FILE_TYPES', 'image/jpeg,image/png,image/gif,image/webp')),
        'scan_for_viruses' => env('SCAN_FILES', false),
        'quarantine_suspicious' => env('QUARANTINE_FILES', false),
    ],

    'encryption' => [
        'key' => env('APP_KEY'),
        'cipher' => 'AES-256-CBC',
    ],

    'session' => [
        'secure' => env('SESSION_SECURE_COOKIE', false),
        'http_only' => true,
        'same_site' => 'lax',
        'lifetime' => 120, // minutes
    ],

    'csrf' => [
        'enabled' => true,
        'token_lifetime' => 120, // minutes
        'regenerate_on_login' => true,
    ],

    'logging' => [
        'security_events' => [
            'failed_login' => true,
            'password_reset' => true,
            'suspicious_activity' => true,
            'admin_actions' => true,
        ],
        'retention_days' => 90,
    ],

    'two_factor' => [
        'enabled' => env('TWO_FACTOR_ENABLED', false),
        'issuer' => env('APP_NAME', 'SoleMate'),
        'algorithm' => 'sha1',
        'digits' => 6,
        'period' => 30,
    ],
];
