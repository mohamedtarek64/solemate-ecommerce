<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class SearchService
{
    /**
     * Search products.
     */
    public function searchProducts(string $query, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $cacheKey = 'search_' . md5($query . serialize($filters) . $perPage);
        
        return Cache::remember($cacheKey, 300, function () use ($query, $filters, $perPage) {
            $products = Product::with(['category'])
                             ->active()
                             ->where(function ($q) use ($query) {
                                 $q->where('name', 'like', "%{$query}%")
                                   ->orWhere('description', 'like', "%{$query}%")
                                   ->orWhere('sku', 'like', "%{$query}%")
                                   ->orWhere('brand', 'like', "%{$query}%");
                             });

            // Apply filters
            $products = $this->applyFilters($products, $filters);

            return $products->orderBy('created_at', 'desc')
                           ->paginate($perPage);
        });
    }

    /**
     * Get search suggestions.
     */
    public function getSearchSuggestions(string $query, int $limit = 10): array
    {
        $cacheKey = 'search_suggestions_' . md5($query . $limit);
        
        return Cache::remember($cacheKey, 600, function () use ($query, $limit) {
            $suggestions = [];

            // Product name suggestions
            $productSuggestions = Product::select('name')
                                        ->where('name', 'like', "%{$query}%")
                                        ->active()
                                        ->distinct()
                                        ->limit($limit)
                                        ->pluck('name')
                                        ->toArray();

            $suggestions = array_merge($suggestions, $productSuggestions);

            // Brand suggestions
            $brandSuggestions = Product::select('brand')
                                      ->where('brand', 'like', "%{$query}%")
                                      ->whereNotNull('brand')
                                      ->where('brand', '!=', '')
                                      ->active()
                                      ->distinct()
                                      ->limit($limit)
                                      ->pluck('brand')
                                      ->toArray();

            $suggestions = array_merge($suggestions, $brandSuggestions);

            // Category suggestions
            $categorySuggestions = Category::select('name')
                                          ->where('name', 'like', "%{$query}%")
                                          ->active()
                                          ->limit($limit)
                                          ->pluck('name')
                                          ->toArray();

            $suggestions = array_merge($suggestions, $categorySuggestions);

            // Remove duplicates and limit results
            $suggestions = array_unique($suggestions);
            $suggestions = array_slice($suggestions, 0, $limit);

            return $suggestions;
        });
    }

    /**
     * Get search filters.
     */
    public function getSearchFilters(): array
    {
        $cacheKey = 'search_filters';
        
        return Cache::remember($cacheKey, 3600, function () {
            return [
                'categories' => Category::active()
                                       ->orderBy('name')
                                       ->get(['id', 'name']),
                'brands' => Product::select('brand')
                                  ->distinct()
                                  ->whereNotNull('brand')
                                  ->where('brand', '!=', '')
                                  ->active()
                                  ->orderBy('brand')
                                  ->pluck('brand'),
                'sizes' => Product::select('size')
                                 ->distinct()
                                 ->whereNotNull('size')
                                 ->where('size', '!=', '')
                                 ->active()
                                 ->orderBy('size')
                                 ->pluck('size'),
                'colors' => Product::select('color')
                                  ->distinct()
                                  ->whereNotNull('color')
                                  ->where('color', '!=', '')
                                  ->active()
                                  ->orderBy('color')
                                  ->pluck('color'),
                'price_ranges' => $this->getPriceRanges(),
            ];
        });
    }

    /**
     * Get trending searches.
     */
    public function getTrendingSearches(int $limit = 10): array
    {
        $cacheKey = 'trending_searches_' . $limit;
        
        return Cache::remember($cacheKey, 1800, function () use ($limit) {
            // This would typically come from analytics data
            // For now, we'll return popular product names
            return Product::select('name')
                          ->active()
                          ->orderBy('created_at', 'desc')
                          ->limit($limit)
                          ->pluck('name')
                          ->toArray();
        });
    }

    /**
     * Get products by tab.
     */
    public function getProductsByTab(string $tab, int $perPage = 15): LengthAwarePaginator
    {
        $cacheKey = 'products_tab_' . $tab . '_' . $perPage;
        
        return Cache::remember($cacheKey, 300, function () use ($tab, $perPage) {
            return match($tab) {
                'featured' => Product::featured()->active()->with(['category'])->paginate($perPage),
                'new' => Product::active()->with(['category'])->orderBy('created_at', 'desc')->paginate($perPage),
                'sale' => Product::whereNotNull('sale_price')->active()->with(['category'])->paginate($perPage),
                'popular' => Product::active()->with(['category'])->orderBy('created_at', 'desc')->paginate($perPage),
                default => Product::active()->with(['category'])->paginate($perPage),
            };
        });
    }

    /**
     * Get popular searches.
     */
    public function getPopularSearches(int $limit = 10): array
    {
        $cacheKey = 'popular_searches_' . $limit;
        
        return Cache::remember($cacheKey, 3600, function () use ($limit) {
            // This would typically come from analytics data
            // For now, we'll return popular product names
            return Product::select('name')
                          ->active()
                          ->orderBy('created_at', 'desc')
                          ->limit($limit)
                          ->pluck('name')
                          ->toArray();
        });
    }

    /**
     * Save search query.
     */
    public function saveSearch(string $query, array $filters = [], int $resultsCount = 0, int $userId = null): void
    {
        // This would typically save to a search_logs table
        // For now, we'll just cache the search
        $cacheKey = 'recent_search_' . md5($query . serialize($filters));
        Cache::put($cacheKey, [
            'query' => $query,
            'filters' => $filters,
            'results_count' => $resultsCount,
            'user_id' => $userId,
            'timestamp' => now(),
        ], 3600);
    }

    /**
     * Get saved searches.
     */
    public function getSavedSearches(int $userId, int $limit = 10): array
    {
        $cacheKey = 'saved_searches_' . $userId . '_' . $limit;
        
        return Cache::remember($cacheKey, 1800, function () use ($userId, $limit) {
            // This would typically come from a saved_searches table
            // For now, we'll return empty array
            return [];
        });
    }

    /**
     * Clear search cache.
     */
    public function clearSearchCache(): bool
    {
        $patterns = [
            'search_*',
            'search_suggestions_*',
            'search_filters',
            'trending_searches_*',
            'products_tab_*',
            'popular_searches_*',
        ];

        foreach ($patterns as $pattern) {
            Cache::forget($pattern);
        }

        return true;
    }

    /**
     * Reindex search.
     */
    public function reindexSearch(): bool
    {
        // Clear all search-related cache
        $this->clearSearchCache();

        // This would typically rebuild search indexes
        // For now, we'll just return true
        return true;
    }

    /**
     * Apply filters to query.
     */
    private function applyFilters($query, array $filters)
    {
        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (isset($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }

        if (isset($filters['max_price'])) {
            $query->where('price', '<=', $filters['max_price']);
        }

        if (isset($filters['brand'])) {
            $query->where('brand', $filters['brand']);
        }

        if (isset($filters['size'])) {
            $query->where('size', $filters['size']);
        }

        if (isset($filters['color'])) {
            $query->where('color', $filters['color']);
        }

        if (isset($filters['in_stock']) && $filters['in_stock']) {
            $query->where('stock_quantity', '>', 0);
        }

        if (isset($filters['on_sale']) && $filters['on_sale']) {
            $query->whereNotNull('sale_price');
        }

        return $query;
    }

    /**
     * Get price ranges.
     */
    private function getPriceRanges(): array
    {
        $minPrice = Product::active()->min('price');
        $maxPrice = Product::active()->max('price');

        return [
            ['label' => 'Under $25', 'min' => 0, 'max' => 25],
            ['label' => '$25 - $50', 'min' => 25, 'max' => 50],
            ['label' => '$50 - $100', 'min' => 50, 'max' => 100],
            ['label' => '$100 - $200', 'min' => 100, 'max' => 200],
            ['label' => 'Over $200', 'min' => 200, 'max' => $maxPrice],
        ];
    }
}
