<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Exceptions\ApiException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Throwable  $exception
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @throws \Throwable
     */
    public function render($request, Throwable $exception)
    {
        if ($request->expectsJson()) {
            return $this->handleApiException($request, $exception);
        }

        return parent::render($request, $exception);
    }

    /**
     * Handle API exceptions.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Throwable  $exception
     * @return \Illuminate\Http\JsonResponse
     */
    protected function handleApiException(Request $request, Throwable $exception): JsonResponse
    {
        if ($exception instanceof ValidationException) {
            return $this->handleValidationException($exception);
        }

        if ($exception instanceof AuthenticationException) {
            return $this->handleAuthenticationException();
        }

        if ($exception instanceof ModelNotFoundException) {
            return $this->handleModelNotFoundException();
        }

        if ($exception instanceof NotFoundHttpException) {
            return $this->handleNotFoundHttpException();
        }

        if ($exception instanceof MethodNotAllowedHttpException) {
            return $this->handleMethodNotAllowedHttpException();
        }

        if ($exception instanceof HttpException) {
            return $this->handleHttpException($exception);
        }

        if ($exception instanceof ApiException) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'errors' => $exception->getErrors() ?: null,
            ], $exception->getStatus());
        }

        return $this->handleGenericException($exception);
    }

    /**
     * Handle validation exception.
     */
    protected function handleValidationException(ValidationException $exception): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $exception->errors(),
        ], 422);
    }

    /**
     * Handle authentication exception.
     */
    protected function handleAuthenticationException(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Unauthenticated',
        ], 401);
    }

    /**
     * Handle model not found exception.
     */
    protected function handleModelNotFoundException(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Resource not found',
        ], 404);
    }

    /**
     * Handle not found HTTP exception.
     */
    protected function handleNotFoundHttpException(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Endpoint not found',
        ], 404);
    }

    /**
     * Handle method not allowed HTTP exception.
     */
    protected function handleMethodNotAllowedHttpException(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Method not allowed',
        ], 405);
    }

    /**
     * Handle HTTP exception.
     */
    protected function handleHttpException(HttpException $exception): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $exception->getMessage() ?: 'HTTP Error',
        ], $exception->getStatusCode());
    }

    /**
     * Handle generic exception.
     */
    protected function handleGenericException(Throwable $exception): JsonResponse
    {
        $statusCode = method_exists($exception, 'getStatusCode') ? $exception->getStatusCode() : 500;

        $response = [
            'success' => false,
            'message' => 'Internal server error',
        ];

        if (config('app.debug')) {
            $response['debug'] = [
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'trace' => $exception->getTraceAsString(),
            ];
        }

        return response()->json($response, $statusCode);
    }
}
