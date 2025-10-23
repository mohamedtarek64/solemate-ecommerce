<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminAnalyticsController extends Controller
{
    public function getSales(Request $request)
    {
        try {
            $period = $request->get('period', '7d');
            $startDate = $this->getStartDate($period);

            $sales = [
                'total_sales' => DB::table('orders')
                    ->where('created_at', '>=', $startDate)
                    ->sum('total_amount'),
                'total_orders' => DB::table('orders')
                    ->where('created_at', '>=', $startDate)
                    ->count(),
                'average_order_value' => DB::table('orders')
                    ->where('created_at', '>=', $startDate)
                    ->avg('total_amount'),
                'sales_by_day' => $this->getSalesByDay($startDate),
                'top_products' => $this->getTopProducts($startDate),
                'sales_growth' => $this->getSalesGrowth($startDate)
            ];

            return response()->json([
                'success' => true,
                'data' => $sales
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get sales analytics: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getUsers(Request $request)
    {
        try {
            $period = $request->get('period', '7d');
            $startDate = $this->getStartDate($period);

            $users = [
                'total_users' => DB::table('users')->count(),
                'new_users' => DB::table('users')
                    ->where('created_at', '>=', $startDate)
                    ->count(),
                'active_users' => DB::table('users')
                    ->where('updated_at', '>=', $startDate)
                    ->count(),
                'users_by_day' => $this->getUsersByDay($startDate),
                'user_segments' => $this->getUserSegments($startDate),
                'user_growth' => $this->getUserGrowth($startDate)
            ];

            return response()->json([
                'success' => true,
                'data' => $users
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get user analytics: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getProducts(Request $request)
    {
        try {
            $period = $request->get('period', '7d');
            $startDate = $this->getStartDate($period);

            $products = [
                'total_products' => DB::table('products')->where('is_active', true)->count(),
                'new_products' => DB::table('products')
                    ->where('created_at', '>=', $startDate)
                    ->count(),
                'top_selling' => $this->getTopSellingProducts($startDate),
                'low_stock' => $this->getLowStockProducts(),
                'product_performance' => $this->getProductPerformance($startDate),
                'category_breakdown' => $this->getCategoryBreakdown($startDate)
            ];

            return response()->json([
                'success' => true,
                'data' => $products
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get product analytics: ' . $e->getMessage()
            ], 500);
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

    private function getSalesByDay($startDate)
    {
        return DB::table('orders')
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_amount) as sales'))
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    private function getTopProducts($startDate)
    {
        return DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select('products.name', DB::raw('SUM(order_items.quantity) as total_sold'), DB::raw('SUM(order_items.quantity * order_items.price) as revenue'))
            ->where('order_items.created_at', '>=', $startDate)
            ->groupBy('products.id', 'products.name')
            ->orderBy('total_sold', 'desc')
            ->limit(10)
            ->get();
    }

    private function getSalesGrowth($startDate)
    {
        $currentPeriod = DB::table('orders')
            ->where('created_at', '>=', $startDate)
            ->sum('total_amount');

        $previousStartDate = $startDate->copy()->subDays($startDate->diffInDays(now()));
        $previousPeriod = DB::table('orders')
            ->whereBetween('created_at', [$previousStartDate, $startDate])
            ->sum('total_amount');

        $growth = $previousPeriod > 0 ? (($currentPeriod - $previousPeriod) / $previousPeriod) * 100 : 0;

        return [
            'current_period' => $currentPeriod,
            'previous_period' => $previousPeriod,
            'growth_percentage' => round($growth, 2)
        ];
    }

    private function getUsersByDay($startDate)
    {
        return DB::table('users')
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    private function getUserSegments($startDate)
    {
        return [
            'new_customers' => DB::table('users')
                ->where('created_at', '>=', $startDate)
                ->count(),
            'returning_customers' => DB::table('users')
                ->where('created_at', '<', $startDate)
                ->where('updated_at', '>=', $startDate)
                ->count(),
            'inactive_customers' => DB::table('users')
                ->where('updated_at', '<', $startDate)
                ->count()
        ];
    }

    private function getUserGrowth($startDate)
    {
        $currentPeriod = DB::table('users')
            ->where('created_at', '>=', $startDate)
            ->count();

        $previousStartDate = $startDate->copy()->subDays($startDate->diffInDays(now()));
        $previousPeriod = DB::table('users')
            ->whereBetween('created_at', [$previousStartDate, $startDate])
            ->count();

        $growth = $previousPeriod > 0 ? (($currentPeriod - $previousPeriod) / $previousPeriod) * 100 : 0;

        return [
            'current_period' => $currentPeriod,
            'previous_period' => $previousPeriod,
            'growth_percentage' => round($growth, 2)
        ];
    }

    private function getTopSellingProducts($startDate)
    {
        return DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select('products.name', 'products.image_url', DB::raw('SUM(order_items.quantity) as total_sold'))
            ->where('order_items.created_at', '>=', $startDate)
            ->groupBy('products.id', 'products.name', 'products.image_url')
            ->orderBy('total_sold', 'desc')
            ->limit(5)
            ->get();
    }

    private function getLowStockProducts()
    {
        return DB::table('products')
            ->where('is_active', true)
            ->where('stock_quantity', '<=', 10)
            ->select('name', 'stock_quantity', 'image_url')
            ->orderBy('stock_quantity', 'asc')
            ->get();
    }

    private function getProductPerformance($startDate)
    {
        return DB::table('products')
            ->leftJoin('order_items', 'products.id', '=', 'order_items.product_id')
            ->select(
                'products.name',
                'products.price',
                'products.stock_quantity',
                DB::raw('COALESCE(SUM(order_items.quantity), 0) as total_sold'),
                DB::raw('COALESCE(SUM(order_items.quantity * order_items.price), 0) as revenue')
            )
            ->where('products.is_active', true)
            ->where('order_items.created_at', '>=', $startDate)
            ->groupBy('products.id', 'products.name', 'products.price', 'products.stock_quantity')
            ->orderBy('total_sold', 'desc')
            ->limit(20)
            ->get();
    }

    private function getCategoryBreakdown($startDate)
    {
        return DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select('products.category', DB::raw('SUM(order_items.quantity) as total_sold'), DB::raw('SUM(order_items.quantity * order_items.price) as revenue'))
            ->where('order_items.created_at', '>=', $startDate)
            ->groupBy('products.category')
            ->orderBy('total_sold', 'desc')
            ->get();
    }
}
