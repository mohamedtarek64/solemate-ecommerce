<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        try {
            // Validation is handled by LoginRequest

            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 401);
            }

            if (!Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid password'
                ], 401);
            }

            // Create access token (1 hour)
            $accessToken = $user->createToken('API Token', ['*'], now()->addMinutes(60))->plainTextToken;

            // Create refresh token (30 days)
            $refreshToken = $user->createToken('Refresh Token', ['refresh'], now()->addDays(30))->plainTextToken;

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name ?? ($user->first_name . ' ' . $user->last_name),
                        'first_name' => $user->first_name ?? null,
                        'last_name' => $user->last_name ?? null,
                        'email' => $user->email,
                        'role' => $user->role ?? 'user',
                        'avatar' => $user->avatar ?? null,
                        'phone' => $user->phone ?? null,
                        'address' => $user->address ?? null
                    ],
                    'token' => $accessToken,
                    'refresh_token' => $refreshToken
                ],
                'message' => 'Login successful'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function register(RegisterRequest $request)
    {
        try {
            // Validation is handled by RegisterRequest

            // Split name into first and last name
            $nameParts = explode(' ', trim($request->name), 2);
            $firstName = $nameParts[0];
            $lastName = isset($nameParts[1]) ? $nameParts[1] : '';

            $user = User::create([
                'name' => $request->name,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'customer'
            ]);

            $accessToken = $user->createToken('API Token')->plainTextToken;

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $user,
                    'token' => $accessToken
                ],
                'message' => 'Registration successful'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            // Check if user is authenticated
            if ($request->user() && $request->user()->currentAccessToken()) {
                $request->user()->currentAccessToken()->delete();
            }

            return response()->json([
                'success' => true,
                'message' => 'Logout successful'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper method to validate user and token
     */
    protected function validateUserAndToken($request)
    {
        $token = $request->bearerToken();
        if (!$token) {
            return [
                'valid' => false,
                'response' => response()->json([
                    'success' => false,
                    'message' => 'Token not provided'
                ], 401)
            ];
        }

        $personalAccessToken = DB::table('personal_access_tokens')
            ->where('token', hash('sha256', $token))
            ->first();

        if (!$personalAccessToken) {
            return [
                'valid' => false,
                'response' => response()->json([
                    'success' => false,
                    'message' => 'Invalid token'
                ], 401)
            ];
        }

        $userId = $personalAccessToken->tokenable_id;
        $user = DB::table('users')
            ->where('id', $userId)
            ->select('id', 'name', 'first_name', 'last_name', 'email', 'avatar', 'phone', 'role', 'address', 'created_at')
            ->first();

        if (!$user) {
            // If user not found, revoke the token
            DB::table('personal_access_tokens')
                ->where('id', $personalAccessToken->id)
                ->delete();

            return [
                'valid' => false,
                'response' => response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404)
            ];
        }

        // Check if user is deleted (has deleted email)
        if (strpos($user->email, 'deleted_') === 0) {
            // Revoke the token for deleted user
            DB::table('personal_access_tokens')
                ->where('id', $personalAccessToken->id)
                ->delete();

            return [
                'valid' => false,
                'response' => response()->json([
                    'success' => false,
                    'message' => 'User account has been deleted'
                ], 404)
            ];
        }

        return [
            'valid' => true,
            'user' => $user,
            'token_id' => $personalAccessToken->id,
            'user_id' => $userId
        ];
    }

    public function refresh(Request $request)
    {
        try {
            $user = $request->user();
            $user->tokens()->delete();

            $accessToken = $user->createToken('API Token')->plainTextToken;

            return response()->json([
                'success' => true,
                'data' => [
                    'token' => $accessToken
                ],
                'message' => 'Token refreshed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token refresh failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function me(Request $request)
    {
        try {
            // Get token from Authorization header
            $token = $request->bearerToken();
            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'No token provided'
                ], 401);
            }

            // Find the token in database - extract the token part after the pipe
            $tokenParts = explode('|', $token);
            if (count($tokenParts) !== 2) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token format'
                ], 401);
            }

            $tokenId = $tokenParts[0];
            $tokenHash = hash('sha256', $tokenParts[1]);

            $personalAccessToken = DB::table('personal_access_tokens')
                ->where('id', $tokenId)
                ->where('token', $tokenHash)
                ->first();

            if (!$personalAccessToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token'
                ], 401);
            }

            $userId = $personalAccessToken->tokenable_id;

            $user = DB::table('users')
                ->where('id', $userId)
                ->select('id', 'name', 'first_name', 'last_name', 'email', 'avatar', 'phone', 'role', 'address', 'created_at')
                ->first();

            if (!$user) {
                // If user not found, revoke the token
                DB::table('personal_access_tokens')
                    ->where('id', $tokenId)
                    ->delete();

                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            // Check if user is deleted (has deleted email)
            if (strpos($user->email, 'deleted_') === 0) {
                // Revoke the token for deleted user
                DB::table('personal_access_tokens')
                    ->where('id', $tokenId)
                    ->delete();

                return response()->json([
                    'success' => false,
                    'message' => 'User account has been deleted'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name ?? (($user->first_name ?? '') . ' ' . ($user->last_name ?? '')),
                        'first_name' => $user->first_name ?? null,
                        'last_name' => $user->last_name ?? null,
                        'email' => $user->email,
                        'role' => $user->role ?? 'customer',
                        'avatar' => $user->avatar ?? null,
                        'phone' => $user->phone ?? null,
                        'address' => $user->address ?? null
                    ]
                ],
                'message' => 'User profile retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get user profile: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getProfile(Request $request)
    {
        try {
            $user = $request->user();

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'avatar' => $user->avatar,
                    'phone' => $user->phone,
                    'created_at' => $user->created_at
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get profile: ' . $e->getMessage()
            ], 500);
        }
    }
}
