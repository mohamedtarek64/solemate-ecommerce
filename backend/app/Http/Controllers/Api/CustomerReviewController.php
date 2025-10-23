<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CustomerReview;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class CustomerReviewController extends Controller
{
    /**
     * Get random customer reviews for homepage
     */
    public function getRandomReviews(Request $request)
    {
        try {
            $limit = $request->get('limit', 10);

            // Get random featured reviews from different products
            $reviews = CustomerReview::with(['product:id,name,images'])
                ->featured()
                ->inRandomOrder()
                ->limit($limit)
                ->get();

            // If we don't have enough featured reviews, get regular reviews
            if ($reviews->count() < $limit) {
                $remainingLimit = $limit - $reviews->count();
                $additionalReviews = CustomerReview::with(['product:id,name,images'])
                    ->where('is_featured', false)
                    ->inRandomOrder()
                    ->limit($remainingLimit)
                    ->get();

                $reviews = $reviews->merge($additionalReviews);
            }

            return response()->json([
                'success' => true,
                'data' => $reviews->map(function ($review) {
                    return [
                        'id' => $review->id,
                        'customer_name' => $review->customer_name,
                        'rating' => $review->rating,
                        'review_text' => $review->review_text,
                        'customer_location' => $review->customer_location,
                        'is_verified_purchase' => $review->is_verified_purchase,
                        'is_featured' => $review->is_featured,
                        'product_name' => $review->product->name,
                        'product_image' => $review->product->images[0] ?? null,
                        'created_at' => $review->created_at->format('M d, Y')
                    ];
                })
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch reviews: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get reviews for a specific product
     */
    public function getProductReviews(Request $request, $productId)
    {
        try {
            $product = Product::find($productId);

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            $reviews = CustomerReview::where('product_id', $productId)
                ->orderBy('is_featured', 'desc')
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => [
                    'product' => [
                        'id' => $product->id,
                        'name' => $product->name,
                        'average_rating' => $reviews->avg('rating'),
                        'total_reviews' => $reviews->total(),
                        'rating_distribution' => $this->getRatingDistribution($productId)
                    ],
                    'reviews' => $reviews->items(),
                    'pagination' => [
                        'current_page' => $reviews->currentPage(),
                        'last_page' => $reviews->lastPage(),
                        'per_page' => $reviews->perPage(),
                        'total' => $reviews->total()
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch product reviews: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get rating distribution for a product
     */
    private function getRatingDistribution($productId)
    {
        $distribution = CustomerReview::where('product_id', $productId)
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->toArray();

        $result = [];
        for ($i = 1; $i <= 5; $i++) {
            $result["{$i}_star"] = $distribution[$i] ?? 0;
        }

        return $result;
    }

    /**
     * Get reviews statistics
     */
    public function getReviewsStats()
    {
        try {
            $stats = DB::table('customer_reviews')
                ->selectRaw('
                    COUNT(*) as total_reviews,
                    AVG(rating) as average_rating,
                    COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
                    COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
                    COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
                    COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
                    COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star,
                    COUNT(CASE WHEN is_verified_purchase = 1 THEN 1 END) as verified_reviews
                ')
                ->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_reviews' => (int) $stats->total_reviews,
                    'average_rating' => round($stats->average_rating, 1),
                    'rating_distribution' => [
                        '5_star' => (int) $stats->five_star,
                        '4_star' => (int) $stats->four_star,
                        '3_star' => (int) $stats->three_star,
                        '2_star' => (int) $stats->two_star,
                        '1_star' => (int) $stats->one_star
                    ],
                    'verified_reviews' => (int) $stats->verified_reviews
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch reviews statistics: ' . $e->getMessage()
            ], 500);
        }
    }
}
