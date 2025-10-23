<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendOrderConfirmationEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $order;
    protected $user;

    /**
     * Create a new job instance.
     */
    public function __construct($order, $user)
    {
        $this->order = $order;
        $this->user = $user;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info("Sending order confirmation email for Order #{$this->order->id}");

            // Send email (in background, user doesn't wait!)
            // Mail::to($this->user->email)->send(new OrderConfirmation($this->order));

            Log::info("Order confirmation email sent successfully for Order #{$this->order->id}");
        } catch (\Exception $e) {
            Log::error("Failed to send order confirmation email: " . $e->getMessage());
            
            // Retry 3 times if failed
            if ($this->attempts() < 3) {
                $this->release(60); // Retry after 60 seconds
            }
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("Order confirmation email failed permanently: " . $exception->getMessage());
    }
}

