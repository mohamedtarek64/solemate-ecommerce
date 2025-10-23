<?php

namespace App\Repositories;

use App\Repositories\Interfaces\ProductRepositoryInterface;
use App\Enums\ProductTable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Product Repository
 */
class ProductRepository implements ProductRepositoryInterface
{
    public function findById(int $productId, string $productTable): ?array
    {
        try {
            // Cache key for product
            $cacheKey = "product:{$productTable}:{$productId}";
            
            // Try to get from cache first (cache for 30 minutes)
            return Cache::remember($cacheKey, 1800, function() use ($productId, $productTable) {
                $product = DB::table($productTable)
                    ->where('id', $productId)
                    ->first();

                if (!$product) {
                    return null;
                }

                $productArray = (array) $product;

                // Handle missing columns
                if (!isset($productArray['stock_quantity'])) {
                    $productArray['stock_quantity'] = $productArray['quantity'] ?? 0;
                }

                if (!isset($productArray['is_active'])) {
                    $productArray['is_active'] = $productArray['status'] === 'active' ? 1 : 0;
                }

                $productArray['source_table'] = $productTable;

                return $productArray;
            });
        } catch (\Exception $e) {
            Log::error("ProductRepository: Failed to find product {$productId} in {$productTable}: " . $e->getMessage());
            return null;
        }
    }

    public function findByUserId(int $userId): array
    {
        // This method might not be applicable for products
        // Keeping it for interface compliance
        return [];
    }

    public function searchProducts(string $query, string $tab = 'all', int $page = 1, int $perPage = 10): array
    {
        // Cache search results for 5 minutes
        $cacheKey = "search:{$tab}:" . md5($query) . ":{$page}:{$perPage}";
        
        return Cache::remember($cacheKey, 300, function() use ($query, $tab, $page, $perPage) {
            $productTables = $this->getTablesByTab($tab);
            $allProducts = collect();
            $totalCount = 0;

            foreach ($productTables as $table) {
                try {
                    // Use indexed columns for better performance
                    $queryBuilder = DB::table($table)
                        ->select('id', 'name', 'description', 'price', 'image_url', 'brand', 'category', 'stock_quantity', 'is_active', 'created_at')
                        ->where(function($q) use ($query) {
                            $q->where('name', 'like', "%{$query}%")
                              ->orWhere('description', 'like', "%{$query}%")
                              ->orWhere('brand', 'like', "%{$query}%")
                              ->orWhere('category', 'like', "%{$query}%");
                        });

                    // Apply active status filter
                    if ($table === ProductTable::PRODUCTS_MEN) {
                        $queryBuilder->where('status', 'active');
                    } else {
                        $queryBuilder->where('is_active', true);
                    }

                    $products = $queryBuilder->get();
                    $totalCount += $products->count();

                    // Add source table to each product
                    $products->each(function($product) use ($table) {
                        $product->source_table = $table;
                        if (!isset($product->stock_quantity)) {
                            $product->stock_quantity = $product->stock ?? 0;
                        }
                        if (!isset($product->is_active)) {
                            $product->is_active = $product->status === 'active' ? 1 : 0;
                        }
                    });

                    $allProducts = $allProducts->merge($products);
                } catch (\Exception $e) {
                    Log::warning("ProductRepository: Table {$table} not found: " . $e->getMessage());
                    continue;
                }
            }

            // Apply pagination
            $paginatedProducts = $allProducts->slice(($page - 1) * $perPage, $perPage)->values();

            return [
                'products' => $paginatedProducts->toArray(),
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total' => $totalCount,
                    'last_page' => ceil($totalCount / $perPage),
                    'has_more' => ($page * $perPage) < $totalCount
                ]
            ];
        });
    }

    public function getProductsByTab(string $tab, int $page = 1, int $perPage = 10, array $filters = []): array
    {
        // Cache products by tab for 10 minutes
        $cacheKey = "products_tab:{$tab}:{$page}:{$perPage}:" . md5(json_encode($filters));
        
        return Cache::remember($cacheKey, 600, function() use ($tab, $page, $perPage, $filters) {
            $table = $this->getTableByTab($tab);

            try {
                $queryBuilder = DB::table($table)
                    ->select('id', 'name', 'price', 'image_url', 'brand', 'category', 'stock_quantity', 'is_active');

                // Apply active status filter
                if ($table === ProductTable::PRODUCTS_MEN) {
                    $queryBuilder->where('status', 'active');
                } else {
                    $queryBuilder->where('is_active', true);
                }

                // Apply filters
                if (!empty($filters['category'])) {
                    $queryBuilder->where('category', $filters['category']);
                }

                if (!empty($filters['brand'])) {
                    $queryBuilder->where('brand', $filters['brand']);
                }

                if (!empty($filters['min_price'])) {
                    $queryBuilder->where('price', '>=', $filters['min_price']);
                }

                if (!empty($filters['max_price'])) {
                    $queryBuilder->where('price', '<=', $filters['max_price']);
                }

                // Apply sorting
                $sortBy = $filters['sort_by'] ?? 'name';
                $sortOrder = $filters['sort_order'] ?? 'asc';
                $queryBuilder->orderBy($sortBy, $sortOrder);

                // Get total count
                $totalCount = $queryBuilder->count();

                // Apply pagination
                $products = $queryBuilder
                    ->offset(($page - 1) * $perPage)
                    ->limit($perPage)
                    ->get();

                // Process products
                $products->each(function($product) use ($table) {
                    $product->source_table = $table;
                    if (!isset($product->stock_quantity)) {
                        $product->stock_quantity = $product->quantity ?? 0;
                    }
                    if (!isset($product->is_active)) {
                        $product->is_active = $product->status === 'active' ? 1 : 0;
                    }
                });

                return [
                    'products' => $products->toArray(),
                    'pagination' => [
                        'current_page' => $page,
                        'per_page' => $perPage,
                        'total' => $totalCount,
                        'last_page' => ceil($totalCount / $perPage),
                        'has_more' => ($page * $perPage) < $totalCount
                    ]
                ];
            } catch (\Exception $e) {
                Log::error("ProductRepository: Failed to get products by tab {$tab}: " . $e->getMessage());
                return [
                    'products' => [],
                    'pagination' => [
                        'current_page' => $page,
                        'per_page' => $perPage,
                        'total' => 0,
                        'last_page' => 0,
                        'has_more' => false
                    ]
                ];
            }
        });
    }

    public function getActiveProducts(string $productTable): array
    {
        try {
            $queryBuilder = DB::table($productTable);

            if ($productTable === ProductTable::PRODUCTS_MEN) {
                $queryBuilder->where('status', 'active');
            } else {
                $queryBuilder->where('is_active', true);
            }

            $products = $queryBuilder->get();

            $products->each(function($product) use ($productTable) {
                $product->source_table = $productTable;
                if (!isset($product->stock_quantity)) {
                    $product->stock_quantity = $product->quantity ?? 0;
                }
                if (!isset($product->is_active)) {
                    $product->is_active = $product->status === 'active' ? 1 : 0;
                }
            });

            return $products->toArray();
        } catch (\Exception $e) {
            Log::error("ProductRepository: Failed to get active products from {$productTable}: " . $e->getMessage());
            return [];
        }
    }

    public function getFeaturedProducts(string $productTable, int $limit = 10): array
    {
        // Cache featured products for 15 minutes
        $cacheKey = "featured_products:{$productTable}:{$limit}";
        
        return Cache::remember($cacheKey, 900, function() use ($productTable, $limit) {
            try {
                $queryBuilder = DB::table($productTable)
                    ->select('id', 'name', 'price', 'image_url', 'brand', 'category', 'stock_quantity', 'is_active')
                    ->limit($limit);

                if ($productTable === ProductTable::PRODUCTS_MEN) {
                    $queryBuilder->where('status', 'active');
                } else {
                    $queryBuilder->where('is_active', true);
                }

                // Check if is_featured column exists
                if ($this->columnExists($productTable, 'is_featured')) {
                    $queryBuilder->where('is_featured', true);
                }

                $products = $queryBuilder->get();

                $products->each(function($product) use ($productTable) {
                    $product->source_table = $productTable;
                    if (!isset($product->stock_quantity)) {
                        $product->stock_quantity = $product->quantity ?? 0;
                    }
                    if (!isset($product->is_active)) {
                        $product->is_active = $product->status === 'active' ? 1 : 0;
                    }
                });

                return $products->toArray();
            } catch (\Exception $e) {
                Log::error("ProductRepository: Failed to get featured products from {$productTable}: " . $e->getMessage());
                return [];
            }
        });
    }

    public function getProductColors(int $productId, string $sourceTable): array
    {
        try {
            $colors = DB::table('product_colors')
                ->where('product_id', $productId)
                ->where('source_table', $sourceTable)
                ->get();

            if ($colors->isEmpty()) {
                // Fallback: get colors without source_table filter for backward compatibility
                $colors = DB::table('product_colors')
                    ->where('product_id', $productId)
                    ->get();
            }

            return $colors->map(function($color) {
                return [
                    'id' => $color->id,
                    'color' => $color->color_name,
                    'color_code' => $color->color_code,
                    'image_url' => $color->image_url,
                    'additional_images' => json_decode($color->additional_images ?? '[]', true),
                    'videos' => json_decode($color->videos ?? '[]', true)
                ];
            })->toArray();
        } catch (\Exception $e) {
            Log::error("ProductRepository: Failed to get product colors for {$productId}: " . $e->getMessage());
            return [];
        }
    }

    public function getColorImage(int $productId, string $colorName): ?string
    {
        try {
            return DB::table('product_colors')
                ->where('product_id', $productId)
                ->where('color', $colorName)
                ->value('image_url');
        } catch (\Exception $e) {
            Log::error("ProductRepository: Failed to get color image for product {$productId}, color {$colorName}: " . $e->getMessage());
            return null;
        }
    }

    public function validateProductExists(int $productId, string $productTable): bool
    {
        try {
            $product = DB::table($productTable)->where('id', $productId)->first();

            if (!$product) {
                return false;
            }

            // Check if product is active
            if ($productTable === ProductTable::PRODUCTS_MEN) {
                return $product->status === 'active';
            } else {
                return $product->is_active ?? true;
            }
        } catch (\Exception $e) {
            Log::error("ProductRepository: Failed to validate product {$productId} in {$productTable}: " . $e->getMessage());
            return false;
        }
    }

    public function getStockQuantity(int $productId, string $productTable): int
    {
        try {
            $product = DB::table($productTable)->where('id', $productId)->first();

            if (!$product) {
                return 0;
            }

            return (int) ($product->stock_quantity ?? $product->stock ?? 0);
        } catch (\Exception $e) {
            Log::error("ProductRepository: Failed to get stock quantity for product {$productId} in {$productTable}: " . $e->getMessage());
            return 0;
        }
    }

    public function updateStock(int $productId, string $productTable, int $quantity): bool
    {
        try {
            $column = $this->columnExists($productTable, 'stock_quantity') ? 'stock_quantity' : 'quantity';

            $result = DB::table($productTable)
                ->where('id', $productId)
                ->update([$column => $quantity]) > 0;
            
            // Clear cache after stock update
            if ($result) {
                $this->clearProductCache($productId, $productTable);
            }
            
            return $result;
        } catch (\Exception $e) {
            Log::error("ProductRepository: Failed to update stock for product {$productId} in {$productTable}: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Clear product cache
     */
    public function clearProductCache(int $productId, string $productTable): void
    {
        try {
            // Clear specific product cache
            $cacheKey = "product:{$productTable}:{$productId}";
            Cache::forget($cacheKey);
            
            // Clear all related list caches using tags (if Redis is used)
            // For file cache, we use pattern matching
            $patterns = [
                "products_tab:*",
                "search:*",
                "featured_products:*"
            ];
            
            foreach ($patterns as $pattern) {
                Cache::forget($pattern);
            }
            
            Log::info("Cleared cache for product {$productId} in {$productTable}");
        } catch (\Exception $e) {
            Log::warning("Failed to clear product cache: " . $e->getMessage());
        }
    }
    
    /**
     * Clear all products cache
     */
    public function clearAllProductsCache(): void
    {
        try {
            Cache::flush();
            Log::info("Cleared all products cache");
        } catch (\Exception $e) {
            Log::warning("Failed to clear all products cache: " . $e->getMessage());
        }
    }

    /**
     * Get table name by tab
     */
    private function getTableByTab(string $tab): string
    {
        switch ($tab) {
            case 'men':
                return ProductTable::PRODUCTS_MEN;
            case 'kids':
                return ProductTable::PRODUCTS_KIDS;
            case 'women':
            case 'all':
            default:
                return ProductTable::PRODUCTS_WOMEN;
        }
    }

    /**
     * Get tables by tab
     */
    private function getTablesByTab(string $tab): array
    {
        switch ($tab) {
            case 'men':
                return [ProductTable::PRODUCTS_MEN];
            case 'kids':
                return [ProductTable::PRODUCTS_KIDS];
            case 'women':
                return [ProductTable::PRODUCTS_WOMEN];
            case 'all':
            default:
                return ProductTable::getAll();
        }
    }

    /**
     * Check if column exists in table
     */
    private function columnExists(string $table, string $column): bool
    {
        try {
            $columns = DB::getSchemaBuilder()->getColumnListing($table);
            return in_array($column, $columns);
        } catch (\Exception $e) {
            return false;
        }
    }
}
