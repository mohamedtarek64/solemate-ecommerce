<?php

namespace App\Exceptions;

use Illuminate\Validation\ValidationException as LaravelValidationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ValidationException extends LaravelValidationException
{
    /**
     * Render the exception as an HTTP response.
     */
    public function render(Request $request): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $this->errors(),
        ];

        if (config('app.debug')) {
            $response['debug'] = [
                'file' => $this->getFile(),
                'line' => $this->getLine(),
            ];
        }

        return response()->json($response, 422);
    }

    /**
     * Get the validation errors.
     */
    public function getValidationErrors(): array
    {
        return $this->errors();
    }

    /**
     * Get the first validation error message.
     */
    public function getFirstError(): ?string
    {
        $errors = $this->errors();
        
        if (empty($errors)) {
            return null;
        }

        $firstField = array_key_first($errors);
        $firstError = $errors[$firstField];
        
        return is_array($firstError) ? $firstError[0] : $firstError;
    }

    /**
     * Get all error messages as a flat array.
     */
    public function getAllErrors(): array
    {
        $errors = $this->errors();
        $allErrors = [];

        foreach ($errors as $field => $fieldErrors) {
            if (is_array($fieldErrors)) {
                foreach ($fieldErrors as $error) {
                    $allErrors[] = $error;
                }
            } else {
                $allErrors[] = $fieldErrors;
            }
        }

        return $allErrors;
    }

    /**
     * Check if a specific field has errors.
     */
    public function hasError(string $field): bool
    {
        return array_key_exists($field, $this->errors());
    }

    /**
     * Get errors for a specific field.
     */
    public function getFieldErrors(string $field): array
    {
        $errors = $this->errors();
        return $errors[$field] ?? [];
    }
}
