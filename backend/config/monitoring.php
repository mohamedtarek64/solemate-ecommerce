<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Monitoring Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains monitoring and observability settings
    |
    */

    'enabled' => env('MONITORING_ENABLED', false),

    'metrics' => [
        'enabled' => env('METRICS_ENABLED', false),
        'driver' => env('METRICS_DRIVER', 'prometheus'),
        'endpoint' => env('METRICS_ENDPOINT', '/metrics'),
    ],

    'health_checks' => [
        'enabled' => env('HEALTH_CHECKS_ENABLED', true),
        'endpoint' => env('HEALTH_CHECKS_ENDPOINT', '/health'),
        'checks' => [
            'database' => true,
            'redis' => true,
            'storage' => true,
            'queue' => true,
            'mail' => false,
        ],
    ],

    'logging' => [
        'enabled' => env('MONITORING_LOGGING_ENABLED', true),
        'level' => env('MONITORING_LOG_LEVEL', 'info'),
        'channels' => [
            'performance' => 'daily',
            'security' => 'daily',
            'errors' => 'daily',
            'audit' => 'daily',
        ],
    ],

    'performance' => [
        'enabled' => env('PERFORMANCE_MONITORING_ENABLED', false),
        'slow_query_threshold' => env('SLOW_QUERY_THRESHOLD', 1000), // milliseconds
        'memory_threshold' => env('MEMORY_THRESHOLD', 128), // MB
        'response_time_threshold' => env('RESPONSE_TIME_THRESHOLD', 500), // milliseconds
    ],

    'alerts' => [
        'enabled' => env('ALERTS_ENABLED', false),
        'channels' => [
            'email' => [
                'enabled' => env('ALERT_EMAIL_ENABLED', false),
                'recipients' => explode(',', env('ALERT_EMAIL_RECIPIENTS', '')),
            ],
            'slack' => [
                'enabled' => env('ALERT_SLACK_ENABLED', false),
                'webhook_url' => env('ALERT_SLACK_WEBHOOK_URL', ''),
            ],
        ],
        'thresholds' => [
            'error_rate' => 5, // percentage
            'response_time' => 1000, // milliseconds
            'memory_usage' => 80, // percentage
            'disk_usage' => 85, // percentage
        ],
    ],

    'tracing' => [
        'enabled' => env('TRACING_ENABLED', false),
        'driver' => env('TRACING_DRIVER', 'jaeger'),
        'endpoint' => env('TRACING_ENDPOINT', 'http://jaeger:14268/api/traces'),
        'sampling_rate' => env('TRACING_SAMPLING_RATE', 0.1), // 10%
    ],

    'dashboard' => [
        'enabled' => env('MONITORING_DASHBOARD_ENABLED', false),
        'endpoint' => env('MONITORING_DASHBOARD_ENDPOINT', '/monitoring'),
        'refresh_interval' => env('MONITORING_DASHBOARD_REFRESH_INTERVAL', 30), // seconds
    ],
];
