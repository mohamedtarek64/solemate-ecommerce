<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class AdminController extends BaseController
{
    /**
     * Get all discount codes
     */
    public function getDiscountCodes()
    {
        try {
            $discountCodes = DB::table('discount_codes')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $discountCodes
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching discount codes: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch discount codes'
            ], 500);
        }
    }

    /**
     * Create a new discount code
     */
    public function createDiscountCode(Request $request)
    {
        try {
            $request->validate([
                'code' => 'required|string|max:255|unique:discount_codes,code',
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'type' => 'required|in:percentage,fixed',
                'value' => 'required|numeric|min:0',
                'minimum_amount' => 'required|numeric|min:0',
                'usage_limit' => 'required|integer|min:1',
                'starts_at' => 'required|date',
                'expires_at' => 'required|date|after:starts_at',
                'is_active' => 'boolean'
            ]);

            $discountCode = DB::table('discount_codes')->insertGetId([
                'code' => $request->code,
                'name' => $request->name,
                'description' => $request->description,
                'type' => $request->type,
                'value' => $request->value,
                'minimum_amount' => $request->minimum_amount,
                'usage_limit' => $request->usage_limit,
                'starts_at' => $request->starts_at,
                'expires_at' => $request->expires_at,
                'is_active' => $request->is_active ?? true,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Discount code created successfully',
                'data' => ['id' => $discountCode]
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating discount code: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create discount code: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a discount code
     */
    public function updateDiscountCode(Request $request, $id)
    {
        try {
            $request->validate([
                'code' => 'required|string|max:255|unique:discount_codes,code,' . $id,
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'type' => 'required|in:percentage,fixed',
                'value' => 'required|numeric|min:0',
                'minimum_amount' => 'required|numeric|min:0',
                'usage_limit' => 'required|integer|min:1',
                'starts_at' => 'required|date',
                'expires_at' => 'required|date|after:starts_at',
                'is_active' => 'boolean'
            ]);

            $updated = DB::table('discount_codes')
                ->where('id', $id)
                ->update([
                    'code' => $request->code,
                    'name' => $request->name,
                    'description' => $request->description,
                    'type' => $request->type,
                    'value' => $request->value,
                    'minimum_amount' => $request->minimum_amount,
                    'usage_limit' => $request->usage_limit,
                    'starts_at' => $request->starts_at,
                    'expires_at' => $request->expires_at,
                    'is_active' => $request->is_active ?? true,
                    'updated_at' => now()
                ]);

            if ($updated) {
            return response()->json([
                'success' => true,
                    'message' => 'Discount code updated successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Discount code not found'
                ], 404);
            }
        } catch (\Exception $e) {
            Log::error('Error updating discount code: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update discount code: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a discount code
     */
    public function deleteDiscountCode($id)
    {
        try {
            $deleted = DB::table('discount_codes')
                ->where('id', $id)
                ->delete();

            if ($deleted) {
            return response()->json([
                'success' => true,
                'message' => 'Discount code deleted successfully'
            ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Discount code not found'
                ], 404);
            }
        } catch (\Exception $e) {
            Log::error('Error deleting discount code: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete discount code: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all customers (from users table)
     */
    public function getCustomers(Request $request)
    {
        try {
            $validation = $this->validateAdminUserAndToken($request);

            if (!$validation['valid']) {
                return $validation['response'];
            }

            // Get all users that are not admins
            $customers = DB::table('users')
                ->where('role', '!=', 'admin')
                ->orWhereNull('role')
                ->select(
                    'users.id',
                    'users.first_name',
                    'users.last_name',
                    'users.email',
                    'users.phone',
                    'users.role',
                    'users.avatar',
                    'users.address',
                    'users.created_at',
                    'users.updated_at',
                    DB::raw('(SELECT COUNT(*) FROM orders WHERE orders.user_id = users.id) as orders_count')
                )
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $customers
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching customers: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch customers'
            ], 500);
        }
    }

    /**
     * Get a specific user/customer
     */
    public function getUser($id)
    {
        try {
            $user = DB::table('users')
                ->where('id', $id)
                ->where(function($query) {
                    $query->where('role', '!=', 'admin')
                          ->orWhereNull('role');
                })
                ->select(
                    'users.id',
                    'users.first_name',
                    'users.last_name',
                    'users.email',
                    'users.phone',
                    'users.role',
                    'users.avatar',
                    'users.address',
                    'users.created_at',
                    'users.updated_at',
                    DB::raw('(SELECT COUNT(*) FROM orders WHERE orders.user_id = users.id) as orders_count')
                )
                ->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $user
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching user: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch user'
            ], 500);
        }
    }

    /**
     * Update a user/customer
     */
    public function updateUser(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'sometimes|string|in:active,inactive,banned',
                'first_name' => 'sometimes|string|max:255',
                'last_name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|max:255',
                'phone' => 'sometimes|string|max:20'
            ]);

            // Check if user exists and is not admin
            $userExists = DB::table('users')
                ->where('id', $id)
                ->where(function($query) {
                    $query->where('role', '!=', 'admin')
                          ->orWhereNull('role');
                })
                ->exists();

            if (!$userExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            // Update user
            $updateData = array_filter($request->only(['first_name', 'last_name', 'email', 'phone', 'avatar', 'address']));
            $updateData['updated_at'] = now();

            DB::table('users')->where('id', $id)->update($updateData);

            // Get updated user
            $updatedUser = DB::table('users')
                ->where('id', $id)
                ->select(
                    'users.id',
                    'users.first_name',
                    'users.last_name',
                    'users.email',
                    'users.phone',
                    'users.role',
                    'users.avatar',
                    'users.address',
                    'users.created_at',
                    'users.updated_at',
                    DB::raw('(SELECT COUNT(*) FROM orders WHERE orders.user_id = users.id) as orders_count')
                )
                ->first();

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
                'data' => $updatedUser
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating user: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user'
            ], 500);
        }
    }

    /**
     * Delete a user/customer
     */
    public function deleteUser($id)
    {
        try {
            // Check if user exists and is not admin
            $user = DB::table('users')
                ->where('id', $id)
                ->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            // Prevent deleting admin users
            if ($user->role === 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete admin users'
                ], 403);
            }

            // Start a database transaction
            DB::beginTransaction();

            try {
                // Get all orders for this user
                $orders = DB::table('orders')->where('user_id', $id)->pluck('id');

                // Delete order items for these orders
                if ($orders->isNotEmpty()) {
                    DB::table('order_items')->whereIn('order_id', $orders)->delete();
                }

                // Delete orders
                DB::table('orders')->where('user_id', $id)->delete();

                // Delete cart items
                DB::table('cart_items')->where('user_id', $id)->delete();

                // Delete wishlist items
                DB::table('wishlist_items')->where('user_id', $id)->delete();

                // Delete addresses
                DB::table('addresses')->where('user_id', $id)->delete();

                // Delete user sessions
                DB::table('sessions')->where('user_id', $id)->delete();

                // Delete the user
                DB::table('users')->where('id', $id)->delete();

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'User deleted successfully'
                ]);
            } catch (\Exception $e) {
                DB::rollback();
                Log::error('Error in deleteUser transaction: ' . $e->getMessage());
                throw $e;
            }
        } catch (\Exception $e) {
            Log::error('Error deleting user: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all orders for admin
     */
    public function getOrders(Request $request = null)
    {
        try {
            $orders = DB::table('orders')
                ->leftJoin('users', 'orders.user_id', '=', 'users.id')
                ->select(
                    'orders.*',
                    'users.name as customer_name',
                    'users.email as customer_email'
                )
                ->orderBy('orders.created_at', 'desc')
                ->get();

            // Get order items for each order
            foreach ($orders as $order) {
                $orderItems = DB::table('order_items')
                    ->where('order_id', $order->id)
                    ->get();

                $order->items = $orderItems;
                $order->total_items = $orderItems->sum('quantity');
            }

            return response()->json([
                'success' => true,
                'data' => $orders
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching orders: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch orders: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all products
     */
    public function getProducts(Request $request)
    {
        try {
            $validation = $this->validateAdminUserAndToken($request);

            if (!$validation['valid']) {
                return $validation['response'];
            }
            $collections = collect();

            // Helper to safely read a table and normalize fields
            $safeRead = function (string $table, string $category) {
                try {
                    if (!DB::getSchemaBuilder()->hasTable($table)) {
                        Log::info("Table {$table} does not exist");
                        return collect();
                    }
                    $rows = DB::table($table)->get();
                    Log::info("Read " . count($rows) . " products from table {$table}");
                    return collect($rows)->map(function ($row) use ($category) {
                        // Get stock/quantity based on table structure
                        $stock = 0;
                        if (isset($row->stock)) {
                            $stock = (int)$row->stock;
                        } elseif (isset($row->quantity)) {
                            $stock = (int)$row->quantity;
                        } elseif (isset($row->stock_quantity)) {
                            $stock = (int)$row->stock_quantity;
                        }

                        // Get image based on table structure
                        $image = $row->image_url ?? $row->image ?? null;

                        return [
                            'id' => $row->id ?? null,
                            'name' => $row->name ?? ($row->title ?? 'Unnamed Product'),
                            'price' => isset($row->price) ? (float)$row->price : (isset($row->amount) ? (float)$row->amount : 0.0),
                            'description' => $row->description ?? null,
                            'sku' => $row->sku ?? null,
                            'brand' => $row->brand ?? null,
                            'category' => ucfirst($category), // Always use the table category (Women, Men, Kids)
                            'status' => $row->status ?? 'active',
                            'stock' => $stock,
                            'image' => $image,
                            'created_at' => $row->created_at ?? null,
                            'updated_at' => $row->updated_at ?? null,
                            'source_table' => $category,
                            'original_category' => $row->category ?? null // Keep original category for reference
                        ];
                    });
                } catch (\Throwable $t) {
                    Log::warning("Products read skipped for table {$table}: " . $t->getMessage());
                    return collect();
                }
            };

            $collections = $collections
                ->concat($safeRead('products_men', 'men'))
                ->concat($safeRead('products_women', 'women'))
                ->concat($safeRead('products_kids', 'kids'))
                ->sortByDesc(function($item) {
                    return $item['created_at'] ?? '1970-01-01 00:00:00';
                })
                ->values();

            Log::info('Total products collected: ' . $collections->count());

            // Log the first few products to debug
            $firstProducts = $collections->take(3)->toArray();
            Log::info('First 3 products: ' . json_encode($firstProducts));

            // Log the database connection
            Log::info('Database connection in getProducts: ' . DB::connection()->getDatabaseName());

            return response()->json([
                'success' => true,
                'data' => $collections
            ]);
        } catch (\Throwable $e) {
            Log::error('Error fetching products: ' . $e->getMessage());
            // Return empty list rather than 500 to unblock UI
            return response()->json([
                'success' => true,
                'data' => []
            ]);
        }
    }

    /**
     * Get settings
     */
    public function getSettings()
    {
        try {
            // Check if settings table exists, if not return default settings
            try {
                $settings = DB::table('settings')->get();
        } catch (\Exception $e) {
                // If settings table doesn't exist, return default settings
                $settings = collect([
                    (object)[
                        'key' => 'site_name',
                        'value' => 'SoleMate',
                        'type' => 'string'
                    ],
                    (object)[
                        'key' => 'site_email',
                        'value' => 'admin@solemate.com',
                        'type' => 'string'
                    ],
                    (object)[
                        'key' => 'currency',
                        'value' => 'USD',
                        'type' => 'string'
                    ],
                    (object)[
                        'key' => 'tax_rate',
                        'value' => '0.1',
                        'type' => 'decimal'
                    ]
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching settings: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch settings'
            ], 500);
        }
    }

    /**
     * Create a new product
     */
    public function createProduct(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'stock' => 'required|integer|min:0',
                'category' => 'required|string|max:255',
                'brand' => 'required|string|max:255',
                'sku' => 'required|string|max:255',
                'status' => 'required|in:active,inactive',
                'image' => 'nullable|string|max:500',
                'colors' => 'nullable|array'
            ]);

            // Determine which table to insert into based on category
            $table = 'products_men'; // default for men
            if (strtolower($request->category) === 'women' || strtolower($request->category) === 'woman') {
                $table = 'products_women';
            } elseif (strtolower($request->category) === 'men' || strtolower($request->category) === 'man') {
                $table = 'products_men';
            } elseif (strtolower($request->category) === 'kids' || strtolower($request->category) === 'kid') {
                $table = 'products_kids';
            }

            // Also check for gender field if provided
            if ($request->has('gender')) {
                $gender = strtolower($request->gender);
                if ($gender === 'women' || $gender === 'woman') {
                    $table = 'products_women';
                } elseif ($gender === 'men' || $gender === 'man') {
                    $table = 'products_men';
                } elseif ($gender === 'kids' || $gender === 'kid') {
                    $table = 'products_kids';
                }
            }

            // Prepare data for insertion based on table structure
            $productData = [
                'name' => $request->name,
                'description' => $request->description,
                'price' => $request->price,
                'category' => $request->category,
                'brand' => $request->brand,
                'sku' => $request->sku,
                'is_active' => $request->status === 'active' ? 1 : 0,
                'created_at' => now()->format('Y-m-d H:i:s'),
                'updated_at' => now()->format('Y-m-d H:i:s')
            ];

            // Add table-specific fields
            if ($table === 'products_men') {
                $productData['stock_quantity'] = $request->stock;
                $productData['image_url'] = $request->image;
                // Generate unique slug
                $baseSlug = \Str::slug($request->name);
                $slug = $baseSlug;
                $counter = 1;
                while (DB::table($table)->where('slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . $counter;
                    $counter++;
                }
                $productData['slug'] = $slug;
                $productData['featured'] = 0;
            } elseif ($table === 'products_women') {
                $productData['stock_quantity'] = $request->stock;
                $productData['image_url'] = $request->image;
                // Generate unique slug for women table
                $baseSlug = \Str::slug($request->name);
                $slug = $baseSlug;
                $counter = 1;
                while (DB::table($table)->where('slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . $counter;
                    $counter++;
                }
                $productData['slug'] = $slug;
            } elseif ($table === 'products_kids') {
                $productData['stock_quantity'] = $request->stock;
                $productData['image_url'] = $request->image;
                // Generate unique slug for kids table
                $baseSlug = \Str::slug($request->name);
                $slug = $baseSlug;
                $counter = 1;
                while (DB::table($table)->where('slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . $counter;
                    $counter++;
                }
                $productData['slug'] = $slug;
                $productData['featured'] = 0;
            }

            // Check for duplicate SKU across all product tables
            $skuExists = DB::table('products_men')->where('sku', $request->sku)->exists() ||
                        DB::table('products_women')->where('sku', $request->sku)->exists() ||
                        DB::table('products_kids')->where('sku', $request->sku)->exists();

            if ($skuExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'SKU already exists. Please use a different SKU.'
                ], 400);
            }

            // Insert product
            Log::info("Attempting to insert product into table: $table");
            Log::info("Product data: " . json_encode($productData));

            // Start transaction
            DB::beginTransaction();

            $productId = DB::table($table)->insertGetId($productData);

            // Commit transaction
            DB::commit();

            Log::info("Product inserted with ID: $productId in table: $table");

            // Verify insertion immediately
            $verifyProduct = DB::table($table)->where('id', $productId)->first();
            if ($verifyProduct) {
                Log::info("Verification successful: " . $verifyProduct->name);
            } else {
                Log::error("Verification failed: Product not found after insertion");
            }

            // Handle colors if provided
            if ($request->has('colors') && is_array($request->colors)) {
                foreach ($request->colors as $color) {
                    if (!empty($color['name']) && !empty($color['code'])) {
                        try {
                            DB::table('product_colors')->insert([
                                'product_id' => $productId,
                                'color' => $color['name'],
                                'color_code' => $color['code'],
                                'price' => $color['price'] ?? $request->price,
                                'quantity' => $color['quantity'] ?? 0,
                                'image_url' => $color['image_url'] ?? null,
                                'created_at' => now(),
                                'updated_at' => now()
                            ]);
                        } catch (\Exception $e) {
                            Log::warning("Could not insert color: " . $e->getMessage());
                        }
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Product created successfully',
                'data' => [
                    'product' => [
                        'id' => $productId,
                        'name' => $request->name,
                        'price' => $request->price,
                        'description' => $request->description,
                        'category' => $request->category,
                        'brand' => $request->brand,
                        'sku' => $request->sku,
                        'status' => $request->status,
                        'image' => $request->image,
                        'stock' => $request->stock,
                        'created_at' => now()->toISOString()
                    ],
                    'table' => $table,
                    'colors_added' => $request->has('colors') ? count($request->colors) : 0
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creating product: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            // Check for specific database constraint violations
            if (strpos($e->getMessage(), 'Duplicate entry') !== false && strpos($e->getMessage(), 'sku') !== false) {
                return response()->json([
                    'success' => false,
                    'message' => 'SKU already exists. Please use a different SKU.'
                ], 400);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to create product: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete multiple products
     */
    public function deleteSelectedProducts(Request $request)
    {
        try {
            $request->validate([
                'product_ids' => 'required|array',
                'product_ids.*' => 'required|integer'
            ]);

            $deletedCount = 0;
            $errors = [];

            foreach ($request->product_ids as $productId) {
                try {
                    // Try to find and delete from each table
                    $deleted = false;

                    // Check products_men table
                    $product = DB::table('products_men')->where('id', $productId)->first();
                    if ($product) {
                        DB::table('products_men')->where('id', $productId)->delete();
                        // Try to delete colors if table exists
                        try {
                            DB::table('product_colors')->where('product_id', $productId)->delete();
                        } catch (\Exception $e) {
                            // Ignore if table doesn't exist or column doesn't exist
                        }
                        $deleted = true;
                    }

                    // Check products_women table
                    if (!$deleted) {
                        $product = DB::table('products_women')->where('id', $productId)->first();
                        if ($product) {
                            DB::table('products_women')->where('id', $productId)->delete();
                            // Try to delete colors if table exists
                            try {
                                DB::table('product_colors')->where('product_id', $productId)->delete();
                            } catch (\Exception $e) {
                                // Ignore if table doesn't exist or column doesn't exist
                            }
                            $deleted = true;
                        }
                    }

                    // Check products_kids table
                    if (!$deleted) {
                        $product = DB::table('products_kids')->where('id', $productId)->first();
                        if ($product) {
                            DB::table('products_kids')->where('id', $productId)->delete();
                            // Try to delete colors if table exists
                            try {
                                DB::table('product_colors')->where('product_id', $productId)->delete();
                            } catch (\Exception $e) {
                                // Ignore if table doesn't exist or column doesn't exist
                            }
                            $deleted = true;
                        }
                    }

                    if ($deleted) {
                        $deletedCount++;
                    } else {
                        $errors[] = "Product with ID {$productId} not found";
                    }

                } catch (\Exception $e) {
                    $errors[] = "Failed to delete product {$productId}: " . $e->getMessage();
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Successfully deleted {$deletedCount} products",
                'deleted_count' => $deletedCount,
                'errors' => $errors
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error deleting selected products: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete products: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a product
     */
    public function updateProduct(Request $request, $id)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'stock' => 'required|integer|min:0',
                'category' => 'required|string|max:255',
                'brand' => 'required|string|max:255',
                'sku' => 'required|string|max:255',
                'status' => 'required|in:active,inactive',
                'image' => 'nullable|string|max:500'
            ]);

            // Determine which table to update based on category
            $table = 'products'; // default
            if (strtolower($request->category) === 'women') {
                $table = 'products_women';
            } elseif (strtolower($request->category) === 'men') {
                $table = 'products';
            } elseif (strtolower($request->category) === 'kids') {
                $table = 'products_kids';
            }

            $productData = [
                'name' => $request->name,
                'description' => $request->description,
                'price' => $request->price,
                'stock_quantity' => $request->stock,
                'category' => $request->category,
                'brand' => $request->brand,
                'sku' => $request->sku,
                'is_active' => $request->status === 'active' ? 1 : 0,
                'image_url' => $request->image,
                'updated_at' => now()
            ];

            $updated = DB::table($table)->where('id', $id)->update($productData);

            if ($updated) {
                return response()->json([
                    'success' => true,
                    'message' => 'Product updated successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error updating product: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update product: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a product
     */
    public function deleteProduct($id)
    {
        try {
            // Try to delete from all tables
            $deleted = false;
            $tables = ['products', 'products_women', 'products_men', 'products_kids'];

            foreach ($tables as $table) {
                if (DB::table($table)->where('id', $id)->exists()) {
                    DB::table($table)->where('id', $id)->delete();
                    $deleted = true;
                    break;
                }
            }

            if ($deleted) {
            return response()->json([
                'success' => true,
                    'message' => 'Product deleted successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

        } catch (\Exception $e) {
            Log::error('Error deleting product: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete product: ' . $e->getMessage()
            ], 500);
        }
    }


    /**
     * Get single order for admin
     */
    public function getOrder($id)
    {
        try {
            $order = DB::table('orders')
                ->leftJoin('users', 'orders.user_id', '=', 'users.id')
                ->select(
                    'orders.*',
                    'users.name as customer_name',
                    'users.email as customer_email',
                    'users.phone as customer_phone'
                )
                ->where('orders.id', $id)
                ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Get order items with product details
            $orderItems = DB::table('order_items')
                ->where('order_id', $id)
                ->get();

            // Enhance order items with product details and images
            $enhancedItems = [];
            foreach ($orderItems as $item) {
                $productDetails = null;

                // Try to find product in different tables
                $tables = ['products', 'products_women', 'products_men', 'products_kids'];
                foreach ($tables as $table) {
                    $product = DB::table($table)
                        ->where('id', $item->product_id)
                        ->first();
                    if ($product) {
                        $productDetails = $product;
                        break;
                    }
                }

                $enhancedItem = [
                    'id' => $item->id,
                    'order_id' => $item->order_id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name,
                    'product_price' => $item->product_price,
                    'quantity' => $item->quantity,
                    'subtotal' => $item->subtotal,
                    'size' => $item->size,
                    'color' => $item->color,
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at,
                    // Product details from database
                    'product_image' => $productDetails ? ($productDetails->image_url ?? $productDetails->image ?? null) : null,
                    'product_description' => $productDetails ? ($productDetails->description ?? null) : null,
                    'product_brand' => $productDetails ? ($productDetails->brand ?? null) : null,
                    'product_sku' => $productDetails ? ($productDetails->sku ?? null) : null,
                    'product_status' => $productDetails ? ($productDetails->status ?? ($productDetails->is_active ? 'active' : 'inactive')) : null
                ];

                $enhancedItems[] = $enhancedItem;
            }

            $order->items = $enhancedItems;

            return response()->json([
                'success' => true,
                'data' => $order
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching order: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update order status
     */
    public function updateOrderStatus(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'required|in:pending,processing,shipped,delivered,cancelled,refunded'
            ]);

            $order = DB::table('orders')->where('id', $id)->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            DB::table('orders')
                ->where('id', $id)
                ->update([
                    'status' => $request->status,
                    'updated_at' => now()
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating order status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete an order
     */
    public function deleteOrder($id)
    {
        try {
            // Check if order exists
            $order = DB::table('orders')->where('id', $id)->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Start transaction to ensure data integrity
            DB::beginTransaction();

            try {
                // Delete order items first (foreign key constraint)
                DB::table('order_items')->where('order_id', $id)->delete();

                // Delete the order
                DB::table('orders')->where('id', $id)->delete();

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Order deleted successfully'
                ]);

            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Error deleting order: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all products without authentication (for testing)
     */
    public function getProductsPublic(Request $request)
    {
        try {
            $collections = collect();

            // Helper to safely read a table and normalize fields
            $safeRead = function (string $table, string $category) {
                try {
                    if (!DB::getSchemaBuilder()->hasTable($table)) {
                        Log::info("Table {$table} does not exist");
                        return collect();
                    }
                    $rows = DB::table($table)->get();
                    Log::info("Read " . count($rows) . " products from table {$table}");
                    return collect($rows)->map(function ($row) use ($category, $table) {
                        // Get stock/quantity based on table structure
                        $stock = 0;
                        if (isset($row->stock)) {
                            $stock = (int)$row->stock;
                        } elseif (isset($row->quantity)) {
                            $stock = (int)$row->quantity;
                        } elseif (isset($row->stock_quantity)) {
                            $stock = (int)$row->stock_quantity;
                        }

                        return [
                            'id' => $row->id,
                            'name' => $row->name ?? 'Unknown Product',
                            'description' => $row->description ?? '',
                            'price' => $row->price ?? '0.00',
                            'original_price' => $row->original_price ?? $row->price ?? '0.00',
                            'image_url' => $row->image_url ?? '',
                            'brand' => $row->brand ?? 'Unknown',
                            'category' => $category,
                            'subcategory' => $row->subcategory ?? '',
                            'stock_quantity' => $stock,
                            'is_active' => $row->is_active ?? 1,
                            'rating' => $row->rating ?? 0,
                            'reviews_count' => $row->reviews_count ?? 0,
                            'created_at' => $row->created_at ?? now(),
                            'updated_at' => $row->updated_at ?? now(),
                            'source_table' => $table
                        ];
                    });
                } catch (\Exception $e) {
                    Log::error("Error reading table {$table}: " . $e->getMessage());
                    return collect();
                }
            };

            // Read from all product tables
            $womenProducts = $safeRead('products_women', 'Women');
            $menProducts = $safeRead('products_men', 'Men');
            $kidsProducts = $safeRead('products_kids', 'Kids');

            // Combine collections
            $collections = $collections->merge($womenProducts)->merge($menProducts)->merge($kidsProducts);

            Log::info('Total products found: ' . $collections->count());

            return response()->json([
                'success' => true,
                'data' => $collections->values()->toArray(),
                'total' => $collections->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching products: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch products: ' . $e->getMessage()
            ], 500);
        }
    }
}
