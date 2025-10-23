<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentException extends Exception
{
    protected $statusCode = 400;
    protected $errorCode = 'PAYMENT_ERROR';
    protected $paymentDetails;

    public function __construct(
        string $message = 'Payment processing failed',
        int $statusCode = 400,
        string $errorCode = 'PAYMENT_ERROR',
        array $paymentDetails = []
    ) {
        parent::__construct($message);
        
        $this->statusCode = $statusCode;
        $this->errorCode = $errorCode;
        $this->paymentDetails = $paymentDetails;
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
            'type' => 'payment_error',
        ];

        if (!empty($this->paymentDetails)) {
            $response['payment_details'] = $this->paymentDetails;
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
     * Get the payment details.
     */
    public function getPaymentDetails(): array
    {
        return $this->paymentDetails;
    }

    /**
     * Set the payment details.
     */
    public function setPaymentDetails(array $paymentDetails): self
    {
        $this->paymentDetails = $paymentDetails;
        return $this;
    }

    /**
     * Create a payment declined exception.
     */
    public static function paymentDeclined(string $reason = 'Payment was declined'): self
    {
        return new self(
            $reason,
            402,
            'PAYMENT_DECLINED',
            ['decline_reason' => $reason]
        );
    }

    /**
     * Create a payment method invalid exception.
     */
    public static function invalidPaymentMethod(string $reason = 'Invalid payment method'): self
    {
        return new self(
            $reason,
            400,
            'INVALID_PAYMENT_METHOD',
            ['error_type' => 'invalid_payment_method']
        );
    }

    /**
     * Create a payment amount invalid exception.
     */
    public static function invalidAmount(string $reason = 'Invalid payment amount'): self
    {
        return new self(
            $reason,
            400,
            'INVALID_AMOUNT',
            ['error_type' => 'invalid_amount']
        );
    }

    /**
     * Create a payment processing timeout exception.
     */
    public static function processingTimeout(string $reason = 'Payment processing timeout'): self
    {
        return new self(
            $reason,
            408,
            'PAYMENT_TIMEOUT',
            ['error_type' => 'timeout']
        );
    }

    /**
     * Create a payment gateway error exception.
     */
    public static function gatewayError(string $reason = 'Payment gateway error'): self
    {
        return new self(
            $reason,
            502,
            'GATEWAY_ERROR',
            ['error_type' => 'gateway_error']
        );
    }

    /**
     * Create a payment insufficient funds exception.
     */
    public static function insufficientFunds(string $reason = 'Insufficient funds'): self
    {
        return new self(
            $reason,
            402,
            'INSUFFICIENT_FUNDS',
            ['error_type' => 'insufficient_funds']
        );
    }

    /**
     * Create a payment card expired exception.
     */
    public static function cardExpired(string $reason = 'Card has expired'): self
    {
        return new self(
            $reason,
            400,
            'CARD_EXPIRED',
            ['error_type' => 'card_expired']
        );
    }

    /**
     * Create a payment card declined exception.
     */
    public static function cardDeclined(string $reason = 'Card was declined'): self
    {
        return new self(
            $reason,
            402,
            'CARD_DECLINED',
            ['error_type' => 'card_declined']
        );
    }
}
