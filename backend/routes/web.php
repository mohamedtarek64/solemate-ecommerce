<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return response()->json([
        'message' => 'SoleMate E-Commerce API',
        'status' => 'running',
        'version' => '1.0.0',
        'frontend_url' => 'http://localhost:3000',
        'api_documentation' => 'http://127.0.0.1:8000/api',
        'endpoints' => [
            'GET /api/health' => 'Health check',
            'GET /api/admin/products' => 'Get all products',
            'POST /api/auth/login' => 'User login',
            'POST /api/auth/register' => 'User registration',
            'GET /api/categories' => 'Get categories',
            'POST /api/orders' => 'Create order'
        ]
    ]);
});

Route::get('/test-route', function () {
    return response()->json(['message' => 'Test route works']);
});

Route::get('/home', function () {
    return response()->json([
        'message' => 'Dashboard API endpoint',
        'status' => 'authenticated',
        'user' => auth()->user()
    ]);
})->middleware('auth');

Route::get('/admin', function () {
    return response()->json([
        'message' => 'Admin Dashboard API endpoint',
        'status' => 'admin_access_granted',
        'user' => auth()->user(),
        'admin_functions' => [
            'Manage Products',
            'Manage Categories',
            'Manage Users',
            'View Orders'
        ]
    ]);
})->middleware(['auth', 'admin']);

// Health check route for web
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now(),
        'environment' => app()->environment(),
    ]);
});

// Maintenance mode bypass
Route::get('/maintenance', function () {
    return response()->json([
        'message' => 'Application is in maintenance mode',
        'retry_after' => 60,
    ], 503);
});


// Dashboard API routes (without middleware for testing)
Route::prefix('api/services/admin/dashboard')->group(function () {
    Route::get('/stats', [App\Http\Controllers\Api\DashboardController::class, 'getStats']);
    Route::get('/recent-orders', [App\Http\Controllers\Api\DashboardController::class, 'getRecentOrders']);
    Route::get('/sales-overview', [App\Http\Controllers\Api\DashboardController::class, 'getSalesOverview']);
    Route::get('/performance', [App\Http\Controllers\Api\DashboardController::class, 'getPerformance']);
    Route::get('/chart-data', [App\Http\Controllers\Api\DashboardController::class, 'getChartData']);
});

// Admin API routes (without middleware for testing)
Route::prefix('api/admin')->group(function () {
    Route::get('/products', [App\Http\Controllers\Api\AdminController::class, 'getProducts']);
    Route::get('/orders', [App\Http\Controllers\Api\AdminController::class, 'getOrders']);
    Route::get('/customers', [App\Http\Controllers\Api\AdminController::class, 'getCustomers']);
    Route::get('/analytics/sales', [App\Http\Controllers\Api\AdminController::class, 'getSalesAnalytics']);
    Route::get('/analytics/users', [App\Http\Controllers\Api\AdminController::class, 'getUsersAnalytics']);
    Route::get('/analytics/products', [App\Http\Controllers\Api\AdminController::class, 'getProductsAnalytics']);
    Route::get('/settings', [App\Http\Controllers\Api\AdminController::class, 'getSettings']);
});
