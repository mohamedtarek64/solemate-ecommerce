<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class DiscountCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'type',
        'value',
        'minimum_amount',
        'usage_limit',
        'used_count',
        'starts_at',
        'expires_at',
        'is_active',
        'applicable_products',
        'applicable_categories'
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
        'applicable_products' => 'array',
        'applicable_categories' => 'array',
        'value' => 'decimal:2',
        'minimum_amount' => 'decimal:2'
    ];

    /**
     * Check if the discount code is valid
     */
    public function isValid(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $now = Carbon::now();

        // Check if code has started
        if ($this->starts_at && $now->lt($this->starts_at)) {
            return false;
        }

        // Check if code has expired
        if ($this->expires_at && $now->gt($this->expires_at)) {
            return false;
        }

        // Check usage limit
        if ($this->usage_limit && $this->used_count >= $this->usage_limit) {
            return false;
        }

        return true;
    }

    /**
     * Check if code applies to specific products
     */
    public function appliesToProducts(array $productIds): bool
    {
        if (empty($this->applicable_products)) {
            return true; // Applies to all products
        }

        return !empty(array_intersect($productIds, $this->applicable_products));
    }

    /**
     * Check if code applies to specific categories
     */
    public function appliesToCategories(array $categoryIds): bool
    {
        if (empty($this->applicable_categories)) {
            return true; // Applies to all categories
        }

        return !empty(array_intersect($categoryIds, $this->applicable_categories));
    }

    /**
     * Calculate discount amount
     */
    public function calculateDiscount(float $totalAmount, array $productIds = [], array $categoryIds = []): float
    {
        if (!$this->isValid()) {
            return 0;
        }

        // Check minimum amount
        if ($this->minimum_amount && $totalAmount < $this->minimum_amount) {
            return 0;
        }

        // Check product/category restrictions
        if (!$this->appliesToProducts($productIds) || !$this->appliesToCategories($categoryIds)) {
            return 0;
        }

        $discountAmount = 0;

        if ($this->type === 'percentage') {
            $discountAmount = ($totalAmount * $this->value) / 100;
            // Round to 2 decimal places
            $discountAmount = round($discountAmount, 2);
        } else {
            // Fixed amount discount
            $discountAmount = min($this->value, $totalAmount); // Can't discount more than total
            $discountAmount = round($discountAmount, 2);
        }

        // Ensure discount is not negative
        return max(0, $discountAmount);
    }

    /**
     * Increment usage count
     */
    public function incrementUsage(): void
    {
        $this->increment('used_count');
    }

    /**
     * Scope for active codes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for valid codes
     */
    public function scopeValid($query)
    {
        $now = Carbon::now();
        return $query->where('is_active', true)
                    ->where(function($q) use ($now) {
                        $q->whereNull('starts_at')
                          ->orWhere('starts_at', '<=', $now);
                    })
                    ->where(function($q) use ($now) {
                        $q->whereNull('expires_at')
                          ->orWhere('expires_at', '>=', $now);
                    });
    }
}
