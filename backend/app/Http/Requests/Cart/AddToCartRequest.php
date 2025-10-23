<?php

namespace App\Http\Requests\Cart;

use App\Http\Requests\BaseFormRequest;
use App\Enums\ProductTable;

/**
 * Add to Cart Request
 */
class AddToCartRequest extends BaseFormRequest
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
            'color' => [
                'nullable',
                'string',
                'max:100',
                // Allow most printable characters except dangerous ones
                'regex:/^[a-zA-Z0-9\s\-_.\/(),&]+$/',
            ],
            'size' => [
                'nullable',
                'string',
                'max:20',
                'regex:/^[a-zA-Z0-9\s\-_]*$/',
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
            'product_id.required' => 'Product ID is required to add item to cart.',
            'product_id.integer' => 'Product ID must be a valid integer.',
            'product_id.min' => 'Product ID must be a positive number.',
            'quantity.required' => 'Quantity is required to add item to cart.',
            'quantity.integer' => 'Quantity must be a valid integer.',
            'quantity.min' => 'Quantity must be at least 1.',
            'quantity.max' => 'Quantity cannot exceed 10 items.',
            'color.string' => 'Color must be a valid string.',
            'color.max' => 'Color name cannot exceed 100 characters.',
            'color.regex' => 'Color name contains invalid characters. Only letters, numbers, spaces, hyphens, underscores, periods, slashes, commas, parentheses, and ampersands are allowed.',
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
            $this->validateStockAvailability($validator);
        });
    }

    /**
     * Validate that the product exists and is active.
     */
    protected function validateProductExists($validator): void
    {
        $productId = $this->input('product_id');
        $productTable = $this->input('product_table');

        \Log::info('🔍 AddToCartRequest validateProductExists', [
            'product_id' => $productId,
            'product_table' => $productTable,
            'all_input' => $this->all()
        ]);

        if (!$productId || !$productTable) {
            \Log::warning('⚠️ Missing product_id or product_table');
            return;
        }

        try {
            $product = \DB::table($productTable)->where('id', $productId)->first();

            \Log::info('🔍 Product lookup result', [
                'product_id' => $productId,
                'product_table' => $productTable,
                'product_found' => $product ? 'yes' : 'no',
                'product_data' => $product
            ]);

            if (!$product) {
                \Log::error('❌ Product not found', [
                    'product_id' => $productId,
                    'product_table' => $productTable
                ]);
                $validator->errors()->add('product_id', 'The specified product does not exist.');
                return;
            }

            // Check if product is active
            $isActive = $product->is_active ?? true;

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
        // Skip color validation - colors are stored in products table as JSON
        // No need to validate against separate product_colors table
        return;
    }

    /**
     * Validate that there's enough stock available.
     */
    protected function validateStockAvailability($validator): void
    {
        $productId = $this->input('product_id');
        $productTable = $this->input('product_table');
        $quantity = $this->input('quantity');

        if (!$productId || !$productTable || !$quantity) {
            return;
        }

        try {
            $product = \DB::table($productTable)->where('id', $productId)->first();

            if (!$product) {
                return;
            }

            $availableStock = $product->stock_quantity ?? $product->stock ?? 0;

            if ($availableStock < $quantity) {
                $validator->errors()->add('quantity', "Insufficient stock. Only {$availableStock} items available.");
            }
        } catch (\Exception $e) {
            $validator->errors()->add('quantity', 'Unable to check stock availability. Please try again.');
        }
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $data = $this->all();

        // Convert color from object to string if needed
        if (isset($data['color'])) {
            if (is_array($data['color'])) {
                $data['color'] = $data['color']['name'] ?? $data['color']['color'] ?? '';
            }
        }

        // Convert size from object to string if needed
        if (isset($data['size'])) {
            if (is_array($data['size'])) {
                $data['size'] = $data['size']['name'] ?? $data['size']['size'] ?? '';
            }
        }

        $this->merge($data);
    }

    /**
     * Process validated data before returning.
     */
    protected function processValidatedData(array $data): array
    {
        // Ensure numeric values are properly cast
        $data['product_id'] = (int) $data['product_id'];
        $data['quantity'] = (int) $data['quantity'];

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
