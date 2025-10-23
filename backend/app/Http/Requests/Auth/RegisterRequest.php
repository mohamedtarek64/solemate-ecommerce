<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseFormRequest;

/**
 * Register Request
 */
class RegisterRequest extends BaseFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'min:2',
                'max:255',
            ],
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
            ],
            'password' => [
                'required',
                'string',
                'min:6',
                'max:255',
                'confirmed',
            ],
            'password_confirmation' => [
                'required',
                'string',
                'min:6',
                'max:255',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return array_merge(parent::messages(), [
            'name.required' => 'Full name is required for registration.',
            'name.string' => 'Name must be a valid string.',
            'name.min' => 'Name must be at least 2 characters.',
            'name.max' => 'Name cannot exceed 255 characters.',
            'email.required' => 'Email address is required for registration.',
            'email.email' => 'Please enter a valid email address.',
            'email.max' => 'Email address cannot exceed 255 characters.',
            'email.unique' => 'An account with this email address already exists.',
            'password.required' => 'Password is required for registration.',
            'password.string' => 'Password must be a valid string.',
            'password.min' => 'Password must be at least 6 characters.',
            'password.max' => 'Password cannot exceed 255 characters.',
            'password.confirmed' => 'Password confirmation does not match.',
            'password_confirmation.required' => 'Password confirmation is required.',
            'password_confirmation.string' => 'Password confirmation must be a valid string.',
            'password_confirmation.min' => 'Password confirmation must be at least 6 characters.',
            'password_confirmation.max' => 'Password confirmation cannot exceed 255 characters.',
        ]);
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $this->validateEmailDomain($validator);
        });
    }

    /**
     * Validate password strength.
     */
    protected function validatePasswordStrength($validator): void
    {
        $password = $this->input('password');

        if (!$password) {
            return;
        }

        $errors = [];

        if (strlen($password) < 8) {
            $errors[] = 'Password must be at least 8 characters long.';
        }

        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = 'Password must contain at least one lowercase letter.';
        }

        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = 'Password must contain at least one uppercase letter.';
        }

        if (!preg_match('/[0-9]/', $password)) {
            $errors[] = 'Password must contain at least one number.';
        }

        if (!preg_match('/[^a-zA-Z0-9]/', $password)) {
            $errors[] = 'Password must contain at least one special character.';
        }

        if (!empty($errors)) {
            $validator->errors()->add('password', implode(' ', $errors));
        }
    }

    /**
     * Validate email domain (optional).
     */
    protected function validateEmailDomain($validator): void
    {
        $email = $this->input('email');

        if (!$email) {
            return;
        }

        $domain = substr(strrchr($email, "@"), 1);

        // List of common disposable email domains (you can expand this)
        $disposableDomains = [
            '10minutemail.com',
            'tempmail.org',
            'guerrillamail.com',
            // Add more as needed
        ];

        if (in_array($domain, $disposableDomains)) {
            $validator->errors()->add('email', 'Please use a permanent email address.');
        }
    }

    /**
     * Process validated data before returning.
     */
    protected function processValidatedData(array $data): array
    {
        // Normalize email to lowercase
        $data['email'] = strtolower(trim($data['email']));

        // Trim and normalize name
        $data['name'] = trim($data['name']);

        // Remove password_confirmation as it's not needed in the processed data
        unset($data['password_confirmation']);

        return $data;
    }
}
