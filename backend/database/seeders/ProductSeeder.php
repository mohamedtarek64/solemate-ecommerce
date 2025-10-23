<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'name' => 'Nike Air Max 270',
                'description' => 'High-performance running shoes with Air Max technology. Features responsive cushioning and breathable mesh upper for maximum comfort during long runs.',
                'price' => 129.99,
                'original_price' => 150.00,
                'discount_percentage' => 13,
                'material' => 'Mesh Upper, Rubber Sole',
                'care_instructions' => 'Clean with damp cloth, air dry',
                'origin' => 'Made in Vietnam',
                'images' => [
                    'https://via.placeholder.com/583x583/FF0000/FFFFFF?text=Nike+Air+Max',
                    'https://via.placeholder.com/583x583/0000FF/FFFFFF?text=Nike+Air+Max+2',
                    'https://via.placeholder.com/583x583/00FF00/FFFFFF?text=Nike+Air+Max+3'
                ],
                'colors' => [
                    ['name' => 'Black', 'color' => 'bg-gray-900'],
                    ['name' => 'White', 'color' => 'bg-white'],
                    ['name' => 'Red', 'color' => 'bg-red-600']
                ],
                'sizes' => ['37', '38', '39', '40', '41', '42', '43', '44', '45'],
                'slug' => 'nike-air-max-270'
            ],
            [
                'name' => 'Adidas Ultraboost 22',
                'description' => 'Revolutionary running shoes with Boost midsole technology. Provides exceptional energy return and comfort for every step.',
                'price' => 180.00,
                'original_price' => 200.00,
                'discount_percentage' => 10,
                'material' => 'Primeknit Upper, Boost Midsole',
                'care_instructions' => 'Machine wash cold, air dry',
                'origin' => 'Made in Germany',
                'images' => [
                    'https://via.placeholder.com/583x583/000000/FFFFFF?text=Adidas+Ultraboost',
                    'https://via.placeholder.com/583x583/333333/FFFFFF?text=Adidas+Ultraboost+2'
                ],
                'colors' => [
                    ['name' => 'Black', 'color' => 'bg-gray-900'],
                    ['name' => 'White', 'color' => 'bg-white'],
                    ['name' => 'Blue', 'color' => 'bg-blue-600']
                ],
                'sizes' => ['37', '38', '39', '40', '41', '42', '43', '44', '45'],
                'slug' => 'adidas-ultraboost-22'
            ],
            [
                'name' => 'Puma RS-X Reinvention',
                'description' => 'Bold and futuristic sneakers with chunky sole design. Features RS-X technology for superior comfort and style.',
                'price' => 110.00,
                'original_price' => null,
                'discount_percentage' => null,
                'material' => 'Textile Upper, Rubber Sole',
                'care_instructions' => 'Clean with damp cloth, air dry',
                'origin' => 'Made in China',
                'images' => [
                    'https://via.placeholder.com/583x583/FF6B35/FFFFFF?text=Puma+RS-X',
                    'https://via.placeholder.com/583x583/2C3E50/FFFFFF?text=Puma+RS-X+2'
                ],
                'colors' => [
                    ['name' => 'Black', 'color' => 'bg-gray-900'],
                    ['name' => 'White', 'color' => 'bg-white'],
                    ['name' => 'Pink', 'color' => 'bg-pink-400']
                ],
                'sizes' => ['37', '38', '39', '40', '41', '42', '43', '44', '45'],
                'slug' => 'puma-rs-x-reinvention'
            ],
            [
                'name' => 'Converse Chuck Taylor All Star',
                'description' => 'Classic canvas sneakers that never go out of style. Perfect for casual wear and everyday comfort.',
                'price' => 65.00,
                'original_price' => 80.00,
                'discount_percentage' => 19,
                'material' => 'Canvas Upper, Rubber Sole',
                'care_instructions' => 'Machine wash cold, air dry',
                'origin' => 'Made in USA',
                'images' => [
                    'https://via.placeholder.com/583x583/FFA500/FFFFFF?text=Converse+Chuck+Taylor',
                    'https://via.placeholder.com/583x583/800080/FFFFFF?text=Converse+Chuck+Taylor+2'
                ],
                'colors' => [
                    ['name' => 'Black', 'color' => 'bg-gray-900'],
                    ['name' => 'White', 'color' => 'bg-white'],
                    ['name' => 'Red', 'color' => 'bg-red-600']
                ],
                'sizes' => ['37', '38', '39', '40', '41', '42', '43', '44', '45'],
                'slug' => 'converse-chuck-taylor-all-star'
            ],
            [
                'name' => 'Vans Old Skool',
                'description' => 'Iconic skateboarding shoes with timeless design. Features durable canvas and suede construction.',
                'price' => 75.00,
                'original_price' => null,
                'discount_percentage' => null,
                'material' => 'Canvas and Suede Upper',
                'care_instructions' => 'Clean with damp cloth, air dry',
                'origin' => 'Made in USA',
                'images' => [
                    'https://via.placeholder.com/583x583/000000/FFFFFF?text=Vans+Old+Skool',
                    'https://via.placeholder.com/583x583/333333/FFFFFF?text=Vans+Old+Skool+2'
                ],
                'colors' => [
                    ['name' => 'Black', 'color' => 'bg-gray-900'],
                    ['name' => 'White', 'color' => 'bg-white'],
                    ['name' => 'Navy', 'color' => 'bg-blue-900']
                ],
                'sizes' => ['37', '38', '39', '40', '41', '42', '43', '44', '45'],
                'slug' => 'vans-old-skool'
            ]
        ];

        foreach ($products as $productData) {
            $productData['sku'] = 'SKU-' . strtoupper(Str::random(8));
            $productData['category_id'] = 1; // Default category
            $productData['brand_id'] = null; // No brand constraint
            $productData['status'] = 'active';
            $productData['featured'] = rand(0, 1) == 1;
            $productData['is_active'] = true;
            $productData['is_featured'] = rand(0, 1) == 1;
            $productData['category'] = ['men', 'women', 'kids'][rand(0, 2)];
            $productData['brand'] = ['Nike', 'Adidas', 'Puma', 'Converse', 'Vans'][rand(0, 4)];
            $productData['created_at'] = now();
            $productData['updated_at'] = now();

            Product::create($productData);
        }
    }
}
