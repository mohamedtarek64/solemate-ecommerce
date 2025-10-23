<?php

namespace App\Providers;

use App\Events\Cart\CartItemAdded;
use App\Events\Cart\CartItemUpdated;
use App\Events\Cart\CartItemRemoved;
use App\Listeners\Cart\SendCartNotification;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

/**
 * Event Service Provider
 */
class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],

        // Cart Events
        CartItemAdded::class => [
            SendCartNotification::class,
        ],

        CartItemUpdated::class => [
            SendCartNotification::class,
        ],

        CartItemRemoved::class => [
            SendCartNotification::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        // Register global event listeners
        $this->registerGlobalListeners();
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }

    /**
     * Register global event listeners
     */
    private function registerGlobalListeners(): void
    {
        // Log all cart events
        Event::listen([
            CartItemAdded::class,
            CartItemUpdated::class,
            CartItemRemoved::class
        ], function ($event) {
            \Log::info('Cart event triggered', [
                'event' => get_class($event),
                'user_id' => $event->userId,
                'timestamp' => now()->toISOString()
            ]);
        });

        // Update user activity on any cart action
        Event::listen([
            CartItemAdded::class,
            CartItemUpdated::class,
            CartItemRemoved::class
        ], function ($event) {
            \DB::table('users')
                ->where('id', $event->userId)
                ->update(['last_activity' => now()]);
        });
    }
}
