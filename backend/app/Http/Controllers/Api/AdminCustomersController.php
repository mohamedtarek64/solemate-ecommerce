<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminCustomersController extends Controller
{
    public function index(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 15);
            $search = $request->get('search');
            $sort = $request->get('sort', 'created_at');
            $order = $request->get('order', 'desc');

            $query = DB::table('users')
                ->select('users.*', 
                    DB::raw('COUNT(orders.id) as total_orders'),
                    DB::raw('COALESCE(SUM(orders.total_amount), 0) as total_spent'),
                    DB::raw('MAX(orders.created_at) as last_order_date')
                )
                ->leftJoin('orders', 'users.id', '=', 'orders.user_id')
                ->groupBy('users.id');

            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('users.name', 'like', "%{$search}%")
                      ->orWhere('users.email', 'like', "%{$search}%");
                });
            }

            $customers = $query->orderBy($sort, $order)
                ->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data' => $customers
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get customers: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Request $request, $id)
    {
        try {
            $customer = DB::table('users')
                ->select('users.*', 
                    DB::raw('COUNT(orders.id) as total_orders'),
                    DB::raw('COALESCE(SUM(orders.total_amount), 0) as total_spent'),
                    DB::raw('MAX(orders.created_at) as last_order_date')
                )
                ->leftJoin('orders', 'users.id', '=', 'orders.user_id')
                ->where('users.id', $id)
                ->groupBy('users.id')
                ->first();

            if (!$customer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Customer not found'
                ], 404);
            }

            // Get customer orders
            $orders = DB::table('orders')
                ->where('user_id', $id)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            // Get customer addresses
            $addresses = DB::table('user_addresses')
                ->where('user_id', $id)
                ->get();

            $customer->orders = $orders;
            $customer->addresses = $addresses;

            return response()->json([
                'success' => true,
                'data' => $customer
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get customer: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'nullable|string|max:20',
                'is_active' => 'boolean'
            ]);

            $updated = DB::table('users')
                ->where('id', $id)
                ->update([
                    'name' => $request->name,
                    'email' => $request->email,
                    'phone' => $request->phone,
                    'is_active' => $request->is_active ?? true,
                    'updated_at' => now()
                ]);

            if ($updated) {
                return response()->json([
                    'success' => true,
                    'message' => 'Customer updated successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Customer not found'
                ], 404);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update customer: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            // Soft delete - just deactivate the user
            $updated = DB::table('users')
                ->where('id', $id)
                ->update([
                    'is_active' => false,
                    'email' => 'deleted_' . time() . '@deleted.com',
                    'name' => 'Deleted User',
                    'updated_at' => now()
                ]);

            if ($updated) {
                return response()->json([
                    'success' => true,
                    'message' => 'Customer deleted successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Customer not found'
                ], 404);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete customer: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getOrders(Request $request, $id)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 15);

            $orders = DB::table('orders')
                ->where('user_id', $id)
                ->orderBy('created_at', 'desc')
                ->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data' => $orders
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get customer orders: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getAnalytics(Request $request, $id)
    {
        try {
            $period = $request->get('period', '30d');
            $startDate = $this->getStartDate($period);

            $analytics = [
                'total_orders' => DB::table('orders')
                    ->where('user_id', $id)
                    ->count(),
                'total_spent' => DB::table('orders')
                    ->where('user_id', $id)
                    ->sum('total_amount'),
                'average_order_value' => DB::table('orders')
                    ->where('user_id', $id)
                    ->avg('total_amount'),
                'orders_in_period' => DB::table('orders')
                    ->where('user_id', $id)
                    ->where('created_at', '>=', $startDate)
                    ->count(),
                'spent_in_period' => DB::table('orders')
                    ->where('user_id', $id)
                    ->where('created_at', '>=', $startDate)
                    ->sum('total_amount'),
                'favorite_categories' => $this->getFavoriteCategories($id),
                'order_frequency' => $this->getOrderFrequency($id, $startDate)
            ];

            return response()->json([
                'success' => true,
                'data' => $analytics
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get customer analytics: ' . $e->getMessage()
            ], 500);
        }
    }

    private function getStartDate($period)
    {
        switch ($period) {
            case '7d':
                return now()->subWeek();
            case '30d':
                return now()->subMonth();
            case '90d':
                return now()->subMonths(3);
            default:
                return now()->subMonth();
        }
    }

    private function getFavoriteCategories($userId)
    {
        return DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->select('products.category', DB::raw('COUNT(*) as order_count'))
            ->where('orders.user_id', $userId)
            ->groupBy('products.category')
            ->orderBy('order_count', 'desc')
            ->limit(5)
            ->get();
    }

    private function getOrderFrequency($userId, $startDate)
    {
        $ordersInPeriod = DB::table('orders')
            ->where('user_id', $userId)
            ->where('created_at', '>=', $startDate)
            ->count();

        $daysInPeriod = $startDate->diffInDays(now());
        
        return [
            'orders_in_period' => $ordersInPeriod,
            'days_in_period' => $daysInPeriod,
            'frequency_per_week' => $daysInPeriod > 0 ? ($ordersInPeriod / $daysInPeriod) * 7 : 0
        ];
    }
}
