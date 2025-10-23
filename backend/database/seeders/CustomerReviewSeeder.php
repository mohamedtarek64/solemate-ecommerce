<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\CustomerReview;
use App\Models\Product;
use App\Models\User;

class CustomerReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $products = Product::all();
        $users = User::all();

        $reviews = [
            [
                'customer_name' => 'Ahmed Hassan',
                'customer_email' => 'ahmed.hassan@email.com',
                'rating' => 5,
                'review_text' => 'Amazing quality! The shoes are very comfortable and look exactly like the pictures. Fast shipping too.',
                'customer_location' => 'Cairo, Egypt',
                'is_verified_purchase' => true,
                'is_featured' => true
            ],
            [
                'customer_name' => 'Sarah Mohamed',
                'customer_email' => 'sarah.m@email.com',
                'rating' => 4,
                'review_text' => 'Great shoes, perfect fit. The material is high quality and they are very stylish.',
                'customer_location' => 'Alexandria, Egypt',
                'is_verified_purchase' => true,
                'is_featured' => true
            ],
            [
                'customer_name' => 'Omar Ali',
                'customer_email' => 'omar.ali@email.com',
                'rating' => 5,
                'review_text' => 'Excellent customer service and the shoes arrived in perfect condition. Highly recommended!',
                'customer_location' => 'Giza, Egypt',
                'is_verified_purchase' => true,
                'is_featured' => false
            ],
            [
                'customer_name' => 'Fatma Ibrahim',
                'customer_email' => 'fatma.i@email.com',
                'rating' => 4,
                'review_text' => 'Love the design and comfort. The sizing was accurate and the delivery was quick.',
                'customer_location' => 'Luxor, Egypt',
                'is_verified_purchase' => true,
                'is_featured' => true
            ],
            [
                'customer_name' => 'Mohamed Salah',
                'customer_email' => 'm.salah@email.com',
                'rating' => 5,
                'review_text' => 'Perfect shoes for daily wear. Comfortable, stylish, and durable. Will definitely buy again!',
                'customer_location' => 'Aswan, Egypt',
                'is_verified_purchase' => true,
                'is_featured' => true
            ],
            [
                'customer_name' => 'Nour El-Din',
                'customer_email' => 'nour.eldin@email.com',
                'rating' => 4,
                'review_text' => 'Good quality shoes with nice design. The price is reasonable for the quality.',
                'customer_location' => 'Port Said, Egypt',
                'is_verified_purchase' => false,
                'is_featured' => false
            ],
            [
                'customer_name' => 'Yasmine Farouk',
                'customer_email' => 'yasmine.f@email.com',
                'rating' => 5,
                'review_text' => 'Absolutely love these shoes! They are so comfortable and the style is perfect.',
                'customer_location' => 'Sharm El Sheikh, Egypt',
                'is_verified_purchase' => true,
                'is_featured' => true
            ],
            [
                'customer_name' => 'Khaled Mostafa',
                'customer_email' => 'khaled.m@email.com',
                'rating' => 3,
                'review_text' => 'Decent shoes but the sizing was a bit off. Otherwise, good quality.',
                'customer_location' => 'Hurghada, Egypt',
                'is_verified_purchase' => true,
                'is_featured' => false
            ],
            [
                'customer_name' => 'Dina Ashraf',
                'customer_email' => 'dina.ashraf@email.com',
                'rating' => 5,
                'review_text' => 'Fantastic shoes! Great quality, perfect fit, and beautiful design. Highly recommended!',
                'customer_location' => 'Mansoura, Egypt',
                'is_verified_purchase' => true,
                'is_featured' => true
            ],
            [
                'customer_name' => 'Tamer Hosny',
                'customer_email' => 'tamer.h@email.com',
                'rating' => 4,
                'review_text' => 'Very satisfied with my purchase. The shoes are comfortable and look great.',
                'customer_location' => 'Tanta, Egypt',
                'is_verified_purchase' => true,
                'is_featured' => false
            ],
            [
                'customer_name' => 'Rania Adel',
                'customer_email' => 'rania.adel@email.com',
                'rating' => 5,
                'review_text' => 'Excellent shoes! Perfect quality, fast delivery, and great customer service.',
                'customer_location' => 'Ismailia, Egypt',
                'is_verified_purchase' => true,
                'is_featured' => true
            ],
            [
                'customer_name' => 'Hassan Mahmoud',
                'customer_email' => 'hassan.m@email.com',
                'rating' => 4,
                'review_text' => 'Good shoes with nice design. The material quality is impressive.',
                'customer_location' => 'Zagazig, Egypt',
                'is_verified_purchase' => true,
                'is_featured' => false
            ],
            [
                'customer_name' => 'Mona Gamal',
                'customer_email' => 'mona.gamal@email.com',
                'rating' => 5,
                'review_text' => 'Love these shoes! They are very comfortable and stylish. Perfect for work.',
                'customer_location' => 'Suez, Egypt',
                'is_verified_purchase' => true,
                'is_featured' => true
            ],
            [
                'customer_name' => 'Amr El-Sayed',
                'customer_email' => 'amr.elsayed@email.com',
                'rating' => 4,
                'review_text' => 'Great shoes with good quality. The delivery was fast and packaging was perfect.',
                'customer_location' => 'Minya, Egypt',
                'is_verified_purchase' => true,
                'is_featured' => false
            ],
            [
                'customer_name' => 'Layla Hassan',
                'customer_email' => 'layla.hassan@email.com',
                'rating' => 5,
                'review_text' => 'Amazing shoes! Perfect fit, great quality, and beautiful design. Will buy again!',
                'customer_location' => 'Qena, Egypt',
                'is_verified_purchase' => true,
                'is_featured' => true
            ]
        ];

        // Create reviews for different products
        foreach ($products as $product) {
            // Get random reviews for each product (5-8 reviews per product)
            $productReviews = collect($reviews)->random(rand(5, 8));

            foreach ($productReviews as $reviewData) {
                CustomerReview::create([
                    'product_id' => $product->id,
                    'user_id' => $users->random()->id ?? null,
                    'customer_name' => $reviewData['customer_name'],
                    'customer_email' => $reviewData['customer_email'],
                    'rating' => $reviewData['rating'],
                    'review_text' => $reviewData['review_text'],
                    'customer_location' => $reviewData['customer_location'],
                    'is_verified_purchase' => $reviewData['is_verified_purchase'],
                    'is_featured' => $reviewData['is_featured'],
                    'created_at' => now()->subDays(rand(1, 90)),
                    'updated_at' => now()->subDays(rand(1, 90))
                ]);
            }
        }
    }
}
