<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingsController extends Controller
{
    public function getSettings(Request $request)
    {
        try {
            $settings = DB::table('system_settings')->get()->keyBy('key');

            return response()->json([
                'success' => true,
                'data' => $settings
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get settings: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateSettings(Request $request)
    {
        try {
            $request->validate([
                'settings' => 'required|array'
            ]);

            foreach ($request->settings as $key => $value) {
                DB::table('system_settings')->updateOrInsert(
                    ['key' => $key],
                    [
                        'value' => is_array($value) ? json_encode($value) : $value,
                        'updated_at' => now()
                    ]
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getAdminSettings(Request $request)
    {
        try {
            $settings = [
                'general' => [
                    'site_name' => 'E-Commerce Store',
                    'site_description' => 'Your one-stop shop for everything',
                    'site_logo' => '/images/logo.png',
                    'site_favicon' => '/images/favicon.ico',
                    'maintenance_mode' => false,
                    'registration_enabled' => true
                ],
                'email' => [
                    'smtp_host' => 'smtp.gmail.com',
                    'smtp_port' => 587,
                    'smtp_username' => '',
                    'smtp_password' => '',
                    'from_email' => 'noreply@example.com',
                    'from_name' => 'E-Commerce Store'
                ],
                'payment' => [
                    'stripe_public_key' => '',
                    'stripe_secret_key' => '',
                    'stripe_webhook_secret' => '',
                    'paypal_client_id' => '',
                    'paypal_client_secret' => ''
                ],
                'social' => [
                    'google_client_id' => '',
                    'google_client_secret' => '',
                    'facebook_client_id' => '',
                    'facebook_client_secret' => '',
                    'twitter_client_id' => '',
                    'twitter_client_secret' => '',
                    'github_client_id' => '',
                    'github_client_secret' => ''
                ],
                'analytics' => [
                    'google_analytics_id' => '',
                    'facebook_pixel_id' => '',
                    'hotjar_id' => ''
                ],
                'storage' => [
                    'default_disk' => 'local',
                    'aws_access_key_id' => '',
                    'aws_secret_access_key' => '',
                    'aws_default_region' => 'us-east-1',
                    'aws_bucket' => ''
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $settings
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get admin settings: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateAdminSettings(Request $request)
    {
        try {
            $request->validate([
                'settings' => 'required|array'
            ]);

            foreach ($request->settings as $category => $categorySettings) {
                foreach ($categorySettings as $key => $value) {
                    DB::table('system_settings')->updateOrInsert(
                        ['key' => $category . '.' . $key],
                        [
                            'value' => is_array($value) ? json_encode($value) : $value,
                            'category' => $category,
                            'updated_at' => now()
                        ]
                    );
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Admin settings updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update admin settings: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getThemeSettings(Request $request)
    {
        try {
            $themeSettings = [
                'primary_color' => '#3B82F6',
                'secondary_color' => '#6B7280',
                'accent_color' => '#F59E0B',
                'background_color' => '#FFFFFF',
                'text_color' => '#1F2937',
                'font_family' => 'Inter',
                'font_size' => '16px',
                'border_radius' => '8px',
                'box_shadow' => '0 1px 3px rgba(0, 0, 0, 0.1)',
                'header_style' => 'default',
                'footer_style' => 'default',
                'product_card_style' => 'default',
                'button_style' => 'default'
            ];

            return response()->json([
                'success' => true,
                'data' => $themeSettings
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get theme settings: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateThemeSettings(Request $request)
    {
        try {
            $request->validate([
                'theme_settings' => 'required|array'
            ]);

            foreach ($request->theme_settings as $key => $value) {
                DB::table('system_settings')->updateOrInsert(
                    ['key' => 'theme.' . $key],
                    [
                        'value' => $value,
                        'category' => 'theme',
                        'updated_at' => now()
                    ]
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Theme settings updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update theme settings: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getNotificationSettings(Request $request)
    {
        try {
            $userId = $request->user()->id;

            $settings = DB::table('user_notification_settings')
                ->where('user_id', $userId)
                ->first();

            if (!$settings) {
                // Create default settings
                $defaultSettings = [
                    'email_notifications' => true,
                    'push_notifications' => true,
                    'sms_notifications' => false,
                    'order_updates' => true,
                    'promotional_emails' => true,
                    'security_alerts' => true,
                    'product_recommendations' => true,
                    'price_drops' => true,
                    'new_arrivals' => true
                ];

                DB::table('user_notification_settings')->insert([
                    'user_id' => $userId,
                    'settings' => json_encode($defaultSettings),
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                $settings = $defaultSettings;
            } else {
                $settings = json_decode($settings->settings, true);
            }

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

    public function updateNotificationSettings(Request $request)
    {
        try {
            $request->validate([
                'settings' => 'required|array'
            ]);

            $userId = $request->user()->id;

            DB::table('user_notification_settings')->updateOrInsert(
                ['user_id' => $userId],
                [
                    'settings' => json_encode($request->settings),
                    'updated_at' => now()
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Notification settings updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update notification settings: ' . $e->getMessage()
            ], 500);
        }
    }
}
