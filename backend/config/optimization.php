<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Optimization Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains optimization settings for the application
    |
    */

    'database' => [
        'query_cache' => [
            'enabled' => true,
            'ttl' => 300, // 5 minutes
        ],
        'connection_pooling' => [
            'enabled' => true,
            'max_connections' => 20,
        ],
        'lazy_loading' => [
            'enabled' => true,
            'eager_load_relations' => true,
        ],
    ],

    'cache' => [
        'enabled' => true,
        'driver' => env('CACHE_DRIVER', 'redis'),
        'ttl' => [
            'default' => 3600, // 1 hour
            'products' => 1800, // 30 minutes
            'categories' => 7200, // 2 hours
            'users' => 1800, // 30 minutes
        ],
        'tags' => [
            'products' => ['products', 'categories'],
            'users' => ['users', 'profiles'],
            'orders' => ['orders', 'users'],
        ],
    ],

    'compression' => [
        'gzip' => [
            'enabled' => true,
            'level' => 6,
            'min_length' => 1024,
        ],
        'brotli' => [
            'enabled' => false,
            'level' => 4,
        ],
    ],

    'images' => [
        'optimization' => [
            'enabled' => env('IMAGE_OPTIMIZATION_ENABLED', false),
            'quality' => 85,
            'formats' => ['webp', 'avif'],
            'sizes' => [
                'thumbnail' => [150, 150],
                'small' => [300, 300],
                'medium' => [600, 600],
                'large' => [1200, 1200],
            ],
        ],
        'lazy_loading' => [
            'enabled' => true,
            'threshold' => 0.1,
            'root_margin' => '50px',
        ],
    ],

    'assets' => [
        'minification' => [
            'css' => true,
            'js' => true,
            'html' => false,
        ],
        'bundling' => [
            'enabled' => true,
            'vendor_chunk' => true,
            'common_chunk' => true,
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
    ],

    'api' => [
        'rate_limiting' => [
            'enabled' => true,
            'per_minute' => 60,
            'per_hour' => 1000,
        ],
        'caching' => [
            'enabled' => true,
            'ttl' => 300, // 5 minutes
            'headers' => [
                'Cache-Control' => 'public, max-age=300',
                'ETag' => true,
            ],
        ],
        'pagination' => [
            'default_per_page' => 20,
            'max_per_page' => 100,
        ],
    ],

    'queue' => [
        'enabled' => true,
        'driver' => env('QUEUE_CONNECTION', 'redis'),
        'workers' => [
            'default' => 2,
            'high' => 1,
            'low' => 1,
        ],
        'retry_after' => 90,
        'timeout' => 60,
    ],

    'search' => [
        'enabled' => env('SEARCH_ENABLED', false),
        'driver' => env('SEARCH_DRIVER', 'elasticsearch'),
        'indexes' => [
            'products' => [
                'fields' => ['name', 'description', 'category', 'brand'],
                'weights' => [
                    'name' => 10,
                    'description' => 5,
                    'category' => 3,
                    'brand' => 2,
                ],
            ],
        ],
    ],

    'monitoring' => [
        'enabled' => env('OPTIMIZATION_MONITORING_ENABLED', false),
        'metrics' => [
            'response_time' => true,
            'memory_usage' => true,
            'database_queries' => true,
            'cache_hit_rate' => true,
        ],
        'alerts' => [
            'slow_queries' => 1000, // milliseconds
            'high_memory' => 128, // MB
            'low_cache_hit_rate' => 80, // percentage
        ],
    ],
];
