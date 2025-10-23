<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

class ApiAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Check if user is authenticated via Sanctum
        if (Auth::guard('sanctum')->check()) {
            return $next($request);
        }

        // Check for Bearer token in Authorization header
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication token not provided',
                'error_code' => 'TOKEN_MISSING'
            ], 401);
        }

        // Attempt to authenticate with the token
        try {
            $user = Auth::guard('sanctum')->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid authentication token',
                    'error_code' => 'TOKEN_INVALID'
                ], 401);
            }

            // Check if user is active (if is_active column exists)
            if (isset($user->is_active) && !$user->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'User account is deactivated',
                    'error_code' => 'ACCOUNT_DEACTIVATED'
                ], 403);
            }

            return $next($request);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token authentication failed',
                'error_code' => 'TOKEN_AUTHENTICATION_FAILED'
            ], 401);
        }
    }
}
