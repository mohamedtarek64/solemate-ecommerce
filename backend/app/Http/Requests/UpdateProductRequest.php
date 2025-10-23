<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        $productId = $this->route('id');

        return [
            'name' => 'required|string|max:255|min:3',
            'price' => 'required|numeric|min:0|max:999999.99',
            'description' => 'nullable|string|max:2000',
            'category' => 'nullable|string|max:100',
            'brand' => 'nullable|string|max:100',
            'size' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:50',
            'material' => 'nullable|string|max:100',
            'stock_quantity' => 'nullable|integer|min:0|max:99999',
            'is_active' => 'nullable|boolean',
            'featured' => 'nullable|boolean',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'original_price' => 'nullable|numeric|min:0|max:999999.99',
            'sku' => 'nullable|string|max:100',
            'weight' => 'nullable|numeric|min:0|max:999.99',
            'dimensions' => 'nullable|string|max:100',
            'care_instructions' => 'nullable|string|max:1000',
            'tags' => 'nullable|string|max:1000',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'image_url' => 'nullable|url|max:500'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages()
    {
        return [
            'name.required' => 'Product name is required',
            'name.min' => 'Product name must be at least 3 characters',
            'name.max' => 'Product name cannot exceed 255 characters',
            'price.required' => 'Product price is required',
            'price.min' => 'Product price must be at least 0',
            'price.max' => 'Product price cannot exceed 999999.99',
            'sku.unique' => 'This SKU is already in use',
            'discount_percentage.max' => 'Discount percentage cannot exceed 100%',
            'stock_quantity.min' => 'Stock quantity cannot be negative',
            'stock_quantity.max' => 'Stock quantity cannot exceed 99999',
            'image_url.url' => 'Image URL must be a valid URL'
        ];
    }
}
