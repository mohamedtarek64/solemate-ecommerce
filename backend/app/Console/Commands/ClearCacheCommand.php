<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;

class ClearCacheCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cache:clear-all {--force}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear all application caches';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Clearing all caches...');

        try {
            // Clear application cache
            $this->clearApplicationCache();

            // Clear configuration cache
            $this->clearConfigCache();

            // Clear route cache
            $this->clearRouteCache();

            // Clear view cache
            $this->clearViewCache();

            // Clear compiled services
            $this->clearCompiledServices();

            // Clear custom caches
            $this->clearCustomCaches();

            $this->info('All caches cleared successfully!');
        } catch (\Exception $e) {
            $this->error('Failed to clear caches: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }

    /**
     * Clear application cache.
     */
    protected function clearApplicationCache(): void
    {
        $this->info('Clearing application cache...');
        Artisan::call('cache:clear');
        $this->info('✓ Application cache cleared');
    }

    /**
     * Clear configuration cache.
     */
    protected function clearConfigCache(): void
    {
        $this->info('Clearing configuration cache...');
        Artisan::call('config:clear');
        $this->info('✓ Configuration cache cleared');
    }

    /**
     * Clear route cache.
     */
    protected function clearRouteCache(): void
    {
        $this->info('Clearing route cache...');
        Artisan::call('route:clear');
        $this->info('✓ Route cache cleared');
    }

    /**
     * Clear view cache.
     */
    protected function clearViewCache(): void
    {
        $this->info('Clearing view cache...');
        Artisan::call('view:clear');
        $this->info('✓ View cache cleared');
    }

    /**
     * Clear compiled services.
     */
    protected function clearCompiledServices(): void
    {
        $this->info('Clearing compiled services...');
        
        $compiledPath = base_path('bootstrap/cache/compiled.php');
        if (File::exists($compiledPath)) {
            File::delete($compiledPath);
        }

        $servicesPath = base_path('bootstrap/cache/services.php');
        if (File::exists($servicesPath)) {
            File::delete($servicesPath);
        }

        $this->info('✓ Compiled services cleared');
    }

    /**
     * Clear custom caches.
     */
    protected function clearCustomCaches(): void
    {
        $this->info('Clearing custom caches...');

        // Clear search cache
        $this->clearSearchCache();

        // Clear analytics cache
        $this->clearAnalyticsCache();

        // Clear product cache
        $this->clearProductCache();

        $this->info('✓ Custom caches cleared');
    }

    /**
     * Clear search cache.
     */
    protected function clearSearchCache(): void
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
    }

    /**
     * Clear analytics cache.
     */
    protected function clearAnalyticsCache(): void
    {
        $patterns = [
            'analytics_dashboard_*',
            'analytics_stats_*',
            'analytics_reports_*',
        ];

        foreach ($patterns as $pattern) {
            Cache::forget($pattern);
        }
    }

    /**
     * Clear product cache.
     */
    protected function clearProductCache(): void
    {
        $patterns = [
            'products_featured_*',
            'products_popular_*',
            'products_recent_*',
            'product_*',
        ];

        foreach ($patterns as $pattern) {
            Cache::forget($pattern);
        }
    }
}
