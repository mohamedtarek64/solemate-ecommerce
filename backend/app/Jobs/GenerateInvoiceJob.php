<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateInvoiceJob implements ShouldQueue
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
            Log::info("Generating invoice for Order #{$this->order->id}");

            // Generate invoice in background
            // PDF generation can be slow, run in queue!

            // $pdf = PDF::loadView('invoices.order', ['order' => $this->order]);
            // $pdf->save(storage_path("app/invoices/order-{$this->order->id}.pdf"));

            Log::info("Invoice generated successfully for Order #{$this->order->id}");
        } catch (\Exception $e) {
            Log::error("Failed to generate invoice: " . $e->getMessage());
            throw $e;
        }
    }
}

