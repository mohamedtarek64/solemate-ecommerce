<?php

namespace App\Factories;

use App\DTOs\CartItemDTO;
use App\Enums\ProductTable;
use App\ValueObjects\ProductVariant;

class CartItemFactory
{
    public static function createFromRequest(array $data): array
    {
        $validator = \Illuminate\Support\Facades\Validator::make($data, [
            'product_id' => 'required|integer|min:1',
            'quantity' => 'required|integer|min:1|max:10',
            'color' => 'nullable|string|max:50',
            'size' => 'nullable|string|max:20',
            'product_table' => 'nullable|string',
            'user_id' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            throw new \InvalidArgumentException('Invalid cart item data: ' . json_encode($validator->errors()));
        }

        $productTable = ProductTable::tryFrom($data['product_table'] ?? 'products_women') ?? ProductTable::PRODUCTS_WOMEN;
        $variant = ProductVariant::create($data['color'] ?? null, $data['size'] ?? null);

        return [
            'user_id' => (int) $data['user_id'],
            'product_id' => (int) $data['product_id'],
            'product_table' => $productTable->value,
            'quantity' => (int) $data['quantity'],
            'color' => $variant->color,
            'size' => $variant->size,
            'variant' => $variant,
            'product_table_enum' => $productTable
        ];
    }

    public static function createDTO(array $data): CartItemDTO
    {
        return CartItemDTO::fromArray($data);
    }

    public static function createFromDatabaseRow(object $row): CartItemDTO
    {
        return CartItemDTO::fromArray((array) $row);
    }

    public static function createEmpty(int $userId): array
    {
        return [
            'user_id' => $userId,
            'product_id' => 0,
            'product_table' => ProductTable::PRODUCTS_WOMEN->value,
            'quantity' => 0,
            'color' => null,
            'size' => null
        ];
    }
}
