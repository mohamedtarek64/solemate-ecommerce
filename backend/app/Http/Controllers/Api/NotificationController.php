<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\NotificationSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NotificationController extends Controller
{
    /**
     * Get user notifications with pagination and filters.
     */
    public function index(Request $request)
    {
        try {
            // For testing without auth, use a default user ID
            // User is guaranteed to be authenticated by auth:sanctum middleware
            $userId = $request->user()->id;
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 20);
            $unreadOnly = $request->get('unread_only', false);
            $type = $request->get('type');

            $query = Notification::where('user_id', $userId);

            if ($unreadOnly) {
                $query->unread();
            }

            if ($type) {
                $query->ofType($type);
            }

            $notifications = $query->orderBy('created_at', 'desc')
                ->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data' => $notifications
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get notifications: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(Request $request, $id)
    {
        try {
            // User is guaranteed to be authenticated by auth:sanctum middleware
            $userId = $request->user()->id;

            $notification = Notification::where('id', $id)
                ->where('user_id', $userId)
                ->first();

            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notification not found'
                ], 404);
            }

            $notification->markAsRead();

            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notification as read: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        try {
            // User is guaranteed to be authenticated by auth:sanctum middleware
            $userId = $request->user()->id;

            Notification::where('user_id', $userId)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);

            return response()->json([
                'success' => true,
                'message' => 'All notifications marked as read'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark all notifications as read: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a notification.
     */
    public function destroy(Request $request, $id)
    {
        try {
            // User is guaranteed to be authenticated by auth:sanctum middleware
            $userId = $request->user()->id;

            $deleted = Notification::where('id', $id)
                ->where('user_id', $userId)
                ->delete();

            if ($deleted) {
                return response()->json([
                    'success' => true,
                    'message' => 'Notification deleted successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Notification not found'
                ], 404);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete notification: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get unread notifications count.
     */
    public function getCount(Request $request)
    {
        try {
            // User is guaranteed to be authenticated by auth:sanctum middleware
            $userId = $request->user()->id;

            $count = Notification::where('user_id', $userId)
                ->whereNull('read_at')
                ->count();

            return response()->json([
                'success' => true,
                'data' => ['count' => $count]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get notification count: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get notification settings.
     */
    public function getSettings(Request $request)
    {
        try {
            // User is guaranteed to be authenticated by auth:sanctum middleware
            $userId = $request->user()->id;
            $settings = NotificationSettings::getForUser($userId);

            return response()->json([
                'success' => true,
                'data' => $settings
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get notification settings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update notification settings.
     */
    public function updateSettings(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email_notifications' => 'boolean',
                'push_notifications' => 'boolean',
                'sms_notifications' => 'boolean',
                'order_updates' => 'boolean',
                'promotions' => 'boolean',
                'stock_alerts' => 'boolean',
                'payment_updates' => 'boolean',
                'shipping_updates' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // User is guaranteed to be authenticated by auth:sanctum middleware
            $userId = $request->user()->id;
            $settings = NotificationSettings::getForUser($userId);
            $settings->update($request->only([
                'email_notifications',
                'push_notifications',
                'sms_notifications',
                'order_updates',
                'promotions',
                'stock_alerts',
                'payment_updates',
                'shipping_updates'
            ]));

            return response()->json([
                'success' => true,
                'data' => $settings,
                'message' => 'Notification settings updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update notification settings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new notification (admin only).
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'type' => 'required|in:order,promotion,stock,admin,payment,shipping',
                'title' => 'required|string|max:255',
                'message' => 'required|string',
                'data' => 'nullable|array'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $notification = Notification::createNotification(
                $request->user_id,
                $request->type,
                $request->title,
                $request->message,
                $request->data
            );

            return response()->json([
                'success' => true,
                'data' => $notification,
                'message' => 'Notification created successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create notification: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Subscribe to push notifications.
     */
    public function subscribe(Request $request)
    {
        try {
            $request->validate([
                'endpoint' => 'required|string',
                'keys' => 'required|array',
                'keys.p256dh' => 'required|string',
                'keys.auth' => 'required|string'
            ]);

            // User is guaranteed to be authenticated by auth:sanctum middleware
            $userId = $request->user()->id;

            \DB::table('push_subscriptions')->updateOrInsert(
                [
                    'user_id' => $userId,
                    'endpoint' => $request->endpoint
                ],
                [
                    'p256dh' => $request->keys['p256dh'],
                    'auth' => $request->keys['auth'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Push notifications subscribed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to subscribe to push notifications: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Unsubscribe from push notifications.
     */
    public function unsubscribe(Request $request)
    {
        try {
            // User is guaranteed to be authenticated by auth:sanctum middleware
            $userId = $request->user()->id;

            \DB::table('push_subscriptions')
                ->where('user_id', $userId)
                ->delete();

            return response()->json([
                'success' => true,
                'message' => 'Push notifications unsubscribed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to unsubscribe from push notifications: ' . $e->getMessage()
            ], 500);
        }
    }
}
