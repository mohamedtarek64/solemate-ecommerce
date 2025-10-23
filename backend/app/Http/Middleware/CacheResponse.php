<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CacheResponse
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next, $duration = 300)
    {
        // Only cache GET requests
        if ($request->method() !== 'GET') {
            return $next($request);
        }

        // Generate cache key from request
        $cacheKey = $this->getCacheKey($request);

        // Check if cached response exists
        if (Cache::has($cacheKey)) {
            $cachedResponse = Cache::get($cacheKey);
            return response($cachedResponse['content'], $cachedResponse['status'])
                ->withHeaders($cachedResponse['headers'])
                ->header('X-Cache', 'HIT');
        }

        // Get response
        $response = $next($request);

        // Cache successful responses
        if ($response->status() === 200) {
            $cacheData = [
                'content' => $response->getContent(),
                'status' => $response->status(),
                'headers' => $response->headers->all()
            ];

            Cache::put($cacheKey, $cacheData, (int)$duration);

            $response->header('X-Cache', 'MISS');
        }

        return $response;
    }

    /**
     * Generate cache key from request
     *
     * @param Request $request
     * @return string
     */
    private function getCacheKey(Request $request): string
    {
        $key = 'response_cache:' . $request->path();

        // Add query parameters to key
        if ($request->query()) {
            $key .= ':' . md5(json_encode($request->query()));
        }

        // Add user ID if authenticated
        if ($request->user()) {
            $key .= ':user_' . $request->user()->id;
        }

        return $key;
    }
}
