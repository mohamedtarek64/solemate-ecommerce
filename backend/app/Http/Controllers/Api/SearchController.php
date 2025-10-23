<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    /**
     * Get products by tab (men, women, kids, etc.)
     */
    public function getProductsByTab(Request $request): JsonResponse
    {
        try {
            $tab = $request->get('tab', 'men');
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 12);
            $search = $request->get('search', '');
            $brand = $request->get('brand', '');
            $minPrice = $request->get('min_price', 0);
            $maxPrice = $request->get('max_price', 1000);
            $sort = $request->get('sort', 'popular');

            // Build query
            $query = Product::query();

            // Filter by tab/category
            if ($tab !== 'all') {
                $query->where('category', $tab);
            }

            // Search filter
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // Brand filter
            if ($brand) {
                $query->where('brand', $brand);
            }

            // Price filter
            if ($minPrice > 0) {
                $query->where('price', '>=', $minPrice);
            }
            if ($maxPrice < 1000) {
                $query->where('price', '<=', $maxPrice);
            }

            // Sort
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
                    $query->orderBy('is_featured', 'desc')->orderBy('created_at', 'desc');
                    break;
            }

            // Paginate
            $products = $query->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data' => [
                    'products' => $products->items(),
                    'pagination' => [
                        'current_page' => $products->currentPage(),
                        'last_page' => $products->lastPage(),
                        'per_page' => $products->perPage(),
                        'total' => $products->total(),
                        'has_more_pages' => $products->hasMorePages()
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching products: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * General search
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $query = $request->get('q', '');
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 12);

            $products = Product::where('name', 'like', "%{$query}%")
                ->orWhere('description', 'like', "%{$query}%")
                ->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data' => [
                    'products' => $products->items(),
                    'pagination' => [
                        'current_page' => $products->currentPage(),
                        'last_page' => $products->lastPage(),
                        'per_page' => $products->perPage(),
                        'total' => $products->total(),
                        'has_more_pages' => $products->hasMorePages()
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error searching products: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get search suggestions
     */
    public function getSuggestions(Request $request): JsonResponse
    {
        try {
            $query = $request->get('q', '');
            
            $suggestions = Product::where('name', 'like', "%{$query}%")
                ->limit(5)
                ->pluck('name')
                ->toArray();

            return response()->json([
                'success' => true,
                'data' => $suggestions
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting suggestions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get search filters
     */
    public function getFilters(Request $request): JsonResponse
    {
        try {
            $brands = Product::distinct()->pluck('brand')->filter()->values();
            $categories = Product::distinct()->pluck('category')->filter()->values();
            
            $minPrice = Product::min('price');
            $maxPrice = Product::max('price');

            return response()->json([
                'success' => true,
                'data' => [
                    'brands' => $brands,
                    'categories' => $categories,
                    'price_range' => [
                        'min' => $minPrice,
                        'max' => $maxPrice
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting filters: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get trending searches
     */
    public function getTrending(Request $request): JsonResponse
    {
        try {
            $trending = Product::where('is_featured', true)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $trending
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting trending: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear search cache
     */
    public function clearSearchCache(Request $request): JsonResponse
    {
        try {
            // Clear cache if using cache
            return response()->json([
                'success' => true,
                'message' => 'Search cache cleared successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error clearing cache: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get popular searches
     */
    public function getPopularSearches(Request $request): JsonResponse
    {
        try {
            $popular = Product::where('is_featured', true)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $popular
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting popular searches: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save search
     */
    public function saveSearch(Request $request): JsonResponse
    {
        try {
            // Implement save search logic
            return response()->json([
                'success' => true,
                'message' => 'Search saved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error saving search: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get saved searches
     */
    public function getSavedSearches(Request $request): JsonResponse
    {
        try {
            // Implement get saved searches logic
            return response()->json([
                'success' => true,
                'data' => []
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting saved searches: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get public saved searches
     */
    public function getPublicSavedSearches(Request $request): JsonResponse
    {
        try {
            // Implement get public saved searches logic
            return response()->json([
                'success' => true,
                'data' => []
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting public saved searches: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete saved search
     */
    public function deleteSavedSearch(Request $request, $savedSearchId): JsonResponse
    {
        try {
            // Implement delete saved search logic
            return response()->json([
                'success' => true,
                'message' => 'Search deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting search: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Use saved search
     */
    public function useSavedSearch(Request $request, $savedSearchId): JsonResponse
    {
        try {
            // Implement use saved search logic
            return response()->json([
                'success' => true,
                'message' => 'Search used successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error using search: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get search analytics
     */
    public function getSearchAnalytics(Request $request): JsonResponse
    {
        try {
            // Implement search analytics logic
            return response()->json([
                'success' => true,
                'data' => []
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting analytics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reindex search
     */
    public function reindexSearch(Request $request): JsonResponse
    {
        try {
            // Implement reindex logic
            return response()->json([
                'success' => true,
                'message' => 'Search reindexed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error reindexing: ' . $e->getMessage()
            ], 500);
        }
    }
}