<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        try {
            $productId = $request->get('product_id');
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 10);

            $query = DB::table('reviews')
                ->join('users', 'reviews.user_id', '=', 'users.id')
                ->select(
                    'reviews.id',
                    'reviews.product_id',
                    'reviews.user_id',
                    'reviews.rating',
                    'reviews.comment',
                    'reviews.is_verified',
                    'reviews.created_at',
                    'users.name as user_name'
                );

            if ($productId) {
                $query->where('reviews.product_id', $productId);
            }

            $reviews = $query->orderBy('reviews.created_at', 'desc')
                ->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data' => $reviews
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get reviews: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'product_id' => 'required|integer|exists:products,id',
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'nullable|string|max:1000'
            ]);

            $userId = $request->user()->id;
            $productId = $request->product_id;

            // Check if user already reviewed this product
            $existingReview = DB::table('reviews')
                ->where('user_id', $userId)
                ->where('product_id', $productId)
                ->first();

            if ($existingReview) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have already reviewed this product'
                ], 400);
            }

            $reviewId = DB::table('reviews')->insertGetId([
                'user_id' => $userId,
                'product_id' => $productId,
                'rating' => $request->rating,
                'comment' => $request->comment,
                'is_verified' => false,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'data' => ['id' => $reviewId],
                'message' => 'Review added successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add review: ' . $e->getMessage()
            ], 500);
        }
    }

    public function vote(Request $request, $reviewId)
    {
        try {
            $request->validate([
                'vote_type' => 'required|in:helpful,not_helpful'
            ]);

            $userId = $request->user()->id;
            $voteType = $request->vote_type;

            // Check if user already voted on this review
            $existingVote = DB::table('review_votes')
                ->where('user_id', $userId)
                ->where('review_id', $reviewId)
                ->first();

            if ($existingVote) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have already voted on this review'
                ], 400);
            }

            DB::table('review_votes')->insert([
                'user_id' => $userId,
                'review_id' => $reviewId,
                'vote_type' => $voteType,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Vote recorded successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to vote on review: ' . $e->getMessage()
            ], 500);
        }
    }
}
