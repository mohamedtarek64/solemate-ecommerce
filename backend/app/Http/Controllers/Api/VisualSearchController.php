<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class VisualSearchController extends Controller
{
    public function search(Request $request)
    {
        try {
            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:10240'
            ]);

            $userId = $request->user() ? $request->user()->id : null;
            $imageFile = $request->file('image');
            
            // Store the uploaded image
            $imagePath = $imageFile->store('visual-searches', 'public');
            
            // Generate search ID
            $searchId = 'VS-' . time() . '-' . rand(1000, 9999);
            
            // Store search record
            $searchRecordId = DB::table('visual_searches')->insertGetId([
                'user_id' => $userId,
                'search_id' => $searchId,
                'image_path' => $imagePath,
                'search_type' => 'upload',
                'status' => 'processing',
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Mock AI processing - in real implementation, this would call ML service
            $similarProducts = $this->findSimilarProducts($imagePath);

            // Update search record with results
            DB::table('visual_searches')
                ->where('id', $searchRecordId)
                ->update([
                    'status' => 'completed',
                    'results_data' => json_encode($similarProducts),
                    'updated_at' => now()
                ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'search_id' => $searchId,
                    'results' => $similarProducts,
                    'status' => 'completed'
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Visual search failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getResults(Request $request, $searchId)
    {
        try {
            $search = DB::table('visual_searches')
                ->where('search_id', $searchId)
                ->first();

            if (!$search) {
                return response()->json([
                    'success' => false,
                    'message' => 'Search not found'
                ], 404);
            }

            $results = json_decode($search->results_data, true) ?? [];

            return response()->json([
                'success' => true,
                'data' => [
                    'search_id' => $searchId,
                    'status' => $search->status,
                    'results' => $results,
                    'created_at' => $search->created_at
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get search results: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getSimilarProducts(Request $request, $productId)
    {
        try {
            $limit = $request->get('limit', 10);
            
            $product = DB::table('products')->where('id', $productId)->first();
            
            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            // Find similar products based on category and brand
            $similarProducts = DB::table('products')
                ->where('id', '!=', $productId)
                ->where('is_active', true)
                ->where(function($query) use ($product) {
                    $query->where('category', $product->category)
                          ->orWhere('brand', $product->brand);
                })
                ->limit($limit)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $similarProducts
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get similar products: ' . $e->getMessage()
            ], 500);
        }
    }

    private function findSimilarProducts($imagePath)
    {
        // Mock implementation - in real scenario, this would use ML/AI
        $products = DB::table('products')
            ->where('is_active', true)
            ->inRandomOrder()
            ->limit(8)
            ->get();

        return $products->map(function($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'price' => $product->price,
                'image_url' => $product->image_url,
                'category' => $product->category,
                'brand' => $product->brand,
                'similarity_score' => rand(70, 95) / 100
            ];
        });
    }
}