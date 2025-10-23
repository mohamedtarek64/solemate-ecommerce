<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;

class SocialAuthController extends Controller
{
    public function redirectToProvider(Request $request, $provider)
    {
        try {
            $socialite = app('Laravel\Socialite\Contracts\Factory');
            $redirectUrl = $socialite->driver($provider)->stateless()->redirect()->getTargetUrl();

            return response()->json([
                'success' => true,
                'data' => [
                    'redirect_url' => $redirectUrl
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate OAuth: ' . $e->getMessage()
            ], 500);
        }
    }

    public function handleCallback(Request $request, $provider)
    {
        try {
            // Use Socialite to handle OAuth callback
            $socialite = app('Laravel\Socialite\Contracts\Factory');
            $socialUser = $socialite->driver($provider)->stateless()->user();

            // Find or create user
            $user = $this->findOrCreateUserFromSocialite($socialUser, $provider);

            // Generate API token
            $token = $user->createToken('API Token')->plainTextToken;

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'avatar' => $user->avatar
                    ],
                    'token' => $token,
                    'provider' => $provider
                ],
                'message' => 'Login successful'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'OAuth callback failed: ' . $e->getMessage(),
                'debug' => [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ]
            ], 500);
        }
    }

    private function findOrCreateUserFromSocialite($socialUser, $provider)
    {
        // Try to find existing user by email
        $user = User::where('email', $socialUser->getEmail())->first();

        if (!$user) {
            // Create new user
            $user = User::create([
                'name' => $socialUser->getName(),
                'email' => $socialUser->getEmail(),
                'password' => Hash::make(Str::random(16)), // Random password for OAuth users
                'avatar' => $socialUser->getAvatar(),
                'email_verified_at' => now(),
            ]);
        }

        return $user;
    }

    public function linkAccount(Request $request)
    {
        try {
            $request->validate([
                'provider' => 'required|string|in:google,facebook,twitter,github',
                'access_token' => 'required|string'
            ]);

            $userId = $request->user()->id;

            // Get user info from provider
            $userInfo = $this->getUserInfoFromProvider($request->provider, $request->access_token);

            // Check if account is already linked
            $existingAccount = DB::table('oauth_accounts')
                ->where('provider', $request->provider)
                ->where('provider_user_id', $userInfo['id'])
                ->first();

            if ($existingAccount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Account already linked to another user'
                ], 400);
            }

            // Create OAuth account record
            DB::table('oauth_accounts')->insert([
                'user_id' => $userId,
                'provider' => $request->provider,
                'provider_user_id' => $userInfo['id'],
                'access_token' => $request->access_token,
                'refresh_token' => $userInfo['refresh_token'] ?? null,
                'expires_at' => $userInfo['expires_at'] ?? null,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Account linked successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to link account: ' . $e->getMessage()
            ], 500);
        }
    }

    public function unlinkAccount(Request $request, $provider)
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
                    'message' => 'Account unlinked successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Account not found'
                ], 404);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to unlink account: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getLinkedAccounts(Request $request)
    {
        try {
            $userId = $request->user()->id;

            $accounts = DB::table('oauth_accounts')
                ->where('user_id', $userId)
                ->select('provider', 'provider_user_id', 'created_at')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $accounts
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get linked accounts: ' . $e->getMessage()
            ], 500);
        }
    }

    private function getProviderRedirectUrl($provider, $state)
    {
        $clientId = $this->getProviderClientId($provider);
        $redirectUri = url('/api/auth/social/' . $provider . '/callback');

        switch ($provider) {
            case 'google':
                return "https://accounts.google.com/oauth/authorize?client_id={$clientId}&redirect_uri={$redirectUri}&scope=email profile&response_type=code&state={$state}";
            case 'facebook':
                return "https://www.facebook.com/v18.0/dialog/oauth?client_id={$clientId}&redirect_uri={$redirectUri}&scope=email&response_type=code&state={$state}";
            case 'twitter':
                return "https://api.twitter.com/oauth/authorize?client_id={$clientId}&redirect_uri={$redirectUri}&response_type=code&state={$state}";
            case 'github':
                return "https://github.com/login/oauth/authorize?client_id={$clientId}&redirect_uri={$redirectUri}&scope=user:email&response_type=code&state={$state}";
            default:
                throw new \Exception('Unsupported provider');
        }
    }

    private function getProviderClientId($provider)
    {
        $clientIds = [
            'google' => env('GOOGLE_CLIENT_ID', 'your-google-client-id'),
            'facebook' => env('FACEBOOK_CLIENT_ID', 'your-facebook-client-id'),
            'twitter' => env('TWITTER_CLIENT_ID', 'your-twitter-client-id'),
            'github' => env('GITHUB_CLIENT_ID', 'your-github-client-id')
        ];

        return $clientIds[$provider] ?? null;
    }

    private function exchangeCodeForToken($provider, $code)
    {
        if ($provider === 'facebook') {
            $clientId = env('FACEBOOK_CLIENT_ID');
            $clientSecret = env('FACEBOOK_CLIENT_SECRET');
            $redirectUri = env('FACEBOOK_REDIRECT_URI');

            $url = "https://graph.facebook.com/v18.0/oauth/access_token?" . http_build_query([
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
                'redirect_uri' => $redirectUri,
                'code' => $code
            ]);

            $response = file_get_contents($url);

            if ($response === false) {
                throw new \Exception('Failed to connect to Facebook API');
            }

            $data = json_decode($response, true);

            if (isset($data['error'])) {
                throw new \Exception('Facebook API error: ' . $data['error']['message']);
            }

            return $data['access_token'] ?? null;
        }

        // Mock for other providers
        return 'mock-access-token-' . $code;
    }

    private function getUserInfoFromProvider($provider, $accessToken)
    {
        if ($provider === 'facebook') {
            $url = "https://graph.facebook.com/v18.0/me?fields=id,name,email,picture&access_token=" . $accessToken;

            $response = file_get_contents($url);

            if ($response === false) {
                throw new \Exception('Failed to connect to Facebook Graph API');
            }

            $data = json_decode($response, true);

            if (isset($data['error'])) {
                throw new \Exception('Facebook Graph API error: ' . $data['error']['message']);
            }

            return [
                'id' => $data['id'],
                'name' => $data['name'],
                'email' => $data['email'],
                'avatar' => $data['picture']['data']['url'] ?? null,
                'refresh_token' => null,
                'expires_at' => null
            ];
        }

        // Mock for other providers
        return [
            'id' => 'provider-user-' . rand(1000, 9999),
            'name' => 'John Doe',
            'email' => 'john.doe@example.com',
            'avatar' => 'https://via.placeholder.com/150',
            'refresh_token' => 'mock-refresh-token',
            'expires_at' => now()->addHour()
        ];
    }

    private function findOrCreateUser($userInfo, $provider)
    {
        // Try to find existing user by email
        $user = DB::table('users')->where('email', $userInfo['email'])->first();

        if (!$user) {
            // Create new user
            $userId = DB::table('users')->insertGetId([
                'name' => $userInfo['name'],
                'email' => $userInfo['email'],
                'password' => Hash::make(Str::random(16)), // Random password for OAuth users
                'avatar' => $userInfo['avatar'],
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            $user = DB::table('users')->where('id', $userId)->first();
        }

        return $user;
    }

    private function createOAuthAccount($userId, $provider, $userInfo, $accessToken)
    {
        DB::table('oauth_accounts')->updateOrInsert(
            [
                'user_id' => $userId,
                'provider' => $provider,
                'provider_user_id' => $userInfo['id']
            ],
            [
                'access_token' => $accessToken,
                'refresh_token' => $userInfo['refresh_token'] ?? null,
                'expires_at' => $userInfo['expires_at'] ?? null,
                'updated_at' => now()
            ]
        );
    }
}
