<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ProductImageController extends Controller
{
    /**
     * Get hero image from products_women table
     * Prioritizes featured products, then random selection for variety
     *
     * @return JsonResponse
     */
    public function getHeroImage(): JsonResponse
    {
        try {
            // First try to get a featured product
            $heroProduct = DB::table('products_women')
                ->where('is_active', true)
                ->where('featured', true)
                ->whereNotNull('image_url')
                ->where('image_url', '!=', '')
                ->inRandomOrder()
                ->first();

            // If no featured product, get any active product with image
            if (!$heroProduct) {
                $heroProduct = DB::table('products_women')
                    ->where('is_active', true)
                    ->whereNotNull('image_url')
                    ->where('image_url', '!=', '')
                    ->inRandomOrder()
                    ->first();
            }

            // Last resort: get any active product
            if (!$heroProduct) {
                $heroProduct = DB::table('products_women')
                    ->where('is_active', true)
                    ->orderBy('id')
                    ->first();
            }

            if (!$heroProduct) {
                return response()->json([
                    'success' => false,
                    'message' => 'No hero product found'
                ], 404);
            }

            // Get image URL from the product
            $imageUrl = $heroProduct->image_url ?? $heroProduct->image ?? '';

            // If no image URL, provide a placeholder
            if (empty($imageUrl)) {
                $imageUrl = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3';
            }

            return response()->json([
                'success' => true,
                'message' => 'Hero image retrieved successfully',
                'image_url' => $imageUrl,
                'title' => $heroProduct->name ?? 'Hero Product',
                'alt_text' => $heroProduct->name ?? 'Hero Product',
                'product_id' => $heroProduct->id,
                'is_featured' => $heroProduct->featured ?? false,
                'price' => $heroProduct->price ?? 0,
                'brand' => $heroProduct->brand ?? 'Unknown'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve hero image',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get featured images from products_women table
     *
     * @return JsonResponse
     */
    public function getFeaturedImages(): JsonResponse
    {
        try {
            $featuredProducts = DB::table('products_women')
                ->where('is_active', true)
                ->where('featured', true)
                ->orderBy('id')
                ->limit(3)
                ->get();

            // If no featured products, get first 3 products
            if ($featuredProducts->isEmpty()) {
                $featuredProducts = DB::table('products_women')
                    ->where('is_active', true)
                    ->orderBy('id')
                    ->limit(3)
                    ->get();
            }

            $images = $featuredProducts->map(function ($product) {
                return [
                    'image_url' => $product->image_url ?? $product->image ?? '',
                    'title' => $product->name ?? 'Featured Product',
                    'alt_text' => $product->name ?? 'Featured Product',
                    'product_id' => $product->id
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Featured images retrieved successfully',
                'images' => $images,
                'count' => $images->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve featured images',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get category images from products_women table
     *
     * @return JsonResponse
     */
    public function getCategoryImages(): JsonResponse
    {
        try {
            $categoryProducts = DB::table('products_women')
                ->where('is_active', true)
                ->orderBy('category')
                ->orderBy('id')
                ->limit(4)
                ->get();

            $images = $categoryProducts->map(function ($product) {
                return [
                    'image_url' => $product->image_url ?? $product->image ?? '',
                    'title' => $product->name ?? 'Category Product',
                    'alt_text' => $product->name ?? 'Category Product',
                    'product_id' => $product->id,
                    'category' => $product->category ?? 'default'
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Category images retrieved successfully',
                'images' => $images,
                'count' => $images->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve category images',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get instagram images from products_women table
     *
     * @return JsonResponse
     */
    public function getInstagramImages(): JsonResponse
    {
        try {
            $instagramProducts = DB::table('products_women')
                ->where('is_active', true)
                ->orderBy('id')
                ->limit(4)
                ->get();

            $images = $instagramProducts->map(function ($product) {
                return [
                    'image_url' => $product->image_url ?? $product->image ?? '',
                    'title' => $product->name ?? 'Instagram Product',
                    'alt_text' => $product->name ?? 'Instagram Product',
                    'product_id' => $product->id
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Instagram images retrieved successfully',
                'images' => $images,
                'count' => $images->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve instagram images',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all product images from products_women table
     *
     * @return JsonResponse
     */
    public function getAllProductImages(): JsonResponse
    {
        try {
            $products = DB::table('products_women')
                ->where('is_active', true)
                ->orderBy('id')
                ->get();

            $images = $products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'image_url' => $product->image_url ?? $product->image ?? '',
                    'title' => $product->name ?? 'Product',
                    'alt_text' => $product->name ?? 'Product',
                    'price' => $product->price ?? 0,
                    'category_id' => $product->category ?? null,
                    'is_featured' => $product->featured ?? false
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'All product images retrieved successfully',
                'images' => $images,
                'count' => $images->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve all product images',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get products by category
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getProductsByCategory(Request $request): JsonResponse
    {
        try {
            $categoryId = $request->input('category_id');

            $query = DB::table('products_women')
                ->where('is_active', true);

            if ($categoryId) {
                $query->where('category', $categoryId);
            }

            $products = $query->orderBy('id')->get();

            $images = $products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'image_url' => $product->image_url ?? $product->image ?? '',
                    'title' => $product->name ?? 'Product',
                    'alt_text' => $product->name ?? 'Product',
                    'price' => $product->price ?? 0,
                    'category_id' => $product->category ?? null
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Products retrieved successfully',
                'images' => $images,
                'count' => $images->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve products',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
