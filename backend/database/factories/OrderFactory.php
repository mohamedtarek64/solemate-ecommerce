<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'order_number' => fake()->unique()->bothify('ORD-####-????'),
            'status' => fake()->randomElement(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
            'payment_status' => fake()->randomElement(['pending', 'paid', 'failed', 'refunded']),
            'payment_method' => fake()->randomElement(['stripe', 'paypal', 'bank_transfer']),
            'subtotal' => fake()->randomFloat(2, 50, 500),
            'tax_amount' => fake()->randomFloat(2, 5, 50),
            'shipping_amount' => fake()->randomFloat(2, 0, 25),
            'discount_amount' => fake()->randomFloat(2, 0, 50),
            'total_amount' => fake()->randomFloat(2, 50, 500),
            'currency' => 'USD',
            'shipping_address' => json_encode([
                'first_name' => fake()->firstName(),
                'last_name' => fake()->lastName(),
                'address_line_1' => fake()->streetAddress(),
                'address_line_2' => fake()->optional()->secondaryAddress(),
                'city' => fake()->city(),
                'state' => fake()->state(),
                'postal_code' => fake()->postcode(),
                'country' => fake()->country(),
                'phone' => fake()->phoneNumber(),
            ]),
            'billing_address' => json_encode([
                'first_name' => fake()->firstName(),
                'last_name' => fake()->lastName(),
                'address_line_1' => fake()->streetAddress(),
                'address_line_2' => fake()->optional()->secondaryAddress(),
                'city' => fake()->city(),
                'state' => fake()->state(),
                'postal_code' => fake()->postcode(),
                'country' => fake()->country(),
                'phone' => fake()->phoneNumber(),
            ]),
            'notes' => fake()->optional()->sentence(),
            'tracking_number' => fake()->optional()->bothify('TRK-####-????'),
            'shipped_at' => fake()->optional()->dateTimeBetween('-1 month', 'now'),
            'delivered_at' => fake()->optional()->dateTimeBetween('-1 month', 'now'),
        ];
    }

    /**
     * Indicate that the order is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);
    }

    /**
     * Indicate that the order is paid.
     */
    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_status' => 'paid',
        ]);
    }

    /**
     * Indicate that the order is shipped.
     */
    public function shipped(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'shipped',
            'shipped_at' => fake()->dateTimeBetween('-1 week', 'now'),
            'tracking_number' => fake()->bothify('TRK-####-????'),
        ]);
    }

    /**
     * Indicate that the order is delivered.
     */
    public function delivered(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'delivered',
            'delivered_at' => fake()->dateTimeBetween('-1 week', 'now'),
        ]);
    }

    /**
     * Indicate that the order is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
        ]);
    }
}
