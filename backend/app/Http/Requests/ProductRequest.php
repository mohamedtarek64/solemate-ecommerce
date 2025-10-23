<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug'],
            'description' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'min:0', 'lt:price'],
            'sku' => ['required', 'string', 'max:100', 'unique:products,sku'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'image' => ['nullable', 'string', 'max:500'],
            'gallery' => ['nullable', 'array'],
            'gallery.*' => ['string', 'max:500'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'brand' => ['nullable', 'string', 'max:100'],
            'size' => ['nullable', 'string', 'max:50'],
            'color' => ['nullable', 'string', 'max:50'],
            'material' => ['nullable', 'string', 'max:100'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'dimensions' => ['nullable', 'array'],
            'is_featured' => ['boolean'],
            'is_active' => ['boolean'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'meta_keywords' => ['nullable', 'string', 'max:500'],
        ];

        // For update requests, make slug and sku unique except for current record
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $productId = $this->route('id') ?? $this->route('product');
            $rules['slug'] = ['nullable', 'string', 'max:255', 'unique:products,slug,' . $productId];
            $rules['sku'] = ['required', 'string', 'max:100', 'unique:products,sku,' . $productId];
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Product name is required.',
            'name.string' => 'Product name must be a string.',
            'name.max' => 'Product name cannot exceed 255 characters.',
            'slug.string' => 'Slug must be a string.',
            'slug.max' => 'Slug cannot exceed 255 characters.',
            'slug.unique' => 'This slug is already taken.',
            'description.required' => 'Product description is required.',
            'description.string' => 'Product description must be a string.',
            'price.required' => 'Product price is required.',
            'price.numeric' => 'Product price must be a number.',
            'price.min' => 'Product price must be at least 0.',
            'sale_price.numeric' => 'Sale price must be a number.',
            'sale_price.min' => 'Sale price must be at least 0.',
            'sale_price.lt' => 'Sale price must be less than regular price.',
            'sku.required' => 'SKU is required.',
            'sku.string' => 'SKU must be a string.',
            'sku.max' => 'SKU cannot exceed 100 characters.',
            'sku.unique' => 'This SKU is already taken.',
            'stock_quantity.required' => 'Stock quantity is required.',
            'stock_quantity.integer' => 'Stock quantity must be an integer.',
            'stock_quantity.min' => 'Stock quantity must be at least 0.',
            'image.string' => 'Image URL must be a string.',
            'image.max' => 'Image URL cannot exceed 500 characters.',
            'gallery.array' => 'Gallery must be an array.',
            'gallery.*.string' => 'Gallery items must be strings.',
            'gallery.*.max' => 'Gallery URLs cannot exceed 500 characters.',
            'category_id.required' => 'Category is required.',
            'category_id.integer' => 'Category must be an integer.',
            'category_id.exists' => 'Selected category does not exist.',
            'brand.string' => 'Brand must be a string.',
            'brand.max' => 'Brand cannot exceed 100 characters.',
            'size.string' => 'Size must be a string.',
            'size.max' => 'Size cannot exceed 50 characters.',
            'color.string' => 'Color must be a string.',
            'color.max' => 'Color cannot exceed 50 characters.',
            'material.string' => 'Material must be a string.',
            'material.max' => 'Material cannot exceed 100 characters.',
            'weight.numeric' => 'Weight must be a number.',
            'weight.min' => 'Weight must be at least 0.',
            'dimensions.array' => 'Dimensions must be an array.',
            'is_featured.boolean' => 'Featured status must be true or false.',
            'is_active.boolean' => 'Active status must be true or false.',
            'meta_title.string' => 'Meta title must be a string.',
            'meta_title.max' => 'Meta title cannot exceed 255 characters.',
            'meta_description.string' => 'Meta description must be a string.',
            'meta_description.max' => 'Meta description cannot exceed 500 characters.',
            'meta_keywords.string' => 'Meta keywords must be a string.',
            'meta_keywords.max' => 'Meta keywords cannot exceed 500 characters.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'product name',
            'slug' => 'slug',
            'description' => 'description',
            'price' => 'price',
            'sale_price' => 'sale price',
            'sku' => 'SKU',
            'stock_quantity' => 'stock quantity',
            'image' => 'image',
            'gallery' => 'gallery',
            'category_id' => 'category',
            'brand' => 'brand',
            'size' => 'size',
            'color' => 'color',
            'material' => 'material',
            'weight' => 'weight',
            'dimensions' => 'dimensions',
            'is_featured' => 'featured status',
            'is_active' => 'active status',
            'meta_title' => 'meta title',
            'meta_description' => 'meta description',
            'meta_keywords' => 'meta keywords',
        ];
    }
}
