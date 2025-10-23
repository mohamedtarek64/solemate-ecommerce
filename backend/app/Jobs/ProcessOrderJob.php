<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessOrderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $order;

    /**
     * Create a new job instance.
     */
    public function __construct($order)
    {
        $this->order = $order;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info("Processing order: {$this->order->id}");

            // Process order (email, notifications, inventory update, etc.)
            // This runs in background, user doesn't wait!

            // Send confirmation email
            // Update inventory
            // Generate invoice
            // Send notifications

            Log::info("Order {$this->order->id} processed successfully");
        } catch (\Exception $e) {
            Log::error("Failed to process order {$this->order->id}: " . $e->getMessage());
            throw $e;
        }
    }
}
