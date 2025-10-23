<?php

namespace App\Services;

use App\Models\PaymentIntent;
use App\Models\PaymentMethod;
use App\Models\User;
use Stripe\Stripe;
use Stripe\PaymentIntent as StripePaymentIntent;
use Stripe\PaymentMethod as StripePaymentMethod;
use Stripe\Exception\ApiErrorException;

class PaymentService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Create payment intent.
     */
    public function createPaymentIntent(User $user, array $data): array
    {
        try {
            $stripePaymentIntent = StripePaymentIntent::create([
                'amount' => $data['amount'] * 100, // Convert to cents
                'currency' => $data['currency'] ?? 'usd',
                'customer' => $this->getOrCreateStripeCustomer($user),
                'metadata' => $data['metadata'] ?? [],
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            // Store payment intent in database
            $paymentIntent = PaymentIntent::create([
                'user_id' => $user->id,
                'order_id' => $data['order_id'] ?? null,
                'stripe_payment_intent_id' => $stripePaymentIntent->id,
                'amount' => $data['amount'],
                'currency' => $data['currency'] ?? 'usd',
                'status' => $stripePaymentIntent->status,
                'client_secret' => $stripePaymentIntent->client_secret,
                'metadata' => $data['metadata'] ?? [],
            ]);

            return [
                'client_secret' => $stripePaymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id,
            ];
        } catch (ApiErrorException $e) {
            throw new \Exception('Payment intent creation failed: ' . $e->getMessage());
        }
    }

    /**
     * Confirm payment intent.
     */
    public function confirmPaymentIntent(string $paymentIntentId): array
    {
        try {
            $stripePaymentIntent = StripePaymentIntent::retrieve($paymentIntentId);
            $stripePaymentIntent->confirm();

            // Update local payment intent
            $paymentIntent = PaymentIntent::where('stripe_payment_intent_id', $paymentIntentId)->first();
            if ($paymentIntent) {
                $paymentIntent->update([
                    'status' => $stripePaymentIntent->status,
                ]);
            }

            return [
                'status' => $stripePaymentIntent->status,
                'payment_intent' => $stripePaymentIntent,
            ];
        } catch (ApiErrorException $e) {
            throw new \Exception('Payment confirmation failed: ' . $e->getMessage());
        }
    }

    /**
     * Get user payment methods.
     */
    public function getUserPaymentMethods(User $user): array
    {
        $paymentMethods = PaymentMethod::where('user_id', $user->id)
                                     ->active()
                                     ->get();

        return $paymentMethods->map(function ($method) {
            return [
                'id' => $method->id,
                'type' => $method->type,
                'card_brand' => $method->card_brand,
                'card_last_four' => $method->card_last_four,
                'card_exp_month' => $method->card_exp_month,
                'card_exp_year' => $method->card_exp_year,
                'is_default' => $method->is_default,
                'masked_card_number' => $method->masked_card_number,
            ];
        })->toArray();
    }

    /**
     * Add payment method.
     */
    public function addPaymentMethod(User $user, string $stripePaymentMethodId): PaymentMethod
    {
        try {
            $stripePaymentMethod = StripePaymentMethod::retrieve($stripePaymentMethodId);
            
            // Attach to customer
            $stripePaymentMethod->attach([
                'customer' => $this->getOrCreateStripeCustomer($user),
            ]);

            $paymentMethod = PaymentMethod::create([
                'user_id' => $user->id,
                'stripe_payment_method_id' => $stripePaymentMethod->id,
                'type' => $stripePaymentMethod->type,
                'card_brand' => $stripePaymentMethod->card->brand ?? null,
                'card_last_four' => $stripePaymentMethod->card->last4 ?? null,
                'card_exp_month' => $stripePaymentMethod->card->exp_month ?? null,
                'card_exp_year' => $stripePaymentMethod->card->exp_year ?? null,
                'is_default' => false,
                'metadata' => $stripePaymentMethod->metadata->toArray(),
            ]);

            return $paymentMethod;
        } catch (ApiErrorException $e) {
            throw new \Exception('Payment method addition failed: ' . $e->getMessage());
        }
    }

    /**
     * Set default payment method.
     */
    public function setDefaultPaymentMethod(User $user, int $paymentMethodId): bool
    {
        $paymentMethod = PaymentMethod::where('user_id', $user->id)
                                     ->where('id', $paymentMethodId)
                                     ->first();

        if (!$paymentMethod) {
            throw new \Exception('Payment method not found');
        }

        // Remove default from other payment methods
        PaymentMethod::where('user_id', $user->id)
                    ->update(['is_default' => false]);

        // Set this as default
        $paymentMethod->update(['is_default' => true]);

        return true;
    }

    /**
     * Delete payment method.
     */
    public function deletePaymentMethod(User $user, int $paymentMethodId): bool
    {
        $paymentMethod = PaymentMethod::where('user_id', $user->id)
                                     ->where('id', $paymentMethodId)
                                     ->first();

        if (!$paymentMethod) {
            throw new \Exception('Payment method not found');
        }

        try {
            // Detach from Stripe
            $stripePaymentMethod = StripePaymentMethod::retrieve($paymentMethod->stripe_payment_method_id);
            $stripePaymentMethod->detach();

            // Delete from database
            $paymentMethod->delete();

            return true;
        } catch (ApiErrorException $e) {
            throw new \Exception('Payment method deletion failed: ' . $e->getMessage());
        }
    }

    /**
     * Get or create Stripe customer.
     */
    private function getOrCreateStripeCustomer(User $user): string
    {
        // Check if user already has a Stripe customer ID
        if ($user->stripe_customer_id) {
            return $user->stripe_customer_id;
        }

        try {
            $customer = \Stripe\Customer::create([
                'email' => $user->email,
                'name' => $user->name,
                'metadata' => [
                    'user_id' => $user->id,
                ],
            ]);

            $user->update(['stripe_customer_id' => $customer->id]);

            return $customer->id;
        } catch (ApiErrorException $e) {
            throw new \Exception('Customer creation failed: ' . $e->getMessage());
        }
    }

    /**
     * Process refund.
     */
    public function processRefund(string $paymentIntentId, int $amount = null): array
    {
        try {
            $refundData = ['payment_intent' => $paymentIntentId];
            
            if ($amount) {
                $refundData['amount'] = $amount * 100; // Convert to cents
            }

            $refund = \Stripe\Refund::create($refundData);

            return [
                'id' => $refund->id,
                'status' => $refund->status,
                'amount' => $refund->amount / 100, // Convert back to dollars
            ];
        } catch (ApiErrorException $e) {
            throw new \Exception('Refund processing failed: ' . $e->getMessage());
        }
    }
}
