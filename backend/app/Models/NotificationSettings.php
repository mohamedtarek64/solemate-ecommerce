<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationSettings extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'email_notifications',
        'push_notifications',
        'sms_notifications',
        'order_updates',
        'promotions',
        'stock_alerts',
        'payment_updates',
        'shipping_updates'
    ];

    protected $casts = [
        'email_notifications' => 'boolean',
        'push_notifications' => 'boolean',
        'sms_notifications' => 'boolean',
        'order_updates' => 'boolean',
        'promotions' => 'boolean',
        'stock_alerts' => 'boolean',
        'payment_updates' => 'boolean',
        'shipping_updates' => 'boolean',
    ];

    /**
     * Get the user that owns the settings.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get or create settings for a user.
     */
    public static function getForUser($userId)
    {
        return self::firstOrCreate(
            ['user_id' => $userId],
            [
                'email_notifications' => true,
                'push_notifications' => true,
                'sms_notifications' => false,
                'order_updates' => true,
                'promotions' => true,
                'stock_alerts' => true,
                'payment_updates' => true,
                'shipping_updates' => true,
            ]
        );
    }

    /**
     * Check if user wants notifications for specific type.
     */
    public function wantsNotificationFor($type)
    {
        switch ($type) {
            case 'order':
                return $this->order_updates;
            case 'promotion':
                return $this->promotions;
            case 'stock':
                return $this->stock_alerts;
            case 'payment':
                return $this->payment_updates;
            case 'shipping':
                return $this->shipping_updates;
            default:
                return true;
        }
    }

    /**
     * Check if user wants email notifications.
     */
    public function wantsEmailNotifications()
    {
        return $this->email_notifications;
    }

    /**
     * Check if user wants push notifications.
     */
    public function wantsPushNotifications()
    {
        return $this->push_notifications;
    }

    /**
     * Check if user wants SMS notifications.
     */
    public function wantsSmsNotifications()
    {
        return $this->sms_notifications;
    }
}
