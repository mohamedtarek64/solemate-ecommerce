<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Customer;
use Stripe\Charge;

class PaymentController extends Controller
{
    public function __construct()
    {
        // Set Stripe API key
        Stripe::setApiKey(env('STRIPE_SECRET_KEY', 'sk_test_your_key_here'));
    }

    /**
     * Create payment intent
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function createPaymentIntent(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'amount' => 'required|numeric|min:0.5',
                'currency' => 'string',
                'order_id' => 'nullable|integer'
            ]);

            $amount = $request->input('amount');
            $currency = $request->input('currency', 'usd');
            $orderId = $request->input('order_id');
            $userId = $request->user()?->id;

            // Convert amount to cents
            $amountInCents = round($amount * 100);

            // Create payment intent
            $paymentIntent = PaymentIntent::create([
                'amount' => $amountInCents,
                'currency' => $currency,
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
                'metadata' => [
                    'order_id' => $orderId,
                    'user_id' => $userId,
                ],
            ]);

            // Store payment intent in database
            if ($userId && $orderId) {
                DB::table('payments')->insert([
                    'user_id' => $userId,
                    'order_id' => $orderId,
                    'payment_intent_id' => $paymentIntent->id,
                    'amount' => $amount,
                    'currency' => $currency,
                    'status' => 'pending',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'client_secret' => $paymentIntent->client_secret,
                    'payment_intent_id' => $paymentIntent->id,
                    'amount' => $amount,
                    'currency' => $currency
                ],
                'message' => 'Payment intent created successfully'
            ]);

        } catch (\Stripe\Exception\CardException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Card error: ' . $e->getMessage()
            ], 400);
        } catch (\Stripe\Exception\InvalidRequestException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid request: ' . $e->getMessage()
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirm payment
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function confirmPayment(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'payment_intent_id' => 'required|string',
                'order_id' => 'required|integer'
            ]);

            $paymentIntentId = $request->input('payment_intent_id');
            $orderId = $request->input('order_id');
            $userId = $request->user()?->id;

            // Retrieve payment intent from Stripe
            $paymentIntent = PaymentIntent::retrieve($paymentIntentId);

            // Update payment status in database
            DB::table('payments')
                ->where('payment_intent_id', $paymentIntentId)
                ->update([
                    'status' => $paymentIntent->status,
                    'updated_at' => now()
                ]);

            // Update order status if payment succeeded
            if ($paymentIntent->status === 'succeeded') {
                DB::table('orders')
                    ->where('id', $orderId)
                    ->update([
                        'payment_status' => 'paid',
                        'status' => 'processing',
                        'updated_at' => now()
                    ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'status' => $paymentIntent->status,
                    'amount' => $paymentIntent->amount / 100,
                    'currency' => $paymentIntent->currency
                ],
                'message' => 'Payment confirmed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment confirmation failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get payment status
     *
     * @param Request $request
     * @param string $paymentIntentId
     * @return JsonResponse
     */
    public function getPaymentStatus(Request $request, string $paymentIntentId): JsonResponse
    {
        try {
            $paymentIntent = PaymentIntent::retrieve($paymentIntentId);

            return response()->json([
                'success' => true,
                'data' => [
                    'status' => $paymentIntent->status,
                    'amount' => $paymentIntent->amount / 100,
                    'currency' => $paymentIntent->currency,
                    'payment_method' => $paymentIntent->payment_method
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get payment status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create Stripe customer
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function createCustomer(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Check if customer already exists
            $existingCustomer = DB::table('stripe_customers')
                ->where('user_id', $user->id)
                ->first();

            if ($existingCustomer) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'customer_id' => $existingCustomer->stripe_customer_id
                    ]
                ]);
            }

            // Create Stripe customer
            $customer = Customer::create([
                'email' => $user->email,
                'name' => $user->name ?? ($user->first_name . ' ' . $user->last_name),
                'metadata' => [
                    'user_id' => $user->id
                ]
            ]);

            // Save customer ID to database
            DB::table('stripe_customers')->insert([
                'user_id' => $user->id,
                'stripe_customer_id' => $customer->id,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'customer_id' => $customer->id
                ],
                'message' => 'Customer created successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create customer: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get payment methods for user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getPaymentMethods(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Get customer ID
            $customer = DB::table('stripe_customers')
                ->where('user_id', $user->id)
                ->first();

            if (!$customer) {
                return response()->json([
                    'success' => true,
                    'data' => []
                ]);
            }

            // Get payment methods from Stripe
            $paymentMethods = \Stripe\PaymentMethod::all([
                'customer' => $customer->stripe_customer_id,
                'type' => 'card',
            ]);

            return response()->json([
                'success' => true,
                'data' => $paymentMethods->data
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get payment methods: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Webhook handler for Stripe events
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function webhook(Request $request): JsonResponse
    {
        try {
            $payload = $request->getContent();
            $sigHeader = $request->header('Stripe-Signature');
            $webhookSecret = env('STRIPE_WEBHOOK_SECRET');

            $event = \Stripe\Webhook::constructEvent(
                $payload,
                $sigHeader,
                $webhookSecret
            );

            // Handle different event types
            switch ($event->type) {
                case 'payment_intent.succeeded':
                    $paymentIntent = $event->data->object;
                    $this->handlePaymentSuccess($paymentIntent);
                    break;

                case 'payment_intent.payment_failed':
                    $paymentIntent = $event->data->object;
                    $this->handlePaymentFailure($paymentIntent);
                    break;

                case 'charge.refunded':
                    $charge = $event->data->object;
                    $this->handleRefund($charge);
                    break;

                default:
                    // Unhandled event type
                    break;
            }

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Webhook error: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Handle successful payment
     */
    private function handlePaymentSuccess($paymentIntent)
    {
        DB::table('payments')
            ->where('payment_intent_id', $paymentIntent->id)
            ->update([
                'status' => 'succeeded',
                'updated_at' => now()
            ]);

        // Update order status
        $payment = DB::table('payments')
            ->where('payment_intent_id', $paymentIntent->id)
            ->first();

        if ($payment && $payment->order_id) {
            DB::table('orders')
                ->where('id', $payment->order_id)
                ->update([
                    'payment_status' => 'paid',
                    'status' => 'processing',
                    'updated_at' => now()
                ]);
        }
    }

    /**
     * Handle failed payment
     */
    private function handlePaymentFailure($paymentIntent)
    {
        DB::table('payments')
            ->where('payment_intent_id', $paymentIntent->id)
            ->update([
                'status' => 'failed',
                'updated_at' => now()
            ]);
    }

    /**
     * Handle refund
     */
    private function handleRefund($charge)
    {
        // Find payment by charge ID
        $payment = DB::table('payments')
            ->where('payment_intent_id', $charge->payment_intent)
            ->first();

        if ($payment) {
            DB::table('payments')
                ->where('id', $payment->id)
                ->update([
                    'status' => 'refunded',
                    'updated_at' => now()
                ]);

            // Update order status
            if ($payment->order_id) {
                DB::table('orders')
                    ->where('id', $payment->order_id)
                    ->update([
                        'payment_status' => 'refunded',
                        'status' => 'cancelled',
                        'updated_at' => now()
                    ]);
            }
        }
    }
}
