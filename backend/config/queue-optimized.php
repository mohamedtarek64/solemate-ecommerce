<?php

/**
 * Optimized Queue Configuration
 * Configure queue workers for better performance
 */

return [
    
    /*
    |--------------------------------------------------------------------------
    | Queue Workers Configuration
    |--------------------------------------------------------------------------
    |
    | Optimized configuration for queue workers
    |
    */
    
    'workers' => [
        // Default worker for general tasks
        'default' => [
            'connection' => env('QUEUE_CONNECTION', 'database'),
            'queue' => 'default',
            'tries' => 3,
            'timeout' => 60,
            'sleep' => 3,
            'max_jobs' => 1000,
            'max_time' => 3600,
        ],
        
        // High priority worker for critical tasks
        'high' => [
            'connection' => env('QUEUE_CONNECTION', 'database'),
            'queue' => 'high',
            'tries' => 3,
            'timeout' => 30,
            'sleep' => 1,
            'max_jobs' => 500,
            'max_time' => 1800,
        ],
        
        // Low priority worker for non-critical tasks
        'low' => [
            'connection' => env('QUEUE_CONNECTION', 'database'),
            'queue' => 'low',
            'tries' => 2,
            'timeout' => 120,
            'sleep' => 5,
            'max_jobs' => 2000,
            'max_time' => 7200,
        ],
        
        // Email worker for sending emails
        'emails' => [
            'connection' => env('QUEUE_CONNECTION', 'database'),
            'queue' => 'emails',
            'tries' => 3,
            'timeout' => 30,
            'sleep' => 2,
            'max_jobs' => 1000,
            'max_time' => 3600,
        ],
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Queue Priorities
    |--------------------------------------------------------------------------
    |
    | Define which jobs should run on which queue
    |
    */
    
    'job_queues' => [
        'SendOrderConfirmationEmail' => 'emails',
        'ProcessOrderJob' => 'high',
        'UpdateProductStockJob' => 'default',
        'GenerateInvoiceJob' => 'low',
    ],
    
];

