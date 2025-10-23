<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Throwable;

class PerformanceAwareHandler extends ExceptionHandler
{
    /**
     * A list of exception types with their corresponding custom log levels.
     *
     * @var array<class-string<\Throwable>, \Psr\Log\LogLevel::*>
     */
    protected $levels = [
        //
    ];

    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<\Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            // Log with performance context
            $executionTime = defined('LARAVEL_START') 
                ? round((microtime(true) - LARAVEL_START) * 1000, 2) 
                : null;

            Log::error('Exception occurred', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'execution_time' => $executionTime ? "{$executionTime}ms" : 'unknown',
                'memory_usage' => round(memory_get_peak_usage(true) / 1024 / 1024, 2) . 'MB'
            ]);
        });
    }

    /**
     * Render an exception into an HTTP response.
     */
    public function render($request, Throwable $e)
    {
        // Add performance headers even on errors
        $response = parent::render($request, $e);

        if (defined('LARAVEL_START')) {
            $executionTime = round((microtime(true) - LARAVEL_START) * 1000, 2);
            $response->headers->set('X-Response-Time', $executionTime . 'ms');
        }

        // Cache error responses for repeated errors
        if ($e->getCode() === 404 && $request->is('api/*')) {
            $cacheKey = 'error_404:' . md5($request->fullUrl());
            if (!Cache::has($cacheKey)) {
                Cache::put($cacheKey, true, 60); // Cache 404 for 1 minute
            }
        }

        return $response;
    }
}

