<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 60;
    public $tries = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $to,
        public string $subject,
        public string $template,
        public array $data = [],
        public string $fromEmail = null,
        public string $fromName = null
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $fromEmail = $this->fromEmail ?? config('mail.from.address');
            $fromName = $this->fromName ?? config('mail.from.name');

            Mail::send($this->template, $this->data, function ($message) use ($fromEmail, $fromName) {
                $message->to($this->to)
                       ->subject($this->subject)
                       ->from($fromEmail, $fromName);
            });

            Log::info('Email sent successfully', [
                'to' => $this->to,
                'subject' => $this->subject,
                'template' => $this->template,
            ]);
        } catch (\Exception $e) {
            Log::error('Email sending failed', [
                'to' => $this->to,
                'subject' => $this->subject,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Email job failed permanently', [
            'to' => $this->to,
            'subject' => $this->subject,
            'error' => $exception->getMessage(),
        ]);
    }
}
