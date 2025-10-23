<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\App;

class ServiceServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Register services
        $this->registerServices();
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Register service bindings.
     */
    protected function registerServices(): void
    {
        // Auth Service
        App::singleton(\App\Services\AuthService::class, function ($app) {
            return new \App\Services\AuthService(
                $app->make(\App\Repositories\Contracts\UserRepositoryInterface::class)
            );
        });

        // Product Service
        App::singleton(\App\Services\ProductService::class, function ($app) {
            return new \App\Services\ProductService(
                $app->make(\App\Repositories\Contracts\ProductRepositoryInterface::class),
                $app->make(\App\Repositories\Contracts\CategoryRepositoryInterface::class)
            );
        });

        // Order Service
        App::singleton(\App\Services\OrderService::class, function ($app) {
            return new \App\Services\OrderService(
                $app->make(\App\Repositories\Contracts\OrderRepositoryInterface::class),
                $app->make(\App\Repositories\Contracts\ProductRepositoryInterface::class)
            );
        });

        // Payment Service
        App::singleton(\App\Services\PaymentService::class, function ($app) {
            return new \App\Services\PaymentService(
                $app->make(\App\Repositories\Contracts\OrderRepositoryInterface::class)
            );
        });

        // Notification Service
        App::singleton(\App\Services\NotificationService::class, function ($app) {
            return new \App\Services\NotificationService(
                $app->make(\App\Repositories\Contracts\NotificationRepositoryInterface::class)
            );
        });

        // Analytics Service
        App::singleton(\App\Services\AnalyticsService::class, function ($app) {
            return new \App\Services\AnalyticsService(
                $app->make(\App\Repositories\Contracts\AnalyticsRepositoryInterface::class)
            );
        });

        // Search Service
        App::singleton(\App\Services\SearchService::class, function ($app) {
            return new \App\Services\SearchService(
                $app->make(\App\Repositories\Contracts\SearchRepositoryInterface::class)
            );
        });
    }
}
