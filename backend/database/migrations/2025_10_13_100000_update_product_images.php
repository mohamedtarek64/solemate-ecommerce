<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update product images to use placeholder images
        $products = DB::table('products')->get();

        foreach ($products as $product) {
            $newImages = [];

            // Generate placeholder images based on product name
            $productName = str_replace(' ', '+', $product->name);
            $newImages[] = "https://via.placeholder.com/583x583/FF0000/FFFFFF?text=" . urlencode($productName);
            $newImages[] = "https://via.placeholder.com/583x583/0000FF/FFFFFF?text=" . urlencode($productName . "+2");

            DB::table('products')
                ->where('id', $product->id)
                ->update(['images' => json_encode($newImages)]);
        }
    }

    public function down(): void
    {
        // Revert to original images (if needed)
        // This is optional as we don't have the original images
    }
};
