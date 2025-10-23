<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;

class HealthCheckController extends Controller
{
    /**
     * Health check endpoint
     */
    public function index(Request $request)
    {
        $startTime = microtime(true);

        $checks = [
            'status' => 'healthy',
            'timestamp' => now()->toIso8601String(),
            'checks' => []
        ];

        // Database check
        try {
            DB::connection()->getPdo();
            $dbTime = microtime(true);
            DB::table('users')->count();
            $dbQueryTime = round((microtime(true) - $dbTime) * 1000, 2);
            
            $checks['checks']['database'] = [
                'status' => 'up',
                'response_time' => "{$dbQueryTime}ms"
            ];
        } catch (\Exception $e) {
            $checks['status'] = 'degraded';
            $checks['checks']['database'] = [
                'status' => 'down',
                'error' => $e->getMessage()
            ];
        }

        // Cache check
        try {
            $cacheTime = microtime(true);
            Cache::put('health_check', true, 1);
            $canWrite = Cache::get('health_check');
            Cache::forget('health_check');
            $cacheCheckTime = round((microtime(true) - $cacheTime) * 1000, 2);
            
            $checks['checks']['cache'] = [
                'status' => $canWrite ? 'up' : 'degraded',
                'response_time' => "{$cacheCheckTime}ms",
                'driver' => config('cache.default')
            ];
        } catch (\Exception $e) {
            $checks['status'] = 'degraded';
            $checks['checks']['cache'] = [
                'status' => 'down',
                'error' => $e->getMessage()
            ];
        }

        // Queue check
        try {
            $queueConnection = config('queue.default');
            $checks['checks']['queue'] = [
                'status' => 'up',
                'connection' => $queueConnection
            ];
        } catch (\Exception $e) {
            $checks['checks']['queue'] = [
                'status' => 'down',
                'error' => $e->getMessage()
            ];
        }

        // Performance metrics
        $executionTime = round((microtime(true) - $startTime) * 1000, 2);
        $memoryUsage = round(memory_get_peak_usage(true) / 1024 / 1024, 2);

        $checks['performance'] = [
            'execution_time' => "{$executionTime}ms",
            'memory_usage' => "{$memoryUsage}MB",
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version()
        ];

        // Overall status
        $hasFailures = collect($checks['checks'])->contains(function ($check) {
            return $check['status'] === 'down';
        });

        if ($hasFailures) {
            $checks['status'] = 'unhealthy';
        }

        $statusCode = $checks['status'] === 'healthy' ? 200 : 503;

        return response()->json($checks, $statusCode)
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    /**
     * Performance metrics endpoint
     */
    public function metrics()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'cache_stats' => [
                    'driver' => config('cache.default'),
                    'prefix' => config('cache.prefix')
                ],
                'queue_stats' => [
                    'connection' => config('queue.default'),
                    'jobs_table' => 'jobs'
                ],
                'database_stats' => [
                    'connection' => config('database.default'),
                    'tables_count' => $this->getTablesCount()
                ],
                'performance' => [
                    'memory_limit' => ini_get('memory_limit'),
                    'max_execution_time' => ini_get('max_execution_time'),
                    'php_version' => PHP_VERSION
                ]
            ]
        ]);
    }

    /**
     * Get tables count
     */
    private function getTablesCount()
    {
        try {
            $tables = DB::select('SHOW TABLES');
            return count($tables);
        } catch (\Exception $e) {
            return 0;
        }
    }
}

