<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Models\PushSubscription;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Send notification to user.
     */
    public function sendNotification(User $user, array $notificationData): Notification
    {
        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => $notificationData['type'],
            'title' => $notificationData['title'],
            'message' => $notificationData['message'],
            'data' => $notificationData['data'] ?? [],
            'channel' => $notificationData['channel'] ?? 'database',
            'priority' => $notificationData['priority'] ?? 5,
        ]);

        // Send via different channels based on user preferences
        $this->sendViaChannels($user, $notification);

        return $notification;
    }

    /**
     * Send notification to multiple users.
     */
    public function sendBulkNotification(array $userIds, array $notificationData): array
    {
        $notifications = [];

        foreach ($userIds as $userId) {
            $user = User::find($userId);
            if ($user) {
                $notifications[] = $this->sendNotification($user, $notificationData);
            }
        }

        return $notifications;
    }

    /**
     * Send email notification.
     */
    public function sendEmailNotification(User $user, string $subject, string $template, array $data = []): bool
    {
        try {
            Mail::send($template, $data, function ($message) use ($user, $subject) {
                $message->to($user->email, $user->name)
                       ->subject($subject);
            });

            return true;
        } catch (\Exception $e) {
            Log::error('Email notification failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send push notification.
     */
    public function sendPushNotification(User $user, array $notificationData): bool
    {
        $subscriptions = PushSubscription::where('user_id', $user->id)
                                        ->active()
                                        ->get();

        if ($subscriptions->isEmpty()) {
            return false;
        }

        foreach ($subscriptions as $subscription) {
            try {
                $this->sendWebPushNotification($subscription, $notificationData);
            } catch (\Exception $e) {
                Log::error('Push notification failed: ' . $e->getMessage());
                // Mark subscription as inactive if it fails
                $subscription->deactivate();
            }
        }

        return true;
    }

    /**
     * Get user notifications.
     */
    public function getUserNotifications(User $user, int $perPage = 15): \Illuminate\Pagination\LengthAwarePaginator
    {
        return Notification::where('user_id', $user->id)
                           ->orderBy('created_at', 'desc')
                           ->paginate($perPage);
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(Notification $notification): bool
    {
        $notification->markAsRead();
        return true;
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(User $user): bool
    {
        Notification::where('user_id', $user->id)
                   ->whereNull('read_at')
                   ->update(['read_at' => now()]);

        return true;
    }

    /**
     * Delete notification.
     */
    public function deleteNotification(Notification $notification): bool
    {
        $notification->delete();
        return true;
    }

    /**
     * Get unread notifications count.
     */
    public function getUnreadCount(User $user): int
    {
        return Notification::where('user_id', $user->id)
                          ->whereNull('read_at')
                          ->count();
    }

    /**
     * Subscribe to push notifications.
     */
    public function subscribeToPush(User $user, array $subscriptionData): PushSubscription
    {
        // Check if subscription already exists
        $existingSubscription = PushSubscription::where('user_id', $user->id)
                                                ->where('endpoint', $subscriptionData['endpoint'])
                                                ->first();

        if ($existingSubscription) {
            $existingSubscription->update([
                'public_key' => $subscriptionData['public_key'],
                'auth_token' => $subscriptionData['auth_token'],
                'device_type' => $subscriptionData['device_type'] ?? 'web',
                'user_agent' => $subscriptionData['user_agent'] ?? null,
                'is_active' => true,
                'last_used_at' => now(),
            ]);

            return $existingSubscription;
        }

        return PushSubscription::create([
            'user_id' => $user->id,
            'endpoint' => $subscriptionData['endpoint'],
            'public_key' => $subscriptionData['public_key'],
            'auth_token' => $subscriptionData['auth_token'],
            'device_type' => $subscriptionData['device_type'] ?? 'web',
            'user_agent' => $subscriptionData['user_agent'] ?? null,
            'is_active' => true,
            'last_used_at' => now(),
        ]);
    }

    /**
     * Unsubscribe from push notifications.
     */
    public function unsubscribeFromPush(User $user, string $endpoint): bool
    {
        $subscription = PushSubscription::where('user_id', $user->id)
                                       ->where('endpoint', $endpoint)
                                       ->first();

        if ($subscription) {
            $subscription->deactivate();
            return true;
        }

        return false;
    }

    /**
     * Send via different channels.
     */
    private function sendViaChannels(User $user, Notification $notification): void
    {
        $preferences = $user->preferences ?? new \App\Models\UserPreference();

        // Send email if enabled
        if ($preferences->notifications_email && $notification->channel !== 'push') {
            $this->sendEmailNotification(
                $user,
                $notification->title,
                'emails.notification',
                ['notification' => $notification]
            );
        }

        // Send push if enabled
        if ($preferences->notifications_push && $notification->channel !== 'email') {
            $this->sendPushNotification($user, [
                'title' => $notification->title,
                'body' => $notification->message,
                'data' => $notification->data,
            ]);
        }
    }

    /**
     * Send web push notification.
     */
    private function sendWebPushNotification(PushSubscription $subscription, array $notificationData): void
    {
        // Implementation for web push notifications
        // This would typically use a service like Pusher or Firebase
        // For now, we'll just log the notification
        Log::info('Web push notification sent', [
            'user_id' => $subscription->user_id,
            'endpoint' => $subscription->endpoint,
            'notification' => $notificationData,
        ]);
    }
}
