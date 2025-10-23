<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentMethod extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'stripe_payment_method_id',
        'type',
        'card_brand',
        'card_last_four',
        'card_exp_month',
        'card_exp_year',
        'is_default',
        'metadata',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'card_exp_month' => 'integer',
        'card_exp_year' => 'integer',
        'metadata' => 'array',
    ];

    /**
     * Get the user that owns the payment method.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for default payment methods.
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Scope for card payment methods.
     */
    public function scopeCard($query)
    {
        return $query->where('type', 'card');
    }

    /**
     * Set as default payment method.
     */
    public function setAsDefault()
    {
        // Remove default from other payment methods
        static::where('user_id', $this->user_id)->update(['is_default' => false]);
        
        // Set this as default
        $this->update(['is_default' => true]);
    }

    /**
     * Get masked card number.
     */
    public function getMaskedCardNumberAttribute()
    {
        return "**** **** **** {$this->card_last_four}";
    }

    /**
     * Check if card is expired.
     */
    public function isExpired()
    {
        $now = now();
        return $this->card_exp_year < $now->year || 
               ($this->card_exp_year == $now->year && $this->card_exp_month < $now->month);
    }
}
