<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProductSize;
use App\Models\Product;

class ProductSizeController extends Controller
{
    /**
     * Get available sizes for a product
     */
    public function getProductSizes(Request $request, $productId)
    {
        try {
            $product = Product::find($productId);

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            $sizes = ProductSize::where('product_id', $productId)
                ->available()
                ->inStock()
                ->orderBy('size')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'sizes' => $sizes->map(function ($size) {
                        return [
                            'id' => $size->id,
                            'size' => $size->size,
                            'stock_quantity' => $size->stock_quantity,
                            'is_available' => $size->is_available
                        ];
                    })
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch product sizes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all sizes for a product (including out of stock)
     */
    public function getAllProductSizes(Request $request, $productId)
    {
        try {
            $product = Product::find($productId);

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            $sizes = ProductSize::where('product_id', $productId)
                ->orderBy('size')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'sizes' => $sizes->map(function ($size) {
                        return [
                            'id' => $size->id,
                            'size' => $size->size,
                            'stock_quantity' => $size->stock_quantity,
                            'is_available' => $size->is_available
                        ];
                    })
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch product sizes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if a specific size is available for a product
     */
    public function checkSizeAvailability(Request $request, $productId, $size)
    {
        try {
            $productSize = ProductSize::where('product_id', $productId)
                ->where('size', $size)
                ->first();

            if (!$productSize) {
                return response()->json([
                    'success' => false,
                    'message' => 'Size not found for this product'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'product_id' => $productId,
                    'size' => $size,
                    'is_available' => $productSize->is_available,
                    'stock_quantity' => $productSize->stock_quantity,
                    'can_purchase' => $productSize->is_available && $productSize->stock_quantity > 0
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check size availability: ' . $e->getMessage()
            ], 500);
        }
    }
}
