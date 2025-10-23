<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WishlistController extends Controller
{
    /**
     * Get all wishlist items for a user
     */
    public function index(Request $request)
    {
        try {
            $userId = $request->input('user_id');

            if (!$userId) {
                Log::error('❌ No user_id provided in index request');
                return response()->json([
                    'success' => false,
                    'message' => 'User ID is required'
                ], 401);
            }

            Log::info('🔍 WishlistController index - User ID from request: ' . $userId);

            $items = DB::table('wishlist_items')
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->get();

            // Fetch product details for each wishlist item
            $itemsWithProducts = [];
            foreach ($items as $item) {
                $product = null;

                // Get product from the appropriate table
                switch ($item->product_table) {
                    case 'products_men':
                        $product = DB::table('products_men')
                            ->where('id', $item->product_id)
                            ->first();
                        break;
                    case 'products_women':
                        $product = DB::table('products_women')
                            ->where('id', $item->product_id)
                            ->first();
                        break;
                    case 'products_kids':
                        $product = DB::table('products_kids')
                            ->where('id', $item->product_id)
                            ->first();
                        break;
                }

                $itemsWithProducts[] = [
                    'id' => $item->id,
                    'user_id' => $item->user_id,
                    'product_id' => $item->product_id,
                    'product_table' => $item->product_table,
                    'color' => $item->color,
                    'size' => $item->size,
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at,
                    'product' => $product
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'items' => $itemsWithProducts,
                    'count' => count($itemsWithProducts)
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Wishlist index error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load wishlist'
            ], 500);
        }
    }

    /**
     * Add item to wishlist
     */
    public function add(Request $request)
    {
        try {
            // Debug logging
            Log::info('🔍 WishlistController add - Request data:', $request->all());

            $request->validate([
                'product_id' => 'required|integer',
                'product_table' => 'required|string',
                'color' => 'nullable|string',
                'size' => 'nullable|string',
                'user_id' => 'required|integer'
            ]);

            // Get user ID from request (sent by frontend)
            $userId = $request->input('user_id');

            if (!$userId) {
                Log::error('❌ No user_id provided in request');
                return response()->json([
                    'success' => false,
                    'message' => 'User ID is required'
                ], 401);
            }

            Log::info('🔍 WishlistController add - User ID from request: ' . $userId);

            $productId = $request->product_id;
            $productTable = $request->product_table;
            $color = $request->color ?? '';
            $size = $request->size ?? '';

            // Check if already exists
            $existing = DB::table('wishlist_items')
                ->where('user_id', $userId)
                ->where('product_id', $productId)
                ->where('product_table', $productTable)
                ->where('color', $color)
                ->where('size', $size)
                ->first();

            if ($existing) {
                return response()->json([
                    'success' => true,
                    'message' => 'Item already in wishlist',
                    'wishlist_id' => $existing->id
                ]);
            }

            // Add new item
            $wishlistId = DB::table('wishlist_items')->insertGetId([
                'user_id' => $userId,
                'product_id' => $productId,
                'product_table' => $productTable,
                'color' => $color,
                'size' => $size,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            Log::info('✅ Item added to wishlist successfully', [
                'wishlist_id' => $wishlistId,
                'user_id' => $userId,
                'product_id' => $productId,
                'product_table' => $productTable,
                'color' => $color,
                'size' => $size
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Item added to wishlist successfully',
                'wishlist_id' => $wishlistId
            ]);

        } catch (\Exception $e) {
            Log::error('Wishlist add error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to add to wishlist'
            ], 500);
        }
    }

    /**
     * Remove item from wishlist
     */
    public function remove(Request $request, $id)
    {
        try {
            $userId = $request->input('user_id');

            if (!$userId) {
                Log::error('❌ No user_id provided in remove request');
                return response()->json([
                    'success' => false,
                    'message' => 'User ID is required'
                ], 401);
            }

            Log::info('🔍 WishlistController remove - User ID from request: ' . $userId);

            $deleted = DB::table('wishlist_items')
                ->where('id', $id)
                ->where('user_id', $userId)
                ->delete();

            if ($deleted) {
                return response()->json([
                    'success' => true,
                    'message' => 'Item removed from wishlist'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Item not found'
                ], 404);
            }

        } catch (\Exception $e) {
            Log::error('Wishlist remove error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove from wishlist'
            ], 500);
        }
    }

    /**
     * Check if product is in wishlist
     */
    public function check(Request $request, $productId)
    {
        try {
            $userId = $request->input('user_id');

            if (!$userId) {
                Log::error('❌ No user_id provided in check request');
                return response()->json([
                    'success' => false,
                    'message' => 'User ID is required'
                ], 401);
            }

            Log::info('🔍 WishlistController check - User ID from request: ' . $userId . ', Product ID: ' . $productId);

            $item = DB::table('wishlist_items')
                ->where('user_id', $userId)
                ->where('product_id', $productId)
                ->first();

            $isInWishlist = $item !== null;

            return response()->json([
                'success' => true,
                'data' => [
                    'is_in_wishlist' => $isInWishlist,
                    'wishlist_item_id' => $item ? $item->id : null
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Wishlist check error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to check wishlist'
            ], 500);
        }
    }

    /**
     * Get wishlist count
     */
    public function count(Request $request)
    {
        try {
            $userId = $request->input('user_id');

            if (!$userId) {
                Log::error('❌ No user_id provided in count request');
                return response()->json([
                    'success' => false,
                    'message' => 'User ID is required'
                ], 401);
            }

            Log::info('🔍 WishlistController count - User ID from request: ' . $userId);

            $count = DB::table('wishlist_items')
                ->where('user_id', $userId)
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'count' => $count
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Wishlist count error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get wishlist count'
            ], 500);
        }
    }

    /**
     * Clear all wishlist items for user
     */
    public function clear(Request $request)
    {
        try {
            $userId = $request->input('user_id');

            if (!$userId) {
                Log::error('❌ No user_id provided in clear request');
                return response()->json([
                    'success' => false,
                    'message' => 'User ID is required'
                ], 401);
            }

            Log::info('🔍 WishlistController clear - User ID from request: ' . $userId);

            $deleted = DB::table('wishlist_items')
                ->where('user_id', $userId)
                ->delete();

            return response()->json([
                'success' => true,
                'message' => 'Wishlist cleared successfully',
                'deleted_count' => $deleted
            ]);

        } catch (\Exception $e) {
            Log::error('Wishlist clear error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear wishlist'
            ], 500);
        }
    }
}
