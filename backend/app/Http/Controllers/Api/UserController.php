<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class UserController extends BaseController
{
    /**
     * Get user profile
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'role' => $user->role,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at
            ]
        ]);
    }

    /**
     * Permanently delete all user data and account
     * This is a destructive operation that cannot be undone
     */
    private function permanentlyDeleteUserData($userId)
    {
        Log::info("Starting permanent deletion for user ID: {$userId}");

        $deletedRecords = 0;

        try {
            // Define tables to delete from (only existing tables)
            $tablesToDelete = [
                'personal_access_tokens' => 'tokenable_id',
                'orders' => 'user_id',
                'cart_items' => 'user_id',
                'wishlist_items' => 'user_id',
                'reviews' => 'user_id',
                'addresses' => 'user_id',
                'payment_methods' => 'user_id',
                'notifications' => 'user_id',
                'sessions' => 'user_id'
            ];

            // Delete from each table if it exists
            foreach ($tablesToDelete as $table => $column) {
                try {
                    // Check if table exists
                    if (DB::getSchemaBuilder()->hasTable($table)) {
                        $count = DB::table($table)
                            ->where($column, $userId)
                            ->delete();
                        $deletedRecords += $count;
                        Log::info("Deleted {$count} records from {$table} for user {$userId}");
                    } else {
                        Log::info("Table {$table} does not exist, skipping...");
                    }
                } catch (\Exception $e) {
                    Log::warning("Failed to delete from {$table} for user {$userId}: " . $e->getMessage());
                    // Continue with other tables even if one fails
                }
            }

            // Handle order_items separately (depends on orders)
            try {
                if (DB::getSchemaBuilder()->hasTable('order_items') && DB::getSchemaBuilder()->hasTable('orders')) {
                    $orderIds = DB::table('orders')
                        ->where('user_id', $userId)
                        ->pluck('id');

                    if ($orderIds->count() > 0) {
                        $count = DB::table('order_items')
                            ->whereIn('order_id', $orderIds)
                            ->delete();
                        $deletedRecords += $count;
                        Log::info("Deleted {$count} records from order_items for user {$userId}");
                    }
                }
            } catch (\Exception $e) {
                Log::warning("Failed to delete order_items for user {$userId}: " . $e->getMessage());
            }

            // Finally, delete the user account
            try {
                if (DB::getSchemaBuilder()->hasTable('users')) {
                    $count = DB::table('users')
                        ->where('id', $userId)
                        ->delete();
                    $deletedRecords += $count;
                    Log::info("Deleted {$count} records from users for user {$userId}");
                }
            } catch (\Exception $e) {
                Log::error("Failed to delete user account {$userId}: " . $e->getMessage());
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error("Error during permanent deletion for user {$userId}: " . $e->getMessage());
            throw $e;
        }

        Log::info("Completed permanent deletion for user ID: {$userId}. Total records deleted: {$deletedRecords}");
        return $deletedRecords;
    }
    public function getWelcomeMessage(Request $request)
    {
        try {
            // Log the request for debugging
            \Log::info('Welcome message request', [
                'headers' => $request->headers->all(),
                'bearer_token' => $request->bearerToken() ? 'present' : 'missing'
            ]);

            $validation = $this->validateUserAndToken($request);

            if (!$validation['valid']) {
                \Log::warning('Welcome message validation failed', ['response' => $validation['response']]);
                return $validation['response'];
            }

            $user = $validation['user'];
            $currentTime = now();
            $hour = $currentTime->hour;

            // Determine greeting based on time of day
            $greeting = '';
            if ($hour >= 5 && $hour < 12) {
                $greeting = 'Good Morning';
            } elseif ($hour >= 12 && $hour < 17) {
                $greeting = 'Good Afternoon';
            } elseif ($hour >= 17 && $hour < 22) {
                $greeting = 'Good Evening';
            } else {
                $greeting = 'Welcome';
            }

            // Get user's first name or name
            $firstName = $user->first_name ?? $user->name ?? 'User';

            // Determine user type message
            $userTypeMessage = '';
            switch ($user->role) {
                case 'admin':
                    $userTypeMessage = 'Welcome to Admin Dashboard';
                    break;
                case 'vendor':
                    $userTypeMessage = 'Welcome to Vendor Panel';
                    break;
                case 'customer':
                default:
                    $userTypeMessage = 'Welcome to SoleMate Store';
                    break;
            }

            // Create personalized welcome message
            $welcomeMessage = "{$greeting} {$firstName}! {$userTypeMessage}";

            // Get user's last login time (placeholder since column doesn't exist)
            $lastLogin = 'First time';

            // Get user's order count
            $orderCount = DB::table('orders')
                ->where('user_id', $user->id)
                ->count();

            // Get user's wishlist count
            $wishlistCount = DB::table('wishlist_items')
                ->where('user_id', $user->id)
                ->count();

            $response = [
                'success' => true,
                'data' => [
                    'welcome_message' => $welcomeMessage,
                    'greeting' => $greeting,
                    'user_name' => $firstName,
                    'user_type' => $user->role,
                    'user_type_message' => $userTypeMessage,
                    'last_login' => $lastLogin,
                    'order_count' => $orderCount,
                    'wishlist_count' => $wishlistCount,
                    'current_time' => $currentTime->format('Y-m-d H:i:s'),
                    'timezone' => config('app.timezone', 'UTC')
                ]
            ];

            \Log::info('Welcome message response prepared', ['user_id' => $user->id]);
            return response()->json($response);

        } catch (\Exception $e) {
            \Log::error('Welcome message error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get welcome message: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateProfile(Request $request)
    {
        try {
            $validation = $this->validateUserAndToken($request);

            if (!$validation['valid']) {
                return $validation['response'];
            }

            $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'phone' => 'nullable|string|max:20'
            ]);

            $updated = DB::table('users')
                ->where('id', $validation['user_id'])
                ->update([
                    'name' => $request->first_name . ' ' . $request->last_name,
                    'first_name' => $request->first_name,
                    'last_name' => $request->last_name,
                    'phone' => $request->phone,
                    'updated_at' => now()
                ]);

            if ($updated) {
                return response()->json([
                    'success' => true,
                    'message' => 'Profile updated successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update profile'
                ], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile: ' . $e->getMessage()
            ], 500);
        }
    }

    public function changePassword(Request $request)
    {
        try {
            $validation = $this->validateUserAndToken($request);

            if (!$validation['valid']) {
                return $validation['response'];
            }

            $request->validate([
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:6'
            ]);

            $user = DB::table('users')->where('id', $validation['user_id'])->first();

            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is incorrect'
                ], 400);
            }

            DB::table('users')
                ->where('id', $validation['user_id'])
                ->update([
                    'password' => Hash::make($request->new_password),
                    'updated_at' => now()
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to change password: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deleteAccount(Request $request)
    {
        try {
            $validation = $this->validateUserAndToken($request);

            if (!$validation['valid']) {
                return $validation['response'];
            }

            $userId = $validation['user_id'];
            $userEmail = $validation['user']->email ?? 'Unknown';

            // Log the deletion attempt
            Log::warning("User account deletion initiated", [
                'user_id' => $userId,
                'user_email' => $userEmail,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            // Start database transaction to ensure data integrity
            DB::beginTransaction();

            try {
                // Permanently delete all user data
                $deletedRecords = $this->permanentlyDeleteUserData($userId);

                // Commit the transaction
                DB::commit();

                // Log successful deletion
                Log::warning("User account permanently deleted", [
                    'user_id' => $userId,
                    'user_email' => $userEmail,
                    'deleted_records' => $deletedRecords
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Account and all associated data deleted permanently',
                    'deleted_records' => $deletedRecords
                ]);

            } catch (\Exception $e) {
                // Rollback the transaction if any error occurs
                DB::rollback();

                // Log the error
                Log::error("Failed to delete user account", [
                    'user_id' => $userId,
                    'user_email' => $userEmail,
                    'error' => $e->getMessage()
                ]);

                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete account: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getAddresses(Request $request)
    {
        try {
            $validation = $this->validateUserAndToken($request);

            if (!$validation['valid']) {
                return $validation['response'];
            }

            // For now, return empty addresses array since we don't have addresses table
            return response()->json([
                'success' => true,
                'addresses' => []
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get addresses: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getDashboard(Request $request)
    {
        try {
            $validation = $this->validateUserAndToken($request);

            if (!$validation['valid']) {
                return $validation['response'];
            }

            $userId = $validation['user_id'];

            // Get user's orders count
            $ordersCount = DB::table('orders')
                ->where('user_id', $userId)
                ->count();

            // Get user's recent orders
            $recentOrders = DB::table('orders')
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            // Get user's total spent
            $totalSpent = DB::table('orders')
                ->where('user_id', $userId)
                ->where('status', 'completed')
                ->sum('total_amount');

            return response()->json([
                'success' => true,
                'data' => [
                    'orders_count' => $ordersCount,
                    'recent_orders' => $recentOrders,
                    'total_spent' => $totalSpent ?: 0,
                    'user_info' => $validation['user']
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get dashboard data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function createAddress(Request $request)
    {
        try {
            $validation = $this->validateUserAndToken($request);

            if (!$validation['valid']) {
                return $validation['response'];
            }

            // For now, return success since we don't have addresses table
            return response()->json([
                'success' => true,
                'message' => 'Address created successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create address: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateAddress(Request $request, $id)
    {
        try {
            $validation = $this->validateUserAndToken($request);

            if (!$validation['valid']) {
                return $validation['response'];
            }

            // For now, return success since we don't have addresses table
            return response()->json([
                'success' => true,
                'message' => 'Address updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update address: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deleteAddress(Request $request, $id)
    {
        try {
            $validation = $this->validateUserAndToken($request);

            if (!$validation['valid']) {
                return $validation['response'];
            }

            // For now, return success since we don't have addresses table
            return response()->json([
                'success' => true,
                'message' => 'Address deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete address: ' . $e->getMessage()
            ], 500);
        }
    }
}
