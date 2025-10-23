<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function trackPageView(Request $request)
    {
        try {
            $request->validate([
                'page' => 'required|string',
                'title' => 'nullable|string',
                'url' => 'required|string',
                'referrer' => 'nullable|string'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_page_views')->insert([
                'user_id' => $userId,
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'page' => $request->page,
                'title' => $request->title,
                'url' => $request->url,
                'referrer' => $request->referrer,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Page view tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track page view: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackEvent(Request $request)
    {
        try {
            $request->validate([
                'event' => 'required|string',
                'category' => 'nullable|string',
                'action' => 'nullable|string',
                'label' => 'nullable|string',
                'value' => 'nullable|numeric',
                'properties' => 'nullable|array'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_events')->insert([
                'user_id' => $userId,
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'event' => $request->event,
                'category' => $request->category,
                'action' => $request->action,
                'label' => $request->label,
                'value' => $request->value,
                'properties' => json_encode($request->properties ?? []),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Event tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track event: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackProductView(Request $request)
    {
        try {
            $request->validate([
                'product_id' => 'required|integer|exists:products,id'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_product_views')->insert([
                'user_id' => $userId,
                'product_id' => $request->product_id,
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Product view tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track product view: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackSearch(Request $request)
    {
        try {
            $request->validate([
                'query' => 'required|string',
                'results_count' => 'required|integer',
                'filters' => 'nullable|array'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_searches')->insert([
                'user_id' => $userId,
                'query' => $request->query,
                'results_count' => $request->results_count,
                'filters' => json_encode($request->filters ?? []),
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Search tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track search: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackCartAction(Request $request)
    {
        try {
            $request->validate([
                'action' => 'required|string|in:add,remove,update,clear',
                'product_id' => 'required|integer|exists:products,id',
                'quantity' => 'required|integer|min:1'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_cart_actions')->insert([
                'user_id' => $userId,
                'action' => $request->action,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cart action tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track cart action: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackPurchase(Request $request)
    {
        try {
            $request->validate([
                'order_id' => 'required|integer',
                'total_amount' => 'required|numeric',
                'items' => 'required|array',
                'items.*.product_id' => 'required|integer',
                'items.*.quantity' => 'required|integer',
                'items.*.price' => 'required|numeric'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_purchases')->insert([
                'user_id' => $userId,
                'order_id' => $request->order_id,
                'total_amount' => $request->total_amount,
                'items' => json_encode($request->items),
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Purchase tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track purchase: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getUserAnalytics(Request $request)
    {
        try {
            $userId = $request->user()->id;

            $analytics = [
                'page_views' => DB::table('analytics_page_views')
                    ->where('user_id', $userId)
                    ->count(),
                'events' => DB::table('analytics_events')
                    ->where('user_id', $userId)
                    ->count(),
                'product_views' => DB::table('analytics_product_views')
                    ->where('user_id', $userId)
                    ->count(),
                'searches' => DB::table('analytics_searches')
                    ->where('user_id', $userId)
                    ->count(),
                'cart_actions' => DB::table('analytics_cart_actions')
                    ->where('user_id', $userId)
                    ->count(),
                'purchases' => DB::table('analytics_purchases')
                    ->where('user_id', $userId)
                    ->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $analytics
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get user analytics: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getProductAnalytics(Request $request, $productId)
    {
        try {
            $analytics = [
                'views' => DB::table('analytics_product_views')
                    ->where('product_id', $productId)
                    ->count(),
                'cart_adds' => DB::table('analytics_cart_actions')
                    ->where('product_id', $productId)
                    ->where('action', 'add')
                    ->count(),
                'purchases' => DB::table('analytics_purchases')
                    ->whereJsonContains('items', ['product_id' => $productId])
                    ->count(),
                'recent_views' => DB::table('analytics_product_views')
                    ->where('product_id', $productId)
                    ->where('created_at', '>=', now()->subDays(7))
                    ->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $analytics
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get product analytics: ' . $e->getMessage()
            ], 500);
        }
    }
}

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function trackPageView(Request $request)
    {
        try {
            $request->validate([
                'page' => 'required|string',
                'title' => 'nullable|string',
                'url' => 'required|string',
                'referrer' => 'nullable|string'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_page_views')->insert([
                'user_id' => $userId,
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'page' => $request->page,
                'title' => $request->title,
                'url' => $request->url,
                'referrer' => $request->referrer,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Page view tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track page view: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackEvent(Request $request)
    {
        try {
            $request->validate([
                'event' => 'required|string',
                'category' => 'nullable|string',
                'action' => 'nullable|string',
                'label' => 'nullable|string',
                'value' => 'nullable|numeric',
                'properties' => 'nullable|array'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_events')->insert([
                'user_id' => $userId,
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'event' => $request->event,
                'category' => $request->category,
                'action' => $request->action,
                'label' => $request->label,
                'value' => $request->value,
                'properties' => json_encode($request->properties ?? []),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Event tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track event: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackProductView(Request $request)
    {
        try {
            $request->validate([
                'product_id' => 'required|integer|exists:products,id'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_product_views')->insert([
                'user_id' => $userId,
                'product_id' => $request->product_id,
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Product view tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track product view: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackSearch(Request $request)
    {
        try {
            $request->validate([
                'query' => 'required|string',
                'results_count' => 'required|integer',
                'filters' => 'nullable|array'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_searches')->insert([
                'user_id' => $userId,
                'query' => $request->query,
                'results_count' => $request->results_count,
                'filters' => json_encode($request->filters ?? []),
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Search tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track search: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackCartAction(Request $request)
    {
        try {
            $request->validate([
                'action' => 'required|string|in:add,remove,update,clear',
                'product_id' => 'required|integer|exists:products,id',
                'quantity' => 'required|integer|min:1'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_cart_actions')->insert([
                'user_id' => $userId,
                'action' => $request->action,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cart action tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track cart action: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackPurchase(Request $request)
    {
        try {
            $request->validate([
                'order_id' => 'required|integer',
                'total_amount' => 'required|numeric',
                'items' => 'required|array',
                'items.*.product_id' => 'required|integer',
                'items.*.quantity' => 'required|integer',
                'items.*.price' => 'required|numeric'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_purchases')->insert([
                'user_id' => $userId,
                'order_id' => $request->order_id,
                'total_amount' => $request->total_amount,
                'items' => json_encode($request->items),
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Purchase tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track purchase: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getUserAnalytics(Request $request)
    {
        try {
            $userId = $request->user()->id;

            $analytics = [
                'page_views' => DB::table('analytics_page_views')
                    ->where('user_id', $userId)
                    ->count(),
                'events' => DB::table('analytics_events')
                    ->where('user_id', $userId)
                    ->count(),
                'product_views' => DB::table('analytics_product_views')
                    ->where('user_id', $userId)
                    ->count(),
                'searches' => DB::table('analytics_searches')
                    ->where('user_id', $userId)
                    ->count(),
                'cart_actions' => DB::table('analytics_cart_actions')
                    ->where('user_id', $userId)
                    ->count(),
                'purchases' => DB::table('analytics_purchases')
                    ->where('user_id', $userId)
                    ->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $analytics
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get user analytics: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getProductAnalytics(Request $request, $productId)
    {
        try {
            $analytics = [
                'views' => DB::table('analytics_product_views')
                    ->where('product_id', $productId)
                    ->count(),
                'cart_adds' => DB::table('analytics_cart_actions')
                    ->where('product_id', $productId)
                    ->where('action', 'add')
                    ->count(),
                'purchases' => DB::table('analytics_purchases')
                    ->whereJsonContains('items', ['product_id' => $productId])
                    ->count(),
                'recent_views' => DB::table('analytics_product_views')
                    ->where('product_id', $productId)
                    ->where('created_at', '>=', now()->subDays(7))
                    ->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $analytics
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get product analytics: ' . $e->getMessage()
            ], 500);
        }
    }
}

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function trackPageView(Request $request)
    {
        try {
            $request->validate([
                'page' => 'required|string',
                'title' => 'nullable|string',
                'url' => 'required|string',
                'referrer' => 'nullable|string'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_page_views')->insert([
                'user_id' => $userId,
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'page' => $request->page,
                'title' => $request->title,
                'url' => $request->url,
                'referrer' => $request->referrer,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Page view tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track page view: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackEvent(Request $request)
    {
        try {
            $request->validate([
                'event' => 'required|string',
                'category' => 'nullable|string',
                'action' => 'nullable|string',
                'label' => 'nullable|string',
                'value' => 'nullable|numeric',
                'properties' => 'nullable|array'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_events')->insert([
                'user_id' => $userId,
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'event' => $request->event,
                'category' => $request->category,
                'action' => $request->action,
                'label' => $request->label,
                'value' => $request->value,
                'properties' => json_encode($request->properties ?? []),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Event tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track event: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackProductView(Request $request)
    {
        try {
            $request->validate([
                'product_id' => 'required|integer|exists:products,id'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_product_views')->insert([
                'user_id' => $userId,
                'product_id' => $request->product_id,
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Product view tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track product view: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackSearch(Request $request)
    {
        try {
            $request->validate([
                'query' => 'required|string',
                'results_count' => 'required|integer',
                'filters' => 'nullable|array'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_searches')->insert([
                'user_id' => $userId,
                'query' => $request->query,
                'results_count' => $request->results_count,
                'filters' => json_encode($request->filters ?? []),
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Search tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track search: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackCartAction(Request $request)
    {
        try {
            $request->validate([
                'action' => 'required|string|in:add,remove,update,clear',
                'product_id' => 'required|integer|exists:products,id',
                'quantity' => 'required|integer|min:1'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_cart_actions')->insert([
                'user_id' => $userId,
                'action' => $request->action,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cart action tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track cart action: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackPurchase(Request $request)
    {
        try {
            $request->validate([
                'order_id' => 'required|integer',
                'total_amount' => 'required|numeric',
                'items' => 'required|array',
                'items.*.product_id' => 'required|integer',
                'items.*.quantity' => 'required|integer',
                'items.*.price' => 'required|numeric'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_purchases')->insert([
                'user_id' => $userId,
                'order_id' => $request->order_id,
                'total_amount' => $request->total_amount,
                'items' => json_encode($request->items),
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Purchase tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track purchase: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getUserAnalytics(Request $request)
    {
        try {
            $userId = $request->user()->id;

            $analytics = [
                'page_views' => DB::table('analytics_page_views')
                    ->where('user_id', $userId)
                    ->count(),
                'events' => DB::table('analytics_events')
                    ->where('user_id', $userId)
                    ->count(),
                'product_views' => DB::table('analytics_product_views')
                    ->where('user_id', $userId)
                    ->count(),
                'searches' => DB::table('analytics_searches')
                    ->where('user_id', $userId)
                    ->count(),
                'cart_actions' => DB::table('analytics_cart_actions')
                    ->where('user_id', $userId)
                    ->count(),
                'purchases' => DB::table('analytics_purchases')
                    ->where('user_id', $userId)
                    ->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $analytics
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get user analytics: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getProductAnalytics(Request $request, $productId)
    {
        try {
            $analytics = [
                'views' => DB::table('analytics_product_views')
                    ->where('product_id', $productId)
                    ->count(),
                'cart_adds' => DB::table('analytics_cart_actions')
                    ->where('product_id', $productId)
                    ->where('action', 'add')
                    ->count(),
                'purchases' => DB::table('analytics_purchases')
                    ->whereJsonContains('items', ['product_id' => $productId])
                    ->count(),
                'recent_views' => DB::table('analytics_product_views')
                    ->where('product_id', $productId)
                    ->where('created_at', '>=', now()->subDays(7))
                    ->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $analytics
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get product analytics: ' . $e->getMessage()
            ], 500);
        }
    }
}

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function trackPageView(Request $request)
    {
        try {
            $request->validate([
                'page' => 'required|string',
                'title' => 'nullable|string',
                'url' => 'required|string',
                'referrer' => 'nullable|string'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_page_views')->insert([
                'user_id' => $userId,
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'page' => $request->page,
                'title' => $request->title,
                'url' => $request->url,
                'referrer' => $request->referrer,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Page view tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track page view: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackEvent(Request $request)
    {
        try {
            $request->validate([
                'event' => 'required|string',
                'category' => 'nullable|string',
                'action' => 'nullable|string',
                'label' => 'nullable|string',
                'value' => 'nullable|numeric',
                'properties' => 'nullable|array'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_events')->insert([
                'user_id' => $userId,
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'event' => $request->event,
                'category' => $request->category,
                'action' => $request->action,
                'label' => $request->label,
                'value' => $request->value,
                'properties' => json_encode($request->properties ?? []),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Event tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track event: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackProductView(Request $request)
    {
        try {
            $request->validate([
                'product_id' => 'required|integer|exists:products,id'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_product_views')->insert([
                'user_id' => $userId,
                'product_id' => $request->product_id,
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Product view tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track product view: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackSearch(Request $request)
    {
        try {
            $request->validate([
                'query' => 'required|string',
                'results_count' => 'required|integer',
                'filters' => 'nullable|array'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_searches')->insert([
                'user_id' => $userId,
                'query' => $request->query,
                'results_count' => $request->results_count,
                'filters' => json_encode($request->filters ?? []),
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Search tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track search: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackCartAction(Request $request)
    {
        try {
            $request->validate([
                'action' => 'required|string|in:add,remove,update,clear',
                'product_id' => 'required|integer|exists:products,id',
                'quantity' => 'required|integer|min:1'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_cart_actions')->insert([
                'user_id' => $userId,
                'action' => $request->action,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cart action tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track cart action: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackPurchase(Request $request)
    {
        try {
            $request->validate([
                'order_id' => 'required|integer',
                'total_amount' => 'required|numeric',
                'items' => 'required|array',
                'items.*.product_id' => 'required|integer',
                'items.*.quantity' => 'required|integer',
                'items.*.price' => 'required|numeric'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_purchases')->insert([
                'user_id' => $userId,
                'order_id' => $request->order_id,
                'total_amount' => $request->total_amount,
                'items' => json_encode($request->items),
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Purchase tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track purchase: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getUserAnalytics(Request $request)
    {
        try {
            $userId = $request->user()->id;

            $analytics = [
                'page_views' => DB::table('analytics_page_views')
                    ->where('user_id', $userId)
                    ->count(),
                'events' => DB::table('analytics_events')
                    ->where('user_id', $userId)
                    ->count(),
                'product_views' => DB::table('analytics_product_views')
                    ->where('user_id', $userId)
                    ->count(),
                'searches' => DB::table('analytics_searches')
                    ->where('user_id', $userId)
                    ->count(),
                'cart_actions' => DB::table('analytics_cart_actions')
                    ->where('user_id', $userId)
                    ->count(),
                'purchases' => DB::table('analytics_purchases')
                    ->where('user_id', $userId)
                    ->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $analytics
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get user analytics: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getProductAnalytics(Request $request, $productId)
    {
        try {
            $analytics = [
                'views' => DB::table('analytics_product_views')
                    ->where('product_id', $productId)
                    ->count(),
                'cart_adds' => DB::table('analytics_cart_actions')
                    ->where('product_id', $productId)
                    ->where('action', 'add')
                    ->count(),
                'purchases' => DB::table('analytics_purchases')
                    ->whereJsonContains('items', ['product_id' => $productId])
                    ->count(),
                'recent_views' => DB::table('analytics_product_views')
                    ->where('product_id', $productId)
                    ->where('created_at', '>=', now()->subDays(7))
                    ->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $analytics
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get product analytics: ' . $e->getMessage()
            ], 500);
        }
    }
}

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function trackPageView(Request $request)
    {
        try {
            $request->validate([
                'page' => 'required|string',
                'title' => 'nullable|string',
                'url' => 'required|string',
                'referrer' => 'nullable|string'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_page_views')->insert([
                'user_id' => $userId,
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'page' => $request->page,
                'title' => $request->title,
                'url' => $request->url,
                'referrer' => $request->referrer,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Page view tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track page view: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackEvent(Request $request)
    {
        try {
            $request->validate([
                'event' => 'required|string',
                'category' => 'nullable|string',
                'action' => 'nullable|string',
                'label' => 'nullable|string',
                'value' => 'nullable|numeric',
                'properties' => 'nullable|array'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_events')->insert([
                'user_id' => $userId,
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'event' => $request->event,
                'category' => $request->category,
                'action' => $request->action,
                'label' => $request->label,
                'value' => $request->value,
                'properties' => json_encode($request->properties ?? []),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Event tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track event: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackProductView(Request $request)
    {
        try {
            $request->validate([
                'product_id' => 'required|integer|exists:products,id'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_product_views')->insert([
                'user_id' => $userId,
                'product_id' => $request->product_id,
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Product view tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track product view: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackSearch(Request $request)
    {
        try {
            $request->validate([
                'query' => 'required|string',
                'results_count' => 'required|integer',
                'filters' => 'nullable|array'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_searches')->insert([
                'user_id' => $userId,
                'query' => $request->query,
                'results_count' => $request->results_count,
                'filters' => json_encode($request->filters ?? []),
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Search tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track search: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackCartAction(Request $request)
    {
        try {
            $request->validate([
                'action' => 'required|string|in:add,remove,update,clear',
                'product_id' => 'required|integer|exists:products,id',
                'quantity' => 'required|integer|min:1'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_cart_actions')->insert([
                'user_id' => $userId,
                'action' => $request->action,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cart action tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track cart action: ' . $e->getMessage()
            ], 500);
        }
    }

    public function trackPurchase(Request $request)
    {
        try {
            $request->validate([
                'order_id' => 'required|integer',
                'total_amount' => 'required|numeric',
                'items' => 'required|array',
                'items.*.product_id' => 'required|integer',
                'items.*.quantity' => 'required|integer',
                'items.*.price' => 'required|numeric'
            ]);

            $userId = $request->user() ? $request->user()->id : null;

            DB::table('analytics_purchases')->insert([
                'user_id' => $userId,
                'order_id' => $request->order_id,
                'total_amount' => $request->total_amount,
                'items' => json_encode($request->items),
                'session_id' => $request->header('X-Session-ID', 'anonymous'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Purchase tracked'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track purchase: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getUserAnalytics(Request $request)
    {
        try {
            $userId = $request->user()->id;

            $analytics = [
                'page_views' => DB::table('analytics_page_views')
                    ->where('user_id', $userId)
                    ->count(),
                'events' => DB::table('analytics_events')
                    ->where('user_id', $userId)
                    ->count(),
                'product_views' => DB::table('analytics_product_views')
                    ->where('user_id', $userId)
                    ->count(),
                'searches' => DB::table('analytics_searches')
                    ->where('user_id', $userId)
                    ->count(),
                'cart_actions' => DB::table('analytics_cart_actions')
                    ->where('user_id', $userId)
                    ->count(),
                'purchases' => DB::table('analytics_purchases')
                    ->where('user_id', $userId)
                    ->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $analytics
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get user analytics: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getProductAnalytics(Request $request, $productId)
    {
        try {
            $analytics = [
                'views' => DB::table('analytics_product_views')
                    ->where('product_id', $productId)
                    ->count(),
                'cart_adds' => DB::table('analytics_cart_actions')
                    ->where('product_id', $productId)
                    ->where('action', 'add')
                    ->count(),
                'purchases' => DB::table('analytics_purchases')
                    ->whereJsonContains('items', ['product_id' => $productId])
                    ->count(),
                'recent_views' => DB::table('analytics_product_views')
                    ->where('product_id', $productId)
                    ->where('created_at', '>=', now()->subDays(7))
                    ->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $analytics
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get product analytics: ' . $e->getMessage()
            ], 500);
        }
    }
}
