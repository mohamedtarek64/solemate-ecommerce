<?php

namespace App\Services;

use App\Models\AnalyticsPageView;
use App\Models\AnalyticsEvent;
use App\Models\AnalyticsProductView;
use App\Models\AnalyticsSearch;
use App\Models\AnalyticsCartAction;
use App\Models\AnalyticsPurchase;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Request;

class AnalyticsService
{
    /**
     * Track page view.
     */
    public function trackPageView(User $user = null, array $data = []): AnalyticsPageView
    {
        return AnalyticsPageView::create([
            'user_id' => $user?->id,
            'session_id' => $data['session_id'] ?? session()->getId(),
            'page_url' => $data['page_url'] ?? Request::url(),
            'page_title' => $data['page_title'] ?? null,
            'referrer' => $data['referrer'] ?? Request::header('referer'),
            'user_agent' => $data['user_agent'] ?? Request::userAgent(),
            'ip_address' => $data['ip_address'] ?? Request::ip(),
            'country' => $data['country'] ?? null,
            'city' => $data['city'] ?? null,
            'device_type' => $data['device_type'] ?? $this->getDeviceType(),
            'browser' => $data['browser'] ?? $this->getBrowser(),
            'os' => $data['os'] ?? $this->getOS(),
            'viewport_width' => $data['viewport_width'] ?? null,
            'viewport_height' => $data['viewport_height'] ?? null,
            'time_on_page' => $data['time_on_page'] ?? null,
            'timestamp' => now(),
        ]);
    }

    /**
     * Track event.
     */
    public function trackEvent(User $user = null, array $data = []): AnalyticsEvent
    {
        return AnalyticsEvent::create([
            'user_id' => $user?->id,
            'session_id' => $data['session_id'] ?? session()->getId(),
            'event_name' => $data['event_name'],
            'event_category' => $data['event_category'] ?? null,
            'event_action' => $data['event_action'] ?? null,
            'event_label' => $data['event_label'] ?? null,
            'event_value' => $data['event_value'] ?? null,
            'page_url' => $data['page_url'] ?? Request::url(),
            'user_agent' => $data['user_agent'] ?? Request::userAgent(),
            'ip_address' => $data['ip_address'] ?? Request::ip(),
            'country' => $data['country'] ?? null,
            'city' => $data['city'] ?? null,
            'device_type' => $data['device_type'] ?? $this->getDeviceType(),
            'browser' => $data['browser'] ?? $this->getBrowser(),
            'os' => $data['os'] ?? $this->getOS(),
            'custom_data' => $data['custom_data'] ?? [],
            'timestamp' => now(),
        ]);
    }

    /**
     * Track product view.
     */
    public function trackProductView(int $productId, User $user = null, array $data = []): AnalyticsProductView
    {
        return AnalyticsProductView::create([
            'user_id' => $user?->id,
            'product_id' => $productId,
            'session_id' => $data['session_id'] ?? session()->getId(),
            'page_url' => $data['page_url'] ?? Request::url(),
            'referrer' => $data['referrer'] ?? Request::header('referer'),
            'user_agent' => $data['user_agent'] ?? Request::userAgent(),
            'ip_address' => $data['ip_address'] ?? Request::ip(),
            'country' => $data['country'] ?? null,
            'city' => $data['city'] ?? null,
            'device_type' => $data['device_type'] ?? $this->getDeviceType(),
            'browser' => $data['browser'] ?? $this->getBrowser(),
            'os' => $data['os'] ?? $this->getOS(),
            'time_on_page' => $data['time_on_page'] ?? null,
            'timestamp' => now(),
        ]);
    }

    /**
     * Track search.
     */
    public function trackSearch(string $query, int $resultsCount, User $user = null, array $data = []): AnalyticsSearch
    {
        return AnalyticsSearch::create([
            'user_id' => $user?->id,
            'session_id' => $data['session_id'] ?? session()->getId(),
            'search_query' => $query,
            'search_filters' => $data['search_filters'] ?? [],
            'results_count' => $resultsCount,
            'clicked_result' => $data['clicked_result'] ?? null,
            'page_url' => $data['page_url'] ?? Request::url(),
            'user_agent' => $data['user_agent'] ?? Request::userAgent(),
            'ip_address' => $data['ip_address'] ?? Request::ip(),
            'country' => $data['country'] ?? null,
            'city' => $data['city'] ?? null,
            'device_type' => $data['device_type'] ?? $this->getDeviceType(),
            'browser' => $data['browser'] ?? $this->getBrowser(),
            'os' => $data['os'] ?? $this->getOS(),
            'timestamp' => now(),
        ]);
    }

    /**
     * Track cart action.
     */
    public function trackCartAction(string $actionType, int $productId, int $quantity, User $user = null, array $data = []): AnalyticsCartAction
    {
        return AnalyticsCartAction::create([
            'user_id' => $user?->id,
            'product_id' => $productId,
            'session_id' => $data['session_id'] ?? session()->getId(),
            'action_type' => $actionType,
            'quantity' => $quantity,
            'product_price' => $data['product_price'] ?? 0,
            'cart_total' => $data['cart_total'] ?? 0,
            'page_url' => $data['page_url'] ?? Request::url(),
            'user_agent' => $data['user_agent'] ?? Request::userAgent(),
            'ip_address' => $data['ip_address'] ?? Request::ip(),
            'country' => $data['country'] ?? null,
            'city' => $data['city'] ?? null,
            'device_type' => $data['device_type'] ?? $this->getDeviceType(),
            'browser' => $data['browser'] ?? $this->getBrowser(),
            'os' => $data['os'] ?? $this->getOS(),
            'timestamp' => now(),
        ]);
    }

    /**
     * Track purchase.
     */
    public function trackPurchase(int $orderId, int $productId, int $quantity, float $totalPrice, User $user = null, array $data = []): AnalyticsPurchase
    {
        return AnalyticsPurchase::create([
            'user_id' => $user?->id,
            'order_id' => $orderId,
            'product_id' => $productId,
            'session_id' => $data['session_id'] ?? session()->getId(),
            'quantity' => $quantity,
            'unit_price' => $data['unit_price'] ?? 0,
            'total_price' => $totalPrice,
            'discount_amount' => $data['discount_amount'] ?? 0,
            'tax_amount' => $data['tax_amount'] ?? 0,
            'payment_method' => $data['payment_method'] ?? null,
            'page_url' => $data['page_url'] ?? Request::url(),
            'user_agent' => $data['user_agent'] ?? Request::userAgent(),
            'ip_address' => $data['ip_address'] ?? Request::ip(),
            'country' => $data['country'] ?? null,
            'city' => $data['city'] ?? null,
            'device_type' => $data['device_type'] ?? $this->getDeviceType(),
            'browser' => $data['browser'] ?? $this->getBrowser(),
            'os' => $data['os'] ?? $this->getOS(),
            'timestamp' => now(),
        ]);
    }

    /**
     * Get analytics dashboard data.
     */
    public function getDashboardData(string $period = '30d'): array
    {
        $cacheKey = "analytics_dashboard_{$period}";
        
        return Cache::remember($cacheKey, 3600, function () use ($period) {
            $startDate = $this->getStartDate($period);
            $endDate = now();

            return [
                'page_views' => AnalyticsPageView::dateRange($startDate, $endDate)->count(),
                'unique_visitors' => AnalyticsPageView::dateRange($startDate, $endDate)->distinct('user_id')->count('user_id'),
                'events' => AnalyticsEvent::dateRange($startDate, $endDate)->count(),
                'product_views' => AnalyticsProductView::dateRange($startDate, $endDate)->count(),
                'searches' => AnalyticsSearch::dateRange($startDate, $endDate)->count(),
                'cart_actions' => AnalyticsCartAction::dateRange($startDate, $endDate)->count(),
                'purchases' => AnalyticsPurchase::dateRange($startDate, $endDate)->count(),
                'revenue' => AnalyticsPurchase::dateRange($startDate, $endDate)->sum('total_price'),
                'conversion_rate' => $this->getConversionRate($startDate, $endDate),
                'popular_products' => $this->getPopularProducts($startDate, $endDate),
                'popular_searches' => $this->getPopularSearches($startDate, $endDate),
            ];
        });
    }

    /**
     * Get conversion rate.
     */
    private function getConversionRate($startDate, $endDate): float
    {
        $visitors = AnalyticsPageView::dateRange($startDate, $endDate)->distinct('user_id')->count('user_id');
        $purchases = AnalyticsPurchase::dateRange($startDate, $endDate)->distinct('user_id')->count('user_id');

        return $visitors > 0 ? ($purchases / $visitors) * 100 : 0;
    }

    /**
     * Get popular products.
     */
    private function getPopularProducts($startDate, $endDate): array
    {
        return AnalyticsProductView::dateRange($startDate, $endDate)
            ->selectRaw('product_id, COUNT(*) as views')
            ->groupBy('product_id')
            ->orderBy('views', 'desc')
            ->limit(10)
            ->get()
            ->toArray();
    }

    /**
     * Get popular searches.
     */
    private function getPopularSearches($startDate, $endDate): array
    {
        return AnalyticsSearch::getPopularSearches(10, $startDate, $endDate)->toArray();
    }

    /**
     * Get start date based on period.
     */
    private function getStartDate(string $period): \Carbon\Carbon
    {
        return match($period) {
            '7d' => now()->subDays(7),
            '30d' => now()->subDays(30),
            '90d' => now()->subDays(90),
            '1y' => now()->subYear(),
            default => now()->subDays(30),
        };
    }

    /**
     * Get device type from user agent.
     */
    private function getDeviceType(): string
    {
        $userAgent = Request::userAgent();
        
        if (preg_match('/Mobile|Android|iPhone/i', $userAgent)) {
            return 'mobile';
        } elseif (preg_match('/Tablet|iPad/i', $userAgent)) {
            return 'tablet';
        }
        
        return 'desktop';
    }

    /**
     * Get browser from user agent.
     */
    private function getBrowser(): string
    {
        $userAgent = Request::userAgent();
        
        if (preg_match('/Chrome/i', $userAgent)) return 'Chrome';
        if (preg_match('/Firefox/i', $userAgent)) return 'Firefox';
        if (preg_match('/Safari/i', $userAgent)) return 'Safari';
        if (preg_match('/Edge/i', $userAgent)) return 'Edge';
        if (preg_match('/Opera/i', $userAgent)) return 'Opera';
        
        return 'Unknown';
    }

    /**
     * Get OS from user agent.
     */
    private function getOS(): string
    {
        $userAgent = Request::userAgent();
        
        if (preg_match('/Windows/i', $userAgent)) return 'Windows';
        if (preg_match('/Mac/i', $userAgent)) return 'macOS';
        if (preg_match('/Linux/i', $userAgent)) return 'Linux';
        if (preg_match('/Android/i', $userAgent)) return 'Android';
        if (preg_match('/iOS/i', $userAgent)) return 'iOS';
        
        return 'Unknown';
    }
}
