<?php

namespace App\Services\Interfaces;

use App\Enums\ProductTable;

interface ProductServiceInterface
{
    public function getProduct(int $productId, ProductTable $productTable): ?array;

    public function getColorImage(int $productId, string $colorName): ?string;

    public function colorExists(int $productId, string $colorName): bool;

    public function getProductFromAnyTable(int $productId, ?ProductTable $productTable = null): ?array;

    public function validateProductExists(int $productId, ProductTable $productTable): bool;

    public function getStockQuantity(int $productId, ProductTable $productTable): int;
}
