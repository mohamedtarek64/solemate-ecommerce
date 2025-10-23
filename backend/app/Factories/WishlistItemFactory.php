<?php

namespace App\Factories;

use App\DTOs\WishlistItemDTO;
use App\Enums\ProductTable;

class WishlistItemFactory
{
    public static function createDTO(array $data): WishlistItemDTO
    {
        return new WishlistItemDTO(
            id: (int) ($data['id'] ?? 0),
            userId: (int) $data['user_id'],
            productId: (int) $data['product_id'],
            productTable: $data['product_table'] ?? ProductTable::PRODUCTS_WOMEN,
            color: $data['color'] ?? null,
            size: $data['size'] ?? null,
            productName: $data['product_name'] ?? null,
            productPrice: (float) ($data['product_price'] ?? 0.0),
            productImage: $data['product_image'] ?? null,
            productSku: $data['product_sku'] ?? null,
            stockQuantity: (int) ($data['stock_quantity'] ?? 0),
            sourceTable: $data['source_table'] ?? ($data['product_table'] ?? ProductTable::PRODUCTS_WOMEN),
            createdAt: $data['created_at'] ?? now()->toDateTimeString(),
            updatedAt: $data['updated_at'] ?? now()->toDateTimeString()
        );
    }
}
