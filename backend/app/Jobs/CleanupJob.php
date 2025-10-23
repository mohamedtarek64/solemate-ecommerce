<?php

namespace App\Jobs;

use App\Models\AnalyticsPageView;
use App\Models\AnalyticsEvent;
use App\Models\AnalyticsProductView;
use App\Models\AnalyticsSearch;
use App\Models\AnalyticsCartAction;
use App\Models\AnalyticsPurchase;
use App\Models\Notification;
use App\Models\PushSubscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CleanupJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 1800; // 30 minutes
    public $tries = 1;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $type = 'all'
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info('Starting cleanup job', ['type' => $this->type]);

            match($this->type) {
                'analytics' => $this->cleanupAnalytics(),
                'notifications' => $this->cleanupNotifications(),
                'subscriptions' => $this->cleanupSubscriptions(),
                'all' => $this->cleanupAll(),
                default => throw new \Exception('Unknown cleanup type'),
            };

            Log::info('Cleanup job completed successfully', ['type' => $this->type]);
        } catch (\Exception $e) {
            Log::error('Cleanup job failed', [
                'type' => $this->type,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Cleanup all data.
     */
    private function cleanupAll(): void
    {
        $this->cleanupAnalytics();
        $this->cleanupNotifications();
        $this->cleanupSubscriptions();
    }

    /**
     * Cleanup analytics data.
     */
    private function cleanupAnalytics(): void
    {
        $retentionDays = config('analytics.retention_days', 365);
        $cutoffDate = now()->subDays($retentionDays);

        Log::info('Cleaning up analytics data', ['cutoff_date' => $cutoffDate]);

        // Cleanup analytics tables
        $deletedCounts = [
            'page_views' => AnalyticsPageView::where('timestamp', '<', $cutoffDate)->delete(),
            'events' => AnalyticsEvent::where('timestamp', '<', $cutoffDate)->delete(),
            'product_views' => AnalyticsProductView::where('timestamp', '<', $cutoffDate)->delete(),
            'searches' => AnalyticsSearch::where('timestamp', '<', $cutoffDate)->delete(),
            'cart_actions' => AnalyticsCartAction::where('timestamp', '<', $cutoffDate)->delete(),
            'purchases' => AnalyticsPurchase::where('timestamp', '<', $cutoffDate)->delete(),
        ];

        Log::info('Analytics cleanup completed', $deletedCounts);
    }

    /**
     * Cleanup notifications.
     */
    private function cleanupNotifications(): void
    {
        $retentionDays = 90; // Keep notifications for 90 days
        $cutoffDate = now()->subDays($retentionDays);

        Log::info('Cleaning up notifications', ['cutoff_date' => $cutoffDate]);

        // Delete read notifications older than retention period
        $deletedCount = Notification::where('read_at', '<', $cutoffDate)->delete();

        Log::info('Notifications cleanup completed', ['deleted_count' => $deletedCount]);
    }

    /**
     * Cleanup push subscriptions.
     */
    private function cleanupSubscriptions(): void
    {
        Log::info('Cleaning up push subscriptions');

        // Delete inactive subscriptions older than 30 days
        $cutoffDate = now()->subDays(30);
        $deletedCount = PushSubscription::where('is_active', false)
                                       ->where('last_used_at', '<', $cutoffDate)
                                       ->delete();

        Log::info('Push subscriptions cleanup completed', ['deleted_count' => $deletedCount]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Cleanup job failed permanently', [
            'type' => $this->type,
            'error' => $exception->getMessage(),
        ]);
    }
}
