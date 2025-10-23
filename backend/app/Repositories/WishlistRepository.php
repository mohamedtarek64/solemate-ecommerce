<?php

namespace App\Repositories;

use App\DTOs\WishlistItemDTO;
use App\Repositories\Interfaces\WishlistRepositoryInterface;
use App\ValueObjects\ProductVariant;
use App\Enums\ProductTable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Wishlist Repository
 */
class WishlistRepository implements WishlistRepositoryInterface
{
    public function findByUserId(int $userId): array
    {
        $allItems = collect();
        $productTables = [ProductTable::PRODUCTS_WOMEN, ProductTable::PRODUCTS_MEN, ProductTable::PRODUCTS_KIDS];

        foreach ($productTables as $table) {
            try {
                $items = DB::table('wishlist_items')
                    ->join($table, function($join) use ($table) {
                        $join->on('wishlist_items.product_id', '=', $table . '.id')
                             ->where('wishlist_items.product_table', '=', $table);
                    })
                    ->select(
                        'wishlist_items.*',
                        $table . '.name as product_name',
                        $table . '.price as product_price',
                        $table . '.image_url as product_image',
                        $table . '.sku as product_sku',
                        $table . '.quantity',
                        DB::raw("'$table' as source_table")
                    )
                    ->where('wishlist_items.user_id', $userId)
                    ->get();

                // Process items to handle missing columns
                $processedItems = $items->map(function($item) {
                    // Handle stock_quantity - use quantity as fallback
                    $item->stock_quantity = $item->quantity ?? 0;
                    return $item;
                });

                $allItems = $allItems->merge($processedItems);
            } catch (\Exception $e) {
                Log::warning("WishlistRepository: Table $table not found or column missing: " . $e->getMessage());
                continue;
            }
        }

        return $allItems->map(fn($item) => WishlistItemDTO::fromArray((array) $item))->toArray();
    }

    public function findById(int $id, int $userId): ?WishlistItemDTO
    {
        try {
            $item = DB::table('wishlist_items')
                ->where('id', $id)
                ->where('user_id', $userId)
                ->first();

            if (!$item) {
                return null;
            }

            // Get product details
            $product = $this->getProductFromAnyTable($item->product_id, $item->product_table);
            if (!$product) {
                return null;
            }

            $itemData = array_merge((array) $item, [
                'product_name' => $product['name'],
                'product_price' => $product['price'],
                'product_image' => $product['image_url'] ?? $product['image'] ?? '',
                'product_sku' => $product['sku'] ?? '',
                'stock_quantity' => $product['stock_quantity'] ?? $product['quantity'] ?? 0,
                'source_table' => $item->product_table
            ]);

            return WishlistItemDTO::fromArray($itemData);
        } catch (\Exception $e) {
            Log::error("WishlistRepository: Failed to find item by ID: " . $e->getMessage());
            return null;
        }
    }

    public function findExistingItem(int $userId, int $productId, ProductVariant $variant, string $productTable): ?WishlistItemDTO
    {
        try {
            $item = DB::table('wishlist_items')
                ->where('user_id', $userId)
                ->where('product_id', $productId)
                ->where('product_table', $productTable)
                ->where('color', $variant->getColor())
                ->where('size', $variant->getSize())
                ->first();

            if (!$item) {
                return null;
            }

            return $this->findById($item->id, $userId);
        } catch (\Exception $e) {
            Log::error("WishlistRepository: Failed to find existing item: " . $e->getMessage());
            return null;
        }
    }

    public function create(array $data): WishlistItemDTO
    {
        try {
            $itemId = DB::table('wishlist_items')->insertGetId($data);

            return $this->findById($itemId, $data['user_id']);
        } catch (\Exception $e) {
            Log::error("WishlistRepository: Failed to create item: " . $e->getMessage());
            throw $e;
        }
    }

    public function delete(int $id, int $userId): bool
    {
        try {
            return DB::table('wishlist_items')
                ->where('id', $id)
                ->where('user_id', $userId)
                ->delete() > 0;
        } catch (\Exception $e) {
            Log::error("WishlistRepository: Failed to delete item: " . $e->getMessage());
            throw $e;
        }
    }

    public function clear(int $userId): int
    {
        try {
            return DB::table('wishlist_items')
                ->where('user_id', $userId)
                ->delete();
        } catch (\Exception $e) {
            Log::error("WishlistRepository: Failed to clear wishlist: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get product from any table
     */
    private function getProductFromAnyTable(int $productId, string $productTable): ?array
    {
        $productTables = [ProductTable::PRODUCTS_WOMEN, ProductTable::PRODUCTS_MEN, ProductTable::PRODUCTS_KIDS];

        if (in_array($productTable, $productTables)) {
            try {
                $product = DB::table($productTable)
                    ->where('id', $productId)
                    ->first();

                if ($product) {
                    // Add missing columns if they don't exist
                    if (!isset($product->stock_quantity)) {
                        $product->stock_quantity = $product->quantity ?? 0;
                    }
                    if (!isset($product->is_active)) {
                        $product->is_active = 1; // Default to active
                    }
                    return (array) $product;
                }
            } catch (\Exception $e) {
                Log::warning("WishlistRepository: Table $productTable not found or column missing: " . $e->getMessage());
                return null;
            }
        }

        return null;
    }
}
