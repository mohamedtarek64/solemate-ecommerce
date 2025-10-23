<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ImageController extends Controller
{
    /**
     * Get images by type from database
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getImages(Request $request): JsonResponse
    {
        try {
            // Validate request
            $validator = Validator::make($request->all(), [
                'type' => 'required|string|in:hero,featured,category,instagram,product,banner,logo'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid image type',
                    'errors' => $validator->errors()
                ], 400);
            }

            $type = $request->input('type');

            // Get images from database
            $images = DB::table('images')
                ->where('image_type', $type)
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(['id', 'image_url', 'title', 'alt_text', 'sort_order']);

            return response()->json([
                'success' => true,
                'message' => 'Images retrieved successfully',
                'images' => $images,
                'count' => $images->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve images',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all images (for admin or debugging)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getAllImages(Request $request): JsonResponse
    {
        try {
            // Get all images from database
            $images = DB::table('images')
                ->where('is_active', true)
                ->orderBy('image_type')
                ->orderBy('sort_order')
                ->get(['id', 'image_url', 'image_type', 'title', 'alt_text', 'sort_order', 'created_at']);

            return response()->json([
                'success' => true,
                'message' => 'All images retrieved successfully',
                'images' => $images,
                'count' => $images->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve all images',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get hero image specifically
     *
     * @return JsonResponse
     */
    public function getHeroImage(): JsonResponse
    {
        try {
            $heroImage = DB::table('images')
                ->where('image_type', 'hero')
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->first(['image_url', 'title', 'alt_text']);

            if (!$heroImage) {
                return response()->json([
                    'success' => false,
                    'message' => 'No hero image found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Hero image retrieved successfully',
                'image_url' => $heroImage->image_url,
                'title' => $heroImage->title,
                'alt_text' => $heroImage->alt_text
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve hero image',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get featured images specifically
     *
     * @return JsonResponse
     */
    public function getFeaturedImages(): JsonResponse
    {
        try {
            $featuredImages = DB::table('images')
                ->where('image_type', 'featured')
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(['image_url', 'title', 'alt_text']);

            return response()->json([
                'success' => true,
                'message' => 'Featured images retrieved successfully',
                'images' => $featuredImages,
                'count' => $featuredImages->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve featured images',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get category images specifically
     *
     * @return JsonResponse
     */
    public function getCategoryImages(): JsonResponse
    {
        try {
            $categoryImages = DB::table('images')
                ->where('image_type', 'category')
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(['image_url', 'title', 'alt_text']);

            return response()->json([
                'success' => true,
                'message' => 'Category images retrieved successfully',
                'images' => $categoryImages,
                'count' => $categoryImages->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve category images',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get instagram images specifically
     *
     * @return JsonResponse
     */
    public function getInstagramImages(): JsonResponse
    {
        try {
            $instagramImages = DB::table('images')
                ->where('image_type', 'instagram')
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(['image_url', 'title', 'alt_text']);

            return response()->json([
                'success' => true,
                'message' => 'Instagram images retrieved successfully',
                'images' => $instagramImages,
                'count' => $instagramImages->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve instagram images',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
