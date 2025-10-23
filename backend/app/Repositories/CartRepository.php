<?php

namespace App\Repositories;

use App\DTOs\CartItemDTO;
use App\Enums\ProductTable;
use App\Repositories\Interfaces\CartRepositoryInterface;
use App\ValueObjects\ProductVariant;
use Illuminate\Support\Facades\DB;

class CartRepository implements CartRepositoryInterface
{
    public function findByUserId(int $userId): array
    {
        $allItems = collect();
        $productTables = ProductTable::getAll();

        foreach ($productTables as $table) {
            try {
                $items = DB::table('cart_items')
                    ->join($table, function($join) use ($table) {
                        $join->on('cart_items.product_id', '=', $table . '.id')
                             ->where('cart_items.product_table', '=', $table);
                    })
                    ->select(
                        'cart_items.id',
                        'cart_items.user_id',
                        'cart_items.product_id',
                        'cart_items.product_table',
                        DB::raw('cart_items.quantity as cart_quantity'),
                        'cart_items.color',
                        'cart_items.size',
                        'cart_items.created_at',
                        'cart_items.updated_at',
                        DB::raw($table . '.name as product_name'),
                        DB::raw($table . '.price as product_price'),
                        DB::raw($table . '.image_url as product_image'),
                        DB::raw($table . '.sku as product_sku'),
                        DB::raw('COALESCE(' . $table . '.stock_quantity, ' . $table . '.stock, 0) as product_stock_quantity'),
                        DB::raw("'$table' as source_table")
                    )
                    ->where('cart_items.user_id', $userId)
                    ->get();

                // Normalize
                $normalized = $items->map(function($item) {
                    $item->quantity = (int)($item->cart_quantity ?? 0);
                    $item->stock_quantity = (int)($item->product_stock_quantity ?? 0);

                    // Convert color from JSON object to string if needed
                    if (is_string($item->color) && json_decode($item->color)) {
                        $colorObj = json_decode($item->color, true);
                        $item->color = $colorObj['color'] ?? $colorObj['name'] ?? $item->color;
                    } elseif (is_object($item->color)) {
                        $item->color = $item->color->color ?? $item->color->name ?? (string)$item->color;
                    }

                    // Convert size from JSON object to string if needed
                    if (is_string($item->size) && json_decode($item->size)) {
                        $sizeObj = json_decode($item->size, true);
                        $item->size = $sizeObj['size'] ?? $sizeObj['name'] ?? $item->size;
                    } elseif (is_object($item->size)) {
                        $item->size = $item->size->size ?? $item->size->name ?? (string)$item->size;
                    }

                    unset($item->cart_quantity);
                    unset($item->product_stock_quantity);
                    return $item;
                });

                $allItems = $allItems->merge($normalized);
            } catch (\Exception $e) {
                // Table doesn't exist, continue
                continue;
            }
        }

        return $allItems->map(fn($item) => CartItemDTO::fromArray((array) $item))->toArray();
    }

    public function findById(int $id, int $userId): ?CartItemDTO
    {
        try {
            $item = DB::table('cart_items')
                ->where('id', $id)
                ->where('user_id', $userId)
                ->first();

            if (!$item) {
                return null;
            }

            // Get product details
            $productTable = $item->product_table ?? 'products_women';
            $product = DB::table($productTable)
                ->where('id', $item->product_id)
                ->first();

            if (!$product) {
                return null;
            }

            // Create complete DTO
            $itemData = (array) $item;
            $itemData['product_name'] = $product->name;
            $itemData['product_price'] = $product->price;
            $itemData['product_image'] = $product->image_url;
            $itemData['product_sku'] = $product->sku;
            $itemData['stock_quantity'] = $product->stock_quantity;
            $itemData['source_table'] = $productTable;

            return CartItemDTO::fromArray($itemData);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('CartRepository findById error: ' . $e->getMessage());
            return null;
        }
    }

    public function findExistingItem(int $userId, int $productId, ProductVariant $variant, ProductTable $productTable): ?CartItemDTO
    {
        $item = DB::table('cart_items')
            ->where('user_id', $userId)
            ->where('product_id', $productId)
            ->where('product_table', $productTable->value)
            ->where('color', $variant->color)
            ->where('size', $variant->size)
            ->first();

        return $item ? CartItemDTO::fromArray((array) $item) : null;
    }

    public function create(array $data): CartItemDTO
    {
        $id = DB::table('cart_items')->insertGetId([
            'user_id' => $data['user_id'],
            'product_id' => $data['product_id'],
            'product_table' => $data['product_table'],
            'quantity' => $data['quantity'],
            'color' => $data['color'] ?? null,
            'size' => $data['size'] ?? null,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return $this->findById($id, $data['user_id']);
    }

    public function update(int $id, array $data): bool
    {
        return DB::table('cart_items')
            ->where('id', $id)
            ->update(array_merge($data, ['updated_at' => now()])) > 0;
    }

    public function delete(int $id, int $userId): bool
    {
        return DB::table('cart_items')
            ->where('id', $id)
            ->where('user_id', $userId)
            ->delete() > 0;
    }

    public function clear(int $userId): int
    {
        return DB::table('cart_items')
            ->where('user_id', $userId)
            ->delete();
    }

    public function count(int $userId): int
    {
        $items = $this->findByUserId($userId);
        return array_sum(array_map(fn(CartItemDTO $item) => $item->quantity, $items));
    }

    public function getTotal(int $userId): float
    {
        $items = $this->findByUserId($userId);
        return array_sum(array_map(fn(CartItemDTO $item) => $item->getTotalPrice(), $items));
    }

    public function exists(int $id, int $userId): bool
    {
        return DB::table('cart_items')
            ->where('id', $id)
            ->where('user_id', $userId)
            ->exists();
    }
}
