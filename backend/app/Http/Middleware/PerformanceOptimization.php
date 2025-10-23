<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PerformanceOptimization
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Add performance headers
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Enable compression
        $response->headers->set('Vary', 'Accept-Encoding');

        // Cache headers for API responses
        if ($request->is('api/*')) {
            $response->headers->set('Cache-Control', 'public, max-age=300'); // 5 minutes
            $response->headers->set('ETag', md5($response->getContent()));
        }

        return $response;
    }
}
