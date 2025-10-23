<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'user_id',
        'customer_name',
        'customer_email',
        'rating',
        'review_text',
        'customer_location',
        'is_verified_purchase',
        'is_featured',
        'images'
    ];

    protected $casts = [
        'is_verified_purchase' => 'boolean',
        'is_featured' => 'boolean',
        'images' => 'array',
        'rating' => 'integer'
    ];

    /**
     * Get the product that owns the review.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the user that owns the review.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get featured reviews
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope to get verified purchase reviews
     */
    public function scopeVerified($query)
    {
        return $query->where('is_verified_purchase', true);
    }

    /**
     * Scope to get reviews by rating
     */
    public function scopeByRating($query, $rating)
    {
        return $query->where('rating', $rating);
    }
}
