<?php

namespace App\Http\Requests\Wishlist;

use App\Http\Requests\BaseFormRequest;
use App\Enums\ProductTable;

/**
 * Add to Wishlist Request
 */
class AddToWishlistRequest extends BaseFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'product_id' => [
                'required',
                'integer',
                'min:1',
                function ($attribute, $value, $fail) {
                    if (!is_numeric($value) || $value <= 0) {
                        $fail('The product ID must be a positive integer.');
                    }
                },
            ],
            'color' => [
                'nullable',
                'string',
                'max:50',
                'regex:/^[a-zA-Z0-9\s\-_]+$/',
            ],
            'size' => [
                'nullable',
                'string',
                'max:20',
                'regex:/^[a-zA-Z0-9\s\-_]+$/',
            ],
            'product_table' => [
                'required',
                'string',
                'in:' . implode(',', ProductTable::getAll()),
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
            'product_id.required' => 'Product ID is required to add item to wishlist.',
            'product_id.integer' => 'Product ID must be a valid integer.',
            'product_id.min' => 'Product ID must be a positive number.',
            'color.string' => 'Color must be a valid string.',
            'color.max' => 'Color name cannot exceed 50 characters.',
            'color.regex' => 'Color name contains invalid characters.',
            'size.string' => 'Size must be a valid string.',
            'size.max' => 'Size cannot exceed 20 characters.',
            'size.regex' => 'Size contains invalid characters.',
            'product_table.required' => 'Product table is required.',
            'product_table.in' => 'Invalid product table specified.',
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
            $this->validateProductExists($validator);
            $this->validateColorExists($validator);
            $this->validateNotAlreadyInWishlist($validator);
        });
    }

    /**
     * Validate that the product exists and is active.
     */
    protected function validateProductExists($validator): void
    {
        $productId = $this->input('product_id');
        $productTable = $this->input('product_table');

        if (!$productId || !$productTable) {
            return;
        }

        try {
            $product = \DB::table($productTable)->where('id', $productId)->first();

            if (!$product) {
                $validator->errors()->add('product_id', 'The specified product does not exist.');
                return;
            }

            // Check if product is active
            $isActive = false;
            if ($productTable === ProductTable::PRODUCTS_MEN) {
                $isActive = $product->status === 'active';
            } else {
                $isActive = $product->is_active ?? true;
            }

            if (!$isActive) {
                $validator->errors()->add('product_id', 'The specified product is not available.');
            }
        } catch (\Exception $e) {
            $validator->errors()->add('product_id', 'Unable to validate product. Please try again.');
        }
    }

    /**
     * Validate that the color exists for the product (if provided).
     */
    protected function validateColorExists($validator): void
    {
        $productId = $this->input('product_id');
        $color = $this->input('color');

        if (!$productId || !$color) {
            return;
        }

        try {
            $colorExists = \DB::table('product_colors')
                ->where('product_id', $productId)
                ->where('color', $color)
                ->exists();

            if (!$colorExists) {
                $validator->errors()->add('color', 'The specified color is not available for this product.');
            }
        } catch (\Exception $e) {
            $validator->errors()->add('color', 'Unable to validate color. Please try again.');
        }
    }

    /**
     * Validate that the product is not already in the wishlist.
     */
    protected function validateNotAlreadyInWishlist($validator): void
    {
        $productId = $this->input('product_id');
        $productTable = $this->input('product_table');
        $color = $this->input('color');
        $size = $this->input('size');
        $userId = $this->input('user_id');

        if (!$productId || !$productTable || !$userId) {
            return;
        }

        try {
            $query = \DB::table('wishlist_items')
                ->where('user_id', $userId)
                ->where('product_id', $productId)
                ->where('product_table', $productTable)
                ->where('color', $color)
                ->where('size', $size);

            $exists = $query->exists();

            if ($exists) {
                $validator->errors()->add('product_id', 'This product variant is already in your wishlist.');
            }
        } catch (\Exception $e) {
            $validator->errors()->add('product_id', 'Unable to check wishlist status. Please try again.');
        }
    }

    /**
     * Process validated data before returning.
     */
    protected function processValidatedData(array $data): array
    {
        // Ensure numeric values are properly cast
        $data['product_id'] = (int) $data['product_id'];

        if (isset($data['user_id'])) {
            $data['user_id'] = (int) $data['user_id'];
        }

        // Trim string values
        if (isset($data['color'])) {
            $data['color'] = trim($data['color']);
        }

        if (isset($data['size'])) {
            $data['size'] = trim($data['size']);
        }

        return $data;
    }
}
