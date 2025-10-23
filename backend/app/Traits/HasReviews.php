<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

trait HasReviews
{
    /**
     * Get all reviews for the model.
     */
    public function reviews(): MorphMany
    {
        return $this->morphMany(\App\Models\Review::class, 'reviewable');
    }

    /**
     * Get approved reviews.
     */
    public function approvedReviews(): MorphMany
    {
        return $this->reviews()->where('is_approved', true);
    }

    /**
     * Get pending reviews.
     */
    public function pendingReviews(): MorphMany
    {
        return $this->reviews()->where('is_approved', false);
    }

    /**
     * Get verified purchase reviews.
     */
    public function verifiedReviews(): MorphMany
    {
        return $this->approvedReviews()->where('is_verified_purchase', true);
    }

    /**
     * Get average rating.
     */
    public function getAverageRatingAttribute(): float
    {
        return $this->approvedReviews()->avg('rating') ?? 0;
    }

    /**
     * Get total reviews count.
     */
    public function getTotalReviewsAttribute(): int
    {
        return $this->approvedReviews()->count();
    }

    /**
     * Get rating distribution.
     */
    public function getRatingDistributionAttribute(): array
    {
        $distribution = [];
        
        for ($i = 1; $i <= 5; $i++) {
            $count = $this->approvedReviews()->where('rating', $i)->count();
            $percentage = $this->total_reviews > 0 ? ($count / $this->total_reviews) * 100 : 0;
            
            $distribution[$i] = [
                'count' => $count,
                'percentage' => round($percentage, 1),
            ];
        }
        
        return $distribution;
    }

    /**
     * Add a review.
     */
    public function addReview(array $data): \App\Models\Review
    {
        return $this->reviews()->create($data);
    }

    /**
     * Check if user has reviewed this item.
     */
    public function hasUserReviewed(int $userId): bool
    {
        return $this->reviews()->where('user_id', $userId)->exists();
    }

    /**
     * Get user's review.
     */
    public function getUserReview(int $userId): ?\App\Models\Review
    {
        return $this->reviews()->where('user_id', $userId)->first();
    }

    /**
     * Get recent reviews.
     */
    public function getRecentReviews(int $limit = 5)
    {
        return $this->approvedReviews()
                   ->with(['user'])
                   ->orderBy('created_at', 'desc')
                   ->limit($limit)
                   ->get();
    }

    /**
     * Get top reviews (highest rated).
     */
    public function getTopReviews(int $limit = 5)
    {
        return $this->approvedReviews()
                   ->with(['user'])
                   ->orderBy('rating', 'desc')
                   ->orderBy('created_at', 'desc')
                   ->limit($limit)
                   ->get();
    }

    /**
     * Get reviews by rating.
     */
    public function getReviewsByRating(int $rating, int $limit = 10)
    {
        return $this->approvedReviews()
                   ->where('rating', $rating)
                   ->with(['user'])
                   ->orderBy('created_at', 'desc')
                   ->limit($limit)
                   ->get();
    }

    /**
     * Calculate rating percentage.
     */
    public function getRatingPercentage(int $rating): float
    {
        $count = $this->approvedReviews()->where('rating', $rating)->count();
        return $this->total_reviews > 0 ? ($count / $this->total_reviews) * 100 : 0;
    }

    /**
     * Get rating stars HTML.
     */
    public function getRatingStarsAttribute(): string
    {
        $rating = $this->average_rating;
        $stars = '';
        
        for ($i = 1; $i <= 5; $i++) {
            if ($i <= $rating) {
                $stars .= '<i class="fas fa-star text-yellow-400"></i>';
            } elseif ($i - 0.5 <= $rating) {
                $stars .= '<i class="fas fa-star-half-alt text-yellow-400"></i>';
            } else {
                $stars .= '<i class="far fa-star text-gray-300"></i>';
            }
        }
        
        return $stars;
    }

    /**
     * Get rating summary.
     */
    public function getRatingSummaryAttribute(): array
    {
        return [
            'average_rating' => round($this->average_rating, 1),
            'total_reviews' => $this->total_reviews,
            'rating_distribution' => $this->rating_distribution,
            'stars_html' => $this->rating_stars,
        ];
    }

    /**
     * Scope models with reviews.
     */
    public function scopeWithReviews($query)
    {
        return $query->has('reviews');
    }

    /**
     * Scope models with approved reviews.
     */
    public function scopeWithApprovedReviews($query)
    {
        return $query->whereHas('reviews', function ($q) {
            $q->where('is_approved', true);
        });
    }

    /**
     * Scope models by minimum rating.
     */
    public function scopeWithMinimumRating($query, float $rating)
    {
        return $query->whereHas('reviews', function ($q) use ($rating) {
            $q->where('is_approved', true)
              ->havingRaw('AVG(rating) >= ?', [$rating]);
        });
    }

    /**
     * Scope models by rating range.
     */
    public function scopeWithRatingRange($query, float $minRating, float $maxRating)
    {
        return $query->whereHas('reviews', function ($q) use ($minRating, $maxRating) {
            $q->where('is_approved', true)
              ->havingRaw('AVG(rating) BETWEEN ? AND ?', [$minRating, $maxRating]);
        });
    }

    /**
     * Scope models with verified reviews.
     */
    public function scopeWithVerifiedReviews($query)
    {
        return $query->whereHas('reviews', function ($q) {
            $q->where('is_verified_purchase', true);
        });
    }

    /**
     * Scope models without reviews.
     */
    public function scopeWithoutReviews($query)
    {
        return $query->doesntHave('reviews');
    }

    /**
     * Get review statistics.
     */
    public function getReviewStats(): array
    {
        $reviews = $this->approvedReviews();
        
        return [
            'total_reviews' => $reviews->count(),
            'average_rating' => round($reviews->avg('rating') ?? 0, 1),
            'verified_reviews' => $reviews->where('is_verified_purchase', true)->count(),
            'rating_distribution' => $this->rating_distribution,
            'recent_reviews_count' => $reviews->where('created_at', '>=', now()->subDays(30))->count(),
        ];
    }
}
