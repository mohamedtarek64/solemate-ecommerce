<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DiscountCodeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $discountCodes = [
            [
                'code' => 'WELCOME10',
                'name' => 'Welcome Discount',
                'description' => '10% off for new customers',
                'type' => 'percentage',
                'value' => 10.00,
                'minimum_amount' => 50.00,
                'usage_limit' => 1000,
                'used_count' => 0,
                'starts_at' => now(),
                'expires_at' => now()->addMonths(3),
                'is_active' => true,
                'applicable_products' => null,
                'applicable_categories' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'SAVE20',
                'name' => 'Save $20',
                'description' => '$20 off on orders over $100',
                'type' => 'fixed',
                'value' => 20.00,
                'minimum_amount' => 100.00,
                'usage_limit' => 500,
                'used_count' => 0,
                'starts_at' => now(),
                'expires_at' => now()->addMonths(2),
                'is_active' => true,
                'applicable_products' => null,
                'applicable_categories' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'FLASH50',
                'name' => 'Flash Sale',
                'description' => '50% off everything - limited time!',
                'type' => 'percentage',
                'value' => 50.00,
                'minimum_amount' => null,
                'usage_limit' => 100,
                'used_count' => 0,
                'starts_at' => now(),
                'expires_at' => now()->addDays(7),
                'is_active' => true,
                'applicable_products' => null,
                'applicable_categories' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'NEWUSER',
                'name' => 'New User Special',
                'description' => '25% off for first-time customers',
                'type' => 'percentage',
                'value' => 25.00,
                'minimum_amount' => 30.00,
                'usage_limit' => 2000,
                'used_count' => 0,
                'starts_at' => now(),
                'expires_at' => now()->addMonths(6),
                'is_active' => true,
                'applicable_products' => null,
                'applicable_categories' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($discountCodes as $code) {
            DB::table('discount_codes')->insert($code);
        }

        $this->command->info('Discount codes seeded successfully!');
    }
}
