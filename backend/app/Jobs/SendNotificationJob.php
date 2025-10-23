<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 60;
    public $tries = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public User $user,
        public array $notificationData
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $notificationService = app(NotificationService::class);
            
            $notificationService->sendNotification($this->user, $this->notificationData);

            Log::info('Notification sent successfully', [
                'user_id' => $this->user->id,
                'notification_type' => $this->notificationData['type'] ?? 'unknown',
            ]);
        } catch (\Exception $e) {
            Log::error('Notification sending failed', [
                'user_id' => $this->user->id,
                'notification_data' => $this->notificationData,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Notification job failed permanently', [
            'user_id' => $this->user->id,
            'notification_data' => $this->notificationData,
            'error' => $exception->getMessage(),
        ]);
    }
}
