<?php

namespace App\Providers;

use App\Repositories\CartRepository;
use App\Repositories\Interfaces\CartRepositoryInterface;
use App\Repositories\WishlistRepository;
use App\Repositories\Interfaces\WishlistRepositoryInterface;
use App\Repositories\ProductRepository;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use App\Services\CartService;
use App\Services\WishlistService;
use App\Services\ProductService;
use App\Services\Interfaces\ProductServiceInterface;
use App\Factories\CartItemFactory;
use App\Factories\WishlistItemFactory;
use App\Factories\ProductFactory;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Repository Bindings
        $this->app->bind(CartRepositoryInterface::class, CartRepository::class);
        $this->app->bind(WishlistRepositoryInterface::class, WishlistRepository::class);
        $this->app->bind(ProductRepositoryInterface::class, ProductRepository::class);

        // Service Bindings
        $this->app->bind(ProductServiceInterface::class, ProductService::class);

        // Service with Dependencies
        $this->app->bind(CartService::class, function ($app) {
            return new CartService(
                $app->make(CartRepositoryInterface::class),
                $app->make(ProductServiceInterface::class)
            );
        });

        $this->app->bind(WishlistService::class, function ($app) {
            return new WishlistService(
                $app->make(WishlistRepositoryInterface::class),
                $app->make(ProductServiceInterface::class)
            );
        });

        $this->app->bind(ProductService::class, function ($app) {
            return new ProductService(
                $app->make(ProductRepositoryInterface::class)
            );
        });

        // Factory Bindings
        $this->app->singleton(CartItemFactory::class);
        $this->app->singleton(WishlistItemFactory::class);
        $this->app->singleton(ProductFactory::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
