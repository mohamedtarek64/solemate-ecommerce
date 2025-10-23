<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomException extends Exception
{
    protected $statusCode;
    protected $errorCode;
    protected $details;

    public function __construct(
        string $message = 'An error occurred',
        int $statusCode = 500,
        string $errorCode = 'GENERAL_ERROR',
        array $details = []
    ) {
        parent::__construct($message);
        
        $this->statusCode = $statusCode;
        $this->errorCode = $errorCode;
        $this->details = $details;
    }

    /**
     * Render the exception as an HTTP response.
     */
    public function render(Request $request): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $this->getMessage(),
            'error_code' => $this->errorCode,
        ];

        if (!empty($this->details)) {
            $response['details'] = $this->details;
        }

        if (config('app.debug')) {
            $response['debug'] = [
                'file' => $this->getFile(),
                'line' => $this->getLine(),
                'trace' => $this->getTraceAsString(),
            ];
        }

        return response()->json($response, $this->statusCode);
    }

    /**
     * Get the status code.
     */
    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    /**
     * Get the error code.
     */
    public function getErrorCode(): string
    {
        return $this->errorCode;
    }

    /**
     * Get the details.
     */
    public function getDetails(): array
    {
        return $this->details;
    }

    /**
     * Set the status code.
     */
    public function setStatusCode(int $statusCode): self
    {
        $this->statusCode = $statusCode;
        return $this;
    }

    /**
     * Set the error code.
     */
    public function setErrorCode(string $errorCode): self
    {
        $this->errorCode = $errorCode;
        return $this;
    }

    /**
     * Set the details.
     */
    public function setDetails(array $details): self
    {
        $this->details = $details;
        return $this;
    }
}
