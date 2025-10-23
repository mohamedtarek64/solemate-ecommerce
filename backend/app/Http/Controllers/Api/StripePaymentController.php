<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StripePaymentController extends Controller
{
    public function getConfig(Request $request)
    {
        try {
            $config = [
                'publishable_key' => env('STRIPE_PUBLISHABLE_KEY', 'pk_test_...'),
                'currency' => 'usd',
                'country' => 'US',
                'locale' => 'en'
            ];

            return response()->json([
                'success' => true,
                'data' => $config
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get Stripe config: ' . $e->getMessage()
            ], 500);
        }
    }

    public function createPaymentIntent(Request $request)
    {
        try {
            $request->validate([
                'amount' => 'required|numeric|min:1',
                'currency' => 'required|string|size:3',
                'order_id' => 'nullable|integer',
                'customer_id' => 'nullable|integer'
            ]);

            // Mock Stripe payment intent creation
            $paymentIntent = [
                'id' => 'pi_' . uniqid(),
                'client_secret' => 'pi_' . uniqid() . '_secret_' . uniqid(),
                'amount' => $request->amount * 100, // Convert to cents
                'currency' => $request->currency,
                'status' => 'requires_payment_method',
                'created' => time()
            ];

            // Store payment intent in database
            DB::table('payment_intents')->insert([
                'stripe_payment_intent_id' => $paymentIntent['id'],
                'amount' => $request->amount,
                'currency' => $request->currency,
                'status' => $paymentIntent['status'],
                'order_id' => $request->order_id,
                'customer_id' => $request->customer_id,
                'metadata' => json_encode($request->all()),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'data' => $paymentIntent
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment intent: ' . $e->getMessage()
            ], 500);
        }
    }

    public function confirmPayment(Request $request)
    {
        try {
            $request->validate([
                'payment_intent_id' => 'required|string',
                'payment_method_id' => 'required|string'
            ]);

            // Mock Stripe payment confirmation
            $paymentIntent = DB::table('payment_intents')
                ->where('stripe_payment_intent_id', $request->payment_intent_id)
                ->first();

            if (!$paymentIntent) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment intent not found'
                ], 404);
            }

            // Update payment intent status
            DB::table('payment_intents')
                ->where('stripe_payment_intent_id', $request->payment_intent_id)
                ->update([
                    'status' => 'succeeded',
                    'payment_method_id' => $request->payment_method_id,
                    'updated_at' => now()
                ]);

            // Update order status if order_id exists
            if ($paymentIntent->order_id) {
                DB::table('orders')
                    ->where('id', $paymentIntent->order_id)
                    ->update([
                        'payment_status' => 'paid',
                        'status' => 'processing',
                        'updated_at' => now()
                    ]);
            }

            $result = [
                'id' => $paymentIntent->stripe_payment_intent_id,
                'status' => 'succeeded',
                'amount' => $paymentIntent->amount,
                'currency' => $paymentIntent->currency,
                'payment_method' => $request->payment_method_id
            ];

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Payment confirmed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm payment: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getPaymentMethods(Request $request)
    {
        try {
            $userId = $request->user()->id;

            $paymentMethods = DB::table('payment_methods')
                ->where('user_id', $userId)
                ->where('is_active', true)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $paymentMethods
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get payment methods: ' . $e->getMessage()
            ], 500);
        }
    }

    public function addPaymentMethod(Request $request)
    {
        try {
            $request->validate([
                'payment_method_id' => 'required|string',
                'type' => 'required|string|in:card',
                'card_last4' => 'required|string|size:4',
                'card_brand' => 'required|string',
                'card_exp_month' => 'required|integer|between:1,12',
                'card_exp_year' => 'required|integer|min:' . date('Y')
            ]);

            $userId = $request->user()->id;

            $paymentMethodId = DB::table('payment_methods')->insertGetId([
                'user_id' => $userId,
                'stripe_payment_method_id' => $request->payment_method_id,
                'type' => $request->type,
                'card_last4' => $request->card_last4,
                'card_brand' => $request->card_brand,
                'card_exp_month' => $request->card_exp_month,
                'card_exp_year' => $request->card_exp_year,
                'is_default' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            $paymentMethod = DB::table('payment_methods')->where('id', $paymentMethodId)->first();

            return response()->json([
                'success' => true,
                'data' => $paymentMethod,
                'message' => 'Payment method added successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add payment method: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deletePaymentMethod(Request $request, $id)
    {
        try {
            $userId = $request->user()->id;

            $deleted = DB::table('payment_methods')
                ->where('id', $id)
                ->where('user_id', $userId)
                ->update(['is_active' => false]);

            if ($deleted) {
                return response()->json([
                    'success' => true,
                    'message' => 'Payment method deleted successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment method not found'
                ], 404);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete payment method: ' . $e->getMessage()
            ], 500);
        }
    }
}