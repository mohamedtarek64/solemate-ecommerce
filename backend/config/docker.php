<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Docker Environment Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration for Docker environment
    |
    */

    'app' => [
        'name' => env('APP_NAME', 'SoleMate'),
        'env' => env('APP_ENV', 'local'),
        'debug' => env('APP_DEBUG', true),
        'url' => env('APP_URL', 'http://localhost:8000'),
    ],

    'database' => [
        'connection' => env('DB_CONNECTION', 'mysql'),
        'host' => env('DB_HOST', 'mysql'),
        'port' => env('DB_PORT', 3306),
        'database' => env('DB_DATABASE', 'ecommerce_db'),
        'username' => env('DB_USERNAME', 'dev_user'),
        'password' => env('DB_PASSWORD', 'dev_pass'),
    ],

    'redis' => [
        'host' => env('REDIS_HOST', 'redis'),
        'password' => env('REDIS_PASSWORD', null),
        'port' => env('REDIS_PORT', 6379),
    ],

    'cache' => [
        'driver' => env('CACHE_DRIVER', 'redis'),
        'session_driver' => env('SESSION_DRIVER', 'redis'),
        'queue_connection' => env('QUEUE_CONNECTION', 'redis'),
    ],

    'mail' => [
        'mailer' => env('MAIL_MAILER', 'smtp'),
        'host' => env('MAIL_HOST', 'mailhog'),
        'port' => env('MAIL_PORT', 1025),
        'username' => env('MAIL_USERNAME', null),
        'password' => env('MAIL_PASSWORD', null),
        'encryption' => env('MAIL_ENCRYPTION', null),
        'from_address' => env('MAIL_FROM_ADDRESS', 'noreply@solemate.com'),
        'from_name' => env('MAIL_FROM_NAME', 'SoleMate'),
    ],

    'security' => [
        'bcrypt_rounds' => env('BCRYPT_ROUNDS', 12),
        'jwt_secret' => env('JWT_SECRET', 'your-jwt-secret-key'),
        'jwt_ttl' => env('JWT_TTL', 900),
        'jwt_refresh_ttl' => env('JWT_REFRESH_TTL', 20160),
    ],

    'performance' => [
        'opcache_enable' => env('OPCACHE_ENABLE', true),
        'opcache_memory_consumption' => env('OPCACHE_MEMORY_CONSUMPTION', 128),
        'opcache_max_accelerated_files' => env('OPCACHE_MAX_ACCELERATED_FILES', 4000),
    ],

    'file_upload' => [
        'max_file_size' => env('MAX_FILE_SIZE', 10485760), // 10MB
        'allowed_file_types' => explode(',', env('ALLOWED_FILE_TYPES', 'image/jpeg,image/png,image/gif,image/webp')),
    ],

    'rate_limiting' => [
        'per_minute' => env('RATE_LIMIT_PER_MINUTE', 60),
        'per_hour' => env('RATE_LIMIT_PER_HOUR', 1000),
    ],

    'cors' => [
        'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:3001')),
        'allowed_methods' => explode(',', env('CORS_ALLOWED_METHODS', 'GET,POST,PUT,DELETE,OPTIONS')),
        'allowed_headers' => explode(',', env('CORS_ALLOWED_HEADERS', 'Content-Type,Authorization,X-Requested-With')),
    ],
];
