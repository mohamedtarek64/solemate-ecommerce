<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddressRequest extends FormRequest
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
            'type' => ['required', 'string', 'in:shipping,billing,both'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'company' => ['nullable', 'string', 'max:100'],
            'address_line_1' => ['required', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:20'],
            'country' => ['required', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:20'],
            'is_default' => ['boolean'],
            'is_billing' => ['boolean'],
            'is_shipping' => ['boolean'],
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
            'type.required' => 'Address type is required.',
            'type.string' => 'Address type must be a string.',
            'type.in' => 'Address type must be shipping, billing, or both.',
            'first_name.required' => 'First name is required.',
            'first_name.string' => 'First name must be a string.',
            'first_name.max' => 'First name cannot exceed 100 characters.',
            'last_name.required' => 'Last name is required.',
            'last_name.string' => 'Last name must be a string.',
            'last_name.max' => 'Last name cannot exceed 100 characters.',
            'company.string' => 'Company must be a string.',
            'company.max' => 'Company cannot exceed 100 characters.',
            'address_line_1.required' => 'Address line 1 is required.',
            'address_line_1.string' => 'Address line 1 must be a string.',
            'address_line_1.max' => 'Address line 1 cannot exceed 255 characters.',
            'address_line_2.string' => 'Address line 2 must be a string.',
            'address_line_2.max' => 'Address line 2 cannot exceed 255 characters.',
            'city.required' => 'City is required.',
            'city.string' => 'City must be a string.',
            'city.max' => 'City cannot exceed 100 characters.',
            'state.required' => 'State is required.',
            'state.string' => 'State must be a string.',
            'state.max' => 'State cannot exceed 100 characters.',
            'postal_code.required' => 'Postal code is required.',
            'postal_code.string' => 'Postal code must be a string.',
            'postal_code.max' => 'Postal code cannot exceed 20 characters.',
            'country.required' => 'Country is required.',
            'country.string' => 'Country must be a string.',
            'country.max' => 'Country cannot exceed 100 characters.',
            'phone.string' => 'Phone must be a string.',
            'phone.max' => 'Phone cannot exceed 20 characters.',
            'is_default.boolean' => 'Default status must be true or false.',
            'is_billing.boolean' => 'Billing status must be true or false.',
            'is_shipping.boolean' => 'Shipping status must be true or false.',
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
            'type' => 'address type',
            'first_name' => 'first name',
            'last_name' => 'last name',
            'company' => 'company',
            'address_line_1' => 'address line 1',
            'address_line_2' => 'address line 2',
            'city' => 'city',
            'state' => 'state',
            'postal_code' => 'postal code',
            'country' => 'country',
            'phone' => 'phone',
            'is_default' => 'default status',
            'is_billing' => 'billing status',
            'is_shipping' => 'shipping status',
        ];
    }
}
