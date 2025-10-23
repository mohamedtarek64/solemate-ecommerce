<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;
use App\Http\Controllers\Api\SocialAuthController;

// ✅ Configure Rate Limiting
RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
});

RateLimiter::for('search', function (Request $request) {
    return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip());
});

RateLimiter::for('checkout', function (Request $request) {
    return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
});

// TEMPORARILY without auth
Route::get('/user', function (Request $request) {
    return $request->user();
});

// User profile routes - Enhanced authentication
Route::get('/user/profile', function (Request $request) {
    // Get token from Authorization header
    $token = $request->bearerToken();
    if (!$token) {
        \Log::error('No bearer token provided in profile request');
        return response()->json([
            'success' => false,
            'message' => 'Authentication token required'
        ], 401);
    }

    // Try to get user from token using manual validation
    try {
        // Find the token in database - extract the token part after the pipe
        $tokenParts = explode('|', $token);
        if (count($tokenParts) !== 2) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token format'
            ], 401);
        }

        $tokenId = $tokenParts[0];
        $tokenHash = hash('sha256', $tokenParts[1]);

        $personalAccessToken = DB::table('personal_access_tokens')
            ->where('id', $tokenId)
            ->where('token', $tokenHash)
            ->first();

        if (!$personalAccessToken) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token'
            ], 401);
        }

        $userId = $personalAccessToken->tokenable_id;
        $user = DB::table('users')
            ->where('id', $userId)
            ->select('id', 'name', 'first_name', 'last_name', 'email', 'phone', 'avatar', 'role', 'created_at', 'updated_at')
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'phone' => $user->phone ?? '',
                    'avatar' => $user->avatar ?? '',
                    'role' => $user->role,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at
                ]
            ]
        ]);

    } catch (\Exception $e) {
        \Log::error('Profile API error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Authentication failed: ' . $e->getMessage()
        ], 401);
    }
});

Route::put('/user/profile', function (Request $request) {
    // Get token from Authorization header
    $token = $request->bearerToken();
    if (!$token) {
        \Log::error('No bearer token provided in profile update request');
        return response()->json([
            'success' => false,
            'message' => 'Authentication token required'
        ], 401);
    }

    try {
        // Find the token in database - extract the token part after the pipe
        $tokenParts = explode('|', $token);
        if (count($tokenParts) !== 2) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token format'
            ], 401);
        }

        $tokenId = $tokenParts[0];
        $tokenHash = hash('sha256', $tokenParts[1]);

        $personalAccessToken = DB::table('personal_access_tokens')
            ->where('id', $tokenId)
            ->where('token', $tokenHash)
            ->first();

        if (!$personalAccessToken) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token'
            ], 401);
        }

        $userId = $personalAccessToken->tokenable_id;
        $user = DB::table('users')
            ->where('id', $userId)
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        // Validate input
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email,' . $userId,
            'name' => 'nullable|string|max:255'
        ]);

        // Update user in database
        $updated = DB::table('users')
            ->where('id', $userId)
            ->update([
                'name' => $validated['first_name'] . ' ' . ($validated['last_name'] ?? ''),
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'] ?? '',
                'email' => $validated['email'],
                'updated_at' => now()
            ]);

        if ($updated) {
            // Get updated user data
            $updatedUser = DB::table('users')
                ->where('id', $userId)
                ->select('id', 'name', 'first_name', 'last_name', 'email', 'phone', 'avatar', 'role', 'created_at', 'updated_at')
                ->first();

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => [
                    'user' => [
                        'id' => $updatedUser->id,
                        'name' => $updatedUser->name,
                        'email' => $updatedUser->email,
                        'first_name' => $updatedUser->first_name,
                        'last_name' => $updatedUser->last_name,
                        'phone' => $updatedUser->phone ?? '',
                        'avatar' => $updatedUser->avatar ?? '',
                        'role' => $updatedUser->role,
                        'created_at' => $updatedUser->created_at,
                        'updated_at' => $updatedUser->updated_at
                    ]
                ]
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile'
            ], 500);
        }

    } catch (\Exception $e) {
        \Log::error('Profile update error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to update profile: ' . $e->getMessage()
        ], 500);
    }
});

Route::get('/auth/user', function (Request $request) {
    // Get token from Authorization header
    $token = $request->bearerToken();
    if (!$token) {
        \Log::error('No bearer token provided in auth user request');
        return response()->json([
            'success' => false,
            'message' => 'Authentication token required'
        ], 401);
    }

    // Try to get user from token
    $user = $request->user();
    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'User not authenticated'
        ], 401);
    }

    return response()->json([
        'success' => true,
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'role' => $user->role,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at
        ]
    ]);
});

// Test authentication route - TEMPORARILY without auth
Route::get('/test-auth', function (Request $request) {
    return response()->json([
        'success' => true,
        'message' => 'Authentication successful',
        'user' => $request->user()
    ]);
});

// Simple test route WITHOUT authentication
Route::get('/test-no-auth', function () {
    return response()->json([
        'success' => true,
        'message' => 'No auth route works!',
        'timestamp' => now()
    ]);
});

// Test route to check current user
Route::get('/test-current-user', function (Request $request) {
    $user = $request->user();
    return response()->json([
        'success' => true,
        'user' => $user ? [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role
        ] : null,
        'has_user' => $user ? true : false,
        'headers' => [
            'authorization' => $request->header('Authorization')
        ]
    ]);
});

// Simple test route
Route::get('/simple-test', function () {
    return response()->json(['message' => 'API is working']);
});

Route::get('/test-user', function (Request $request) {
    try {
        $user = $request->user();
        if ($user) {
            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role
                ]
            ]);
        } else {
            return response()->json(['success' => false, 'message' => 'No authenticated user']);
        }
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'error' => $e->getMessage()]);
    }
});

Route::get('/test-user-auth', function (Request $request) {
    try {
        $user = $request->user();
        if ($user) {
            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role
                ]
            ]);
        } else {
            return response()->json(['success' => false, 'message' => 'No authenticated user']);
        }
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'error' => $e->getMessage()]);
    }
});

Route::get('/test-profile', function (Request $request) {
    try {
        // Get token from Authorization header
        $token = $request->bearerToken();
        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'No token provided'
            ], 401);
        }

        // Find the token in database - extract the token part after the pipe
        $tokenParts = explode('|', $token);
        if (count($tokenParts) !== 2) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token format'
            ], 401);
        }

        $tokenId = $tokenParts[0];
        $tokenHash = hash('sha256', $tokenParts[1]);

        $personalAccessToken = \DB::table('personal_access_tokens')
            ->where('id', $tokenId)
            ->where('token', $tokenHash)
            ->first();

        if (!$personalAccessToken) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token'
            ], 401);
        }

        $userId = $personalAccessToken->tokenable_id;

        $user = \DB::table('users')
            ->where('id', $userId)
            ->select('id', 'name', 'first_name', 'last_name', 'email', 'avatar', 'phone', 'role', 'created_at')
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'user' => $user
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ], 500);
    }
});

// Discount codes validation (public)
Route::post('/discount-codes/validate', [App\Http\Controllers\Api\DiscountController::class, 'validateDiscountCode']);
Route::post('/discount-codes/apply', [App\Http\Controllers\Api\DiscountController::class, 'applyDiscountCode']);

// Test CORS route
Route::get('/cors-test', function () {
    return response()->json([
        'message' => 'CORS is working',
        'timestamp' => now()->toISOString(),
        'origin' => request()->header('Origin')
    ]);
});

// Stripe routes
Route::get('/stripe/config', [App\Http\Controllers\Api\StripeController::class, 'getConfig']);
Route::post('/stripe/create-payment-intent', [App\Http\Controllers\Api\StripeController::class, 'createPaymentIntent']);
Route::post('/stripe/confirm-payment', [App\Http\Controllers\Api\StripeController::class, 'confirmPayment']);
Route::post('/stripe/validate-payment-method', [App\Http\Controllers\Api\StripeController::class, 'validatePaymentMethod']);

// Orders routes - Using custom token validation
Route::get('/orders', [App\Http\Controllers\Api\OrderController::class, 'index']);
Route::get('/orders/{orderNumber}', [App\Http\Controllers\Api\OrderController::class, 'showByOrderNumber'])->where('orderNumber', 'ORD-.*');
Route::get('/orders/{id}', [App\Http\Controllers\Api\OrderController::class, 'show'])->where('id', '[0-9]+');
Route::post('/orders', [App\Http\Controllers\Api\OrderController::class, 'store']);
Route::put('/orders/{id}/status', [App\Http\Controllers\Api\OrderController::class, 'updateStatus']);
Route::delete('/orders/{id}/cancel', [App\Http\Controllers\Api\OrderController::class, 'cancel']);
Route::get('/orders/{id}/tracking', [App\Http\Controllers\Api\OrderController::class, 'getTracking']);

// Database status route
Route::get('/db-status', function () {
    try {
        $tables = [
            'users' => DB::table('users')->count(),
            'orders' => DB::table('orders')->count(),
            'products_women' => DB::table('products_women')->count(),
            'products_men' => DB::table('products_men')->count()
        ];

        return response()->json([
            'success' => true,
            'message' => 'Database connection successful',
            'tables' => $tables,
            'timestamp' => now()->toISOString()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Database connection failed: ' . $e->getMessage(),
            'timestamp' => now()->toISOString()
        ], 500);
    }
});

// ✅ Enhanced Health Check with Performance Monitoring
Route::get('/health', [App\Http\Controllers\Api\HealthCheckController::class, 'index']);
Route::get('/status', [App\Http\Controllers\Api\HealthCheckController::class, 'index']);
Route::get('/metrics', [App\Http\Controllers\Api\HealthCheckController::class, 'metrics']);

// Auth routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [App\Http\Controllers\Api\AuthController::class, 'login']);
    Route::post('/register', [App\Http\Controllers\Api\AuthController::class, 'register']);
    Route::post('/logout', [App\Http\Controllers\Api\AuthController::class, 'logout']); // TEMPORARILY without auth
    Route::post('/refresh', [App\Http\Controllers\Api\AuthController::class, 'refresh']); // TEMPORARILY without auth
    Route::get('/me', [App\Http\Controllers\Api\AuthController::class, 'me']); // TEMPORARILY without auth
    Route::get('/user', [App\Http\Controllers\Api\AuthController::class, 'me']);
    Route::get('/profile', [App\Http\Controllers\Api\AuthController::class, 'getProfile']); // TEMPORARILY without auth
    Route::put('/profile', [App\Http\Controllers\Api\AuthController::class, 'updateProfile']); // TEMPORARILY without auth
    Route::put('/change-password', [App\Http\Controllers\Api\AuthController::class, 'changePassword']); // TEMPORARILY without auth

    // OAuth: Google/Facebook redirect + callback (public)
    Route::get('/{provider}', [SocialAuthController::class, 'redirectToProvider'])
        ->whereIn('provider', ['google', 'facebook']);
    Route::post('/{provider}/callback', [SocialAuthController::class, 'handleCallback'])
        ->whereIn('provider', ['google', 'facebook']);
    // Also support callbacks under /api/auth/social/{provider}/callback for compatibility
    Route::match(['get','post'], '/social/{provider}/callback', [SocialAuthController::class, 'handleCallback'])
        ->whereIn('provider', ['google', 'facebook']);

    // OAuth account linking - TEMPORARILY without auth
    Route::post('/link', [SocialAuthController::class, 'linkAccount']);
    Route::delete('/{provider}/unlink', [SocialAuthController::class, 'unlinkAccount'])
        ->whereIn('provider', ['google', 'facebook']);
    Route::get('/linked-accounts', [SocialAuthController::class, 'getLinkedAccounts']);
});

// User routes
Route::prefix('user')->group(function () {
    Route::get('/profile', [App\Http\Controllers\Api\UserController::class, 'getProfile']);
    // Temporarily disable auth for welcome message debugging
    Route::get('/welcome-message', function(Request $request) {
        return response()->json([
            'success' => true,
            'data' => [
                'welcome_message' => 'Welcome to SoleMate Store!',
                'greeting' => 'Welcome',
                'user_name' => 'User',
                'user_type' => 'customer',
                'user_type_message' => 'Welcome to SoleMate Store',
                'last_login' => 'First time',
                'order_count' => 0,
                'wishlist_count' => 0,
                'current_time' => now()->format('Y-m-d H:i:s'),
                'timezone' => config('app.timezone', 'UTC')
            ]
        ]);
    });
    Route::post('/profile', [App\Http\Controllers\Api\UserController::class, 'updateProfile']);
    Route::post('/change-password', [App\Http\Controllers\Api\UserController::class, 'changePassword']);
    Route::delete('/delete-account', [App\Http\Controllers\Api\UserController::class, 'deleteAccount']);
    Route::get('/dashboard', [App\Http\Controllers\Api\UserController::class, 'getDashboard']);

    // Addresses routes
    Route::get('/addresses', [App\Http\Controllers\Api\UserController::class, 'getAddresses']);
    Route::post('/addresses', [App\Http\Controllers\Api\UserController::class, 'createAddress']);
    Route::put('/addresses/{id}', [App\Http\Controllers\Api\UserController::class, 'updateAddress']);
    Route::delete('/addresses/{id}', [App\Http\Controllers\Api\UserController::class, 'deleteAddress']);
});

// Payment routes - TEMPORARILY without auth
Route::prefix('payment')->group(function () {
    Route::post('/create-intent', [App\Http\Controllers\PaymentController::class, 'createPaymentIntent']);
    Route::post('/confirm', [App\Http\Controllers\PaymentController::class, 'confirmPayment']);
    Route::get('/status/{paymentIntentId}', [App\Http\Controllers\PaymentController::class, 'getPaymentStatus']);
    Route::post('/create-customer', [App\Http\Controllers\PaymentController::class, 'createCustomer']);
    Route::get('/methods', [App\Http\Controllers\PaymentController::class, 'getPaymentMethods']);
});

// Stripe webhook (no auth)
Route::post('/payment/webhook', [App\Http\Controllers\PaymentController::class, 'webhook']);

// Public product images routes (no auth required)
Route::get('/public/product-images/hero', [App\Http\Controllers\ProductImageController::class, 'getHeroImage']);
Route::get('/public/product-images/featured', [App\Http\Controllers\ProductImageController::class, 'getFeaturedImages']);
Route::get('/public/product-images/categories', [App\Http\Controllers\ProductImageController::class, 'getCategoryImages']);
Route::get('/public/product-images/instagram', [App\Http\Controllers\ProductImageController::class, 'getInstagramImages']);
Route::get('/public/product-images/all', [App\Http\Controllers\ProductImageController::class, 'getAllProductImages']);

// Cart routes (temporarily without auth for testing)
Route::prefix('cart')->group(function () {
    Route::get('/', [App\Http\Controllers\Api\CartController::class, 'index']);
    Route::post('/add', [App\Http\Controllers\Api\CartController::class, 'add']);
    Route::put('/items/{id}', [App\Http\Controllers\Api\CartController::class, 'update']);
    Route::delete('/items/{id}', [App\Http\Controllers\Api\CartController::class, 'remove']);
    Route::delete('/clear', [App\Http\Controllers\Api\CartController::class, 'clear']);
    Route::get('/count', [App\Http\Controllers\Api\CartController::class, 'count']);
    Route::post('/update-quantity', [App\Http\Controllers\Api\CartController::class, 'updateQuantity']); // Fast quantity update
});

// Simplified cart update route for frontend compatibility
Route::put('/cart/items/{id}', function(Request $request, $id) {
    try {
        // Debug logging
        \Log::info('Cart item update request:', [
            'id' => $id,
            'request_data' => $request->all()
        ]);

        $request->validate([
            'quantity' => 'required|integer|min:1|max:10',
            'user_id' => 'required|integer'
        ]);

        $userId = $request->user_id;
        $quantity = (int)$request->quantity;

        \Log::info('Cart item update params:', [
            'id' => $id,
            'userId' => $userId,
            'quantity' => $quantity
        ]);

        // Find cart item
        $cartItem = DB::table('cart_items')
            ->where('id', $id)
            ->where('user_id', $userId)
            ->first();

        \Log::info('Cart item found:', ['cartItem' => $cartItem]);

        if (!$cartItem) {
            \Log::warning('Cart item not found', ['id' => $id, 'userId' => $userId]);
            return response()->json([
                'success' => false,
                'message' => 'Cart item not found'
            ], 404);
        }

        // Update cart item
        $updated = DB::table('cart_items')
            ->where('id', $id)
            ->where('user_id', $userId)
            ->update([
                'quantity' => $quantity,
                'updated_at' => now()
            ]);

        \Log::info('Cart item update result:', ['updated' => $updated]);

        if ($updated) {
            return response()->json([
                'success' => true,
                'message' => 'Cart item updated successfully'
            ]);
        } else {
            \Log::warning('Failed to update cart item', ['id' => $id, 'userId' => $userId]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update cart item'
            ], 500);
        }

    } catch (Exception $e) {
        \Log::error('Cart item update error:', [
            'id' => $id,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        return response()->json([
            'success' => false,
            'message' => 'Error updating cart item: ' . $e->getMessage()
        ], 500);
    }
});

// Wishlist routes
Route::prefix('wishlist')->group(function () {
    Route::get('/', [App\Http\Controllers\Api\WishlistController::class, 'index']);
    Route::post('/add', [App\Http\Controllers\Api\WishlistController::class, 'add']);
    Route::delete('/remove/{id}', [App\Http\Controllers\Api\WishlistController::class, 'remove']);
    Route::get('/check/{productId}', [App\Http\Controllers\Api\WishlistController::class, 'check']);
    Route::get('/count', [App\Http\Controllers\Api\WishlistController::class, 'count']);
    Route::delete('/clear', [App\Http\Controllers\Api\WishlistController::class, 'clear']);
});

// Test route for cart
Route::post('/test-cart', function(Request $request) {
    try {
        DB::table('cart_items')->insert([
            'user_id' => 18,
            'product_id' => $request->product_id,
            'quantity' => $request->quantity,
            'color' => $request->color,
            'size' => $request->size,
            'created_at' => now(),
            'updated_at' => now()
        ]);
        return response()->json(['success' => true, 'message' => 'Item added successfully']);
    } catch (Exception $e) {
        return response()->json(['success' => false, 'message' => $e->getMessage()]);
    }
});

// Get cart items - REMOVED: Duplicate routes that were overriding the CartController

// Simple cart add route (legacy)
Route::post('/simple-cart-add', function(Request $request) {
    try {
        $request->validate([
            'product_id' => 'required|integer',
            'quantity' => 'required|integer|min:1',
            'color' => 'nullable|string',
            'size' => 'nullable|string'
        ]);

        DB::table('cart_items')->insert([
            'user_id' => 18,
            'product_id' => $request->product_id,
            'quantity' => $request->quantity,
            'color' => $request->color,
            'size' => $request->size,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json(['success' => true, 'message' => 'Item added to cart successfully']);
    } catch (Exception $e) {
        return response()->json(['success' => false, 'message' => $e->getMessage()]);
    }
});

// Simple wishlist add route for testing
Route::post('/wishlist/add-simple', function(Request $request) {
    try {
        $request->validate([
            'product_id' => 'required|integer',
            'color' => 'nullable|string',
            'size' => 'nullable|string',
            'product_table' => 'required|string',
            'user_id' => 'required|integer'
        ]);

        // Check if item already exists
        $existingItem = DB::table('wishlist_items')
            ->where('user_id', $request->user_id)
            ->where('product_id', $request->product_id)
            ->where('product_table', $request->product_table)
            ->where('color', $request->color ?? '')
            ->where('size', $request->size ?? '')
            ->first();

        if ($existingItem) {
            return response()->json([
                'success' => false,
                'message' => 'Item already in wishlist'
            ]);
        }

        // Insert new item
        $wishlistId = DB::table('wishlist_items')->insertGetId([
            'user_id' => $request->user_id,
            'product_id' => $request->product_id,
            'product_table' => $request->product_table,
            'color' => $request->color ?? '',
            'size' => $request->size ?? '',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Item added to wishlist successfully',
            'wishlist_id' => $wishlistId
        ]);

    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ], 500);
    }
});

// Search routes (public)
Route::prefix('search')->group(function () {
    Route::get('/products-by-tab', [App\Http\Controllers\Api\ProductController::class, 'getProductsByTab']);
    Route::get('/products', [App\Http\Controllers\Api\ProductController::class, 'searchProducts']);
    // Advanced Search
    Route::get('/', [App\Http\Controllers\SearchController::class, 'search']);
    Route::get('/suggestions', [App\Http\Controllers\SearchController::class, 'suggestions']);
    Route::get('/popular', [App\Http\Controllers\SearchController::class, 'popular']);
});

// Product routes (public)
Route::get('/products', [App\Http\Controllers\Api\ProductController::class, 'index']);
Route::get('/products/recommended', [App\Http\Controllers\Api\ProductController::class, 'getRecommendedProducts']);
Route::get('/products/trending', [App\Http\Controllers\Api\ProductController::class, 'getTrendingProducts']);
Route::get('/products/{id}', [App\Http\Controllers\Api\ProductController::class, 'show']);
Route::get('/products/{id}/sizes', [App\Http\Controllers\Api\ProductController::class, 'getProductSizes']);
Route::get('/products/{id}/reviews', [App\Http\Controllers\Api\ProductController::class, 'getProductReviews']);
Route::get('/product-colors/{id}', function (Request $request, $id) {
    try {
        $productTable = $request->input('table', 'products_women');

        // Validate table name
        $allowedTables = ['products_women', 'products_men', 'products_kids'];
        if (!in_array($productTable, $allowedTables)) {
            $productTable = 'products_women';
        }

        // Check if product_colors table exists and has data
        $colors = collect([]);
        if (Schema::hasTable('product_colors')) {
        $colors = DB::table('product_colors')
            ->where('product_id', $id)
            ->get();
        }

        // If no colors from product_colors table, get from product itself
        if ($colors->isEmpty() || count($colors) === 0) {
            $product = DB::table($productTable)
                ->where('id', $id)
                ->first();

            if ($product && !empty($product->colors)) {
                $colorsData = json_decode($product->colors, true);
                if (is_array($colorsData)) {
                    $colors = collect($colorsData)->map(function ($color, $index) {
                        // Map Tailwind color classes to hex codes
                        $colorMap = [
                            'bg-gray-900' => '#111827',
                            'bg-white' => '#FFFFFF',
                            'bg-blue-900' => '#1e3a8a',
                            'bg-red-600' => '#dc2626',
                            'bg-green-600' => '#16a34a',
                            'bg-yellow-500' => '#eab308',
                            'bg-purple-600' => '#9333ea',
                            'bg-pink-500' => '#ec4899',
                            'bg-orange-500' => '#f97316'
                        ];

                        $colorClass = is_array($color) ? ($color['color'] ?? $color['code'] ?? 'bg-gray-900') : 'bg-gray-900';
                        $hexCode = $colorMap[$colorClass] ?? '#000000';

                        return [
                            'id' => $index + 1,
                            'color' => is_array($color) ? ($color['name'] ?? 'Color ' . ($index + 1)) : $color,
                            'color_code' => $hexCode,
                            'image_url' => is_array($color) ? ($color['image'] ?? null) : null,
                            'is_available' => true,
                            'stock_quantity' => 50
                        ];
                    });
                }
            }
        } else {
            $colors = $colors->map(function ($color) {
                return [
                    'id' => $color->id,
                    'color' => $color->color_name,
                    'color_code' => $color->color_code,
                    'image_url' => $color->image_url,
                    'is_available' => true,
                    'stock_quantity' => 50
                ];
            });
        }

        return response()->json([
            'success' => true,
            'data' => $colors
        ]);
    } catch (\Exception $e) {
        // Return empty array instead of error
        return response()->json([
            'success' => true,
            'data' => []
        ]);
    }
});

// Dashboard routes
Route::prefix('dashboard')->group(function () {
    Route::get('/stats', [App\Http\Controllers\Api\DashboardController::class, 'getStats']);
    Route::get('/recent-orders', [App\Http\Controllers\Api\DashboardController::class, 'getRecentOrders']);
    Route::get('/sales-overview', [App\Http\Controllers\Api\DashboardController::class, 'getSalesOverview']);
    Route::get('/chart-data', [App\Http\Controllers\Api\DashboardController::class, 'getChartData']);
});

// Admin routes - TEMPORARILY without auth
Route::prefix('admin')->group(function () {
    // Products
    Route::get('/products', [App\Http\Controllers\Api\AdminController::class, 'getProducts']);
    Route::post('/products', [App\Http\Controllers\Api\AdminController::class, 'createProduct']);
    Route::put('/products/{id}', [App\Http\Controllers\Api\AdminController::class, 'updateProduct']);
    Route::delete('/products/{id}', [App\Http\Controllers\Api\AdminController::class, 'deleteProduct']);

    // Orders
    Route::get('/orders', [App\Http\Controllers\Api\AdminController::class, 'getOrders']);
    Route::put('/orders/{id}', [App\Http\Controllers\Api\AdminController::class, 'updateOrder']);

    // Customers
    Route::get('/customers', [App\Http\Controllers\Api\AdminController::class, 'getCustomers']);

    // Analytics
    Route::get('/analytics/sales', [App\Http\Controllers\Api\AdminController::class, 'getSalesAnalytics']);
    Route::get('/analytics/users', [App\Http\Controllers\Api\AdminController::class, 'getUsersAnalytics']);
    Route::get('/analytics/products', [App\Http\Controllers\Api\AdminController::class, 'getProductsAnalytics']);

    // Settings
    Route::get('/settings', [App\Http\Controllers\Api\AdminController::class, 'getSettings']);
    Route::put('/settings', [App\Http\Controllers\Api\AdminController::class, 'updateSettings']);
});

// Discount Codes routes (temporarily without auth to fix 500 error)
Route::prefix('admin')->group(function () {
    Route::get('/discount-codes', [App\Http\Controllers\Api\AdminController::class, 'getDiscountCodes']);
    Route::post('/discount-codes', [App\Http\Controllers\Api\AdminController::class, 'createDiscountCode']);
    Route::put('/discount-codes/{id}', [App\Http\Controllers\Api\AdminController::class, 'updateDiscountCode']);
    Route::delete('/discount-codes/{id}', [App\Http\Controllers\Api\AdminController::class, 'deleteDiscountCode']);
});

// Analytics routes - TEMPORARILY without auth
Route::prefix('admin/analytics')->group(function () {
    Route::get('/sales', [App\Http\Controllers\Api\AdminController::class, 'getSalesAnalytics']);
    Route::get('/users', [App\Http\Controllers\Api\AdminController::class, 'getUsersAnalytics']);
    Route::get('/products', [App\Http\Controllers\Api\AdminController::class, 'getProductsAnalytics']);
    Route::get('/overview', [App\Http\Controllers\Api\AdminController::class, 'getAnalyticsOverview']);
    Route::get('/chart-data', [App\Http\Controllers\Api\AdminController::class, 'getChartData']);
});

// Test route for colors without middleware
Route::get('/test-colors/{id}', function ($id) {
    $fakeColors = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'purple', 'orange'];
    $randomColors = array_slice($fakeColors, 0, rand(1, 4));

    return response()->json([
        'success' => true,
        'data' => [
            'colors' => $randomColors
        ]
    ]);
});

// Admin colors route without middleware for testing
Route::get('/admin/products/{id}/colors-test', function ($id) {
    $fakeColors = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'purple', 'orange'];
    $randomColors = array_slice($fakeColors, 0, rand(1, 4));

    return response()->json([
        'success' => true,
        'data' => [
            'colors' => $randomColors
        ]
    ]);
});

// Admin colors route without middleware (real endpoint)
Route::get('/admin/products', [App\Http\Controllers\Api\AdminController::class, 'getProducts']);
Route::get('/admin/products/{id}/colors', [App\Http\Controllers\Api\AdminController::class, 'getProductColors']);

// Admin products without authentication for testing
Route::get('/admin/products-public', [App\Http\Controllers\Api\AdminController::class, 'getProductsPublic']);

// Admin orders routes
Route::get('/admin/orders', [App\Http\Controllers\Api\AdminController::class, 'getOrders']);
Route::get('/admin/orders/{id}', [App\Http\Controllers\Api\AdminController::class, 'getOrder']);
Route::put('/admin/orders/{id}/status', [App\Http\Controllers\Api\AdminController::class, 'updateOrderStatus']);
Route::delete('/admin/orders/{id}', [App\Http\Controllers\Api\AdminController::class, 'deleteOrder']);

// Admin create product without middleware (real endpoint)
Route::post('/admin/products-create', [App\Http\Controllers\Api\AdminController::class, 'createProduct']);

// Admin products without middleware for testing
Route::post('/admin/products-test', [App\Http\Controllers\Api\AdminController::class, 'createProduct']);
Route::put('/admin/products-test/{id}', [App\Http\Controllers\Api\AdminController::class, 'updateProduct']);
Route::delete('/admin/products-test/{id}', [App\Http\Controllers\Api\AdminController::class, 'deleteProduct']);
Route::delete('/admin/products-test/selected', [App\Http\Controllers\Api\AdminController::class, 'deleteSelectedProducts']);

// Admin products routes (standard paths)
Route::post('/admin/products', [App\Http\Controllers\Api\AdminController::class, 'createProduct']);
Route::put('/admin/products/{id}', [App\Http\Controllers\Api\AdminController::class, 'updateProduct']);
Route::delete('/admin/products/{id}', [App\Http\Controllers\Api\AdminController::class, 'deleteProduct']);

// Test delete selected products without middleware
Route::delete('/admin/delete-selected-test', [App\Http\Controllers\Api\AdminController::class, 'deleteSelectedProducts']);

// Admin customers without middleware
Route::get('/admin/customers-test', [App\Http\Controllers\Api\AdminController::class, 'getCustomers']);
Route::get('/admin/customers', [App\Http\Controllers\Api\AdminController::class, 'getCustomers']);
Route::get('/admin/users/{id}', [App\Http\Controllers\Api\AdminController::class, 'getUser']);
Route::put('/admin/users/{id}', [App\Http\Controllers\Api\AdminController::class, 'updateUser']);
Route::delete('/admin/users/{id}', [App\Http\Controllers\Api\AdminController::class, 'deleteUser']);

// CSRF token endpoint
Route::get('/csrf-token', function () {
    return response()->json([
        'csrf_token' => csrf_token()
    ]);
});

// Test route without middleware
Route::post('/test-no-middleware', function (Request $request) {
    return response()->json([
        'success' => true,
        'message' => 'No middleware test successful',
        'data' => $request->all()
    ]);
});



// Notification routes - TEMPORARILY without auth
Route::prefix('notifications')->group(function () {
    Route::get('/', [App\Http\Controllers\Api\NotificationController::class, 'index']);
    Route::get('/count', [App\Http\Controllers\Api\NotificationController::class, 'getCount']);
    Route::get('/settings', [App\Http\Controllers\Api\NotificationController::class, 'getSettings']);
    Route::put('/settings', [App\Http\Controllers\Api\NotificationController::class, 'updateSettings']);
    Route::put('/{id}/read', [App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
    Route::put('/mark-all-read', [App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead']);
    Route::delete('/{id}', [App\Http\Controllers\Api\NotificationController::class, 'destroy']);
    Route::post('/subscribe', [App\Http\Controllers\Api\NotificationController::class, 'subscribe']);
    Route::post('/unsubscribe', [App\Http\Controllers\Api\NotificationController::class, 'unsubscribe']);
});

// Invoice routes - TEMPORARILY without auth
Route::prefix('invoices')->group(function () {
    Route::get('/', [App\Http\Controllers\Api\InvoiceController::class, 'index']);
    Route::post('/create', [App\Http\Controllers\Api\InvoiceController::class, 'create']);
    Route::get('/statistics', [App\Http\Controllers\Api\InvoiceController::class, 'getStatistics']);
    Route::get('/{id}', [App\Http\Controllers\Api\InvoiceController::class, 'show']);
    Route::post('/', [App\Http\Controllers\Api\InvoiceController::class, 'store']);
    Route::post('/from-order/{orderId}', [App\Http\Controllers\Api\InvoiceController::class, 'createFromOrder']);
    Route::put('/{id}/paid', [App\Http\Controllers\Api\InvoiceController::class, 'markAsPaid']);
    Route::delete('/{id}', [App\Http\Controllers\Api\InvoiceController::class, 'destroy']);
});

// Customer Reviews routes
Route::prefix('reviews')->group(function () {
    Route::get('/random', [App\Http\Controllers\Api\CustomerReviewController::class, 'getRandomReviews']);
    Route::get('/stats', [App\Http\Controllers\Api\CustomerReviewController::class, 'getReviewsStats']);
    Route::get('/product/{productId}', [App\Http\Controllers\Api\CustomerReviewController::class, 'getProductReviews']);
});

// Product Sizes routes
Route::prefix('sizes')->group(function () {
    Route::get('/product/{productId}', [App\Http\Controllers\Api\ProductSizeController::class, 'getProductSizes']);
    Route::get('/product/{productId}/all', [App\Http\Controllers\Api\ProductSizeController::class, 'getAllProductSizes']);
    Route::get('/product/{productId}/check/{size}', [App\Http\Controllers\Api\ProductSizeController::class, 'checkSizeAvailability']);
});

// Test OAuth callback route
Route::get('/test-callback', function(Request $request) {
    return response()->json([
        'message' => 'Callback test successful',
        'all_params' => $request->query(),
        'code' => $request->query('code'),
        'state' => $request->query('state'),
        'method' => $request->method(),
        'url' => $request->fullUrl()
    ]);
});
