<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserAddress extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'first_name',
        'last_name',
        'company',
        'address_line_1',
        'address_line_2',
        'city',
        'state',
        'postal_code',
        'country',
        'phone',
        'is_default',
        'is_billing',
        'is_shipping',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_billing' => 'boolean',
        'is_shipping' => 'boolean',
    ];

    /**
     * Get the user that owns the address.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for default addresses.
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Scope for billing addresses.
     */
    public function scopeBilling($query)
    {
        return $query->where('is_billing', true);
    }

    /**
     * Scope for shipping addresses.
     */
    public function scopeShipping($query)
    {
        return $query->where('is_shipping', true);
    }

    /**
     * Get full name.
     */
    public function getFullNameAttribute()
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    /**
     * Get full address.
     */
    public function getFullAddressAttribute()
    {
        $address = $this->address_line_1;
        if ($this->address_line_2) {
            $address .= ', ' . $this->address_line_2;
        }
        $address .= ', ' . $this->city . ', ' . $this->state . ' ' . $this->postal_code;
        if ($this->country) {
            $address .= ', ' . $this->country;
        }
        return $address;
    }

    /**
     * Set as default address.
     */
    public function setAsDefault()
    {
        // Remove default from other addresses of same type
        static::where('user_id', $this->user_id)
              ->where('type', $this->type)
              ->update(['is_default' => false]);
        
        // Set this as default
        $this->update(['is_default' => true]);
    }
}
