<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Performance Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains performance optimization settings
    |
    */

    'cache' => [
        'default' => env('CACHE_DRIVER', 'redis'),
        'stores' => [
            'redis' => [
                'driver' => 'redis',
                'connection' => 'cache',
                'prefix' => env('CACHE_PREFIX', 'solemate_cache'),
            ],
            'file' => [
                'driver' => 'file',
                'path' => storage_path('framework/cache/data'),
            ],
        ],
    ],

    'database' => [
        'query_cache' => [
            'enabled' => true,
            'ttl' => 300, // 5 minutes
        ],
        'connection_pooling' => [
            'enabled' => true,
            'max_connections' => 20,
        ],
    ],

    'opcache' => [
        'enabled' => env('OPCACHE_ENABLE', true),
        'memory_consumption' => env('OPCACHE_MEMORY_CONSUMPTION', 128),
        'interned_strings_buffer' => 8,
        'max_accelerated_files' => env('OPCACHE_MAX_ACCELERATED_FILES', 4000),
        'revalidate_freq' => 2,
        'fast_shutdown' => 1,
        'enable_cli' => 1,
    ],

    'compression' => [
        'gzip' => [
            'enabled' => true,
            'level' => 6,
        ],
        'brotli' => [
            'enabled' => false,
            'level' => 4,
        ],
    ],

    'cdn' => [
        'enabled' => env('CDN_ENABLED', false),
        'url' => env('CDN_URL', ''),
        'assets' => [
            'css' => true,
            'js' => true,
            'images' => true,
            'fonts' => true,
        ],
    ],

    'lazy_loading' => [
        'enabled' => true,
        'threshold' => 0.1, // 10% of viewport
        'root_margin' => '50px',
    ],

    'preloading' => [
        'enabled' => true,
        'critical_resources' => [
            'css' => ['app.css', 'vendor.css'],
            'js' => ['app.js', 'vendor.js'],
        ],
    ],

    'monitoring' => [
        'enabled' => env('PERFORMANCE_MONITORING', false),
        'slow_query_threshold' => 1000, // milliseconds
        'memory_threshold' => 128, // MB
        'response_time_threshold' => 500, // milliseconds
    ],
];
