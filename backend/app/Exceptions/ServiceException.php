<?php

namespace App\Exceptions;

use Exception;

/**
 * Service Exception Class
 *
 * Custom exception for service layer operations
 */
class ServiceException extends Exception
{
    protected array $context = [];

    public function __construct(string $message = "", int $code = 0, \Throwable $previous = null, array $context = [])
    {
        parent::__construct($message, $code, $previous);
        $this->context = $context;
    }

    public function getContext(): array
    {
        return $this->context;
    }

    public function setContext(array $context): void
    {
        $this->context = $context;
    }

    public function addContext(string $key, $value): void
    {
        $this->context[$key] = $value;
    }
}
