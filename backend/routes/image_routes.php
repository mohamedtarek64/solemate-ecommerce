<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ImageController;

/*
|--------------------------------------------------------------------------
| Image API Routes
|--------------------------------------------------------------------------
|
| These routes handle all image-related API endpoints
| All routes require authentication token
|
*/

Route::middleware(['auth:sanctum'])->group(function () {

    // Get images by type (general endpoint)
    Route::get('/images', [ImageController::class, 'getImages'])
        ->name('images.get');

    // Get all images (for admin or debugging)
    Route::get('/images/all', [ImageController::class, 'getAllImages'])
        ->name('images.all');

    // Specific image type endpoints
    Route::get('/images/hero', [ImageController::class, 'getHeroImage'])
        ->name('images.hero');

    Route::get('/images/featured', [ImageController::class, 'getFeaturedImages'])
        ->name('images.featured');

    Route::get('/images/categories', [ImageController::class, 'getCategoryImages'])
        ->name('images.categories');

    Route::get('/images/instagram', [ImageController::class, 'getInstagramImages'])
        ->name('images.instagram');
});

/*
|--------------------------------------------------------------------------
| Public Image Routes (if needed)
|--------------------------------------------------------------------------
|
| These routes don't require authentication
| Use with caution - only for public images
|
*/

// Public hero image (no auth required)
Route::get('/public/images/hero', [ImageController::class, 'getHeroImage'])
    ->name('public.images.hero');

// Public featured images (no auth required)
Route::get('/public/images/featured', [ImageController::class, 'getFeaturedImages'])
    ->name('public.images.featured');
