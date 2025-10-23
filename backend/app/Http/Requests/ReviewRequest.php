<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewRequest extends FormRequest
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
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['required', 'string', 'max:255'],
            'comment' => ['required', 'string', 'max:1000'],
            'is_verified_purchase' => ['boolean'],
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
            'product_id.required' => 'Product ID is required.',
            'product_id.integer' => 'Product ID must be an integer.',
            'product_id.exists' => 'Selected product does not exist.',
            'rating.required' => 'Rating is required.',
            'rating.integer' => 'Rating must be an integer.',
            'rating.min' => 'Rating must be at least 1.',
            'rating.max' => 'Rating cannot exceed 5.',
            'title.required' => 'Review title is required.',
            'title.string' => 'Review title must be a string.',
            'title.max' => 'Review title cannot exceed 255 characters.',
            'comment.required' => 'Review comment is required.',
            'comment.string' => 'Review comment must be a string.',
            'comment.max' => 'Review comment cannot exceed 1000 characters.',
            'is_verified_purchase.boolean' => 'Verified purchase status must be true or false.',
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
            'product_id' => 'product',
            'rating' => 'rating',
            'title' => 'review title',
            'comment' => 'review comment',
            'is_verified_purchase' => 'verified purchase status',
        ];
    }
}
