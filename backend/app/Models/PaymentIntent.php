<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentIntent extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_id',
        'stripe_payment_intent_id',
        'amount',
        'currency',
        'status',
        'client_secret',
        'payment_method',
        'metadata',
        'confirmation_method',
        'capture_method',
        'receipt_email',
        'description',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'metadata' => 'array',
    ];

    /**
     * Get the user that owns the payment intent.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the order for the payment intent.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Scope for successful payments.
     */
    public function scopeSuccessful($query)
    {
        return $query->where('status', 'succeeded');
    }

    /**
     * Scope for pending payments.
     */
    public function scopePending($query)
    {
        return $query->whereIn('status', ['requires_payment_method', 'requires_confirmation', 'requires_action']);
    }

    /**
     * Scope for failed payments.
     */
    public function scopeFailed($query)
    {
        return $query->whereIn('status', ['canceled', 'payment_failed']);
    }

    /**
     * Check if payment is successful.
     */
    public function isSuccessful()
    {
        return $this->status === 'succeeded';
    }

    /**
     * Check if payment is pending.
     */
    public function isPending()
    {
        return in_array($this->status, ['requires_payment_method', 'requires_confirmation', 'requires_action']);
    }

    /**
     * Check if payment failed.
     */
    public function isFailed()
    {
        return in_array($this->status, ['canceled', 'payment_failed']);
    }
}
