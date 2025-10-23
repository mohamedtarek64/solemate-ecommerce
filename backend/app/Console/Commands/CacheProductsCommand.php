<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use App\Models\ProductWomen;

class CacheProductsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cache:products {--clear : Clear existing cache}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cache products data for improved performance';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        if ($this->option('clear')) {
            $this->clearCache();
            return Command::SUCCESS;
        }

        $this->info('🚀 Starting products caching...');

        // Cache all products
        $this->cacheAllProducts();

        // Cache featured products
        $this->cacheFeaturedProducts();

        // Cache products by category
        $this->cacheProductsByCategory();

        // Cache statistics
        $this->cacheStatistics();

        $this->info('✅ Products caching completed successfully!');
        return Command::SUCCESS;
    }

    private function cacheAllProducts()
    {
        $this->info('📦 Caching all products...');

        $products = ProductWomen::orderBy('created_at', 'desc')->get();
        Cache::put('products:all', $products, 3600); // 1 hour

        $this->line("   Cached {$products->count()} products");
    }

    private function cacheFeaturedProducts()
    {
        $this->info('⭐ Caching featured products...');

        $featuredProducts = ProductWomen::featured()
            ->active()
            ->inStock()
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        Cache::put('products:featured', $featuredProducts, 1800); // 30 minutes

        $this->line("   Cached {$featuredProducts->count()} featured products");
    }

    private function cacheProductsByCategory()
    {
        $this->info('📂 Caching products by category...');

        $categories = ProductWomen::distinct()->pluck('category')->filter();

        foreach ($categories as $category) {
            $products = ProductWomen::byCategory($category)
                ->active()
                ->orderBy('created_at', 'desc')
                ->get();

            Cache::put("products:category:{$category}", $products, 1800); // 30 minutes

            $this->line("   Cached {$products->count()} products for category: {$category}");
        }
    }

    private function cacheStatistics()
    {
        $this->info('📊 Caching statistics...');

        $stats = [
            'total_products' => ProductWomen::count(),
            'active_products' => ProductWomen::active()->count(),
            'featured_products' => ProductWomen::featured()->count(),
            'low_stock_products' => $this->getLowStockCount(),
            'total_categories' => ProductWomen::distinct()->count('category'),
            'average_price' => ProductWomen::active()->avg('price'),
            'price_range' => [
                'min' => ProductWomen::active()->min('price'),
                'max' => ProductWomen::active()->max('price')
            ],
            'brands' => ProductWomen::distinct()->pluck('brand')->filter()->values(),
            'categories' => ProductWomen::distinct()->pluck('category')->filter()->values()
        ];

        Cache::put('products:statistics', $stats, 3600); // 1 hour

        $this->line("   Cached comprehensive statistics");
    }

    private function getLowStockCount()
    {
        try {
            return ProductWomen::where('stock_quantity', '<', 10)->count();
        } catch (\Exception $e) {
            // If stock_quantity column doesn't exist, return 0
            return 0;
        }
    }

    private function clearCache()
    {
        $this->info('🗑️ Clearing products cache...');

        $keys = [
            'products:all',
            'products:featured',
            'products:statistics'
        ];

        // Clear category caches
        $categories = ProductWomen::distinct()->pluck('category')->filter();
        foreach ($categories as $category) {
            $keys[] = "products:category:{$category}";
        }

        foreach ($keys as $key) {
            Cache::forget($key);
        }

        $this->info('✅ Products cache cleared successfully!');
    }
}
