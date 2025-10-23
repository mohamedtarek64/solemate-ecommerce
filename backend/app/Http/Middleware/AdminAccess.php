<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AdminAccess
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
        try {
            // Check if user is authenticated
            if (!Auth::check()) {
                Log::warning('Admin access denied: User not authenticated', [
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'url' => $request->fullUrl()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required',
                    'error_code' => 'UNAUTHENTICATED'
                ], 401);
            }

            $user = Auth::user();

            // Check if user has admin role
            if (!$user || $user->role !== 'admin') {
                Log::warning('Admin access denied: Insufficient privileges', [
                    'user_id' => $user?->id,
                    'user_role' => $user?->role,
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'url' => $request->fullUrl()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Admin access required',
                    'error_code' => 'INSUFFICIENT_PRIVILEGES',
                    'user_role' => $user?->role
                ], 403);
            }

            // Log successful admin access
            Log::info('Admin access granted', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'ip' => $request->ip(),
                'url' => $request->fullUrl(),
                'method' => $request->method()
            ]);

            return $next($request);

        } catch (\Exception $e) {
            Log::error('Admin access middleware error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'ip' => $request->ip(),
                'url' => $request->fullUrl()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal server error',
                'error_code' => 'MIDDLEWARE_ERROR'
            ], 500);
        }
    }
}
