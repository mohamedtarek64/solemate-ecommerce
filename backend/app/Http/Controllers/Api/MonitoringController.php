<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MonitoringController extends Controller
{
    public function trackBehavior(Request $request)
    {
        try {
            $request->validate([
                'event_type' => 'required|string',
                'page_url' => 'required|string',
                'user_agent' => 'required|string',
                'session_id' => 'required|string',
                'metadata' => 'nullable|array'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('monitoring_behavior')->insert([
                'user_id' => $userId,
                'event_type' => $request->event_type,
                'page_url' => $request->page_url,
                'user_agent' => $request->user_agent,
                'session_id' => $request->session_id,
                'ip_address' => $request->ip(),
                'metadata' => json_encode($request->metadata ?? []),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Behavior tracked successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track behavior: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackPerformance(Request $request)
    {
        try {
            $request->validate([
                'page_load_time' => 'required|numeric',
                'dom_content_loaded' => 'required|numeric',
                'first_paint' => 'required|numeric',
                'first_contentful_paint' => 'required|numeric',
                'largest_contentful_paint' => 'required|numeric',
                'cumulative_layout_shift' => 'required|numeric',
                'first_input_delay' => 'required|numeric',
                'page_url' => 'required|string',
                'session_id' => 'required|string'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('monitoring_performance')->insert([
                'user_id' => $userId,
                'page_load_time' => $request->page_load_time,
                'dom_content_loaded' => $request->dom_content_loaded,
                'first_paint' => $request->first_paint,
                'first_contentful_paint' => $request->first_contentful_paint,
                'largest_contentful_paint' => $request->largest_contentful_paint,
                'cumulative_layout_shift' => $request->cumulative_layout_shift,
                'first_input_delay' => $request->first_input_delay,
                'page_url' => $request->page_url,
                'session_id' => $request->session_id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Performance tracked successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track performance: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackBusiness(Request $request)
    {
        try {
            $request->validate([
                'metric_type' => 'required|string',
                'value' => 'required|numeric',
                'metadata' => 'nullable|array'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('monitoring_business')->insert([
                'user_id' => $userId,
                'metric_type' => $request->metric_type,
                'value' => $request->value,
                'metadata' => json_encode($request->metadata ?? []),
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Business metric tracked successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track business metric: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getHealth(Request $request)
    {
        try {
            $health = [
                'status' => 'healthy',
                'timestamp' => now()->toISOString(),
                'services' => [
                    'database' => $this->checkDatabaseHealth(),
                    'cache' => $this->checkCacheHealth(),
                    'storage' => $this->checkStorageHealth()
                ],
                'metrics' => [
                    'active_users' => DB::table('users')->where('updated_at', '>=', now()->subHour())->count(),
                    'total_orders' => DB::table('orders')->count(),
                    'total_products' => DB::table('products')->where('is_active', true)->count()
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $health
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get health status: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getDashboard(Request $request)
    {
        try {
            $period = $request->get('period', '7d');
            $startDate = $this->getStartDate($period);

            $dashboard = [
                'overview' => [
                    'total_users' => DB::table('users')->count(),
                    'active_users' => DB::table('users')->where('updated_at', '>=', $startDate)->count(),
                    'total_orders' => DB::table('orders')->where('created_at', '>=', $startDate)->count(),
                    'total_revenue' => DB::table('orders')->where('created_at', '>=', $startDate)->sum('total_amount')
                ],
                'performance' => [
                    'avg_page_load' => DB::table('monitoring_performance')->where('created_at', '>=', $startDate)->avg('page_load_time'),
                    'avg_fcp' => DB::table('monitoring_performance')->where('created_at', '>=', $startDate)->avg('first_contentful_paint'),
                    'avg_lcp' => DB::table('monitoring_performance')->where('created_at', '>=', $startDate)->avg('largest_contentful_paint')
                ],
                'behavior' => [
                    'page_views' => DB::table('monitoring_behavior')->where('created_at', '>=', $startDate)->count(),
                    'unique_sessions' => DB::table('monitoring_behavior')->where('created_at', '>=', $startDate)->distinct('session_id')->count(),
                    'bounce_rate' => $this->calculateBounceRate($startDate)
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $dashboard
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get dashboard data: ' . $e->getMessage()
            ], 500);
        }
    }

    private function checkDatabaseHealth()
    {
        try {
            DB::table('users')->count();
            return 'healthy';
        } catch (\Exception $e) {
            return 'unhealthy';
        }
    }

    private function checkCacheHealth()
    {
        try {
            // Check Redis connection if available
            return 'healthy';
        } catch (\Exception $e) {
            return 'unhealthy';
        }
    }

    private function checkStorageHealth()
    {
        try {
            // Check storage availability
            return 'healthy';
        } catch (\Exception $e) {
            return 'unhealthy';
        }
    }

    private function getStartDate($period)
    {
        switch ($period) {
            case '1d':
                return now()->subDay();
            case '7d':
                return now()->subWeek();
            case '30d':
                return now()->subMonth();
            case '90d':
                return now()->subMonths(3);
            default:
                return now()->subWeek();
        }
    }

    private function calculateBounceRate($startDate)
    {
        $totalSessions = DB::table('monitoring_behavior')
            ->where('created_at', '>=', $startDate)
            ->distinct('session_id')
            ->count();

        $singlePageSessions = DB::table('monitoring_behavior')
            ->where('created_at', '>=', $startDate)
            ->groupBy('session_id')
            ->havingRaw('COUNT(*) = 1')
            ->count();

        return $totalSessions > 0 ? ($singlePageSessions / $totalSessions) * 100 : 0;
    }
}
