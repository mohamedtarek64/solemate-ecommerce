<?php

namespace App\Http\Requests\Cart;

use App\Http\Requests\BaseFormRequest;

/**
 * Update Cart Item Request
 */
class UpdateCartItemRequest extends BaseFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'quantity' => [
                'required',
                'integer',
                'min:1',
                'max:10',
                function ($attribute, $value, $fail) {
                    if (!is_numeric($value) || $value < 1 || $value > 10) {
                        $fail('The quantity must be between 1 and 10.');
                    }
                },
            ],
            'user_id' => [
                'nullable',
                'integer',
                'min:1',
                function ($attribute, $value, $fail) {
                    if ($value !== null && (!is_numeric($value) || $value <= 0)) {
                        $fail('The user ID must be a positive integer.');
                    }
                },
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return array_merge(parent::messages(), [
            'quantity.required' => 'Quantity is required to update cart item.',
            'quantity.integer' => 'Quantity must be a valid integer.',
            'quantity.min' => 'Quantity must be at least 1.',
            'quantity.max' => 'Quantity cannot exceed 10 items.',
            'user_id.integer' => 'User ID must be a valid integer.',
            'user_id.min' => 'User ID must be a positive number.',
        ]);
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $this->validateCartItemExists($validator);
            $this->validateStockAvailability($validator);
        });
    }

    /**
     * Validate that the cart item exists and belongs to the user.
     */
    protected function validateCartItemExists($validator): void
    {
        $itemId = $this->route('id'); // Assuming route parameter is 'id'
        $userId = $this->input('user_id');

        if (!$itemId || !$userId) {
            return;
        }

        try {
            $cartItem = \DB::table('cart_items')
                ->where('id', $itemId)
                ->where('user_id', $userId)
                ->first();

            if (!$cartItem) {
                $validator->errors()->add('cart_item', 'Cart item not found or does not belong to the user.');
            }
        } catch (\Exception $e) {
            $validator->errors()->add('cart_item', 'Unable to validate cart item. Please try again.');
        }
    }

    /**
     * Validate that there's enough stock available for the new quantity.
     */
    protected function validateStockAvailability($validator): void
    {
        $itemId = $this->route('id');
        $newQuantity = $this->input('quantity');

        if (!$itemId || !$newQuantity) {
            return;
        }

        try {
            $cartItem = \DB::table('cart_items')
                ->where('id', $itemId)
                ->first();

            if (!$cartItem) {
                return;
            }

            $productTable = $cartItem->product_table;
            $productId = $cartItem->product_id;

            $product = \DB::table($productTable)->where('id', $productId)->first();

            if (!$product) {
                $validator->errors()->add('quantity', 'Product not found.');
                return;
            }

            $availableStock = $product->stock_quantity ?? $product->quantity ?? 0;

            if ($availableStock < $newQuantity) {
                $validator->errors()->add('quantity', "Insufficient stock. Only {$availableStock} items available.");
            }
        } catch (\Exception $e) {
            $validator->errors()->add('quantity', 'Unable to check stock availability. Please try again.');
        }
    }

    /**
     * Process validated data before returning.
     */
    protected function processValidatedData(array $data): array
    {
        // Ensure numeric values are properly cast
        $data['quantity'] = (int) $data['quantity'];

        if (isset($data['user_id'])) {
            $data['user_id'] = (int) $data['user_id'];
        }

        return $data;
    }
}
