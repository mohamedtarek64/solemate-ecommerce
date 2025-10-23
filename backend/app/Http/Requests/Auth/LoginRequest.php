<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseFormRequest;

/**
 * Login Request
 */
class LoginRequest extends BaseFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'email',
                'max:255',
            ],
            'password' => [
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
            'email.required' => 'Email address is required for login.',
            'email.email' => 'Please enter a valid email address.',
            'email.max' => 'Email address cannot exceed 255 characters.',
            'password.required' => 'Password is required for login.',
            'password.string' => 'Password must be a valid string.',
            'password.min' => 'Password must be at least 6 characters.',
            'password.max' => 'Password cannot exceed 255 characters.',
        ]);
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $this->validateUserExists($validator);
        });
    }

    /**
     * Validate that the user exists in the database.
     */
    protected function validateUserExists($validator): void
    {
        $email = $this->input('email');

        if (!$email) {
            return;
        }

        try {
            $user = \DB::table('users')->where('email', $email)->first();

            if (!$user) {
                $validator->errors()->add('email', 'No account found with this email address.');
            }
        } catch (\Exception $e) {
            $validator->errors()->add('email', 'Unable to validate user. Please try again.');
        }
    }

    /**
     * Process validated data before returning.
     */
    protected function processValidatedData(array $data): array
    {
        // Normalize email to lowercase
        $data['email'] = strtolower(trim($data['email']));

        // Trim password (though this is usually not needed)
        $data['password'] = trim($data['password']);

        return $data;
    }
}
