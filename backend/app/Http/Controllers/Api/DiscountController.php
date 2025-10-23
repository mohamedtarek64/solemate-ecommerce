<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DiscountCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class DiscountController extends Controller
{
    /**
     * Validate discount code
     */
    public function validateDiscountCode(Request $request)
    {
        try {
            \Log::info('Discount code validation request:', [
                'request_data' => $request->all(),
                'headers' => $request->headers->all()
            ]);

            $validator = Validator::make($request->all(), [
                'code' => 'required|string|max:50|min:3|regex:/^[A-Z0-9]+$/',
                'total_amount' => 'required|numeric|min:0',
                'product_ids' => 'array',
                'product_ids.*' => 'integer',
                'category_ids' => 'array',
                'category_ids.*' => 'integer'
            ]);

            if ($validator->fails()) {
                \Log::error('Discount code validation failed:', [
                    'errors' => $validator->errors(),
                    'request_data' => $request->all()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Invalid promo code format. Code must be 3-50 characters, uppercase letters and numbers only.',
                    'errors' => $validator->errors()
                ], 400);
            }

            $code = strtoupper(trim($request->input('code')));
            $totalAmount = $request->input('total_amount');
            $productIds = $request->input('product_ids', []);
            $categoryIds = $request->input('category_ids', []);

            // Additional validation: Check if code is not empty or just spaces
            if (empty($code) || strlen($code) < 3) {
                return response()->json([
                    'success' => false,
                    'message' => 'Promo code must be at least 3 characters long'
                ], 400);
            }

            // Check if total amount is reasonable
            if ($totalAmount <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart total must be greater than zero to apply discount'
                ], 400);
            }

            // Find the discount code
            $discountCode = DiscountCode::where('code', $code)->first();

            if (!$discountCode) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid discount code'
                ], 404);
            }

            // Check if code is valid
            if (!$discountCode->isValid()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Discount code is not valid or has expired'
                ], 400);
            }

            // Calculate discount amount
            $discountAmount = $discountCode->calculateDiscount(
                $totalAmount,
                $productIds,
                $categoryIds
            );

            \Log::info('Discount calculation details:', [
                'code' => $code,
                'total_amount' => $totalAmount,
                'product_ids' => $productIds,
                'category_ids' => $categoryIds,
                'discount_code' => [
                    'id' => $discountCode->id,
                    'name' => $discountCode->name,
                    'type' => $discountCode->type,
                    'value' => $discountCode->value,
                    'minimum_amount' => $discountCode->minimum_amount,
                    'is_valid' => $discountCode->isValid(),
                    'applies_to_products' => $discountCode->appliesToProducts($productIds),
                    'applies_to_categories' => $discountCode->appliesToCategories($categoryIds)
                ],
                'calculated_discount_amount' => $discountAmount
            ]);

            if ($discountAmount <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Discount code does not apply to this order',
                    'debug_info' => [
                        'total_amount' => $totalAmount,
                        'minimum_amount_required' => $discountCode->minimum_amount,
                        'meets_minimum' => $discountCode->minimum_amount ? $totalAmount >= $discountCode->minimum_amount : true,
                        'is_valid' => $discountCode->isValid(),
                        'applies_to_products' => $discountCode->appliesToProducts($productIds),
                        'applies_to_categories' => $discountCode->appliesToCategories($categoryIds)
                    ]
                ], 400);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'discount_code' => $discountCode,
                    'discount_amount' => $discountAmount,
                    'final_amount' => $totalAmount - $discountAmount
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error validating discount code: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error validating discount code'
            ], 500);
        }
    }

    /**
     * Apply discount code (for checkout)
     */
    public function applyDiscountCode(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'code' => 'required|string|max:50|min:3|regex:/^[A-Z0-9]+$/',
                'total_amount' => 'required|numeric|min:0',
                'product_ids' => 'array',
                'product_ids.*' => 'integer',
                'category_ids' => 'array',
                'category_ids.*' => 'integer'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid promo code format. Code must be 3-50 characters, uppercase letters and numbers only.',
                    'errors' => $validator->errors()
                ], 400);
            }

            $code = strtoupper(trim($request->input('code')));
            $totalAmount = $request->input('total_amount');
            $productIds = $request->input('product_ids', []);
            $categoryIds = $request->input('category_ids', []);

            // Additional validation: Check if code is not empty or just spaces
            if (empty($code) || strlen($code) < 3) {
                return response()->json([
                    'success' => false,
                    'message' => 'Promo code must be at least 3 characters long'
                ], 400);
            }

            // Check if total amount is reasonable
            if ($totalAmount <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart total must be greater than zero to apply discount'
                ], 400);
            }

            // Find the discount code
            $discountCode = DiscountCode::where('code', $code)->first();

            if (!$discountCode) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid discount code'
                ], 404);
            }

            // Check if code is valid
            if (!$discountCode->isValid()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Discount code is not valid or has expired'
                ], 400);
            }

            // Calculate discount amount
            $discountAmount = $discountCode->calculateDiscount(
                $totalAmount,
                $productIds,
                $categoryIds
            );

            \Log::info('Discount calculation details:', [
                'code' => $code,
                'total_amount' => $totalAmount,
                'product_ids' => $productIds,
                'category_ids' => $categoryIds,
                'discount_code' => [
                    'id' => $discountCode->id,
                    'name' => $discountCode->name,
                    'type' => $discountCode->type,
                    'value' => $discountCode->value,
                    'minimum_amount' => $discountCode->minimum_amount,
                    'is_valid' => $discountCode->isValid(),
                    'applies_to_products' => $discountCode->appliesToProducts($productIds),
                    'applies_to_categories' => $discountCode->appliesToCategories($categoryIds)
                ],
                'calculated_discount_amount' => $discountAmount
            ]);

            if ($discountAmount <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Discount code does not apply to this order',
                    'debug_info' => [
                        'total_amount' => $totalAmount,
                        'minimum_amount_required' => $discountCode->minimum_amount,
                        'meets_minimum' => $discountCode->minimum_amount ? $totalAmount >= $discountCode->minimum_amount : true,
                        'is_valid' => $discountCode->isValid(),
                        'applies_to_products' => $discountCode->appliesToProducts($productIds),
                        'applies_to_categories' => $discountCode->appliesToCategories($categoryIds)
                    ]
                ], 400);
            }

            // Increment usage count
            $discountCode->incrementUsage();

            return response()->json([
                'success' => true,
                'data' => [
                    'discount_code' => $discountCode,
                    'discount_amount' => $discountAmount,
                    'final_amount' => $totalAmount - $discountAmount
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error applying discount code: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error applying discount code'
            ], 500);
        }
    }
}
