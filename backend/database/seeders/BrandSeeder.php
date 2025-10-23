<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            ['name' => 'Nike', 'slug' => 'nike'],
            ['name' => 'Adidas', 'slug' => 'adidas'],
            ['name' => 'Puma', 'slug' => 'puma'],
            ['name' => 'Reebok', 'slug' => 'reebok'],
        ];

        foreach ($brands as $brand) {
            DB::table('brands')->updateOrInsert(
                ['slug' => $brand['slug']],
                array_merge($brand, ['created_at' => now(), 'updated_at' => now()])
            );
        }

        echo "Brands seeded successfully!\n";
    }
}
