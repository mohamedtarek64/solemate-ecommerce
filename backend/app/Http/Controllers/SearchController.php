<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class SearchController extends Controller
{
    /**
     * Search products across all tables
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $query = $request->input('q', '');
            $category = $request->input('category', '');
            $minPrice = $request->input('min_price', 0);
            $maxPrice = $request->input('max_price', 999999);
            $brand = $request->input('brand', '');
            $sort = $request->input('sort', 'relevance');
            $limit = $request->input('limit', 20);

            if (empty($query)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Search query is required'
                ], 400);
            }

            // Search in all product tables
            $results = collect();

            // Search in products_men table (Men's products)
            $menProducts = DB::table('products_men')
                ->where('is_active', 1)
                ->where(function ($q) use ($query) {
                    $q->where('name', 'LIKE', "%{$query}%")
                      ->orWhere('description', 'LIKE', "%{$query}%")
                      ->orWhere('brand', 'LIKE', "%{$query}%")
                      ->orWhere('category', 'LIKE', "%{$query}%");
                })
                ->when($brand, function ($q) use ($brand) {
                    return $q->where('brand', 'LIKE', "%{$brand}%");
                })
                ->when($category, function ($q) use ($category) {
                    return $q->where('category', 'LIKE', "%{$category}%");
                })
                ->whereBetween('price', [$minPrice, $maxPrice])
                ->select('id', 'name', 'description', 'price', 'image_url', 'brand', 'category', DB::raw('COALESCE(stock_quantity, 0) as stock_quantity'))
                ->get()
                ->map(function ($product) {
                    $product->table_source = 'products_men';
                    $product->gender = 'Men';
                    return $product;
                });

            $results = $results->merge($menProducts);

            // Search in products_women table
            $womenProducts = DB::table('products_women')
                ->where('is_active', true)
                ->where(function ($q) use ($query) {
                    $q->where('name', 'LIKE', "%{$query}%")
                      ->orWhere('description', 'LIKE', "%{$query}%")
                      ->orWhere('brand', 'LIKE', "%{$query}%")
                      ->orWhere('category', 'LIKE', "%{$query}%");
                })
                ->when($brand, function ($q) use ($brand) {
                    return $q->where('brand', 'LIKE', "%{$brand}%");
                })
                ->when($category, function ($q) use ($category) {
                    return $q->where('category', 'LIKE', "%{$category}%");
                })
                ->whereBetween('price', [$minPrice, $maxPrice])
                ->select('id', 'name', 'description', 'price', 'image_url', 'brand', 'category', 'stock_quantity')
                ->get()
                ->map(function ($product) {
                    $product->table_source = 'products_women';
                    $product->gender = 'Women';
                    return $product;
                });

            $results = $results->merge($womenProducts);

            // Search in products_kids table
            $kidsProducts = DB::table('products_kids')
                ->where('is_active', 1)
                ->where(function ($q) use ($query) {
                    $q->where('name', 'LIKE', "%{$query}%")
                      ->orWhere('description', 'LIKE', "%{$query}%")
                      ->orWhere('brand', 'LIKE', "%{$query}%")
                      ->orWhere('category', 'LIKE', "%{$query}%");
                })
                ->when($brand, function ($q) use ($brand) {
                    return $q->where('brand', 'LIKE', "%{$brand}%");
                })
                ->when($category, function ($q) use ($category) {
                    return $q->where('category', 'LIKE', "%{$category}%");
                })
                ->whereBetween('price', [$minPrice, $maxPrice])
                ->select('id', 'name', 'description', 'price', 'image_url', 'brand', 'category', DB::raw('COALESCE(stock_quantity, 0) as stock_quantity'))
                ->get()
                ->map(function ($product) {
                    $product->table_source = 'products_kids';
                    $product->gender = 'Kids';
                    return $product;
                });

            $results = $results->merge($kidsProducts);

            // Sort results
            switch ($sort) {
                case 'price_asc':
                    $results = $results->sortBy('price')->values();
                    break;
                case 'price_desc':
                    $results = $results->sortByDesc('price')->values();
                    break;
                case 'name':
                    $results = $results->sortBy('name')->values();
                    break;
                case 'relevance':
                default:
                    // Keep original relevance order
                    break;
            }

            // Limit results
            $results = $results->take($limit);

            // Get filter options from results
            $brands = $results->pluck('brand')->unique()->filter()->values();
            $categories = $results->pluck('category')->unique()->filter()->values();
            $priceRange = [
                'min' => $results->min('price') ?? 0,
                'max' => $results->max('price') ?? 0
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'products' => $results,
                    'total' => $results->count(),
                    'query' => $query,
                    'filters' => [
                        'brands' => $brands,
                        'categories' => $categories,
                        'price_range' => $priceRange
                    ]
                ],
                'message' => 'Search completed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Search failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get search suggestions for autocomplete
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function suggestions(Request $request): JsonResponse
    {
        try {
            $query = $request->input('q', '');

            \Log::info('Search suggestions request:', [
                'query' => $query,
                'request_data' => $request->all()
            ]);

            if (strlen($query) < 1) {
                return response()->json([
                    'success' => true,
                    'data' => []
                ]);
            }

            $suggestions = collect();

            // Get product details from all tables with images and prices
            $menSuggestions = DB::table('products_men')
                ->where('is_active', 1)
                ->where(function ($q) use ($query) {
                    $q->where('name', 'LIKE', "%{$query}%")
                      ->orWhere('brand', 'LIKE', "%{$query}%");
                })
                ->select('id', 'name', 'brand', 'category', 'price', 'image_url', DB::raw('"products_men" as table_source'), DB::raw('"Men" as gender'))
                ->limit(5)
                ->get();

            $womenSuggestions = DB::table('products_women')
                ->where('is_active', true)
                ->where(function ($q) use ($query) {
                    $q->where('name', 'LIKE', "%{$query}%")
                      ->orWhere('brand', 'LIKE', "%{$query}%");
                })
                ->select('id', 'name', 'brand', 'category', 'price', 'image_url', DB::raw('"products_women" as table_source'), DB::raw('"Women" as gender'))
                ->limit(5)
                ->get();

            $kidsSuggestions = DB::table('products_kids')
                ->where('is_active', 1)
                ->where(function ($q) use ($query) {
                    $q->where('name', 'LIKE', "%{$query}%")
                      ->orWhere('brand', 'LIKE', "%{$query}%");
                })
                ->select('id', 'name', 'brand', 'category', 'price', 'image_url', DB::raw('"products_kids" as table_source'), DB::raw('"Kids" as gender'))
                ->limit(5)
                ->get();

            $suggestions = $suggestions
                ->merge($menSuggestions)
                ->merge($womenSuggestions)
                ->merge($kidsSuggestions)
                ->take(10)
                ->values();

            \Log::info('Search suggestions result:', [
                'query' => $query,
                'men_count' => $menSuggestions->count(),
                'women_count' => $womenSuggestions->count(),
                'kids_count' => $kidsSuggestions->count(),
                'total_suggestions' => $suggestions->count()
            ]);

            return response()->json([
                'success' => true,
                'data' => $suggestions
            ]);

        } catch (\Exception $e) {
            \Log::error('Search suggestions error:', [
                'query' => $request->input('q', ''),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get suggestions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get popular searches
     *
     * @return JsonResponse
     */
    public function popular(): JsonResponse
    {
        try {
            // Get popular products from all tables with full details
            $menPopular = DB::table('products_men')
                ->where('is_active', 1)
                ->select('id', 'name', 'brand', 'category', 'price', 'image_url', DB::raw('"products_men" as table_source'), DB::raw('"Men" as gender'))
                ->limit(3)
                ->get();

            $womenPopular = DB::table('products_women')
                ->where('is_active', 1)
                ->select('id', 'name', 'brand', 'category', 'price', 'image_url', DB::raw('"products_women" as table_source'), DB::raw('"Women" as gender'))
                ->limit(3)
                ->get();

            $kidsPopular = DB::table('products_kids')
                ->where('is_active', 1)
                ->select('id', 'name', 'brand', 'category', 'price', 'image_url', DB::raw('"products_kids" as table_source'), DB::raw('"Kids" as gender'))
                ->limit(2)
                ->get();

            $popularProducts = collect()
                ->merge($menPopular)
                ->merge($womenPopular)
                ->merge($kidsPopular)
                ->take(8)
                ->values();

            return response()->json([
                'success' => true,
                'data' => $popularProducts
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get popular searches: ' . $e->getMessage()
            ], 500);
        }
    }
}
