<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'slug' => fake()->slug(),
            'description' => fake()->paragraphs(3, true),
            'price' => fake()->randomFloat(2, 10, 1000),
            'sale_price' => fake()->optional(0.3)->randomFloat(2, 5, 500),
            'sku' => fake()->unique()->bothify('SKU-####-????'),
            'stock_quantity' => fake()->numberBetween(0, 100),
            'image' => fake()->imageUrl(400, 400, 'shoes', true),
            'gallery' => json_encode([
                fake()->imageUrl(400, 400, 'shoes', true),
                fake()->imageUrl(400, 400, 'shoes', true),
                fake()->imageUrl(400, 400, 'shoes', true),
            ]),
            'category_id' => Category::factory(),
            'brand' => fake()->randomElement(['Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance']),
            'size' => fake()->randomElement(['S', 'M', 'L', 'XL', 'XXL']),
            'color' => fake()->colorName(),
            'material' => fake()->randomElement(['Leather', 'Canvas', 'Mesh', 'Synthetic']),
            'weight' => fake()->randomFloat(2, 0.5, 2.0),
            'dimensions' => json_encode([
                'length' => fake()->randomFloat(2, 20, 40),
                'width' => fake()->randomFloat(2, 10, 20),
                'height' => fake()->randomFloat(2, 5, 15),
            ]),
            'is_featured' => fake()->boolean(20),
            'is_active' => true,
            'meta_title' => fake()->sentence(),
            'meta_description' => fake()->sentence(),
            'meta_keywords' => fake()->words(5, true),
        ];
    }

    /**
     * Indicate that the product is featured.
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
        ]);
    }

    /**
     * Indicate that the product is on sale.
     */
    public function onSale(): static
    {
        return $this->state(fn (array $attributes) => [
            'sale_price' => fake()->randomFloat(2, 5, $attributes['price'] * 0.8),
        ]);
    }

    /**
     * Indicate that the product is out of stock.
     */
    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'stock_quantity' => 0,
        ]);
    }

    /**
     * Indicate that the product is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
