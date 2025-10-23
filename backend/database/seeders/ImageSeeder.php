<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ImageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing images
        DB::table('images')->truncate();

        // Sample images data
        $images = [
            // Hero images
            [
                'image_url' => 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&h=600&fit=crop',
                'image_type' => 'hero',
                'title' => 'Premium Sneakers Hero',
                'alt_text' => 'Premium sneakers collection hero image',
                'sort_order' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Featured images
            [
                'image_url' => 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop',
                'image_type' => 'featured',
                'title' => 'Featured Sneaker 1',
                'alt_text' => 'Featured sneaker product 1',
                'sort_order' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'image_url' => 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=300&fit=crop',
                'image_type' => 'featured',
                'title' => 'Featured Sneaker 2',
                'alt_text' => 'Featured sneaker product 2',
                'sort_order' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'image_url' => 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop',
                'image_type' => 'featured',
                'title' => 'Featured Sneaker 3',
                'alt_text' => 'Featured sneaker product 3',
                'sort_order' => 3,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Category images
            [
                'image_url' => 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=200&fit=crop',
                'image_type' => 'category',
                'title' => 'Sports Category',
                'alt_text' => 'Sports category image',
                'sort_order' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'image_url' => 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&h=200&fit=crop',
                'image_type' => 'category',
                'title' => 'Casual Category',
                'alt_text' => 'Casual category image',
                'sort_order' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'image_url' => 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=200&fit=crop',
                'image_type' => 'category',
                'title' => 'Running Category',
                'alt_text' => 'Running category image',
                'sort_order' => 3,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'image_url' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop',
                'image_type' => 'category',
                'title' => 'Basketball Category',
                'alt_text' => 'Basketball category image',
                'sort_order' => 4,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Instagram images
            [
                'image_url' => 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=250&h=250&fit=crop',
                'image_type' => 'instagram',
                'title' => 'Instagram Post 1',
                'alt_text' => 'Instagram post image 1',
                'sort_order' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'image_url' => 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=250&h=250&fit=crop',
                'image_type' => 'instagram',
                'title' => 'Instagram Post 2',
                'alt_text' => 'Instagram post image 2',
                'sort_order' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'image_url' => 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=250&h=250&fit=crop',
                'image_type' => 'instagram',
                'title' => 'Instagram Post 3',
                'alt_text' => 'Instagram post image 3',
                'sort_order' => 3,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'image_url' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=250&h=250&fit=crop',
                'image_type' => 'instagram',
                'title' => 'Instagram Post 4',
                'alt_text' => 'Instagram post image 4',
                'sort_order' => 4,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Insert images
        DB::table('images')->insert($images);

        $this->command->info('Images seeded successfully!');
    }
}
