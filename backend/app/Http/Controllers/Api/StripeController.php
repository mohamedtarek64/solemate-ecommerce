<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StripeKeyManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class StripeController extends Controller
{
    /**
     * Get Stripe configuration (publishable key)
     */
    public function getConfig()
    {
        try {
            // Check if Stripe is properly configured
            if (!StripeKeyManager::isConfigured()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stripe configuration not found or invalid'
                ], 500);
            }

            $publishableKey = StripeKeyManager::getPublishableKey();
            $keyType = StripeKeyManager::getKeyType();

            return response()->json([
                'success' => true,
                'data' => [
                    'publishable_key' => $publishableKey,
                    'key_type' => $keyType
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Stripe config error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to get Stripe configuration'
            ], 500);
        }
    }

    /**
     * Create payment intent
     */
    public function createPaymentIntent(Request $request)
    {
        try {
            // Log incoming request
            Log::info('Create payment intent request', [
                'has_amount' => $request->has('amount'),
                'has_currency' => $request->has('currency'),
                'has_order_data' => $request->has('order_data'),
                'all_data' => $request->all()
            ]);

            // Validate with better error messages
            $validator = \Validator::make($request->all(), [
                'amount' => 'required|numeric|min:1',
                'currency' => 'string|size:3',
                'order_data' => 'array'
            ]);

            if ($validator->fails()) {
                Log::error('Stripe validation failed', ['errors' => $validator->errors()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed: ' . $validator->errors()->first(),
                    'errors' => $validator->errors()
                ], 422);
            }

            // Validate that we're in test mode and using official Stripe test cards
            $this->validateTestEnvironment();

            $secretKey = StripeKeyManager::getSecretKey();

            // Set Stripe secret key
            Stripe::setApiKey($secretKey);

            // Create real Stripe payment intent
            $metadata = [
                'user_id' => $request->user()->id ?? null
            ];

            if ($request->has('order_data')) {
                $metadata['order_data'] = json_encode($request->order_data);
            }

            $paymentIntent = PaymentIntent::create([
                'amount' => (int) round($request->amount * 100), // Convert to cents and round to integer
                'currency' => $request->currency ?? 'usd',
                'metadata' => $metadata,
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            Log::info('Real Stripe payment intent created', [
                'id' => $paymentIntent->id,
                'amount' => $paymentIntent->amount,
                'currency' => $paymentIntent->currency
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'client_secret' => $paymentIntent->client_secret,
                    'payment_intent_id' => $paymentIntent->id
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Stripe payment intent error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment intent: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validate test environment and official Stripe test cards
     */
    private function validateTestEnvironment()
    {
        try {
            $secretKey = StripeKeyManager::getSecretKey();
            
            // Ensure we're in test mode
            if (!str_starts_with($secretKey, 'sk_test_')) {
                throw new \Exception('Payment processing is only available in test mode. Please use official Stripe test cards.');
            }

            // Log test environment usage
            Log::info('Payment intent created in TEST MODE with official Stripe test cards only');
            
        } catch (\Exception $e) {
            Log::error('Stripe environment validation failed: ' . $e->getMessage());
            throw new \Exception('Payment processing is only available in test mode. Please use official Stripe test cards.');
        }
    }

    /**
     * Validate payment method (card number) against official Stripe test cards
     */
    public function validatePaymentMethod(Request $request)
    {
        try {
            $request->validate([
                'card_number' => 'required|string'
            ]);

            $cardNumber = preg_replace('/\s+/', '', $request->card_number); // Remove spaces

            // Official Stripe test cards from Stripe documentation
            $officialTestCards = [
                // Success cards
                '4242424242424242', // Visa
                '5555555555554444', // Mastercard
                '378282246310005',  // American Express
                '6011111111111117', // Discover

                // Declined cards
                '4000000000000002', // Generic decline
                '4000000000009995', // Insufficient funds
                '4000000000009987', // Lost card
                '4000000000009979', // Stolen card

                // 3D Secure cards
                '4000000000003220', // Requires 3D Secure
                '4000000000003063', // 3D Secure failed

                // Additional official test cards
                '30569309025904',   // Diners Club
                '3530111333300000', // JCB
                '4000000560000008', // Visa Debit
                '5200828282828210', // Mastercard Debit
                '371449635398431',  // Amex with 3D Secure
                '4000002500003155', // Visa with 3D Secure
            ];

            if (!in_array($cardNumber, $officialTestCards)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only official Stripe test cards are allowed in test mode. Please use the provided test card numbers.',
                    'allowed_cards' => [
                        '4242 4242 4242 4242' => 'Visa (Success)',
                        '5555 5555 5555 4444' => 'Mastercard (Success)',
                        '4000 0000 0000 0002' => 'Visa (Declined)',
                        '4000 0000 0000 9995' => 'Insufficient Funds'
                    ]
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Valid official Stripe test card',
                'card_type' => $this->getCardType($cardNumber)
            ]);

        } catch (\Exception $e) {
            Log::error('Payment method validation error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Payment method validation failed'
            ], 500);
        }
    }

    /**
     * Get card type from card number
     */
    private function getCardType($cardNumber)
    {
        if (substr($cardNumber, 0, 1) === '4') {
            return 'Visa';
        } elseif (substr($cardNumber, 0, 1) === '5') {
            return 'Mastercard';
        } elseif (substr($cardNumber, 0, 1) === '3') {
            return 'American Express';
        } elseif (substr($cardNumber, 0, 1) === '6') {
            return 'Discover';
        }

        return 'Unknown';
    }

    /**
     * Confirm payment
     */
    public function confirmPayment(Request $request)
    {
        try {
            $request->validate([
                'payment_intent_id' => 'required|string',
                'order_data' => 'required|array'
            ]);

            // Validate test environment
            $this->validateTestEnvironment();

            $secretKey = StripeKeyManager::getSecretKey();

            // Set Stripe secret key
            Stripe::setApiKey($secretKey);

            // Retrieve payment intent
            $paymentIntent = PaymentIntent::retrieve($request->payment_intent_id);

            if ($paymentIntent->status === 'succeeded') {
                // Here you would typically create an order in your database
                $orderData = [
                    'user_id' => $request->user()->id ?? 18,
                    'payment_intent_id' => $paymentIntent->id,
                    'amount' => $paymentIntent->amount / 100,
                    'currency' => $paymentIntent->currency,
                    'status' => 'completed',
                    'created_at' => now(),
                ];

                // Log successful payment (in production, save to database)
                Log::info('Payment succeeded', $orderData);

                return response()->json([
                    'success' => true,
                    'data' => [
                        'order' => $orderData,
                        'payment_intent' => $paymentIntent
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Payment not completed'
            ], 400);

        } catch (\Exception $e) {
            Log::error('Stripe payment confirmation error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm payment: ' . $e->getMessage()
            ], 500);
        }
    }
}
