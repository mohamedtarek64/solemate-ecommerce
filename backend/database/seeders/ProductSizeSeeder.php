<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ProductSize;
use App\Models\Product;

class ProductSizeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $products = Product::all();

        // Define shoe sizes only (no clothing sizes)
        $shoeSizes = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];

        foreach ($products as $product) {
            // All products are shoes, so use shoe sizes
            $sizes = $shoeSizes;

            // Create 5-8 random sizes for each product
            $productSizes = collect($sizes)->random(rand(5, 8));

            foreach ($productSizes as $size) {
                ProductSize::create([
                    'product_id' => $product->id,
                    'size' => $size,
                    'stock_quantity' => rand(0, 50),
                    'is_available' => rand(0, 1) == 1, // Random availability
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }
    }
}
