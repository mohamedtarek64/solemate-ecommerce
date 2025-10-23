<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

class HealthController extends Controller
{
    public function check(Request $request)
    {
        try {
            $health = [
                'status' => 'healthy',
                'timestamp' => now()->toISOString(),
                'version' => '1.0.0',
                'environment' => app()->environment(),
                'services' => []
            ];

            // Check Database
            try {
                DB::connection()->getPdo();
                $health['services']['database'] = [
                    'status' => 'healthy',
                    'response_time' => $this->getDatabaseResponseTime()
                ];
            } catch (\Exception $e) {
                $health['services']['database'] = [
                    'status' => 'unhealthy',
                    'error' => $e->getMessage()
                ];
                $health['status'] = 'unhealthy';
            }

            // Check Cache
            try {
                Cache::put('health_check', 'ok', 60);
                $cacheValue = Cache::get('health_check');
                $health['services']['cache'] = [
                    'status' => $cacheValue === 'ok' ? 'healthy' : 'unhealthy',
                    'driver' => config('cache.default')
                ];
            } catch (\Exception $e) {
                $health['services']['cache'] = [
                    'status' => 'unhealthy',
                    'error' => $e->getMessage()
                ];
            }

            // Check Redis (if available)
            try {
                if (config('cache.default') === 'redis') {
                    Redis::ping();
                    $health['services']['redis'] = [
                        'status' => 'healthy',
                        'driver' => 'redis'
                    ];
                }
            } catch (\Exception $e) {
                $health['services']['redis'] = [
                    'status' => 'unhealthy',
                    'error' => $e->getMessage()
                ];
            }

            // Check Storage
            try {
                $testFile = 'health_check_' . time() . '.txt';
                \Storage::put($testFile, 'health check');
                \Storage::delete($testFile);
                $health['services']['storage'] = [
                    'status' => 'healthy',
                    'driver' => config('filesystems.default')
                ];
            } catch (\Exception $e) {
                $health['services']['storage'] = [
                    'status' => 'unhealthy',
                    'error' => $e->getMessage()
                ];
            }

            // System Info
            $health['system'] = [
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'memory_usage' => memory_get_usage(true),
                'memory_limit' => ini_get('memory_limit'),
                'uptime' => $this->getUptime()
            ];

            $statusCode = $health['status'] === 'healthy' ? 200 : 503;

            return response()->json([
                'success' => $health['status'] === 'healthy',
                'data' => $health
            ], $statusCode);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Health check failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function status(Request $request)
    {
        try {
            $status = [
                'status' => 'online',
                'timestamp' => now()->toISOString(),
                'uptime' => $this->getUptime(),
                'version' => '1.0.0'
            ];

            return response()->json([
                'success' => true,
                'data' => $status
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Status check failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function metrics(Request $request)
    {
        try {
            $metrics = [
                'timestamp' => now()->toISOString(),
                'database' => [
                    'total_users' => DB::table('users')->count(),
                    'total_products' => DB::table('products')->count(),
                    'total_orders' => DB::table('orders')->count(),
                    'active_products' => DB::table('products')->where('is_active', true)->count()
                ],
                'system' => [
                    'memory_usage' => memory_get_usage(true),
                    'memory_peak' => memory_get_peak_usage(true),
                    'memory_limit' => ini_get('memory_limit'),
                    'cpu_usage' => $this->getCpuUsage(),
                    'disk_usage' => $this->getDiskUsage()
                ],
                'performance' => [
                    'response_time' => microtime(true) - LARAVEL_START,
                    'queries_count' => DB::getQueryLog() ? count(DB::getQueryLog()) : 0
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $metrics
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get metrics: ' . $e->getMessage()
            ], 500);
        }
    }

    private function getDatabaseResponseTime()
    {
        $start = microtime(true);
        DB::select('SELECT 1');
        return round((microtime(true) - $start) * 1000, 2); // Convert to milliseconds
    }

    private function getUptime()
    {
        try {
            if (function_exists('sys_getloadavg')) {
                $load = sys_getloadavg();
                return [
                    'load_1min' => $load[0],
                    'load_5min' => $load[1],
                    'load_15min' => $load[2]
                ];
            }
            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    private function getCpuUsage()
    {
        try {
            if (function_exists('sys_getloadavg')) {
                $load = sys_getloadavg();
                return $load[0]; // 1-minute load average
            }
            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    private function getDiskUsage()
    {
        try {
            $total = disk_total_space('/');
            $free = disk_free_space('/');
            $used = $total - $free;
            
            return [
                'total' => $total,
                'used' => $used,
                'free' => $free,
                'percentage' => round(($used / $total) * 100, 2)
            ];
        } catch (\Exception $e) {
            return null;
        }
    }
}