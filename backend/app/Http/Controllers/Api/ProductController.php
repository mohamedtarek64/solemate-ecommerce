<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
    /**
     * Get products list with pagination and filtering
     */
    public function index(Request $request)
    {
        try {
            $table = $request->input('table', 'products_women');
            $limit = $request->input('limit', 12);
            $offset = $request->input('offset', 0);
            $category = $request->input('category');

            // Validate table name
            $allowedTables = ['products_women', 'products_men', 'products_kids'];
            if (!in_array($table, $allowedTables)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid table name'
                ], 400);
            }

            // Create cache key
            $cacheKey = "products_list:{$table}:{$limit}:{$offset}:" . md5($category ?? '');
            
            // Cache for 10 minutes
            $result = Cache::remember($cacheKey, 600, function() use ($table, $limit, $offset, $category) {
                // Build query with only needed columns for better performance
                $query = DB::table($table)
                    ->select('id', 'name', 'price', 'image_url', 'category', 'stock_quantity', 'is_active')
                    ->where('is_active', 1);

                // Add category filter if provided
                if ($category) {
                    $query->where('category', 'like', '%' . $category . '%');
                }

                // Get total count for pagination
                $total = $query->count();

                // Apply pagination
                $products = $query->offset($offset)
                    ->limit($limit)
                    ->get();

                return [
                    'success' => true,
                    'data' => $products,
                    'pagination' => [
                        'total' => $total,
                        'limit' => $limit,
                        'offset' => $offset,
                        'has_more' => ($offset + $limit) < $total
                    ]
                ];
            });

            return response()->json($result)
                ->header('Cache-Control', 'public, max-age=600')
                ->header('X-Cache', Cache::has($cacheKey) ? 'HIT' : 'MISS');

        } catch (\Exception $e) {
            Log::error('Error fetching products list: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch products'
            ], 500);
        }
    }

    /**
     * Get table name by tab
     */
    private function getTableByTab($tab)
    {
        switch ($tab) {
            case 'men':
                return 'products_men';
            case 'kids':
                return 'products_kids';
            case 'women':
            case 'all':
            default:
                return 'products_women';
        }
      }

      /**
     * Get product images array (combine main image + additional images + videos)
     */
    private function getProductImages($product)
    {
        $images = [];
        $videos = [];

        // First, try to get images from the 'images' field (JSON array)
        $imagesField = json_decode($product->images ?? '[]', true);
        if (is_array($imagesField) && !empty($imagesField)) {
            // Use images from the images field
            foreach ($imagesField as $image) {
                if (is_string($image) && !empty($image)) {
                    $images[] = $image;
                }
            }
        } else {
            // Fallback: Add main image if exists
        if (!empty($product->image_url)) {
            $images[] = $product->image_url;
            }
        }

        // Get additional images and videos from colors field
        $colors = json_decode($product->colors ?? '[]', true);
        if (is_array($colors) && !empty($colors)) {
            foreach ($colors as $color) {
                if (is_array($color)) {
                    // Add additional images
                    if (isset($color['additional_images']) && is_array($color['additional_images'])) {
                        foreach ($color['additional_images'] as $img) {
                            if (is_string($img) && !empty($img) && !in_array($img, $images)) {
                                $images[] = $img;
                            }
                        }
                    }

                    // Add videos
                    if (isset($color['videos']) && is_array($color['videos'])) {
                        foreach ($color['videos'] as $video) {
                            if (is_string($video) && !empty($video) && !in_array($video, $videos)) {
                                $videos[] = $video;
                            }
                        }
                    }
                }
            }
        }

        // Add additional images if exists (for backward compatibility)
        $additionalImages = json_decode($product->additional_images ?? '[]', true);
        if (is_array($additionalImages)) {
            foreach ($additionalImages as $image) {
                if (is_string($image) && !in_array($image, $images)) {
                    $images[] = $image;
                }
            }
        }

        // Add videos from videos field (for backward compatibility)
        $productVideos = json_decode($product->videos ?? '[]', true);
        if (is_array($productVideos)) {
            foreach ($productVideos as $video) {
                if (is_string($video) && !in_array($video, $videos)) {
                    $videos[] = $video;
                }
            }
        }

        // Also check for single video_url field
        if (!empty($product->video_url) && !in_array($product->video_url, $videos)) {
            $videos[] = $product->video_url;
        }

        // Combine: images first, then videos
        $allMedia = array_merge($images, $videos);

        // Pad to 4 items if needed with empty strings
        while (count($allMedia) < 4) {
            $allMedia[] = '';
        }

        return array_slice($allMedia, 0, 4);
    }

    /**
     * Get product colors (from product_colors table or product colors field)
     */
    private function getProductColors($product, $colorsFromTable)
    {
        // First try to get colors from product_colors table
        if ($colorsFromTable->isNotEmpty()) {
            return $colorsFromTable->map(function ($color) {
                return [
                    'id' => $color->id,
                    'color_name' => $color->color_name,
                    'color_code' => $color->color_code,
                    'image_url' => $color->image_url,
                    'additional_images' => json_decode($color->additional_images ?? '[]', true),
                    'videos' => json_decode($color->videos ?? '[]', true)
                ];
            })->toArray();
        }

        // Fallback: Get colors from product colors field
        $productColors = json_decode($product->colors ?? '[]', true);
        if (is_array($productColors) && !empty($productColors)) {
            return array_map(function ($color, $index) {
                return [
                    'id' => $color['id'] ?? ($index + 1),
                    'color_name' => $color['color_name'] ?? $color['name'] ?? 'Color ' . ($index + 1),
                    'color_code' => $color['color_code'] ?? $color['code'] ?? '#808080',
                    'image_url' => $color['image_url'] ?? $color['image'] ?? null,
                    'additional_images' => $color['additional_images'] ?? [],
                    'videos' => $color['videos'] ?? []
                ];
            }, $productColors, array_keys($productColors));
        }

        return [];
    }
    /**
     * Get products by tab (men, women, etc.)
     */
    public function getProductsByTab(Request $request)
    {
        try {
            $tab = $request->input('tab', 'women');
            $page = (int) $request->input('page', 1);
            $perPage = (int) $request->input('limit', $request->input('per_page', 12));
            $search = $request->input('search', '');
            $brand = $request->input('brand', '');
            $minPrice = (float) $request->input('min_price', 0);
            $maxPrice = (float) $request->input('max_price', 1000);
            $sort = $request->input('sort', 'popular');
            
            // Color filtering parameters
            $colors = $request->input('colors', []);
            $color = $request->input('color', '');
            $category = $request->input('category', '');

            // Determine which table to use based on tab
            $tableName = $this->getTableByTab($tab);
            $query = DB::table($tableName);

            // Apply filters - all tables use 'is_active' column
            $query->where('is_active', 1);

            // Filter by category/tab
            // For kids tab, skip category filter as table already contains only kids products
            if ($tab && $tab !== 'all' && $tab !== 'women' && $tab !== 'men' && $tab !== 'kids') {
                // Map tab names to category values
                $categoryMap = [
                    'accessories' => 'accessories',
                    'sale' => 'sale'
                ];

                if (isset($categoryMap[$tab])) {
                    $query->where('category', $categoryMap[$tab]);
                }
            }

            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('description', 'LIKE', "%{$search}%");
                });
            }

            if ($brand) {
                $query->where('brand', $brand);
            }

            // Color filtering with similarity matching
            if (!empty($colors) || !empty($color)) {
                $colorFilters = !empty($colors) ? $colors : [$color];
                $colorFilters = array_filter($colorFilters); // Remove empty values
                
                \Log::info('Color filtering applied', [
                    'original_colors' => $colors,
                    'original_color' => $color,
                    'processed_filters' => $colorFilters
                ]);
                
                if (!empty($colorFilters)) {
                    $query->where(function($q) use ($colorFilters, $tableName) {
                        foreach ($colorFilters as $filterColor) {
                            $similarColors = $this->getSimilarColors($filterColor);
                            
                            \Log::info('Color similarity matching', [
                                'filter_color' => $filterColor,
                                'similar_colors' => $similarColors
                            ]);
                            
                            $q->orWhere(function($subQ) use ($filterColor, $similarColors) {
                                // Exact color match
                                $subQ->where('color', 'LIKE', "%{$filterColor}%")
                                     ->orWhere('colors', 'LIKE', "%{$filterColor}%");
                                
                                // Similar colors match
                                foreach ($similarColors as $similarColor) {
                                    $subQ->orWhere('color', 'LIKE', "%{$similarColor}%")
                                         ->orWhere('colors', 'LIKE', "%{$similarColor}%");
                                }
                            });
                        }
                    });
                }
            }

            // Category filtering
            if ($category) {
                $query->where('category', $category);
            }

            if ($minPrice > 0) {
                $query->where('price', '>=', $minPrice);
            }

            if ($maxPrice > 0 && $maxPrice < 1000) {
                $query->where('price', '<=', $maxPrice);
            }

            // Apply sorting
            switch ($sort) {
                case 'price_low':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_high':
                    $query->orderBy('price', 'desc');
                    break;
                case 'newest':
                    $query->orderBy('created_at', 'desc');
                    break;
                case 'popular':
                default:
                    $query->orderBy('id', 'desc');
                    break;
            }

            // Get total count for pagination
            $total = $query->count();

            // Apply pagination
            $offset = ($page - 1) * $perPage;
            $products = $query->offset($offset)
                            ->limit($perPage)
                ->get();

            // Format products
            try {
            $formattedProducts = $products->map(function ($product) {
                // Parse additional images from JSON fields
                $additionalImages = [];
                if (isset($product->additional_images) && $product->additional_images) {
                    $additionalImages = json_decode($product->additional_images, true) ?: [];
                }
                if (isset($product->images) && $product->images) {
                    $images = json_decode($product->images, true) ?: [];
                    $additionalImages = array_merge($additionalImages, $images);
                }
                if (isset($product->gallery_images) && $product->gallery_images) {
                    $galleryImages = json_decode($product->gallery_images, true) ?: [];
                    $additionalImages = array_merge($additionalImages, $galleryImages);
                }

                // Remove duplicates and empty values, then re-index to ensure it's a proper array
                $additionalImages = array_values(array_unique(array_filter($additionalImages)));

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'original_price' => $product->original_price ?? $product->compare_price ?? $product->price,
                    'discount_percentage' => $product->discount_percentage ?? 0,
                    'image_url' => $product->image_url ?? $product->image ?? '',
                    'additional_images' => $additionalImages,
                    'brand' => $product->brand ?? '',
                    'category' => $product->category ?? '',
                    'is_featured' => $product->is_featured ?? $product->featured ?? false,
                    'stock_quantity' => $product->stock_quantity ?? $product->stock ?? 0,
                    'sku' => $product->sku ?? '',
                    'slug' => $product->slug ?? '',
                    'rating' => $product->rating ?? 4.6,
                    'description' => $product->description ?? $product->short_description ?? '',
                ];
            });
            } catch (\Exception $formatException) {
                \Log::error('Error formatting products', [
                    'error' => $formatException->getMessage(),
                    'trace' => $formatException->getTraceAsString()
                ]);
                throw $formatException;
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'products' => $formattedProducts,
                    'pagination' => [
                        'current_page' => $page,
                        'per_page' => $perPage,
                        'total' => $total,
                        'last_page' => ceil($total / $perPage),
                        'has_more' => $page < ceil($total / $perPage)
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch products: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search products
     */
    public function searchProducts(Request $request)
    {
        try {
            $query = $request->input('q', '');
            $category = $request->input('category', '');
            $brand = $request->input('brand', '');
            $minPrice = (float) $request->input('min_price', 0);
            $maxPrice = (float) $request->input('max_price', 1000);

            // Determine table based on category or default to products_women
            $tableName = 'products_women'; // Default
            if ($category) {
                $tableName = $this->getTableByTab($category);
            }

            $products = DB::table($tableName);

            // Apply status filter based on table
            if ($tableName === 'products_men' || $tableName === 'products_kids') {
                $products->where('status', 'active');
            } else {
                $products->where('is_active', true);
            }

            if ($query) {
                $products->where(function($q) use ($query) {
                    $q->where('name', 'LIKE', "%{$query}%")
                      ->orWhere('description', 'LIKE', "%{$query}%")
                      ->orWhere('brand', 'LIKE', "%{$query}%");
                });
            }

            if ($category) {
                $products->where('category', $category);
            }

            if ($brand) {
                $products->where('brand', $brand);
            }

            if ($minPrice > 0) {
                $products->where('price', '>=', $minPrice);
            }

            if ($maxPrice > 0 && $maxPrice < 1000) {
                $products->where('price', '<=', $maxPrice);
            }

            $results = $products->orderBy('id', 'desc')
                              ->limit(20)
                ->get();

            $formattedResults = $results->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'image_url' => $product->image_url ?? $product->image ?? '',
                    'brand' => $product->brand ?? '',
                    'category' => $product->category ?? '',
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'products' => $formattedResults,
                    'query' => $query,
                    'total' => $formattedResults->count()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search products: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a single product by ID
     */
    public function show(Request $request, $id)
    {
        try {
            // Get table preference from query parameter
            $preferredTable = $request->query('table');
            $category = $request->query('category');

            // Determine table from category or use preferred table
            if ($category) {
                $preferredTable = 'products_' . strtolower($category);
            }

            // Build cache key based on table preference
            $cacheKey = $preferredTable
                ? "product_detail_{$id}_{$preferredTable}"
                : "product_detail_{$id}";

            // Check cache first for super fast response
            $cachedProduct = \Cache::get($cacheKey);
            if ($cachedProduct) {
                return response()->json([
                    'success' => true,
                    'data' => $cachedProduct,
                    'cached' => true
                ])->header('Cache-Control', 'public, max-age=600');
            }

            // Search in all product tables with optimized queries
            $product = null;
            $sourceTable = null;

            // If preferred table is specified, search there first
            $tables = ['products_women', 'products_men', 'products_kids'];

            // Reorder tables if preferred table is specified
            if ($preferredTable && in_array($preferredTable, $tables)) {
                $tables = array_merge(
                    [$preferredTable],
                    array_diff($tables, [$preferredTable])
                );
            }

            foreach ($tables as $table) {
                try {
                    $result = DB::table($table)
                        ->where('id', $id)
                        ->first();

                    if ($result) {
                        // Check if is_active column exists and product is active
                        if (isset($result->is_active)) {
                            if ($result->is_active) {
                                $product = $result;
                                $sourceTable = $table;
                                break;
                            }
                        } else {
                            // If no is_active column, check status column or assume active
                            if (isset($result->status)) {
                                if ($result->status === 'active') {
                                    $product = $result;
                                    $sourceTable = $table;
                                    break;
                                }
                            } else {
                                // If no status column either, assume product is active
                                $product = $result;
                                $sourceTable = $table;
                                break;
                            }
                        }
                    }
                } catch (\Exception $e) {
                    // Table doesn't exist or has issues, continue to next table
                    continue;
                }
            }

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            // Log which table we found the product in
            \Log::info("Product Found", [
                'product_id' => $id,
                'source_table' => $sourceTable,
                'product_name' => $product->name,
                'preferred_table' => $preferredTable
            ]);

            // Get product colors ONLY from the source table where we found the product
            $colors = collect();

                try {
                // First try to get colors for this specific product from its source table
                $colors = DB::table('product_colors')
                        ->where('product_id', $id)
                    ->where('source_table', $sourceTable)
                    ->orderBy('sort_order', 'asc')
                    ->orderBy('id', 'asc')
                        ->get();

                \Log::info("Product Colors Query", [
                    'product_id' => $id,
                    'source_table' => $sourceTable,
                    'colors_found' => $colors->count()
                ]);

            // If no colors found with source_table, try without (backward compatibility)
                // But ONLY if no colors were found above
            if ($colors->isEmpty()) {
                    $colors = DB::table('product_colors')
                        ->where('product_id', $id)
                        ->orderBy('sort_order', 'asc')
                        ->orderBy('id', 'asc')
                        ->get();

                    \Log::info("Fallback Colors Query (no source_table)", [
                        'product_id' => $id,
                        'colors_found' => $colors->count()
                    ]);
                }
            } catch (\Exception $e) {
                // If product_colors table doesn't exist, use empty collection
                \Log::warning("Error loading colors", ['error' => $e->getMessage()]);
                $colors = collect();
            }

            // Format the product data
            $formattedProduct = [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'price' => $product->price,
                'original_price' => $product->original_price ?? $product->price,
                'image_url' => $product->image_url ?? $product->image ?? '',
                'brand' => $product->brand ?? '',
                'category' => $product->category ?? '',
                'subcategory' => $product->subcategory ?? '',
                'stock_quantity' => $product->stock_quantity ?? $product->stock ?? 0,
                'is_active' => $product->is_active ?? ($product->status === 'active' ? 1 : 0),
                'rating' => $product->rating ?? 4.5,
                'reviews_count' => $product->reviews_count ?? 0,
                'sizes' => json_decode($product->sizes ?? '["S", "M", "L", "XL"]', true),
                'colors' => $this->getProductColors($product, $colors),
                'images' => $this->getProductImages($product),
                'additional_images' => json_decode($product->additional_images ?? '[]', true),
                'videos' => json_decode($product->videos ?? '[]', true),
                'source_table' => $sourceTable,
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at
            ];

            // Cache the formatted product for 30 minutes (1800 seconds) for better performance
            Cache::put($cacheKey, $formattedProduct, 1800);

            return response()->json([
                'success' => true,
                'data' => $formattedProduct
            ])->header('Cache-Control', 'public, max-age=600');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load product: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get product sizes
     */
    public function getProductSizes($id)
    {
        try {
            // Check all product tables for the product
            $tables = ['products_women', 'products_men', 'products_kids'];
            $product = null;
            $tableName = null;

            foreach ($tables as $table) {
                // Optimized query with specific fields only
                $product = DB::table($table)
                    ->select([
                        'id', 'name', 'description', 'price', 'original_price',
                        'image_url', 'brand', 'category', 'subcategory',
                        'stock_quantity', 'is_active', 'rating', 'reviews_count',
                        'sizes', 'colors', 'images', 'additional_images', 'videos',
                        'created_at', 'updated_at'
                    ])
                    ->where('id', $id)
                    ->where('is_active', 1)
                    ->first();
                if ($product) {
                    $tableName = $table;
                    break;
                }
            }

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            // Extract sizes from the product data
            $sizes = [];
            if (isset($product->size) && $product->size) {
                $decodedSizes = json_decode($product->size, true);

                // Handle both single size and array of sizes
                if (is_array($decodedSizes)) {
                    $sizes = $decodedSizes;
                } elseif (is_string($decodedSizes)) {
                    // If it's a single size string, make it an array
                    $sizes = [$decodedSizes];
                } elseif (is_string($product->size)) {
                    // If size is a plain string (not JSON), make it an array
                    $sizes = [$product->size];
                }
            }

            // If no sizes in database, return default shoe sizes
            if (empty($sizes)) {
                $sizes = ['35', '36', '37', '38', '39', '40', '41', '42'];
            }

            // Convert sizes array to objects with proper structure for frontend
            $formattedSizes = array_map(function($size, $index) {
                return [
                    'id' => $index + 1,
                    'size' => $size,
                    'is_available' => true,
                    'stock_quantity' => rand(5, 50) // Random stock for demo
                ];
            }, $sizes, array_keys($sizes));

            return response()->json([
                'success' => true,
                'data' => $formattedSizes
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load product sizes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get product reviews
     */
    public function getProductReviews($id)
    {
        try {
            // Check if reviews table exists
            if (!DB::getSchemaBuilder()->hasTable('reviews')) {
                return response()->json([
                    'success' => true,
                    'data' => []
                ]);
            }

            $reviews = DB::table('reviews')
                ->where('product_id', $id)
                ->where('status', 'approved')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $reviews
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => true,
                'data' => [] // Return empty array if reviews table doesn't exist
            ]);
        }
    }

    public function getRecommendedProducts(Request $request)
    {
        try {
            // Get the product table from request
            $productTable = $request->input('product_table', 'products_women');
            $currentProductId = $request->input('product_id', null);

            \Log::info('🔍 Getting recommended products', [
                'requested_table' => $request->input('product_table'),
                'product_id' => $currentProductId,
                'final_table' => $productTable
            ]);

            // Validate table name for security
            $allowedTables = ['products_women', 'products_men', 'products_kids'];
            if (!in_array($productTable, $allowedTables)) {
                $productTable = 'products_women';
            }

            // Get random products from the same table with safe column selection
            $query = DB::table($productTable)
                ->select('id', 'name', 'price', 'image_url', 'brand');

            // All tables use is_active column
            $query->select('id', 'name', 'price', 'old_price as original_price', 'image_url', 'brand')
                  ->where('is_active', 1);

            // Exclude current product if provided
            if ($currentProductId) {
                $query->where('id', '!=', $currentProductId);
            }

            $recommendedProducts = $query
                ->inRandomOrder()
                ->limit(8)
                ->get()
                ->map(function ($product) use ($productTable) {
                    // Determine category from table name
                    if ($productTable === 'products_women') {
                        $product->category = 'women';
                    } elseif ($productTable === 'products_men') {
                        $product->category = 'men';
                    } else {
                        $product->category = 'kids';
                    }

                    // Safe discount calculation - if original_price is NULL, use price
                    $originalPrice = $product->original_price ?? $product->price ?? 0;
                    $currentPrice = $product->price ?? 0;

                    // Set original_price to price if it was NULL
                    if (!$product->original_price) {
                        $product->original_price = $currentPrice;
                    }

                    $product->discount_percentage = $originalPrice > $currentPrice
                        ? round((($originalPrice - $currentPrice) / $originalPrice) * 100)
                        : 0;

                    // Add safe ratings and reviews count
                    $product->rating = round(4 + (rand(0, 10) / 10), 1); // 4.0 to 5.0
                    $product->reviews_count = rand(15, 200);

                    // Add safe flags
                    $product->is_new = $product->is_new ?? false;
                    $product->is_sale = $product->is_sale ?? false;
                    $product->is_featured = $product->is_featured ?? false;

                    return $product;
                });

            \Log::info('✅ Returning recommended products', [
                'table' => $productTable,
                'count' => $recommendedProducts->count(),
                'product_ids' => $recommendedProducts->pluck('id')->toArray()
            ]);

            return response()->json([
                'success' => true,
                'data' => $recommendedProducts->values()->toArray()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load recommended products',
                'data' => []
            ], 500);
        }
    }

    public function getTrendingProducts()
    {
        try {
            // Get trending products (simulate with random selection for now)
            $trendingProducts = collect();

            // Mix products from all categories
            $allProducts = collect();

            // Get some products from each category
            $categories = ['products_women', 'products_men', 'products_kids'];

            foreach ($categories as $category) {
                $products = DB::table($category)
                    ->select('id', 'name', 'price', 'image_url', 'brand')
                    ->where('status', 'active')
                    ->inRandomOrder()
                    ->limit(2)
                    ->get();
                $allProducts = $allProducts->merge($products);
            }

            // Take 4 products and add trending data
            $trendingProducts = $allProducts
                ->shuffle()
                ->take(4)
                ->map(function ($product, $index) {
                    $product->rating = round(4.5 + (rand(0, 5) / 10), 1); // 4.5 to 5.0
                    $product->rank = $index + 1;
                    return $product;
                });

            return response()->json([
                'success' => true,
                'data' => $trendingProducts->values()->toArray()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load trending products',
                'data' => []
            ], 500);
        }
    }

    /**
     * Get similar colors based on color name or hex code
     */
    private function getSimilarColors($color)
    {
        $color = strtolower(trim($color));
        
        // Color similarity mapping
        $colorGroups = [
            'black' => ['black', 'dark', 'charcoal', 'navy', 'midnight'],
            'white' => ['white', 'cream', 'ivory', 'pearl', 'snow'],
            'red' => ['red', 'crimson', 'scarlet', 'burgundy', 'maroon', 'pink', 'rose'],
            'blue' => ['blue', 'navy', 'royal', 'sky', 'azure', 'cyan', 'teal'],
            'green' => ['green', 'emerald', 'forest', 'lime', 'mint', 'olive'],
            'yellow' => ['yellow', 'gold', 'amber', 'mustard', 'lemon'],
            'purple' => ['purple', 'violet', 'lavender', 'plum', 'magenta'],
            'orange' => ['orange', 'peach', 'coral', 'apricot', 'tangerine'],
            'brown' => ['brown', 'tan', 'beige', 'khaki', 'coffee', 'chocolate'],
            'gray' => ['gray', 'grey', 'silver', 'charcoal', 'ash', 'slate'],
            'pink' => ['pink', 'rose', 'salmon', 'coral', 'magenta'],
            'cyan' => ['cyan', 'turquoise', 'aqua', 'teal', 'mint']
        ];

        // Hex color similarity (for exact hex codes)
        if (strpos($color, '#') === 0) {
            $hexSimilarity = $this->getHexSimilarColors($color);
            return array_merge([$color], $hexSimilarity);
        }

        // Find matching color group
        foreach ($colorGroups as $groupName => $groupColors) {
            if (in_array($color, $groupColors)) {
                return $groupColors;
            }
        }

        // If no group found, return the original color
        return [$color];
    }

    /**
     * Get similar hex colors based on color distance
     */
    private function getHexSimilarColors($hexColor)
    {
        $hexColor = str_replace('#', '', $hexColor);
        
        // Convert hex to RGB
        $r = hexdec(substr($hexColor, 0, 2));
        $g = hexdec(substr($hexColor, 2, 2));
        $b = hexdec(substr($hexColor, 4, 2));

        $similarColors = [];
        
        // Generate similar colors by adjusting RGB values
        $variations = [
            [10, 10, 10],   // Lighter
            [-10, -10, -10], // Darker
            [15, 0, 0],     // More red
            [-15, 0, 0],    // Less red
            [0, 15, 0],     // More green
            [0, -15, 0],    // Less green
            [0, 0, 15],     // More blue
            [0, 0, -15],    // Less blue
        ];

        foreach ($variations as $variation) {
            $newR = max(0, min(255, $r + $variation[0]));
            $newG = max(0, min(255, $g + $variation[1]));
            $newB = max(0, min(255, $b + $variation[2]));
            
            $similarHex = sprintf("#%02x%02x%02x", $newR, $newG, $newB);
            $similarColors[] = $similarHex;
        }

        return $similarColors;
    }
}
