<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\AnalyticsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class GenerateReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 600;
    public $tries = 2;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $reportType,
        public string $period = '30d',
        public ?int $userId = null,
        public string $format = 'pdf'
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info('Generating report', [
                'report_type' => $this->reportType,
                'period' => $this->period,
                'user_id' => $this->userId,
                'format' => $this->format,
            ]);

            $reportData = $this->generateReportData();
            $reportFile = $this->createReportFile($reportData);

            // Store report file
            $fileName = $this->getReportFileName();
            Storage::disk('public')->put("reports/{$fileName}", $reportFile);

            Log::info('Report generated successfully', [
                'report_type' => $this->reportType,
                'file_name' => $fileName,
            ]);
        } catch (\Exception $e) {
            Log::error('Report generation failed', [
                'report_type' => $this->reportType,
                'period' => $this->period,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Generate report data.
     */
    private function generateReportData(): array
    {
        $startDate = $this->getStartDate();
        $endDate = now();

        return match($this->reportType) {
            'sales' => $this->generateSalesReport($startDate, $endDate),
            'products' => $this->generateProductsReport($startDate, $endDate),
            'users' => $this->generateUsersReport($startDate, $endDate),
            'analytics' => $this->generateAnalyticsReport($startDate, $endDate),
            default => throw new \Exception('Unknown report type'),
        };
    }

    /**
     * Generate sales report data.
     */
    private function generateSalesReport(Carbon $startDate, Carbon $endDate): array
    {
        $orders = Order::whereBetween('created_at', [$startDate, $endDate])
                      ->with(['user', 'items', 'items.product'])
                      ->get();

        $totalRevenue = $orders->sum('total_amount');
        $averageOrderValue = $orders->avg('total_amount');

        return [
            'period' => $this->period,
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'total_orders' => $orders->count(),
            'total_revenue' => $this->formatCurrency($totalRevenue),
            'average_order_value' => $this->formatCurrency($averageOrderValue),
            'orders_by_status' => $this->normalizeOrderStatuses($orders->groupBy('status')->map->count()),
            'orders_by_payment_method' => $this->normalizePaymentMethods($orders->groupBy('payment_method')->map->count()),
            'top_products' => $this->getTopProducts($orders),
            'orders' => $this->normalizeOrdersData($orders->take(100)), // Limit for performance
        ];
    }

    /**
     * Generate products report data.
     */
    private function generateProductsReport(Carbon $startDate, Carbon $endDate): array
    {
        $products = Product::with(['category'])
                          ->whereBetween('created_at', [$startDate, $endDate])
                          ->get();

        return [
            'period' => $this->period,
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'total_products' => $products->count(),
            'products_by_category' => $this->normalizeCategoryNames($products->groupBy('category.name')->map->count()),
            'products_by_brand' => $this->normalizeBrandNames($products->groupBy('brand')->map->count()),
            'low_stock_products' => $this->normalizeProductsData($products->where('stock_quantity', '<', 10)),
            'out_of_stock_products' => $this->normalizeProductsData($products->where('stock_quantity', 0)),
            'products' => $this->normalizeProductsData($products),
        ];
    }

    /**
     * Generate users report data.
     */
    private function generateUsersReport(Carbon $startDate, Carbon $endDate): array
    {
        $users = User::whereBetween('created_at', [$startDate, $endDate])->get();

        return [
            'period' => $this->period,
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'total_users' => $users->count(),
            'active_users' => $users->where('is_active', true)->count(),
            'admin_users' => $users->where('is_admin', true)->count(),
            'users_by_gender' => $users->groupBy('gender')->map->count(),
            'users' => $users->take(100), // Limit for performance
        ];
    }

    /**
     * Generate analytics report data.
     */
    private function generateAnalyticsReport(Carbon $startDate, Carbon $endDate): array
    {
        $analyticsService = app(AnalyticsService::class);

        return [
            'period' => $this->period,
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'dashboard_data' => $analyticsService->getDashboardData($this->period),
        ];
    }

    /**
     * Create report file.
     */
    private function createReportFile(array $data): string
    {
        return match($this->format) {
            'pdf' => $this->createPdfReport($data),
            'csv' => $this->createCsvReport($data),
            'json' => json_encode($data, JSON_PRETTY_PRINT),
            default => throw new \Exception('Unsupported report format'),
        };
    }

    /**
     * Create PDF report.
     */
    private function createPdfReport(array $data): string
    {
        // Normalize data before creating PDF
        $normalizedData = $this->normalizeReportData($data);

        // This would typically use a PDF library like DomPDF or TCPDF
        // For now, we'll return a simple HTML representation
        $html = view('reports.' . $this->reportType, $normalizedData)->render();
        return $html;
    }

    /**
     * Create CSV report.
     */
    private function createCsvReport(array $data): string
    {
        $csv = '';

        // Add headers
        $csv .= implode(',', array_keys($data)) . "\n";

        // Add data rows
        foreach ($data as $row) {
            if (is_array($row)) {
                $csv .= implode(',', array_values($row)) . "\n";
            } else {
                $csv .= $row . "\n";
            }
        }

        return $csv;
    }

    /**
     * Get report file name.
     */
    private function getReportFileName(): string
    {
        $timestamp = now()->format('Y-m-d_H-i-s');
        return "{$this->reportType}_report_{$this->period}_{$timestamp}.{$this->format}";
    }

    /**
     * Get start date based on period.
     */
    private function getStartDate(): Carbon
    {
        return match($this->period) {
            '7d' => now()->subDays(7),
            '30d' => now()->subDays(30),
            '90d' => now()->subDays(90),
            '1y' => now()->subYear(),
            default => now()->subDays(30),
        };
    }

    /**
     * Get top products from orders.
     */
    private function getTopProducts($orders): array
    {
        $productCounts = [];

        foreach ($orders as $order) {
            foreach ($order->items as $item) {
                $productId = $item->product_id;
                $productCounts[$productId] = ($productCounts[$productId] ?? 0) + $item->quantity;
            }
        }

        arsort($productCounts);

        return array_slice($productCounts, 0, 10, true);
    }

    /**
     * Normalize report data for PDF generation.
     */
    private function normalizeReportData(array $data): array
    {
        $normalizedData = [];

        foreach ($data as $key => $value) {
            $normalizedData[$key] = $this->normalizeValue($value);
        }

        return $normalizedData;
    }

    /**
     * Normalize individual values based on their type.
     */
    private function normalizeValue($value)
    {
        if (is_array($value)) {
            return $this->normalizeArray($value);
        }

        if (is_numeric($value)) {
            return $this->normalizeNumeric($value);
        }

        if (is_string($value)) {
            return $this->normalizeString($value);
        }

        if ($value instanceof \DateTime || $value instanceof \Carbon\Carbon) {
            return $this->normalizeDate($value);
        }

        return $value;
    }

    /**
     * Normalize array data.
     */
    private function normalizeArray(array $array): array
    {
        $normalized = [];

        foreach ($array as $key => $value) {
            $normalizedKey = $this->normalizeKey($key);
            $normalized[$normalizedKey] = $this->normalizeValue($value);
        }

        return $normalized;
    }

    /**
     * Normalize numeric values.
     */
    private function normalizeNumeric($value)
    {
        // Round to 2 decimal places for currency
        if (is_float($value)) {
            return round($value, 2);
        }

        return $value;
    }

    /**
     * Normalize string values.
     */
    private function normalizeString(string $value): string
    {
        // Remove extra whitespace
        $value = trim($value);

        // Replace multiple spaces with single space
        $value = preg_replace('/\s+/', ' ', $value);

        // Remove special characters that might cause PDF issues
        $value = preg_replace('/[^\w\s\-\.\,\:\;\(\)\[\]\/]/', '', $value);

        // Limit string length for PDF display
        if (strlen($value) > 200) {
            $value = substr($value, 0, 197) . '...';
        }

        return $value;
    }

    /**
     * Normalize date values.
     */
    private function normalizeDate($date): string
    {
        if ($date instanceof \Carbon\Carbon) {
            return $date->format('Y-m-d H:i:s');
        }

        if ($date instanceof \DateTime) {
            return $date->format('Y-m-d H:i:s');
        }

        return (string) $date;
    }

    /**
     * Normalize array keys.
     */
    private function normalizeKey($key): string
    {
        if (is_string($key)) {
            // Convert snake_case to Title Case
            return ucwords(str_replace('_', ' ', $key));
        }

        return (string) $key;
    }

    /**
     * Format currency values for PDF display.
     */
    private function formatCurrency($amount): string
    {
        if (!is_numeric($amount)) {
            return '0.00';
        }

        return number_format($amount, 2, '.', ',');
    }

    /**
     * Format percentage values for PDF display.
     */
    private function formatPercentage($value, $total): string
    {
        if (!is_numeric($value) || !is_numeric($total) || $total == 0) {
            return '0.00%';
        }

        $percentage = ($value / $total) * 100;
        return number_format($percentage, 2) . '%';
    }

    /**
     * Clean and format product names for PDF.
     */
    private function normalizeProductName(string $name): string
    {
        // Remove HTML tags
        $name = strip_tags($name);

        // Decode HTML entities
        $name = html_entity_decode($name, ENT_QUOTES, 'UTF-8');

        // Normalize string
        $name = $this->normalizeString($name);

        return $name;
    }

    /**
     * Normalize order status for consistent display.
     */
    private function normalizeOrderStatus(string $status): string
    {
        $statusMap = [
            'pending' => 'Pending',
            'processing' => 'Processing',
            'shipped' => 'Shipped',
            'delivered' => 'Delivered',
            'cancelled' => 'Cancelled',
            'refunded' => 'Refunded',
        ];

        return $statusMap[strtolower($status)] ?? ucfirst($status);
    }

    /**
     * Normalize order statuses collection.
     */
    private function normalizeOrderStatuses($statuses): array
    {
        $normalized = [];

        foreach ($statuses as $status => $count) {
            $normalized[$this->normalizeOrderStatus($status)] = $count;
        }

        return $normalized;
    }

    /**
     * Normalize payment methods collection.
     */
    private function normalizePaymentMethods($methods): array
    {
        $normalized = [];

        foreach ($methods as $method => $count) {
            $normalizedMethod = ucwords(str_replace('_', ' ', $method));
            $normalized[$normalizedMethod] = $count;
        }

        return $normalized;
    }

    /**
     * Normalize orders data for PDF display.
     */
    private function normalizeOrdersData($orders): array
    {
        $normalizedOrders = [];

        foreach ($orders as $order) {
            $normalizedOrders[] = [
                'id' => $order->id,
                'order_number' => $order->order_number ?? 'N/A',
                'customer_name' => $this->normalizeString($order->user->name ?? 'Guest'),
                'email' => $this->normalizeString($order->user->email ?? 'N/A'),
                'status' => $this->normalizeOrderStatus($order->status),
                'payment_method' => ucwords(str_replace('_', ' ', $order->payment_method)),
                'total_amount' => $this->formatCurrency($order->total_amount),
                'created_at' => $this->normalizeDate($order->created_at),
                'items_count' => $order->items->count(),
            ];
        }

        return $normalizedOrders;
    }

    /**
     * Normalize category names collection.
     */
    private function normalizeCategoryNames($categories): array
    {
        $normalized = [];

        foreach ($categories as $category => $count) {
            $normalizedCategory = $this->normalizeString($category ?? 'Uncategorized');
            $normalized[$normalizedCategory] = $count;
        }

        return $normalized;
    }

    /**
     * Normalize brand names collection.
     */
    private function normalizeBrandNames($brands): array
    {
        $normalized = [];

        foreach ($brands as $brand => $count) {
            $normalizedBrand = $this->normalizeString($brand ?? 'No Brand');
            $normalized[$normalizedBrand] = $count;
        }

        return $normalized;
    }

    /**
     * Normalize products data for PDF display.
     */
    private function normalizeProductsData($products): array
    {
        $normalizedProducts = [];

        foreach ($products as $product) {
            $normalizedProducts[] = [
                'id' => $product->id,
                'name' => $this->normalizeProductName($product->name),
                'sku' => $this->normalizeString($product->sku ?? 'N/A'),
                'category' => $this->normalizeString($product->category->name ?? 'Uncategorized'),
                'brand' => $this->normalizeString($product->brand ?? 'No Brand'),
                'price' => $this->formatCurrency($product->price),
                'stock_quantity' => $product->stock_quantity ?? 0,
                'stock_status' => ucwords(str_replace('_', ' ', $product->stock_status ?? 'unknown')),
                'is_featured' => $product->is_featured ? 'Yes' : 'No',
                'is_active' => $product->is_active ? 'Yes' : 'No',
                'created_at' => $this->normalizeDate($product->created_at),
            ];
        }

        return $normalizedProducts;
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Report generation job failed permanently', [
            'report_type' => $this->reportType,
            'period' => $this->period,
            'error' => $exception->getMessage(),
        ]);
    }
}
