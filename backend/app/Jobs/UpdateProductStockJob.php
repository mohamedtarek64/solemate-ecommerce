<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class UpdateProductStockJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $productId;
    protected $productTable;
    protected $quantity;

    /**
     * Create a new job instance.
     */
    public function __construct($productId, $productTable, $quantity)
    {
        $this->productId = $productId;
        $this->productTable = $productTable;
        $this->quantity = $quantity;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info("Updating stock for Product #{$this->productId} in {$this->productTable}");

            // Determine stock column name
            $stockColumn = DB::getSchemaBuilder()->hasColumn($this->productTable, 'stock_quantity') 
                ? 'stock_quantity' 
                : 'stock';

            // Update stock
            DB::table($this->productTable)
                ->where('id', $this->productId)
                ->decrement($stockColumn, $this->quantity);

            // Clear product cache
            $cacheKey = "product:{$this->productTable}:{$this->productId}";
            Cache::forget($cacheKey);
            Cache::forget("products_list:*");

            Log::info("Stock updated successfully for Product #{$this->productId}");
        } catch (\Exception $e) {
            Log::error("Failed to update product stock: " . $e->getMessage());
            throw $e;
        }
    }
}

