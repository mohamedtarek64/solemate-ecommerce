<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrderRequest extends FormRequest
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
        return [
            'payment_method' => ['required', 'string', 'in:stripe,paypal,bank_transfer'],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'tax_amount' => ['nullable', 'numeric', 'min:0'],
            'shipping_amount' => ['nullable', 'numeric', 'min:0'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'total_amount' => ['required', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'shipping_address' => ['required', 'array'],
            'shipping_address.first_name' => ['required', 'string', 'max:100'],
            'shipping_address.last_name' => ['required', 'string', 'max:100'],
            'shipping_address.company' => ['nullable', 'string', 'max:100'],
            'shipping_address.address_line_1' => ['required', 'string', 'max:255'],
            'shipping_address.address_line_2' => ['nullable', 'string', 'max:255'],
            'shipping_address.city' => ['required', 'string', 'max:100'],
            'shipping_address.state' => ['required', 'string', 'max:100'],
            'shipping_address.postal_code' => ['required', 'string', 'max:20'],
            'shipping_address.country' => ['required', 'string', 'max:100'],
            'shipping_address.phone' => ['nullable', 'string', 'max:20'],
            'billing_address' => ['nullable', 'array'],
            'billing_address.first_name' => ['required_with:billing_address', 'string', 'max:100'],
            'billing_address.last_name' => ['required_with:billing_address', 'string', 'max:100'],
            'billing_address.company' => ['nullable', 'string', 'max:100'],
            'billing_address.address_line_1' => ['required_with:billing_address', 'string', 'max:255'],
            'billing_address.address_line_2' => ['nullable', 'string', 'max:255'],
            'billing_address.city' => ['required_with:billing_address', 'string', 'max:100'],
            'billing_address.state' => ['required_with:billing_address', 'string', 'max:100'],
            'billing_address.postal_code' => ['required_with:billing_address', 'string', 'max:20'],
            'billing_address.country' => ['required_with:billing_address', 'string', 'max:100'],
            'billing_address.phone' => ['nullable', 'string', 'max:20'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'payment_method.required' => 'Payment method is required.',
            'payment_method.string' => 'Payment method must be a string.',
            'payment_method.in' => 'Payment method must be stripe, paypal, or bank_transfer.',
            'subtotal.required' => 'Subtotal is required.',
            'subtotal.numeric' => 'Subtotal must be a number.',
            'subtotal.min' => 'Subtotal must be at least 0.',
            'tax_amount.numeric' => 'Tax amount must be a number.',
            'tax_amount.min' => 'Tax amount must be at least 0.',
            'shipping_amount.numeric' => 'Shipping amount must be a number.',
            'shipping_amount.min' => 'Shipping amount must be at least 0.',
            'discount_amount.numeric' => 'Discount amount must be a number.',
            'discount_amount.min' => 'Discount amount must be at least 0.',
            'total_amount.required' => 'Total amount is required.',
            'total_amount.numeric' => 'Total amount must be a number.',
            'total_amount.min' => 'Total amount must be at least 0.',
            'currency.string' => 'Currency must be a string.',
            'currency.size' => 'Currency must be exactly 3 characters.',
            'shipping_address.required' => 'Shipping address is required.',
            'shipping_address.array' => 'Shipping address must be an array.',
            'shipping_address.first_name.required' => 'Shipping first name is required.',
            'shipping_address.first_name.string' => 'Shipping first name must be a string.',
            'shipping_address.first_name.max' => 'Shipping first name cannot exceed 100 characters.',
            'shipping_address.last_name.required' => 'Shipping last name is required.',
            'shipping_address.last_name.string' => 'Shipping last name must be a string.',
            'shipping_address.last_name.max' => 'Shipping last name cannot exceed 100 characters.',
            'shipping_address.company.string' => 'Shipping company must be a string.',
            'shipping_address.company.max' => 'Shipping company cannot exceed 100 characters.',
            'shipping_address.address_line_1.required' => 'Shipping address line 1 is required.',
            'shipping_address.address_line_1.string' => 'Shipping address line 1 must be a string.',
            'shipping_address.address_line_1.max' => 'Shipping address line 1 cannot exceed 255 characters.',
            'shipping_address.address_line_2.string' => 'Shipping address line 2 must be a string.',
            'shipping_address.address_line_2.max' => 'Shipping address line 2 cannot exceed 255 characters.',
            'shipping_address.city.required' => 'Shipping city is required.',
            'shipping_address.city.string' => 'Shipping city must be a string.',
            'shipping_address.city.max' => 'Shipping city cannot exceed 100 characters.',
            'shipping_address.state.required' => 'Shipping state is required.',
            'shipping_address.state.string' => 'Shipping state must be a string.',
            'shipping_address.state.max' => 'Shipping state cannot exceed 100 characters.',
            'shipping_address.postal_code.required' => 'Shipping postal code is required.',
            'shipping_address.postal_code.string' => 'Shipping postal code must be a string.',
            'shipping_address.postal_code.max' => 'Shipping postal code cannot exceed 20 characters.',
            'shipping_address.country.required' => 'Shipping country is required.',
            'shipping_address.country.string' => 'Shipping country must be a string.',
            'shipping_address.country.max' => 'Shipping country cannot exceed 100 characters.',
            'shipping_address.phone.string' => 'Shipping phone must be a string.',
            'shipping_address.phone.max' => 'Shipping phone cannot exceed 20 characters.',
            'billing_address.array' => 'Billing address must be an array.',
            'billing_address.first_name.required_with' => 'Billing first name is required when billing address is provided.',
            'billing_address.first_name.string' => 'Billing first name must be a string.',
            'billing_address.first_name.max' => 'Billing first name cannot exceed 100 characters.',
            'billing_address.last_name.required_with' => 'Billing last name is required when billing address is provided.',
            'billing_address.last_name.string' => 'Billing last name must be a string.',
            'billing_address.last_name.max' => 'Billing last name cannot exceed 100 characters.',
            'billing_address.company.string' => 'Billing company must be a string.',
            'billing_address.company.max' => 'Billing company cannot exceed 100 characters.',
            'billing_address.address_line_1.required_with' => 'Billing address line 1 is required when billing address is provided.',
            'billing_address.address_line_1.string' => 'Billing address line 1 must be a string.',
            'billing_address.address_line_1.max' => 'Billing address line 1 cannot exceed 255 characters.',
            'billing_address.address_line_2.string' => 'Billing address line 2 must be a string.',
            'billing_address.address_line_2.max' => 'Billing address line 2 cannot exceed 255 characters.',
            'billing_address.city.required_with' => 'Billing city is required when billing address is provided.',
            'billing_address.city.string' => 'Billing city must be a string.',
            'billing_address.city.max' => 'Billing city cannot exceed 100 characters.',
            'billing_address.state.required_with' => 'Billing state is required when billing address is provided.',
            'billing_address.state.string' => 'Billing state must be a string.',
            'billing_address.state.max' => 'Billing state cannot exceed 100 characters.',
            'billing_address.postal_code.required_with' => 'Billing postal code is required when billing address is provided.',
            'billing_address.postal_code.string' => 'Billing postal code must be a string.',
            'billing_address.postal_code.max' => 'Billing postal code cannot exceed 20 characters.',
            'billing_address.country.required_with' => 'Billing country is required when billing address is provided.',
            'billing_address.country.string' => 'Billing country must be a string.',
            'billing_address.country.max' => 'Billing country cannot exceed 100 characters.',
            'billing_address.phone.string' => 'Billing phone must be a string.',
            'billing_address.phone.max' => 'Billing phone cannot exceed 20 characters.',
            'items.required' => 'Order items are required.',
            'items.array' => 'Order items must be an array.',
            'items.min' => 'At least one item is required.',
            'items.*.product_id.required' => 'Product ID is required for each item.',
            'items.*.product_id.integer' => 'Product ID must be an integer.',
            'items.*.product_id.exists' => 'Selected product does not exist.',
            'items.*.quantity.required' => 'Quantity is required for each item.',
            'items.*.quantity.integer' => 'Quantity must be an integer.',
            'items.*.quantity.min' => 'Quantity must be at least 1.',
            'notes.string' => 'Notes must be a string.',
            'notes.max' => 'Notes cannot exceed 1000 characters.',
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
            'payment_method' => 'payment method',
            'subtotal' => 'subtotal',
            'tax_amount' => 'tax amount',
            'shipping_amount' => 'shipping amount',
            'discount_amount' => 'discount amount',
            'total_amount' => 'total amount',
            'currency' => 'currency',
            'shipping_address' => 'shipping address',
            'billing_address' => 'billing address',
            'items' => 'order items',
            'notes' => 'notes',
        ];
    }
}
