<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use App\ValueObjects\ProductVariant;
use App\Http\Requests\Cart\AddToCartRequest;
use App\Http\Requests\Cart\UpdateCartItemRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class CartController extends Controller
{
    private CartService $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }
    /**
     * Get product data from any product table
     */
    private function getProductFromAnyTable($productId, $productTable = null)
    {
        $productTables = ['products_women', 'products_men', 'products_kids']; // All available tables

        if ($productTable && in_array($productTable, $productTables)) {
            // Search in specific table
            try {
                // Optimized query with only needed fields
                $product = DB::table($productTable)
                    ->select([
                        'id', 'name', 'price', 'image_url', 'stock_quantity', 'is_active'
                    ])
                    ->where('id', $productId)
                    ->where('is_active', 1)
                    ->first();

                if ($product) {
                    // Add missing columns if they don't exist
                    if (!isset($product->stock_quantity)) {
                        $product->stock_quantity = $product->stock ?? 0;
                    }
                    if (!isset($product->is_active)) {
                        $product->is_active = 1; // Default to active
                    }
                    $product->source_table = $productTable;
                    return $product;
                }
            } catch (\Exception $e) {
                Log::warning("CartController: Table $productTable not found or column missing: " . $e->getMessage());
                return null;
            }
        } else {
            // Search in all tables
            foreach ($productTables as $table) {
                try {
                    $product = DB::table($table)
                        ->where('id', $productId)
                        ->first();

                    if ($product) {
                        // Add missing columns if they don't exist
                        if (!isset($product->stock_quantity)) {
                            $product->stock_quantity = $product->stock ?? 0;
                        }
                        if (!isset($product->is_active)) {
                            $product->is_active = 1; // Default to active
                        }
                        $product->source_table = $table;
                        return $product;
                    }
                } catch (\Exception $e) {
                    Log::warning("CartController: Table $table not found or column missing: " . $e->getMessage());
                    continue;
                }
            }
        }

        return null;
    }

    /**
     * Get all cart items for a user from any product table - OPTIMIZED
     */
    private function getAllCartItems($userId)
    {
        // First get all cart items for this user
        $cartItems = DB::table('cart_items')
            ->where('user_id', $userId)
            ->get();

        if ($cartItems->isEmpty()) {
            return collect();
        }

        $allItems = collect();
        $productTables = ['products_women', 'products_men', 'products_kids'];

        // Group cart items by product_table for efficient querying
        $itemsByTable = $cartItems->groupBy('product_table');

        foreach ($productTables as $table) {
            $tableItems = $itemsByTable->get($table, collect());

            if ($tableItems->isEmpty()) {
                continue;
            }

            try {
                $productIds = $tableItems->pluck('product_id')->unique()->toArray();

                // Single query for all products in this table
                $products = DB::table($table)
                    ->whereIn('id', $productIds)
                    ->select('id', 'name', 'price', 'image_url', 'sku', 'stock', 'stock_quantity')
                    ->get()
                    ->keyBy('id');

                // Merge cart items with product data
                foreach ($tableItems as $cartItem) {
                    $product = $products->get($cartItem->product_id);

                    if ($product) {
                        $item = (object) [
                            'id' => $cartItem->id,
                            'user_id' => $cartItem->user_id,
                            'product_id' => $cartItem->product_id,
                            'product_table' => $cartItem->product_table,
                            'cart_quantity' => $cartItem->quantity,
                            'quantity' => (int)$cartItem->quantity,
                            'color' => $cartItem->color,
                            'size' => $cartItem->size,
                            'created_at' => $cartItem->created_at,
                            'updated_at' => $cartItem->updated_at,
                            'product_name' => $product->name,
                            'product_price' => $product->price,
                            'product_image' => $product->image_url,
                            'product_sku' => $product->sku,
                            'product_stock_quantity' => $product->stock_quantity ?? $product->stock ?? 0,
                            'stock_quantity' => $product->stock_quantity ?? $product->stock ?? 0,
                            'source_table' => $table
                        ];

                        $allItems->push($item);
                    }
                }
            } catch (\Exception $e) {
                Log::warning("CartController: Error processing table {$table}: " . $e->getMessage());
                continue;
            }
        }

        return $allItems;
    }

    public function index(Request $request)
    {
        DB::beginTransaction();

        try {
            // Get user ID from request (support any user)
            $userId = $request->input('user_id') ?? optional($request->user())->id;

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User ID is required'
                ], 401);
            }

            // Get cart items from all product tables
            $cartItems = $this->getAllCartItems($userId);

            // Debug logging
            Log::info('CartController: getAllCartItems returned ' . $cartItems->count() . ' items for user ' . $userId);

            // Validate cart items exist
            if ($cartItems->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'items' => [],
                        'total' => 0,
                        'count' => 0
                    ]
                ]);
            }

            // Update product images based on color with error handling
            foreach ($cartItems as $item) {
                try {
                    if (!empty($item->color)) {
                        $colorImage = DB::table('product_colors')
                            ->where('product_id', $item->product_id)
                            ->where('color', $item->color)
                            ->value('image_url');

                        if ($colorImage && !empty($colorImage)) {
                            $item->product_image = $colorImage;
                        }
                    }
                } catch (\Exception $e) {
                    Log::warning('Failed to get color image for product ' . $item->product_id . ': ' . $e->getMessage());
                    // Continue with default image
                }
            }

            // Calculate total with validation
            $total = 0;
            foreach ($cartItems as $item) {
                $itemTotal = (float)$item->quantity * (float)$item->product_price;
                $total += $itemTotal;
            }

            DB::commit();

            // Convert collection to array for proper JSON response
                $itemsArray = $cartItems->map(function($item) {
                    // Convert color from JSON object to string if needed
                    $colorString = $item->color;
                    if (is_string($item->color)) {
                        $decoded = json_decode($item->color, true);
                        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                            // If it's a valid JSON string, extract the color name
                            $colorString = $decoded['color'] ?? $decoded['name'] ?? $item->color;
                            Log::info('CartController: Converted color from JSON to string: ' . $colorString);
                        }
                    } elseif (is_object($item->color)) {
                        // If it's already an object, extract the color name
                        $colorString = $item->color->color ?? $item->color->name ?? (string)$item->color;
                        Log::info('CartController: Converted color from object to string: ' . $colorString);
                    }
                    Log::info('CartController: Final color string: ' . $colorString);

                    // Convert size from JSON object to string if needed
                    $sizeString = $item->size;
                    if (is_string($item->size)) {
                        $decoded = json_decode($item->size, true);
                        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                            // If it's a valid JSON string, extract the size name
                            $sizeString = $decoded['size'] ?? $decoded['name'] ?? $item->size;
                        }
                    } elseif (is_object($item->size)) {
                        // If it's already an object, extract the size name
                        $sizeString = $item->size->size ?? $item->size->name ?? (string)$item->size;
                    }

                    return [
                        'id' => $item->id,
                        'user_id' => $item->user_id,
                        'product_id' => $item->product_id,
                        'product_table' => $item->product_table,
                        'cart_quantity' => $item->cart_quantity,
                        'quantity' => $item->quantity,
                        'color' => $colorString,
                        'size' => $sizeString,
                        'name' => $item->product_name, // Primary name field
                        'product_name' => $item->product_name,
                        'product_price' => $item->product_price,
                        'price' => $item->product_price, // Primary price field
                        'product_image' => $item->product_image,
                        'image' => $item->product_image, // Primary image field
                        'product_sku' => $item->product_sku,
                        'product_stock_quantity' => $item->product_stock_quantity,
                        'stock_quantity' => $item->stock_quantity,
                        'source_table' => $item->source_table,
                        'created_at' => $item->created_at,
                        'updated_at' => $item->updated_at
                    ];
                })->toArray();

            return response()->json([
                'success' => true,
                'data' => [
                    'items' => $itemsArray,
                    'total' => round($total, 2),
                    'count' => $cartItems->count()
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Cart index error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve cart items'
            ], 500);
        }
    }

    public function add(AddToCartRequest $request)
    {
        DB::beginTransaction();
        try {
            // Validation is handled by AddToCartRequest

            $userId = $request->input('user_id') ?? optional($request->user())->id;
            $productId = (int)$request->product_id;
            $quantity = (int)$request->quantity;
            $color = $request->color ?? '';
            $size = $request->size ?? '';
            $productTable = $request->input('product_table');

            // Additional validation removed - size is now optional

            // Validate user exists
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User ID is required'
                ], 401);
            }

            // Validate product exists and is active from any table
            $product = $this->getProductFromAnyTable($productId, $productTable);

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found or inactive'
                ], 404);
            }

            // Check stock availability
            if ($product->stock_quantity < $quantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient stock. Available: ' . $product->stock_quantity
                ], 400);
            }

            // Skip color validation since product_colors table doesn't exist
            // Colors are stored in products table as JSON
            $colorImage = null;

            // Check if exact item already exists in cart
            $existingItem = DB::table('cart_items')
                ->where('user_id', $userId)
                ->where('product_id', $productId)
                ->where('product_table', $product->source_table ?? 'products_women')
                ->where('color', $color)
                ->where('size', $size)
                ->first();

            if ($existingItem) {
                // Update quantity for exact match
                $newQuantity = $existingItem->quantity + $quantity;

                // Check if new total exceeds stock
                if ($newQuantity > $product->stock_quantity) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cannot add more items. Stock limit reached.'
                    ], 400);
                }

                $updated = DB::table('cart_items')
                    ->where('id', $existingItem->id)
                    ->update([
                        'quantity' => $newQuantity,
                        'updated_at' => now()
                    ]);

                if (!$updated) {
                    throw new \Exception('Failed to update cart item');
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Item quantity updated in cart',
                    'data' => [
                        'cart_item_id' => $existingItem->id,
                        'new_quantity' => $newQuantity
                    ]
                    ]);
            } else {
                // Add new item
                $cartItemId = DB::table('cart_items')->insertGetId([
                    'user_id' => $userId,
                    'product_id' => $productId,
                    'product_table' => $product->source_table ?? 'products_women',
                    'quantity' => $quantity,
                    'color' => $color,
                    'size' => $size,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                if (!$cartItemId) {
                    throw new \Exception('Failed to insert cart item');
                }

                DB::commit();

            return response()->json([
                'success' => true,
                    'message' => 'Item added to cart successfully',
                    'data' => [
                        'cart_item_id' => $cartItemId,
                        'quantity' => $quantity
                    ]
                ]);
            }

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Cart add error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to add item to cart'
            ], 500);
        }
    }

    public function update(UpdateCartItemRequest $request, $id)
    {
        DB::beginTransaction();

        try {
            // Validation is handled by UpdateCartItemRequest

            $userId = $request->input('user_id') ?? optional($request->user())->id ?? 18;
            $quantity = (int)$request->quantity;

            // Debug logging
            Log::info('CartController update: Attempting to update cart item', [
                'cart_item_id' => $id,
                'user_id' => $userId,
                'new_quantity' => $quantity,
                'request_data' => $request->all()
            ]);

            // Validate user
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Get cart item with product info from any table
            $cartItem = DB::table('cart_items')
                ->where('cart_items.id', $id)
                ->where('cart_items.user_id', $userId)
                ->first();

            if (!$cartItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart item not found'
                ], 404);
            }

            // If quantity is 0 or less, remove the item
            if ($quantity <= 0) {
                $deleted = DB::table('cart_items')
                    ->where('id', $id)
                    ->where('user_id', $userId)
                    ->delete();

                if (!$deleted) {
                    throw new \Exception('Failed to remove cart item');
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Item removed from cart',
                    'data' => [
                        'cart_item_id' => $id,
                        'action' => 'removed'
                    ]
                ]);
            }

            // Get product info from the correct table
            $product = $this->getProductFromAnyTable($cartItem->product_id, $cartItem->product_table);

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found or inactive'
                ], 404);
            }

            // Check stock availability
            if ($product->stock_quantity < $quantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient stock. Available: ' . $product->stock_quantity
                ], 400);
            }

            // Update cart item
            $updated = DB::table('cart_items')
                ->where('id', $id)
                ->where('user_id', $userId)
                ->update([
                    'quantity' => $quantity,
                    'updated_at' => now()
                ]);

            if (!$updated) {
                throw new \Exception('Failed to update cart item');
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cart item updated successfully',
                'data' => [
                    'cart_item_id' => $id,
                    'new_quantity' => $quantity
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Cart update error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update cart item'
            ], 500);
        }
    }

    public function remove(Request $request, $id)
    {
        DB::beginTransaction();

        try {
            // Validate input
            if (!is_numeric($id) || $id < 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid cart item ID'
                ], 422);
            }

            $userId = $request->input('user_id') ?? optional($request->user())->id ?? 18;

            // Debug logging
            Log::info('CartController remove: Attempting to remove cart item', [
                'cart_item_id' => $id,
                'user_id' => $userId,
                'request_user_id' => $request->input('user_id')
            ]);

            // Validate user
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Check if cart item exists and belongs to user
            $cartItem = DB::table('cart_items')
                ->where('id', $id)
                ->where('user_id', $userId)
                ->first();

            Log::info('CartController remove: Cart item lookup result', [
                'cart_item_found' => $cartItem ? true : false,
                'cart_item_data' => $cartItem
            ]);

            if (!$cartItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart item not found or does not belong to user'
                ], 404);
            }

            // Delete cart item
            $deleted = DB::table('cart_items')
                ->where('id', $id)
                ->where('user_id', $userId)
                ->delete();

            if (!$deleted) {
                throw new \Exception('Failed to delete cart item');
            }

            DB::commit();

                return response()->json([
                    'success' => true,
                'message' => 'Item removed from cart successfully',
                'data' => [
                    'removed_item_id' => $id
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Cart remove error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to remove item from cart'
            ], 500);
        }
    }

    public function clear(Request $request)
    {
        DB::beginTransaction();

        try {
            $userId = $request->input('user_id') ?? optional($request->user())->id ?? 18;

            // Validate user
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Get count before deletion for response
            $itemsCount = DB::table('cart_items')
                ->where('user_id', $userId)
                ->count();

            // Clear cart items
            $deleted = DB::table('cart_items')
                ->where('user_id', $userId)
                ->delete();

            if ($deleted === false) {
                throw new \Exception('Failed to clear cart items');
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cart cleared successfully',
                'data' => [
                    'cleared_items_count' => $itemsCount
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Cart clear error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to clear cart'
            ], 500);
        }
    }

    public function count(Request $request)
    {
        try {
            $userId = $request->input('user_id') ?? optional($request->user())->id ?? 18;

            // Validate user
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Fast count query - just count cart_items table
            $count = DB::table('cart_items')
                ->where('user_id', $userId)
                ->sum('quantity');

            $itemsCount = DB::table('cart_items')
                ->where('user_id', $userId)
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'count' => (int)$count,
                    'items_count' => (int)$itemsCount
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Cart count error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to get cart count'
            ], 500);
        }
    }

    /**
     * Fast quantity update endpoint for sidebar cart
     */
    public function updateQuantity(Request $request)
    {
        try {
            $userId = $request->input('user_id') ?? optional($request->user())->id ?? 18;
            $itemId = $request->input('item_id');
            $quantity = (int)$request->input('quantity');

            // Validate input
            if (!$itemId || $quantity < 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid item ID or quantity'
                ], 422);
            }

            // Validate user
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // If quantity is 0, remove item
            if ($quantity === 0) {
                $deleted = DB::table('cart_items')
                    ->where('id', $itemId)
                    ->where('user_id', $userId)
                    ->delete();

                if ($deleted) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Item removed',
                        'action' => 'removed'
                    ]);
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => 'Item not found'
                    ], 404);
                }
            }

            // Update quantity
            $updated = DB::table('cart_items')
                ->where('id', $itemId)
                ->where('user_id', $userId)
                ->update([
                    'quantity' => $quantity,
                    'updated_at' => now()
                ]);

            if ($updated) {
                return response()->json([
                    'success' => true,
                    'message' => 'Quantity updated',
                    'data' => [
                        'item_id' => $itemId,
                        'quantity' => $quantity
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Item not found'
                ], 404);
            }

        } catch (\Exception $e) {
            Log::error('Cart updateQuantity error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update quantity'
            ], 500);
        }
    }
}
