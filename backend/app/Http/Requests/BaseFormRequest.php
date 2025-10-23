<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\JsonResponse;

/**
 * Base Form Request
 *
 * Provides common validation functionality for all form requests
 */
abstract class BaseFormRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Override in child classes if needed
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator): void
    {
        $errors = $validator->errors();

        $response = new JsonResponse([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $errors->toArray(),
            'error_count' => $errors->count()
        ], 422);

        throw new HttpResponseException($response);
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'required' => 'The :attribute field is required.',
            'email' => 'The :attribute must be a valid email address.',
            'min' => 'The :attribute must be at least :min characters.',
            'max' => 'The :attribute must not exceed :max characters.',
            'integer' => 'The :attribute must be an integer.',
            'numeric' => 'The :attribute must be a number.',
            'string' => 'The :attribute must be a string.',
            'boolean' => 'The :attribute must be true or false.',
            'in' => 'The selected :attribute is invalid.',
            'exists' => 'The selected :attribute does not exist.',
            'unique' => 'The :attribute has already been taken.',
            'confirmed' => 'The :attribute confirmation does not match.',
            'regex' => 'The :attribute format is invalid.',
            'url' => 'The :attribute must be a valid URL.',
            'date' => 'The :attribute must be a valid date.',
            'before' => 'The :attribute must be a date before :date.',
            'after' => 'The :attribute must be a date after :date.',
            'alpha' => 'The :attribute must only contain letters.',
            'alpha_num' => 'The :attribute must only contain letters and numbers.',
            'alpha_dash' => 'The :attribute must only contain letters, numbers, dashes and underscores.',
            'between' => 'The :attribute must be between :min and :max.',
            'digits' => 'The :attribute must be :digits digits.',
            'digits_between' => 'The :attribute must be between :min and :max digits.',
            'size' => 'The :attribute must be :size.',
            'file' => 'The :attribute must be a file.',
            'image' => 'The :attribute must be an image.',
            'mimes' => 'The :attribute must be a file of type: :values.',
            'mimetypes' => 'The :attribute must be a file of type: :values.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'email' => 'email address',
            'password' => 'password',
            'password_confirmation' => 'password confirmation',
            'first_name' => 'first name',
            'last_name' => 'last name',
            'phone_number' => 'phone number',
            'postal_code' => 'postal code',
            'product_id' => 'product ID',
            'user_id' => 'user ID',
            'cart_item_id' => 'cart item ID',
            'wishlist_item_id' => 'wishlist item ID',
            'product_table' => 'product table',
            'color' => 'color name',
            'stock_quantity' => 'stock quantity',
            'original_price' => 'original price',
            'image_url' => 'image URL',
            'category_id' => 'category ID',
            'brand_id' => 'brand ID',
            'is_active' => 'active status',
            'is_featured' => 'featured status',
            'reviews_count' => 'reviews count',
            'additional_images' => 'additional images',
            'source_table' => 'source table',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Override in child classes if needed
    }

    /**
     * Get the validation rules that apply to the request.
     */
    abstract public function rules(): array;

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            // Add custom validation logic here if needed
            $this->afterValidation($validator);
        });
    }

    /**
     * Custom validation logic to be executed after standard validation.
     */
    protected function afterValidation(Validator $validator): void
    {
        // Override in child classes if needed
    }

    /**
     * Get the validated data from the request.
     */
    public function validated($key = null, $default = null)
    {
        $validated = parent::validated($key, $default);

        // Add any additional processing here
        return $this->processValidatedData($validated);
    }

    /**
     * Process validated data before returning.
     */
    protected function processValidatedData(array $data): array
    {
        return $data;
    }
}
