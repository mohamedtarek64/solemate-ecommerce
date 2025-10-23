<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\ProductWomen;
use Illuminate\Support\Facades\Cache;

class AdminApiTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $adminUser;
    protected $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin user
        $this->adminUser = User::factory()->create([
            'role' => 'admin',
            'email' => 'admin@example.com'
        ]);

        // Create regular user
        $this->regularUser = User::factory()->create([
            'role' => 'user',
            'email' => 'user@example.com'
        ]);

        // Create test products
        ProductWomen::factory()->count(10)->create();
    }

    public function test_admin_can_access_products_endpoint()
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/admin/products');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'products',
                    'pagination',
                    'filters',
                    'stats'
                ]
            ]);
    }

    public function test_regular_user_cannot_access_admin_endpoints()
    {
        $response = $this->actingAs($this->regularUser, 'sanctum')
            ->getJson('/api/admin/products');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Admin access required',
                'error_code' => 'INSUFFICIENT_PRIVILEGES'
            ]);
    }

    public function test_unauthenticated_user_cannot_access_admin_endpoints()
    {
        $response = $this->getJson('/api/admin/products');

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Authentication required',
                'error_code' => 'UNAUTHENTICATED'
            ]);
    }

    public function test_admin_can_update_product()
    {
        $product = ProductWomen::first();

        $updateData = [
            'name' => 'Updated Product Name',
            'price' => 199.99,
            'description' => 'Updated description',
            'category' => 'Updated Category',
            'brand' => 'Updated Brand',
            'stock_quantity' => 50,
            'is_active' => true,
            'featured' => true
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->putJson("/api/admin/products/{$product->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Product updated successfully'
            ]);

        $this->assertDatabaseHas('products_women', [
            'id' => $product->id,
            'name' => 'Updated Product Name',
            'price' => 199.99
        ]);
    }

    public function test_product_update_validation()
    {
        $product = ProductWomen::first();

        $invalidData = [
            'name' => '', // Empty name should fail
            'price' => -10, // Negative price should fail
            'stock_quantity' => -5 // Negative stock should fail
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->putJson("/api/admin/products/{$product->id}", $invalidData);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Validation failed'
            ])
            ->assertJsonStructure([
                'errors' => [
                    'name',
                    'price',
                    'stock_quantity'
                ]
            ]);
    }

    public function test_admin_can_delete_product()
    {
        $product = ProductWomen::first();

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/admin/products/{$product->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Product deleted successfully'
            ]);

        $this->assertDatabaseMissing('products_women', [
            'id' => $product->id
        ]);
    }

    public function test_products_endpoint_with_filters()
    {
        // Create products with specific categories
        ProductWomen::factory()->create(['category' => 'Dresses']);
        ProductWomen::factory()->create(['category' => 'Shoes']);
        ProductWomen::factory()->create(['brand' => 'Nike']);

        // Test category filter
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/admin/products?category=Dresses');

        $response->assertStatus(200);
        $products = $response->json('data.products');

        foreach ($products as $product) {
            if ($product['table_source'] === 'products_women') {
                $this->assertEquals('Dresses', $product['category']);
            }
        }

        // Test brand filter
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/admin/products?brand=Nike');

        $response->assertStatus(200);
        $products = $response->json('data.products');

        foreach ($products as $product) {
            if ($product['table_source'] === 'products_women') {
                $this->assertEquals('Nike', $product['brand']);
            }
        }

        // Test search filter
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/admin/products?search=Dress');

        $response->assertStatus(200);
    }

    public function test_products_endpoint_pagination()
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/admin/products?per_page=5');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'pagination' => [
                        'current_page',
                        'per_page',
                        'total',
                        'last_page'
                    ]
                ]
            ]);

        $pagination = $response->json('data.pagination');
        $this->assertEquals(5, $pagination['per_page']);
    }

    public function test_health_endpoint()
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'status',
                    'timestamp',
                    'version',
                    'environment',
                    'services',
                    'system'
                ]
            ]);
    }

    public function test_status_endpoint()
    {
        $response = $this->getJson('/api/status');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'status',
                    'timestamp',
                    'uptime',
                    'version'
                ]
            ]);
    }

    public function test_metrics_endpoint()
    {
        $response = $this->getJson('/api/metrics');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'timestamp',
                    'database',
                    'system',
                    'performance'
                ]
            ]);
    }

    public function test_rate_limiting()
    {
        // Make multiple requests to test rate limiting
        for ($i = 0; $i < 5; $i++) {
            $response = $this->getJson('/api/health');
            $response->assertStatus(200);
        }

        // Check rate limit headers
        $response = $this->getJson('/api/health');
        $response->assertHeader('X-RateLimit-Limit');
        $response->assertHeader('X-RateLimit-Remaining');
        $response->assertHeader('X-RateLimit-Reset');
    }

    public function test_caching_functionality()
    {
        // Clear cache first
        Cache::flush();

        // First request should hit database
        $response1 = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/admin/products');

        $response1->assertStatus(200);

        // Second request should hit cache (if no filters)
        $response2 = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/admin/products');

        $response2->assertStatus(200);

        // Both responses should be identical
        $this->assertEquals(
            $response1->json('data.products'),
            $response2->json('data.products')
        );
    }
}
