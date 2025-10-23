<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class AdminController extends Controller
{
    /**
     * Get all discount codes
     */
    public function getDiscountCodes()
    {
        try {
            $discountCodes = DB::table('discount_codes')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $discountCodes
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching discount codes: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch discount codes'
            ], 500);
        }
    }

    /**
     * Create a new discount code
     */
    public function createDiscountCode(Request $request)
    {
        try {
            $request->validate([
                'code' => 'required|string|max:255|unique:discount_codes,code',
                'description' => 'required|string',
                'type' => 'required|in:percentage,fixed',
                'value' => 'required|numeric|min:0',
                'minimum_amount' => 'required|numeric|min:0',
                'usage_limit' => 'required|integer|min:1',
                'starts_at' => 'required|date',
                'expires_at' => 'required|date|after:starts_at',
                'is_active' => 'boolean'
            ]);

            $discountCode = DB::table('discount_codes')->insertGetId([
                'code' => $request->code,
                'description' => $request->description,
                'type' => $request->type,
                'value' => $request->value,
                'minimum_amount' => $request->minimum_amount,
                'usage_limit' => $request->usage_limit,
                'starts_at' => $request->starts_at,
                'expires_at' => $request->expires_at,
                'is_active' => $request->is_active ?? true,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Discount code created successfully',
                'data' => ['id' => $discountCode]
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating discount code: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create discount code: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a discount code
     */
    public function updateDiscountCode(Request $request, $id)
    {
        try {
            $request->validate([
                'code' => 'required|string|max:255|unique:discount_codes,code,' . $id,
                'description' => 'required|string',
                'type' => 'required|in:percentage,fixed',
                'value' => 'required|numeric|min:0',
                'minimum_amount' => 'required|numeric|min:0',
                'usage_limit' => 'required|integer|min:1',
                'starts_at' => 'required|date',
                'expires_at' => 'required|date|after:starts_at',
                'is_active' => 'boolean'
            ]);

            $updated = DB::table('discount_codes')
                ->where('id', $id)
                ->update([
                    'code' => $request->code,
                    'description' => $request->description,
                    'type' => $request->type,
                    'value' => $request->value,
                    'minimum_amount' => $request->minimum_amount,
                    'usage_limit' => $request->usage_limit,
                    'starts_at' => $request->starts_at,
                    'expires_at' => $request->expires_at,
                    'is_active' => $request->is_active ?? true,
                    'updated_at' => now()
                ]);

            if ($updated) {
                return response()->json([
                    'success' => true,
                    'message' => 'Discount code updated successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Discount code not found'
                ], 404);
            }
        } catch (\Exception $e) {
            Log::error('Error updating discount code: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update discount code: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a discount code
     */
    public function deleteDiscountCode($id)
    {
        try {
            $deleted = DB::table('discount_codes')
                ->where('id', $id)
                ->delete();

            if ($deleted) {
                return response()->json([
                    'success' => true,
                    'message' => 'Discount code deleted successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Discount code not found'
                ], 404);
            }
        } catch (\Exception $e) {
            Log::error('Error deleting discount code: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete discount code: ' . $e->getMessage()
            ], 500);
        }
    }
}
