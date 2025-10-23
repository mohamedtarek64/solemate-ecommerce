<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class RateLimitMiddleware
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
        $key = $this->resolveRequestSignature($request);
        $maxAttempts = $this->resolveMaxAttempts($request);
        $decayMinutes = $this->resolveDecayMinutes($request);

        if ($this->tooManyAttempts($key, $maxAttempts)) {
            return $this->buildException($key, $maxAttempts, $decayMinutes);
        }

        $this->hit($key, $decayMinutes);

        $response = $next($request);

        return $this->addHeaders(
            $response,
            $maxAttempts,
            $this->calculateRemainingAttempts($key, $maxAttempts)
        );
    }

    protected function resolveRequestSignature($request)
    {
        if ($user = $request->user()) {
            return 'user:' . $user->id;
        }

        return 'ip:' . $request->ip();
    }

    protected function resolveMaxAttempts($request)
    {
        // Different limits for different endpoints
        if ($request->is('api/admin/*')) {
            return 100; // 100 requests per minute for admin endpoints
        }

        if ($request->is('api/auth/*')) {
            return 10; // 10 requests per minute for auth endpoints
        }

        return 60; // Default: 60 requests per minute
    }

    protected function resolveDecayMinutes($request)
    {
        return 1; // 1 minute window
    }

    protected function tooManyAttempts($key, $maxAttempts)
    {
        $attempts = Cache::get($key, 0);
        return $attempts >= $maxAttempts;
    }

    protected function hit($key, $decayMinutes)
    {
        $attempts = Cache::get($key, 0);
        Cache::put($key, $attempts + 1, $decayMinutes * 60);
    }

    protected function calculateRemainingAttempts($key, $maxAttempts)
    {
        $attempts = Cache::get($key, 0);
        return max(0, $maxAttempts - $attempts);
    }

    protected function buildException($key, $maxAttempts, $decayMinutes)
    {
        $retryAfter = $this->getTimeUntilNextRetry($key, $decayMinutes);

        return response()->json([
            'success' => false,
            'message' => 'Too many requests. Please try again later.',
            'error_code' => 'RATE_LIMIT_EXCEEDED',
            'retry_after' => $retryAfter,
            'max_attempts' => $maxAttempts,
            'decay_minutes' => $decayMinutes
        ], 429)->withHeaders([
            'Retry-After' => $retryAfter,
            'X-RateLimit-Limit' => $maxAttempts,
            'X-RateLimit-Remaining' => 0,
            'X-RateLimit-Reset' => time() + ($decayMinutes * 60)
        ]);
    }

    protected function getTimeUntilNextRetry($key, $decayMinutes)
    {
        return $decayMinutes * 60;
    }

    protected function addHeaders($response, $maxAttempts, $remainingAttempts)
    {
        $response->headers->set('X-RateLimit-Limit', $maxAttempts);
        $response->headers->set('X-RateLimit-Remaining', $remainingAttempts);
        $response->headers->set('X-RateLimit-Reset', time() + 60);

        return $response;
    }
}
