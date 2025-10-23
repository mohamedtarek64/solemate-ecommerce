<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class CheckoutController extends Controller
{
    public function createPaymentIntent(Request $request)
    {
        try {
            $request->validate([
                'amount' => 'required|numeric|min:1',
                'currency' => 'required|string|size:3',
                'order_data' => 'required|array'
            ]);

            Stripe::setApiKey(env('STRIPE_SECRET'));

            $paymentIntent = PaymentIntent::create([
                'amount' => $request->amount * 100, // Convert to cents
                'currency' => $request->currency,
                'metadata' => [
                    'user_id' => $request->user()->id,
                    'order_data' => json_encode($request->order_data)
                ]
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'payment_intent' => $paymentIntent,
                    'client_secret' => $paymentIntent->client_secret
                ]
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

            Stripe::setApiKey(env('STRIPE_SECRET'));

            $paymentIntent = PaymentIntent::retrieve($request->payment_intent_id);
            $paymentIntent->confirm([
                'payment_method' => $request->payment_method_id
            ]);

            if ($paymentIntent->status === 'succeeded') {
                // Create order in database
                $orderId = DB::table('orders')->insertGetId([
                    'user_id' => $request->user()->id,
                    'order_number' => 'ORD-' . time(),
                    'status' => 'completed',
                    'total_amount' => $paymentIntent->amount / 100,
                    'payment_method' => 'stripe',
                    'payment_status' => 'paid',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                return response()->json([
                    'success' => true,
                    'data' => [
                        'order' => [
                            'id' => $orderId,
                            'order_number' => 'ORD-' . time(),
                            'status' => 'completed',
                            'total_amount' => $paymentIntent->amount / 100
                        ],
                        'payment_intent' => $paymentIntent
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Payment not completed'
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm payment: ' . $e->getMessage()
            ], 500);
        }
    }

    public function validateCoupon(Request $request)
    {
        try {
            $request->validate([
                'coupon_code' => 'required|string'
            ]);

            // Mock coupon validation
            $validCoupons = [
                'WELCOME10' => ['discount' => 10, 'type' => 'percentage'],
                'SAVE20' => ['discount' => 20, 'type' => 'percentage'],
                'FIXED50' => ['discount' => 50, 'type' => 'fixed']
            ];

            $couponCode = strtoupper($request->coupon_code);

            if (isset($validCoupons[$couponCode])) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'coupon_code' => $couponCode,
                        'discount' => $validCoupons[$couponCode]['discount'],
                        'type' => $validCoupons[$couponCode]['type']
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Invalid coupon code'
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to validate coupon: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getShippingOptions(Request $request)
    {
        try {
            $request->validate([
                'address' => 'required|array',
                'address.country' => 'required|string',
                'address.state' => 'required|string',
                'address.city' => 'required|string'
            ]);

            // Mock shipping options
            $shippingOptions = [
                [
                    'id' => 'standard',
                    'name' => 'Standard Shipping',
                    'price' => 9.99,
                    'estimated_days' => '5-7 business days'
                ],
                [
                    'id' => 'express',
                    'name' => 'Express Shipping',
                    'price' => 19.99,
                    'estimated_days' => '2-3 business days'
                ],
                [
                    'id' => 'overnight',
                    'name' => 'Overnight Shipping',
                    'price' => 39.99,
                    'estimated_days' => '1 business day'
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $shippingOptions
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get shipping options: ' . $e->getMessage()
            ], 500);
        }
    }
}

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class CheckoutController extends Controller
{
    public function createPaymentIntent(Request $request)
    {
        try {
            $request->validate([
                'amount' => 'required|numeric|min:1',
                'currency' => 'required|string|size:3',
                'order_data' => 'required|array'
            ]);

            Stripe::setApiKey(env('STRIPE_SECRET'));

            $paymentIntent = PaymentIntent::create([
                'amount' => $request->amount * 100, // Convert to cents
                'currency' => $request->currency,
                'metadata' => [
                    'user_id' => $request->user()->id,
                    'order_data' => json_encode($request->order_data)
                ]
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'payment_intent' => $paymentIntent,
                    'client_secret' => $paymentIntent->client_secret
                ]
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

            Stripe::setApiKey(env('STRIPE_SECRET'));

            $paymentIntent = PaymentIntent::retrieve($request->payment_intent_id);
            $paymentIntent->confirm([
                'payment_method' => $request->payment_method_id
            ]);

            if ($paymentIntent->status === 'succeeded') {
                // Create order in database
                $orderId = DB::table('orders')->insertGetId([
                    'user_id' => $request->user()->id,
                    'order_number' => 'ORD-' . time(),
                    'status' => 'completed',
                    'total_amount' => $paymentIntent->amount / 100,
                    'payment_method' => 'stripe',
                    'payment_status' => 'paid',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                return response()->json([
                    'success' => true,
                    'data' => [
                        'order' => [
                            'id' => $orderId,
                            'order_number' => 'ORD-' . time(),
                            'status' => 'completed',
                            'total_amount' => $paymentIntent->amount / 100
                        ],
                        'payment_intent' => $paymentIntent
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Payment not completed'
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm payment: ' . $e->getMessage()
            ], 500);
        }
    }

    public function validateCoupon(Request $request)
    {
        try {
            $request->validate([
                'coupon_code' => 'required|string'
            ]);

            // Mock coupon validation
            $validCoupons = [
                'WELCOME10' => ['discount' => 10, 'type' => 'percentage'],
                'SAVE20' => ['discount' => 20, 'type' => 'percentage'],
                'FIXED50' => ['discount' => 50, 'type' => 'fixed']
            ];

            $couponCode = strtoupper($request->coupon_code);

            if (isset($validCoupons[$couponCode])) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'coupon_code' => $couponCode,
                        'discount' => $validCoupons[$couponCode]['discount'],
                        'type' => $validCoupons[$couponCode]['type']
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Invalid coupon code'
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to validate coupon: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getShippingOptions(Request $request)
    {
        try {
            $request->validate([
                'address' => 'required|array',
                'address.country' => 'required|string',
                'address.state' => 'required|string',
                'address.city' => 'required|string'
            ]);

            // Mock shipping options
            $shippingOptions = [
                [
                    'id' => 'standard',
                    'name' => 'Standard Shipping',
                    'price' => 9.99,
                    'estimated_days' => '5-7 business days'
                ],
                [
                    'id' => 'express',
                    'name' => 'Express Shipping',
                    'price' => 19.99,
                    'estimated_days' => '2-3 business days'
                ],
                [
                    'id' => 'overnight',
                    'name' => 'Overnight Shipping',
                    'price' => 39.99,
                    'estimated_days' => '1 business day'
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $shippingOptions
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get shipping options: ' . $e->getMessage()
            ], 500);
        }
    }
}

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class CheckoutController extends Controller
{
    public function createPaymentIntent(Request $request)
    {
        try {
            $request->validate([
                'amount' => 'required|numeric|min:1',
                'currency' => 'required|string|size:3',
                'order_data' => 'required|array'
            ]);

            Stripe::setApiKey(env('STRIPE_SECRET'));

            $paymentIntent = PaymentIntent::create([
                'amount' => $request->amount * 100, // Convert to cents
                'currency' => $request->currency,
                'metadata' => [
                    'user_id' => $request->user()->id,
                    'order_data' => json_encode($request->order_data)
                ]
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'payment_intent' => $paymentIntent,
                    'client_secret' => $paymentIntent->client_secret
                ]
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

            Stripe::setApiKey(env('STRIPE_SECRET'));

            $paymentIntent = PaymentIntent::retrieve($request->payment_intent_id);
            $paymentIntent->confirm([
                'payment_method' => $request->payment_method_id
            ]);

            if ($paymentIntent->status === 'succeeded') {
                // Create order in database
                $orderId = DB::table('orders')->insertGetId([
                    'user_id' => $request->user()->id,
                    'order_number' => 'ORD-' . time(),
                    'status' => 'completed',
                    'total_amount' => $paymentIntent->amount / 100,
                    'payment_method' => 'stripe',
                    'payment_status' => 'paid',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                return response()->json([
                    'success' => true,
                    'data' => [
                        'order' => [
                            'id' => $orderId,
                            'order_number' => 'ORD-' . time(),
                            'status' => 'completed',
                            'total_amount' => $paymentIntent->amount / 100
                        ],
                        'payment_intent' => $paymentIntent
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Payment not completed'
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm payment: ' . $e->getMessage()
            ], 500);
        }
    }

    public function validateCoupon(Request $request)
    {
        try {
            $request->validate([
                'coupon_code' => 'required|string'
            ]);

            // Mock coupon validation
            $validCoupons = [
                'WELCOME10' => ['discount' => 10, 'type' => 'percentage'],
                'SAVE20' => ['discount' => 20, 'type' => 'percentage'],
                'FIXED50' => ['discount' => 50, 'type' => 'fixed']
            ];

            $couponCode = strtoupper($request->coupon_code);

            if (isset($validCoupons[$couponCode])) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'coupon_code' => $couponCode,
                        'discount' => $validCoupons[$couponCode]['discount'],
                        'type' => $validCoupons[$couponCode]['type']
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Invalid coupon code'
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to validate coupon: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getShippingOptions(Request $request)
    {
        try {
            $request->validate([
                'address' => 'required|array',
                'address.country' => 'required|string',
                'address.state' => 'required|string',
                'address.city' => 'required|string'
            ]);

            // Mock shipping options
            $shippingOptions = [
                [
                    'id' => 'standard',
                    'name' => 'Standard Shipping',
                    'price' => 9.99,
                    'estimated_days' => '5-7 business days'
                ],
                [
                    'id' => 'express',
                    'name' => 'Express Shipping',
                    'price' => 19.99,
                    'estimated_days' => '2-3 business days'
                ],
                [
                    'id' => 'overnight',
                    'name' => 'Overnight Shipping',
                    'price' => 39.99,
                    'estimated_days' => '1 business day'
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $shippingOptions
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get shipping options: ' . $e->getMessage()
            ], 500);
        }
    }
}

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class CheckoutController extends Controller
{
    public function createPaymentIntent(Request $request)
    {
        try {
            $request->validate([
                'amount' => 'required|numeric|min:1',
                'currency' => 'required|string|size:3',
                'order_data' => 'required|array'
            ]);

            Stripe::setApiKey(env('STRIPE_SECRET'));

            $paymentIntent = PaymentIntent::create([
                'amount' => $request->amount * 100, // Convert to cents
                'currency' => $request->currency,
                'metadata' => [
                    'user_id' => $request->user()->id,
                    'order_data' => json_encode($request->order_data)
                ]
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'payment_intent' => $paymentIntent,
                    'client_secret' => $paymentIntent->client_secret
                ]
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

            Stripe::setApiKey(env('STRIPE_SECRET'));

            $paymentIntent = PaymentIntent::retrieve($request->payment_intent_id);
            $paymentIntent->confirm([
                'payment_method' => $request->payment_method_id
            ]);

            if ($paymentIntent->status === 'succeeded') {
                // Create order in database
                $orderId = DB::table('orders')->insertGetId([
                    'user_id' => $request->user()->id,
                    'order_number' => 'ORD-' . time(),
                    'status' => 'completed',
                    'total_amount' => $paymentIntent->amount / 100,
                    'payment_method' => 'stripe',
                    'payment_status' => 'paid',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                return response()->json([
                    'success' => true,
                    'data' => [
                        'order' => [
                            'id' => $orderId,
                            'order_number' => 'ORD-' . time(),
                            'status' => 'completed',
                            'total_amount' => $paymentIntent->amount / 100
                        ],
                        'payment_intent' => $paymentIntent
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Payment not completed'
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm payment: ' . $e->getMessage()
            ], 500);
        }
    }

    public function validateCoupon(Request $request)
    {
        try {
            $request->validate([
                'coupon_code' => 'required|string'
            ]);

            // Mock coupon validation
            $validCoupons = [
                'WELCOME10' => ['discount' => 10, 'type' => 'percentage'],
                'SAVE20' => ['discount' => 20, 'type' => 'percentage'],
                'FIXED50' => ['discount' => 50, 'type' => 'fixed']
            ];

            $couponCode = strtoupper($request->coupon_code);

            if (isset($validCoupons[$couponCode])) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'coupon_code' => $couponCode,
                        'discount' => $validCoupons[$couponCode]['discount'],
                        'type' => $validCoupons[$couponCode]['type']
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Invalid coupon code'
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to validate coupon: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getShippingOptions(Request $request)
    {
        try {
            $request->validate([
                'address' => 'required|array',
                'address.country' => 'required|string',
                'address.state' => 'required|string',
                'address.city' => 'required|string'
            ]);

            // Mock shipping options
            $shippingOptions = [
                [
                    'id' => 'standard',
                    'name' => 'Standard Shipping',
                    'price' => 9.99,
                    'estimated_days' => '5-7 business days'
                ],
                [
                    'id' => 'express',
                    'name' => 'Express Shipping',
                    'price' => 19.99,
                    'estimated_days' => '2-3 business days'
                ],
                [
                    'id' => 'overnight',
                    'name' => 'Overnight Shipping',
                    'price' => 39.99,
                    'estimated_days' => '1 business day'
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $shippingOptions
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get shipping options: ' . $e->getMessage()
            ], 500);
        }
    }
}

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class CheckoutController extends Controller
{
    public function createPaymentIntent(Request $request)
    {
        try {
            $request->validate([
                'amount' => 'required|numeric|min:1',
                'currency' => 'required|string|size:3',
                'order_data' => 'required|array'
            ]);

            Stripe::setApiKey(env('STRIPE_SECRET'));

            $paymentIntent = PaymentIntent::create([
                'amount' => $request->amount * 100, // Convert to cents
                'currency' => $request->currency,
                'metadata' => [
                    'user_id' => $request->user()->id,
                    'order_data' => json_encode($request->order_data)
                ]
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'payment_intent' => $paymentIntent,
                    'client_secret' => $paymentIntent->client_secret
                ]
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

            Stripe::setApiKey(env('STRIPE_SECRET'));

            $paymentIntent = PaymentIntent::retrieve($request->payment_intent_id);
            $paymentIntent->confirm([
                'payment_method' => $request->payment_method_id
            ]);

            if ($paymentIntent->status === 'succeeded') {
                // Create order in database
                $orderId = DB::table('orders')->insertGetId([
                    'user_id' => $request->user()->id,
                    'order_number' => 'ORD-' . time(),
                    'status' => 'completed',
                    'total_amount' => $paymentIntent->amount / 100,
                    'payment_method' => 'stripe',
                    'payment_status' => 'paid',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                return response()->json([
                    'success' => true,
                    'data' => [
                        'order' => [
                            'id' => $orderId,
                            'order_number' => 'ORD-' . time(),
                            'status' => 'completed',
                            'total_amount' => $paymentIntent->amount / 100
                        ],
                        'payment_intent' => $paymentIntent
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Payment not completed'
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm payment: ' . $e->getMessage()
            ], 500);
        }
    }

    public function validateCoupon(Request $request)
    {
        try {
            $request->validate([
                'coupon_code' => 'required|string'
            ]);

            // Mock coupon validation
            $validCoupons = [
                'WELCOME10' => ['discount' => 10, 'type' => 'percentage'],
                'SAVE20' => ['discount' => 20, 'type' => 'percentage'],
                'FIXED50' => ['discount' => 50, 'type' => 'fixed']
            ];

            $couponCode = strtoupper($request->coupon_code);

            if (isset($validCoupons[$couponCode])) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'coupon_code' => $couponCode,
                        'discount' => $validCoupons[$couponCode]['discount'],
                        'type' => $validCoupons[$couponCode]['type']
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Invalid coupon code'
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to validate coupon: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getShippingOptions(Request $request)
    {
        try {
            $request->validate([
                'address' => 'required|array',
                'address.country' => 'required|string',
                'address.state' => 'required|string',
                'address.city' => 'required|string'
            ]);

            // Mock shipping options
            $shippingOptions = [
                [
                    'id' => 'standard',
                    'name' => 'Standard Shipping',
                    'price' => 9.99,
                    'estimated_days' => '5-7 business days'
                ],
                [
                    'id' => 'express',
                    'name' => 'Express Shipping',
                    'price' => 19.99,
                    'estimated_days' => '2-3 business days'
                ],
                [
                    'id' => 'overnight',
                    'name' => 'Overnight Shipping',
                    'price' => 39.99,
                    'estimated_days' => '1 business day'
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $shippingOptions
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get shipping options: ' . $e->getMessage()
            ], 500);
        }
    }
}
