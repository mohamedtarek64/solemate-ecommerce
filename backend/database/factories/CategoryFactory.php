<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true),
            'slug' => fake()->slug(),
            'description' => fake()->paragraph(),
            'image' => fake()->imageUrl(300, 300, 'categories', true),
            'parent_id' => null,
            'is_active' => true,
            'sort_order' => fake()->numberBetween(1, 100),
            'meta_title' => fake()->sentence(),
            'meta_description' => fake()->sentence(),
            'meta_keywords' => fake()->words(5, true),
        ];
    }

    /**
     * Indicate that the category is a subcategory.
     */
    public function subcategory(): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => \App\Models\Category::factory(),
        ]);
    }

    /**
     * Indicate that the category is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
