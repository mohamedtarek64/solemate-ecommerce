<?php

namespace App\Mail;

use App\Events\Cart\CartItemAdded;
use App\Events\Cart\CartItemUpdated;
use App\Events\Cart\CartItemRemoved;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Cart Notification Mail
 */
class CartNotification extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $event;
    public $actionType;
    public $subject;

    /**
     * Create a new message instance.
     */
    public function __construct(CartItemAdded|CartItemUpdated|CartItemRemoved $event)
    {
        $this->event = $event;
        $this->actionType = $this->getActionType($event);
        $this->subject = $this->getSubject();
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.cart-notification',
            with: [
                'event' => $this->event,
                'actionType' => $this->actionType,
                'userName' => $this->getUserName(),
            ]
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }

    /**
     * Get action type from event
     */
    private function getActionType($event): string
    {
        return match(get_class($event)) {
            CartItemAdded::class => 'added',
            CartItemUpdated::class => 'updated',
            CartItemRemoved::class => 'removed',
            default => 'modified'
        };
    }

    /**
     * Get email subject
     */
    private function getSubject(): string
    {
        return match($this->actionType) {
            'added' => 'Item Added to Your Cart - SoleMate',
            'updated' => 'Cart Item Updated - SoleMate',
            'removed' => 'Item Removed from Cart - SoleMate',
            default => 'Cart Update - SoleMate'
        };
    }

    /**
     * Get user name
     */
    private function getUserName(): string
    {
        try {
            $user = \DB::table('users')->where('id', $this->event->userId)->first();
            return $user->name ?? 'Valued Customer';
        } catch (\Exception $e) {
            return 'Valued Customer';
        }
    }
}
