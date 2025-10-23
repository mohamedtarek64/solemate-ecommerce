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
 * Cart Item Removed Event
 */
class CartItemRemoved implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $cartItemId;
    public int $userId;
    public array $metadata;

    /**
     * Create a new event instance.
     */
    public function __construct(int $cartItemId, int $userId, array $metadata = [])
    {
        $this->cartItemId = $cartItemId;
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
        return 'cart.item.removed';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'cart_item_id' => $this->cartItemId,
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
}
