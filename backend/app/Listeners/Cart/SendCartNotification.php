<?php

namespace App\Listeners\Cart;

use App\Events\Cart\CartItemAdded;
use App\Events\Cart\CartItemUpdated;
use App\Events\Cart\CartItemRemoved;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\CartNotification;

/**
 * Send Cart Notification Listener
 */
class SendCartNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of seconds the job can run.
     */
    public int $timeout = 30;

    /**
     * Handle the event.
     */
    public function handle(CartItemAdded|CartItemUpdated|CartItemRemoved $event): void
    {
        try {
            // Log the cart action
            $this->logCartAction($event);

            // Send notification if user has email notifications enabled
            if ($this->shouldSendNotification($event)) {
                $this->sendNotification($event);
            }

            // Update user activity
            $this->updateUserActivity($event);

        } catch (\Exception $e) {
            Log::error('Cart notification failed: ' . $e->getMessage(), [
                'event' => get_class($event),
                'user_id' => $event->userId,
                'error' => $e->getTraceAsString()
            ]);

            throw $e;
        }
    }

    /**
     * Log cart action
     */
    private function logCartAction($event): void
    {
        $action = $this->getActionType($event);

        Log::info("Cart {$action}", [
            'user_id' => $event->userId,
            'action' => $action,
            'timestamp' => now()->toISOString(),
            'metadata' => $event->metadata ?? []
        ]);
    }

    /**
     * Determine if notification should be sent
     */
    private function shouldSendNotification($event): bool
    {
        // Check if user has email notifications enabled
        // This would typically check user preferences from database
        return true; // Simplified for now
    }

    /**
     * Send notification to user
     */
    private function sendNotification($event): void
    {
        // Get user email (simplified)
        $userEmail = $this->getUserEmail($event->userId);

        if ($userEmail) {
            Mail::to($userEmail)->send(new CartNotification($event));
        }
    }

    /**
     * Update user activity
     */
    private function updateUserActivity($event): void
    {
        // Update user's last activity timestamp
        \DB::table('users')
            ->where('id', $event->userId)
            ->update(['last_activity' => now()]);
    }

    /**
     * Get action type from event
     */
    private function getActionType($event): string
    {
        return match(get_class($event)) {
            CartItemAdded::class => 'item_added',
            CartItemUpdated::class => 'item_updated',
            CartItemRemoved::class => 'item_removed',
            default => 'unknown_action'
        };
    }

    /**
     * Get user email by ID
     */
    private function getUserEmail(int $userId): ?string
    {
        try {
            $user = \DB::table('users')->where('id', $userId)->first();
            return $user->email ?? null;
        } catch (\Exception $e) {
            Log::error("Failed to get user email for ID {$userId}: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(CartItemAdded|CartItemUpdated|CartItemRemoved $event, \Throwable $exception): void
    {
        Log::error('Cart notification job failed permanently', [
            'event' => get_class($event),
            'user_id' => $event->userId,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
    }
}
