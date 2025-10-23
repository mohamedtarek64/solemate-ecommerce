<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ResponseCompression
{
    /**
     * Minimum size for compression (in bytes)
     */
    private const MIN_COMPRESSION_SIZE = 1024;

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Add security headers
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Enable compression
        $response->headers->set('Vary', 'Accept-Encoding');

        // Apply compression if supported and content is large enough
        if ($this->shouldCompress($request, $response)) {
            $this->compressResponse($response);
        }

        // Cache headers for API responses
        if ($request->is('api/*')) {
            $this->setCacheHeaders($response, $request);
        }

        // Add performance timing header
        if (defined('LARAVEL_START')) {
            $executionTime = round((microtime(true) - LARAVEL_START) * 1000, 2);
            $response->headers->set('X-Response-Time', $executionTime . 'ms');
        }

        return $response;
    }

    /**
     * Check if response should be compressed
     */
    private function shouldCompress(Request $request, $response): bool
    {
        // Check if client accepts gzip
        $acceptEncoding = $request->header('Accept-Encoding', '');
        if (!str_contains($acceptEncoding, 'gzip')) {
            return false;
        }

        // Check if response is already compressed
        if ($response->headers->has('Content-Encoding')) {
            return false;
        }

        // Check content type
        $contentType = $response->headers->get('Content-Type', '');
        $compressibleTypes = [
            'text/',
            'application/json',
            'application/javascript',
            'application/xml',
            'application/x-javascript'
        ];

        $isCompressible = false;
        foreach ($compressibleTypes as $type) {
            if (str_contains($contentType, $type)) {
                $isCompressible = true;
                break;
            }
        }

        if (!$isCompressible) {
            return false;
        }

        // Check content size
        $content = $response->getContent();
        if (strlen($content) < self::MIN_COMPRESSION_SIZE) {
            return false;
        }

        return true;
    }

    /**
     * Compress response content
     */
    private function compressResponse($response): void
    {
        $content = $response->getContent();
        $compressed = gzencode($content, 6); // Compression level 6 for balance

        if ($compressed !== false) {
            $response->setContent($compressed);
            $response->headers->set('Content-Encoding', 'gzip');
            $response->headers->set('Content-Length', strlen($compressed));
        }
    }

    /**
     * Set cache headers for API responses
     */
    private function setCacheHeaders($response, Request $request): void
    {
        // Different cache strategies for different endpoints
        $path = $request->path();

        if (str_contains($path, 'products')) {
            // Products - cache for 10 minutes
            $response->headers->set('Cache-Control', 'public, max-age=600');
        } elseif (str_contains($path, 'categories')) {
            // Categories - cache for 30 minutes
            $response->headers->set('Cache-Control', 'public, max-age=1800');
        } elseif (str_contains($path, 'cart') || str_contains($path, 'wishlist')) {
            // User-specific data - no cache
            $response->headers->set('Cache-Control', 'private, no-cache, must-revalidate');
        } else {
            // Default - cache for 5 minutes
            $response->headers->set('Cache-Control', 'public, max-age=300');
        }

        // Add ETag for cache validation
        if ($response->isOk() && !$response->headers->has('ETag')) {
            $etag = md5($response->getContent());
            $response->headers->set('ETag', '"' . $etag . '"');
            
            // Check if client has cached version
            $ifNoneMatch = $request->header('If-None-Match');
            if ($ifNoneMatch && $ifNoneMatch === '"' . $etag . '"') {
                $response->setNotModified();
            }
        }
    }
}
