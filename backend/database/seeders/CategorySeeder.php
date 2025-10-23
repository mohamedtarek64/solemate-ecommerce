<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Men', 'slug' => 'men', 'description' => 'Men Category'],
            ['name' => 'Women', 'slug' => 'women', 'description' => 'Women Category'],
            ['name' => 'Kids', 'slug' => 'kids', 'description' => 'Kids Category'],
        ];

        foreach ($categories as $category) {
            DB::table('categories')->updateOrInsert(
                ['slug' => $category['slug']],
                array_merge($category, ['created_at' => now(), 'updated_at' => now()])
            );
        }

        echo "Categories seeded successfully!\n";
    }
}
