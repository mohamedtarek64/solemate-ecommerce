<?php

namespace App\Exceptions;

use Exception;

class ApiException extends Exception
{
    private int $status;
    private array $errors;

    public function __construct(string $message, int $status = 400, array $errors = [])
    {
        parent::__construct($message, $status);
        $this->status = $status;
        $this->errors = $errors;
    }

    public function getStatus(): int
    {
        return $this->status;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }
}
