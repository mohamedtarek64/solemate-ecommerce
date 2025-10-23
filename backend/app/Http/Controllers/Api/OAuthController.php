<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class OAuthController extends Controller
{
    public function callback(Request $request)
    {
        try {
            $request->validate([
                'provider' => 'required|string|in:google,facebook,twitter',
                'code' => 'required|string',
                'state' => 'nullable|string'
            ]);

            $provider = $request->provider;
            $code = $request->code;

            // Mock OAuth callback processing
            $userData = [
                'provider' => $provider,
                'provider_id' => 'mock_' . time(),
                'name' => 'OAuth User',
                'email' => 'oauth@example.com',
                'avatar' => 'https://via.placeholder.com/150'
            ];

            // Check if user exists
            $user = DB::table('users')
                ->where('email', $userData['email'])
                ->first();

            if (!$user) {
                // Create new user
                $userId = DB::table('users')->insertGetId([
                    'name' => $userData['name'],
                    'email' => $userData['email'],
                    'password' => bcrypt('oauth_password'),
                    'role' => 'user',
                    'email_verified_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            } else {
                $userId = $user->id;
            }

            // Create or update OAuth account
            DB::table('oauth_accounts')->updateOrInsert(
                [
                    'user_id' => $userId,
                    'provider' => $provider
                ],
                [
                    'provider_id' => $userData['provider_id'],
                    'name' => $userData['name'],
                    'email' => $userData['email'],
                    'avatar' => $userData['avatar'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'user_id' => $userId,
                    'provider' => $provider,
                    'message' => 'OAuth login successful'
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'OAuth callback failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function link(Request $request)
    {
        try {
            $request->validate([
                'provider' => 'required|string|in:google,facebook,twitter',
                'provider_id' => 'required|string',
                'name' => 'required|string',
                'email' => 'required|email',
                'avatar' => 'nullable|url'
            ]);

            $userId = $request->user()->id;

            // Check if account already linked
            $existingAccount = DB::table('oauth_accounts')
                ->where('user_id', $userId)
                ->where('provider', $request->provider)
                ->first();

            if ($existingAccount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Account already linked to this provider'
                ], 400);
            }

            // Link OAuth account
            DB::table('oauth_accounts')->insert([
                'user_id' => $userId,
                'provider' => $request->provider,
                'provider_id' => $request->provider_id,
                'name' => $request->name,
                'email' => $request->email,
                'avatar' => $request->avatar,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'OAuth account linked successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to link OAuth account: ' . $e->getMessage()
            ], 500);
        }
    }

    public function unlink(Request $request, $provider)
    {
        try {
            $userId = $request->user()->id;

            $deleted = DB::table('oauth_accounts')
                ->where('user_id', $userId)
                ->where('provider', $provider)
                ->delete();

            if ($deleted) {
                return response()->json([
                    'success' => true,
                    'message' => 'OAuth account unlinked successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'OAuth account not found'
                ], 404);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to unlink OAuth account: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getAccounts(Request $request)
    {
        try {
            $userId = $request->user()->id;

            $accounts = DB::table('oauth_accounts')
                ->where('user_id', $userId)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $accounts
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get OAuth accounts: ' . $e->getMessage()
            ], 500);
        }
    }
}

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class OAuthController extends Controller
{
    public function callback(Request $request)
    {
        try {
            $request->validate([
                'provider' => 'required|string|in:google,facebook,twitter',
                'code' => 'required|string',
                'state' => 'nullable|string'
            ]);

            $provider = $request->provider;
            $code = $request->code;

            // Mock OAuth callback processing
            $userData = [
                'provider' => $provider,
                'provider_id' => 'mock_' . time(),
                'name' => 'OAuth User',
                'email' => 'oauth@example.com',
                'avatar' => 'https://via.placeholder.com/150'
            ];

            // Check if user exists
            $user = DB::table('users')
                ->where('email', $userData['email'])
                ->first();

            if (!$user) {
                // Create new user
                $userId = DB::table('users')->insertGetId([
                    'name' => $userData['name'],
                    'email' => $userData['email'],
                    'password' => bcrypt('oauth_password'),
                    'role' => 'user',
                    'email_verified_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            } else {
                $userId = $user->id;
            }

            // Create or update OAuth account
            DB::table('oauth_accounts')->updateOrInsert(
                [
                    'user_id' => $userId,
                    'provider' => $provider
                ],
                [
                    'provider_id' => $userData['provider_id'],
                    'name' => $userData['name'],
                    'email' => $userData['email'],
                    'avatar' => $userData['avatar'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'user_id' => $userId,
                    'provider' => $provider,
                    'message' => 'OAuth login successful'
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'OAuth callback failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function link(Request $request)
    {
        try {
            $request->validate([
                'provider' => 'required|string|in:google,facebook,twitter',
                'provider_id' => 'required|string',
                'name' => 'required|string',
                'email' => 'required|email',
                'avatar' => 'nullable|url'
            ]);

            $userId = $request->user()->id;

            // Check if account already linked
            $existingAccount = DB::table('oauth_accounts')
                ->where('user_id', $userId)
                ->where('provider', $request->provider)
                ->first();

            if ($existingAccount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Account already linked to this provider'
                ], 400);
            }

            // Link OAuth account
            DB::table('oauth_accounts')->insert([
                'user_id' => $userId,
                'provider' => $request->provider,
                'provider_id' => $request->provider_id,
                'name' => $request->name,
                'email' => $request->email,
                'avatar' => $request->avatar,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'OAuth account linked successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to link OAuth account: ' . $e->getMessage()
            ], 500);
        }
    }

    public function unlink(Request $request, $provider)
    {
        try {
            $userId = $request->user()->id;

            $deleted = DB::table('oauth_accounts')
                ->where('user_id', $userId)
                ->where('provider', $provider)
                ->delete();

            if ($deleted) {
                return response()->json([
                    'success' => true,
                    'message' => 'OAuth account unlinked successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'OAuth account not found'
                ], 404);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to unlink OAuth account: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getAccounts(Request $request)
    {
        try {
            $userId = $request->user()->id;

            $accounts = DB::table('oauth_accounts')
                ->where('user_id', $userId)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $accounts
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get OAuth accounts: ' . $e->getMessage()
            ], 500);
        }
    }
}

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class OAuthController extends Controller
{
    public function callback(Request $request)
    {
        try {
            $request->validate([
                'provider' => 'required|string|in:google,facebook,twitter',
                'code' => 'required|string',
                'state' => 'nullable|string'
            ]);

            $provider = $request->provider;
            $code = $request->code;

            // Mock OAuth callback processing
            $userData = [
                'provider' => $provider,
                'provider_id' => 'mock_' . time(),
                'name' => 'OAuth User',
                'email' => 'oauth@example.com',
                'avatar' => 'https://via.placeholder.com/150'
            ];

            // Check if user exists
            $user = DB::table('users')
                ->where('email', $userData['email'])
                ->first();

            if (!$user) {
                // Create new user
                $userId = DB::table('users')->insertGetId([
                    'name' => $userData['name'],
                    'email' => $userData['email'],
                    'password' => bcrypt('oauth_password'),
                    'role' => 'user',
                    'email_verified_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            } else {
                $userId = $user->id;
            }

            // Create or update OAuth account
            DB::table('oauth_accounts')->updateOrInsert(
                [
                    'user_id' => $userId,
                    'provider' => $provider
                ],
                [
                    'provider_id' => $userData['provider_id'],
                    'name' => $userData['name'],
                    'email' => $userData['email'],
                    'avatar' => $userData['avatar'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'user_id' => $userId,
                    'provider' => $provider,
                    'message' => 'OAuth login successful'
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'OAuth callback failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function link(Request $request)
    {
        try {
            $request->validate([
                'provider' => 'required|string|in:google,facebook,twitter',
                'provider_id' => 'required|string',
                'name' => 'required|string',
                'email' => 'required|email',
                'avatar' => 'nullable|url'
            ]);

            $userId = $request->user()->id;

            // Check if account already linked
            $existingAccount = DB::table('oauth_accounts')
                ->where('user_id', $userId)
                ->where('provider', $request->provider)
                ->first();

            if ($existingAccount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Account already linked to this provider'
                ], 400);
            }

            // Link OAuth account
            DB::table('oauth_accounts')->insert([
                'user_id' => $userId,
                'provider' => $request->provider,
                'provider_id' => $request->provider_id,
                'name' => $request->name,
                'email' => $request->email,
                'avatar' => $request->avatar,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'OAuth account linked successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to link OAuth account: ' . $e->getMessage()
            ], 500);
        }
    }

    public function unlink(Request $request, $provider)
    {
        try {
            $userId = $request->user()->id;

            $deleted = DB::table('oauth_accounts')
                ->where('user_id', $userId)
                ->where('provider', $provider)
                ->delete();

            if ($deleted) {
                return response()->json([
                    'success' => true,
                    'message' => 'OAuth account unlinked successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'OAuth account not found'
                ], 404);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to unlink OAuth account: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getAccounts(Request $request)
    {
        try {
            $userId = $request->user()->id;

            $accounts = DB::table('oauth_accounts')
                ->where('user_id', $userId)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $accounts
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get OAuth accounts: ' . $e->getMessage()
            ], 500);
        }
    }
}

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class OAuthController extends Controller
{
    public function callback(Request $request)
    {
        try {
            $request->validate([
                'provider' => 'required|string|in:google,facebook,twitter',
                'code' => 'required|string',
                'state' => 'nullable|string'
            ]);

            $provider = $request->provider;
            $code = $request->code;

            // Mock OAuth callback processing
            $userData = [
                'provider' => $provider,
                'provider_id' => 'mock_' . time(),
                'name' => 'OAuth User',
                'email' => 'oauth@example.com',
                'avatar' => 'https://via.placeholder.com/150'
            ];

            // Check if user exists
            $user = DB::table('users')
                ->where('email', $userData['email'])
                ->first();

            if (!$user) {
                // Create new user
                $userId = DB::table('users')->insertGetId([
                    'name' => $userData['name'],
                    'email' => $userData['email'],
                    'password' => bcrypt('oauth_password'),
                    'role' => 'user',
                    'email_verified_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            } else {
                $userId = $user->id;
            }

            // Create or update OAuth account
            DB::table('oauth_accounts')->updateOrInsert(
                [
                    'user_id' => $userId,
                    'provider' => $provider
                ],
                [
                    'provider_id' => $userData['provider_id'],
                    'name' => $userData['name'],
                    'email' => $userData['email'],
                    'avatar' => $userData['avatar'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'user_id' => $userId,
                    'provider' => $provider,
                    'message' => 'OAuth login successful'
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'OAuth callback failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function link(Request $request)
    {
        try {
            $request->validate([
                'provider' => 'required|string|in:google,facebook,twitter',
                'provider_id' => 'required|string',
                'name' => 'required|string',
                'email' => 'required|email',
                'avatar' => 'nullable|url'
            ]);

            $userId = $request->user()->id;

            // Check if account already linked
            $existingAccount = DB::table('oauth_accounts')
                ->where('user_id', $userId)
                ->where('provider', $request->provider)
                ->first();

            if ($existingAccount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Account already linked to this provider'
                ], 400);
            }

            // Link OAuth account
            DB::table('oauth_accounts')->insert([
                'user_id' => $userId,
                'provider' => $request->provider,
                'provider_id' => $request->provider_id,
                'name' => $request->name,
                'email' => $request->email,
                'avatar' => $request->avatar,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'OAuth account linked successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to link OAuth account: ' . $e->getMessage()
            ], 500);
        }
    }

    public function unlink(Request $request, $provider)
    {
        try {
            $userId = $request->user()->id;

            $deleted = DB::table('oauth_accounts')
                ->where('user_id', $userId)
                ->where('provider', $provider)
                ->delete();

            if ($deleted) {
                return response()->json([
                    'success' => true,
                    'message' => 'OAuth account unlinked successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'OAuth account not found'
                ], 404);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to unlink OAuth account: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getAccounts(Request $request)
    {
        try {
            $userId = $request->user()->id;

            $accounts = DB::table('oauth_accounts')
                ->where('user_id', $userId)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $accounts
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get OAuth accounts: ' . $e->getMessage()
            ], 500);
        }
    }
}

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class OAuthController extends Controller
{
    public function callback(Request $request)
    {
        try {
            $request->validate([
                'provider' => 'required|string|in:google,facebook,twitter',
                'code' => 'required|string',
                'state' => 'nullable|string'
            ]);

            $provider = $request->provider;
            $code = $request->code;

            // Mock OAuth callback processing
            $userData = [
                'provider' => $provider,
                'provider_id' => 'mock_' . time(),
                'name' => 'OAuth User',
                'email' => 'oauth@example.com',
                'avatar' => 'https://via.placeholder.com/150'
            ];

            // Check if user exists
            $user = DB::table('users')
                ->where('email', $userData['email'])
                ->first();

            if (!$user) {
                // Create new user
                $userId = DB::table('users')->insertGetId([
                    'name' => $userData['name'],
                    'email' => $userData['email'],
                    'password' => bcrypt('oauth_password'),
                    'role' => 'user',
                    'email_verified_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            } else {
                $userId = $user->id;
            }

            // Create or update OAuth account
            DB::table('oauth_accounts')->updateOrInsert(
                [
                    'user_id' => $userId,
                    'provider' => $provider
                ],
                [
                    'provider_id' => $userData['provider_id'],
                    'name' => $userData['name'],
                    'email' => $userData['email'],
                    'avatar' => $userData['avatar'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'user_id' => $userId,
                    'provider' => $provider,
                    'message' => 'OAuth login successful'
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'OAuth callback failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function link(Request $request)
    {
        try {
            $request->validate([
                'provider' => 'required|string|in:google,facebook,twitter',
                'provider_id' => 'required|string',
                'name' => 'required|string',
                'email' => 'required|email',
                'avatar' => 'nullable|url'
            ]);

            $userId = $request->user()->id;

            // Check if account already linked
            $existingAccount = DB::table('oauth_accounts')
                ->where('user_id', $userId)
                ->where('provider', $request->provider)
                ->first();

            if ($existingAccount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Account already linked to this provider'
                ], 400);
            }

            // Link OAuth account
            DB::table('oauth_accounts')->insert([
                'user_id' => $userId,
                'provider' => $request->provider,
                'provider_id' => $request->provider_id,
                'name' => $request->name,
                'email' => $request->email,
                'avatar' => $request->avatar,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'OAuth account linked successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to link OAuth account: ' . $e->getMessage()
            ], 500);
        }
    }

    public function unlink(Request $request, $provider)
    {
        try {
            $userId = $request->user()->id;

            $deleted = DB::table('oauth_accounts')
                ->where('user_id', $userId)
                ->where('provider', $provider)
                ->delete();

            if ($deleted) {
                return response()->json([
                    'success' => true,
                    'message' => 'OAuth account unlinked successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'OAuth account not found'
                ], 404);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to unlink OAuth account: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getAccounts(Request $request)
    {
        try {
            $userId = $request->user()->id;

            $accounts = DB::table('oauth_accounts')
                ->where('user_id', $userId)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $accounts
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get OAuth accounts: ' . $e->getMessage()
            ], 500);
        }
    }
}
