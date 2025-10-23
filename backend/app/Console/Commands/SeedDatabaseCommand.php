<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SeedDatabaseCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:seed-custom {--fresh} {--force}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed the database with custom data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if ($this->option('fresh')) {
            $this->info('Fresh seeding database...');
            $this->call('migrate:fresh');
        }

        $this->info('Seeding database...');

        try {
            DB::beginTransaction();

            // Seed users
            $this->seedUsers();

            // Seed categories
            $this->seedCategories();

            // Seed products
            $this->seedProducts();

            // Seed orders
            $this->seedOrders();

            DB::commit();

            $this->info('Database seeded successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Seeding failed: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }

    /**
     * Seed users.
     */
    protected function seedUsers(): void
    {
        $this->info('Seeding users...');

        $users = [
            [
                'name' => 'Admin User',
                'email' => 'admin@solemate.com',
                'password' => bcrypt('password'),
                'is_admin' => true,
                'is_active' => true,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'password' => bcrypt('password'),
                'is_admin' => false,
                'is_active' => true,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'jane@example.com',
                'password' => bcrypt('password'),
                'is_admin' => false,
                'is_active' => true,
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $user) {
            \App\Models\User::firstOrCreate(
                ['email' => $user['email']],
                $user
            );
        }

        $this->info('Users seeded successfully!');
    }

    /**
     * Seed categories.
     */
    protected function seedCategories(): void
    {
        $this->info('Seeding categories...');

        $categories = [
            [
                'name' => 'Sneakers',
                'slug' => 'sneakers',
                'description' => 'Comfortable and stylish sneakers for everyday wear',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Boots',
                'slug' => 'boots',
                'description' => 'Durable boots for outdoor activities',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Sandals',
                'slug' => 'sandals',
                'description' => 'Lightweight sandals for summer',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Dress Shoes',
                'slug' => 'dress-shoes',
                'description' => 'Elegant dress shoes for formal occasions',
                'is_active' => true,
                'sort_order' => 4,
            ],
        ];

        foreach ($categories as $category) {
            \App\Models\Category::firstOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }

        $this->info('Categories seeded successfully!');
    }

    /**
     * Seed products.
     */
    protected function seedProducts(): void
    {
        $this->info('Seeding products...');

        $categories = \App\Models\Category::all();
        
        if ($categories->isEmpty()) {
            $this->warn('No categories found. Please seed categories first.');
            return;
        }

        $products = [
            [
                'name' => 'Nike Air Max 270',
                'slug' => 'nike-air-max-270',
                'description' => 'Comfortable running shoes with Air Max technology',
                'price' => 150.00,
                'sku' => 'NIKE-AM270-001',
                'stock_quantity' => 50,
                'category_id' => $categories->where('slug', 'sneakers')->first()->id,
                'brand' => 'Nike',
                'size' => 'M',
                'color' => 'White',
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Adidas Ultraboost 22',
                'slug' => 'adidas-ultraboost-22',
                'description' => 'High-performance running shoes with Boost technology',
                'price' => 180.00,
                'sku' => 'ADIDAS-UB22-001',
                'stock_quantity' => 30,
                'category_id' => $categories->where('slug', 'sneakers')->first()->id,
                'brand' => 'Adidas',
                'size' => 'M',
                'color' => 'Black',
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Timberland Classic Boots',
                'slug' => 'timberland-classic-boots',
                'description' => 'Durable leather boots for outdoor adventures',
                'price' => 200.00,
                'sku' => 'TIMBERLAND-CB-001',
                'stock_quantity' => 25,
                'category_id' => $categories->where('slug', 'boots')->first()->id,
                'brand' => 'Timberland',
                'size' => 'M',
                'color' => 'Brown',
                'is_featured' => false,
                'is_active' => true,
            ],
        ];

        foreach ($products as $product) {
            \App\Models\Product::firstOrCreate(
                ['sku' => $product['sku']],
                $product
            );
        }

        $this->info('Products seeded successfully!');
    }

    /**
     * Seed orders.
     */
    protected function seedOrders(): void
    {
        $this->info('Seeding orders...');

        $users = \App\Models\User::where('is_admin', false)->get();
        $products = \App\Models\Product::all();

        if ($users->isEmpty() || $products->isEmpty()) {
            $this->warn('No users or products found. Please seed users and products first.');
            return;
        }

        for ($i = 0; $i < 5; $i++) {
            $user = $users->random();
            $product = $products->random();

            $order = \App\Models\Order::create([
                'user_id' => $user->id,
                'order_number' => 'ORD-' . strtoupper(uniqid()),
                'status' => 'delivered',
                'payment_status' => 'paid',
                'payment_method' => 'stripe',
                'subtotal' => $product->price,
                'tax_amount' => $product->price * 0.1,
                'shipping_amount' => 10.00,
                'total_amount' => $product->price * 1.1 + 10.00,
                'currency' => 'USD',
                'shipping_address' => json_encode([
                    'first_name' => $user->name,
                    'last_name' => 'Doe',
                    'address_line_1' => '123 Main St',
                    'city' => 'New York',
                    'state' => 'NY',
                    'postal_code' => '10001',
                    'country' => 'USA',
                ]),
                'delivered_at' => now()->subDays(rand(1, 30)),
            ]);

            \App\Models\OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'quantity' => 1,
                'unit_price' => $product->price,
                'total_price' => $product->price,
                'product_name' => $product->name,
                'product_sku' => $product->sku,
                'product_image' => $product->image,
            ]);
        }

        $this->info('Orders seeded successfully!');
    }
}
