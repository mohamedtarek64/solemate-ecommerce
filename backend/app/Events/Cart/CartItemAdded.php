<?php

namespace App\Events\Cart;

use App\DTOs\CartItemDTO;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Cart Item Added Event
 */
class CartItemAdded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public CartItemDTO $cartItem;
    public int $userId;
    public array $metadata;

    /**
     * Create a new event instance.
     */
    public function __construct(CartItemDTO $cartItem, int $userId, array $metadata = [])
    {
        $this->cartItem = $cartItem;
        $this->userId = $userId;
        $this->metadata = $metadata;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->userId),
            new Channel('cart-updates'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'cart.item.added';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'cart_item' => $this->cartItem->toArray(),
            'user_id' => $this->userId,
            'timestamp' => now()->toISOString(),
            'metadata' => $this->metadata,
        ];
    }

    /**
     * Determine if this event should be queued.
     */
    public function shouldQueue(): bool
    {
        return true;
    }

    /**
     * Get the queue connection to use.
     */
    public function viaConnection(): string
    {
        return 'redis';
    }

    /**
     * Get the queue name to use.
     */
    public function viaQueue(): string
    {
        return 'events';
    }
}
