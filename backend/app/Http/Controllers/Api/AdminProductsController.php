<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminProductsController extends Controller
{
    public function index(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 15);
            $search = $request->get('search');
            $category = $request->get('category');
            $status = $request->get('status');
            $sort = $request->get('sort', 'created_at');
            $order = $request->get('order', 'desc');

            $query = DB::table('products');

            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%");
                });
            }

            if ($category) {
                $query->where('category', $category);
            }

            if ($status) {
                $query->where('is_active', $status === 'active');
            }

            $products = $query->orderBy($sort, $order)
                ->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data' => $products
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get products: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Request $request, $id)
    {
        try {
            $product = DB::table('products')->where('id', $id)->first();

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            // Get product statistics
            $product->stats = [
                'total_orders' => DB::table('order_items')
                    ->join('orders', 'order_items.order_id', '=', 'orders.id')
                    ->where('order_items.product_id', $id)
                    ->count(),
                'total_sold' => DB::table('order_items')
                    ->where('product_id', $id)
                    ->sum('quantity'),
                'total_revenue' => DB::table('order_items')
                    ->where('product_id', $id)
                    ->sum('subtotal'),
                'avg_rating' => DB::table('reviews')
                    ->where('product_id', $id)
                    ->avg('rating')
            ];

            return response()->json([
                'success' => true,
                'data' => $product
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get product: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'price' => 'required|numeric|min:0',
                'sku' => 'required|string|unique:products,sku',
                'stock_quantity' => 'required|integer|min:0',
                'category' => 'required|string',
                'brand' => 'nullable|string',
                'image_url' => 'nullable|url',
                'is_active' => 'boolean',
                'is_featured' => 'boolean'
            ]);

            $productId = DB::table('products')->insertGetId([
                'name' => $request->name,
                'description' => $request->description,
                'price' => $request->price,
                'sku' => $request->sku,
                'stock_quantity' => $request->stock_quantity,
                'category' => $request->category,
                'brand' => $request->brand,
                'image_url' => $request->image_url,
                'is_active' => $request->is_active ?? true,
                'is_featured' => $request->is_featured ?? false,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            $product = DB::table('products')->where('id', $productId)->first();

            return response()->json([
                'success' => true,
                'data' => $product,
                'message' => 'Product created successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create product: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'price' => 'required|numeric|min:0',
                'sku' => 'required|string|unique:products,sku,' . $id,
                'stock_quantity' => 'required|integer|min:0',
                'category' => 'required|string',
                'brand' => 'nullable|string',
                'image_url' => 'nullable|url',
                'is_active' => 'boolean',
                'is_featured' => 'boolean'
            ]);

            $updated = DB::table('products')
                ->where('id', $id)
                ->update([
                    'name' => $request->name,
                    'description' => $request->description,
                    'price' => $request->price,
                    'sku' => $request->sku,
                    'stock_quantity' => $request->stock_quantity,
                    'category' => $request->category,
                    'brand' => $request->brand,
                    'image_url' => $request->image_url,
                    'is_active' => $request->is_active ?? true,
                    'is_featured' => $request->is_featured ?? false,
                    'updated_at' => now()
                ]);

            if ($updated) {
                $product = DB::table('products')->where('id', $id)->first();
                
                return response()->json([
                    'success' => true,
                    'data' => $product,
                    'message' => 'Product updated successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update product: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            // Soft delete - just deactivate the product
            $updated = DB::table('products')
                ->where('id', $id)
                ->update([
                    'is_active' => false,
                    'updated_at' => now()
                ]);

            if ($updated) {
                return response()->json([
                    'success' => true,
                    'message' => 'Product deleted successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete product: ' . $e->getMessage()
            ], 500);
        }
    }

    public function export(Request $request)
    {
        try {
            $format = $request->get('format', 'csv');
            $category = $request->get('category');

            $query = DB::table('products');

            if ($category) {
                $query->where('category', $category);
            }

            $products = $query->orderBy('created_at', 'desc')->get();

            if ($format === 'csv') {
                $csv = "ID,Name,SKU,Price,Stock,Category,Brand,Active,Featured,Created At\n";
                
                foreach ($products as $product) {
                    $csv .= "{$product->id},{$product->name},{$product->sku},{$product->price},{$product->stock_quantity},{$product->category},{$product->brand},{$product->is_active},{$product->is_featured},{$product->created_at}\n";
                }

                return response($csv)
                    ->header('Content-Type', 'text/csv')
                    ->header('Content-Disposition', 'attachment; filename="products.csv"');
            }

            return response()->json([
                'success' => true,
                'data' => $products
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export products: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getCategories(Request $request)
    {
        try {
            $categories = DB::table('products')
                ->select('category')
                ->distinct()
                ->whereNotNull('category')
                ->where('category', '!=', '')
                ->orderBy('category')
                ->pluck('category');

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get categories: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getBrands(Request $request)
    {
        try {
            $brands = DB::table('products')
                ->select('brand')
                ->distinct()
                ->whereNotNull('brand')
                ->where('brand', '!=', '')
                ->orderBy('brand')
                ->pluck('brand');

            return response()->json([
                'success' => true,
                'data' => $brands
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get brands: ' . $e->getMessage()
            ], 500);
        }
    }
}
