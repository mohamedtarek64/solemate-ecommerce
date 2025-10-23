<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ImageController extends Controller
{
    public function getImagesByCategory(Request $request, $category)
    {
        try {
            $images = DB::table('images')
                ->where('category', $category)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $images
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get images: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getAllImages(Request $request)
    {
        try {
            $images = DB::table('images')->get();

            return response()->json([
                'success' => true,
                'data' => $images
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get images: ' . $e->getMessage()
            ], 500);
        }
    }

    public function uploadImage(Request $request)
    {
        try {
            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
                'category' => 'required|string'
            ]);

            $imagePath = $request->file('image')->store('images', 'public');
            
            $imageId = DB::table('images')->insertGetId([
                'filename' => $imagePath,
                'category' => $request->category,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $imageId,
                    'path' => $imagePath
                ],
                'message' => 'Image uploaded successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload image: ' . $e->getMessage()
            ], 500);
        }
    }
}

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ImageController extends Controller
{
    public function getImagesByCategory(Request $request, $category)
    {
        try {
            $images = DB::table('images')
                ->where('category', $category)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $images
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get images: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getAllImages(Request $request)
    {
        try {
            $images = DB::table('images')->get();

            return response()->json([
                'success' => true,
                'data' => $images
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get images: ' . $e->getMessage()
            ], 500);
        }
    }

    public function uploadImage(Request $request)
    {
        try {
            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
                'category' => 'required|string'
            ]);

            $imagePath = $request->file('image')->store('images', 'public');
            
            $imageId = DB::table('images')->insertGetId([
                'filename' => $imagePath,
                'category' => $request->category,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $imageId,
                    'path' => $imagePath
                ],
                'message' => 'Image uploaded successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload image: ' . $e->getMessage()
            ], 500);
        }
    }
}

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ImageController extends Controller
{
    public function getImagesByCategory(Request $request, $category)
    {
        try {
            $images = DB::table('images')
                ->where('category', $category)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $images
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get images: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getAllImages(Request $request)
    {
        try {
            $images = DB::table('images')->get();

            return response()->json([
                'success' => true,
                'data' => $images
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get images: ' . $e->getMessage()
            ], 500);
        }
    }

    public function uploadImage(Request $request)
    {
        try {
            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
                'category' => 'required|string'
            ]);

            $imagePath = $request->file('image')->store('images', 'public');
            
            $imageId = DB::table('images')->insertGetId([
                'filename' => $imagePath,
                'category' => $request->category,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $imageId,
                    'path' => $imagePath
                ],
                'message' => 'Image uploaded successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload image: ' . $e->getMessage()
            ], 500);
        }
    }
}

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ImageController extends Controller
{
    public function getImagesByCategory(Request $request, $category)
    {
        try {
            $images = DB::table('images')
                ->where('category', $category)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $images
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get images: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getAllImages(Request $request)
    {
        try {
            $images = DB::table('images')->get();

            return response()->json([
                'success' => true,
                'data' => $images
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get images: ' . $e->getMessage()
            ], 500);
        }
    }

    public function uploadImage(Request $request)
    {
        try {
            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
                'category' => 'required|string'
            ]);

            $imagePath = $request->file('image')->store('images', 'public');
            
            $imageId = DB::table('images')->insertGetId([
                'filename' => $imagePath,
                'category' => $request->category,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $imageId,
                    'path' => $imagePath
                ],
                'message' => 'Image uploaded successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload image: ' . $e->getMessage()
            ], 500);
        }
    }
}

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ImageController extends Controller
{
    public function getImagesByCategory(Request $request, $category)
    {
        try {
            $images = DB::table('images')
                ->where('category', $category)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $images
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get images: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getAllImages(Request $request)
    {
        try {
            $images = DB::table('images')->get();

            return response()->json([
                'success' => true,
                'data' => $images
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get images: ' . $e->getMessage()
            ], 500);
        }
    }

    public function uploadImage(Request $request)
    {
        try {
            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
                'category' => 'required|string'
            ]);

            $imagePath = $request->file('image')->store('images', 'public');
            
            $imageId = DB::table('images')->insertGetId([
                'filename' => $imagePath,
                'category' => $request->category,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $imageId,
                    'path' => $imagePath
                ],
                'message' => 'Image uploaded successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload image: ' . $e->getMessage()
            ], 500);
        }
    }
}
