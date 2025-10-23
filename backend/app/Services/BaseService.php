<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Exceptions\ServiceException;

/**
 * Base Service Class
 *
 * Provides common functionality for all services
 */
abstract class BaseService
{
    /**
     * Execute database operations within a transaction
     */
    protected function executeInTransaction(callable $callback)
    {
        DB::beginTransaction();

        try {
            $result = $callback();
            DB::commit();
            return $result;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error(get_class($this) . ' transaction failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            throw new ServiceException('Operation failed: ' . $e->getMessage(), 0, $e);
        }
    }

    /**
     * Log service operations
     */
    protected function logOperation(string $operation, array $context = []): void
    {
        Log::info(get_class($this) . " - {$operation}", $context);
    }

    /**
     * Log service errors
     */
    protected function logError(string $operation, \Exception $exception, array $context = []): void
    {
        Log::error(get_class($this) . " - {$operation} failed", array_merge($context, [
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]));
    }

    /**
     * Validate required parameters
     */
    protected function validateRequired(array $data, array $required): void
    {
        $missing = array_diff($required, array_keys($data));

        if (!empty($missing)) {
            throw new ServiceException('Missing required parameters: ' . implode(', ', $missing));
        }
    }

    /**
     * Handle service exceptions
     */
    protected function handleException(\Exception $exception, string $operation = 'Operation'): void
    {
        $this->logError($operation, $exception);
        throw new ServiceException("{$operation} failed: " . $exception->getMessage(), 0, $exception);
    }
}
