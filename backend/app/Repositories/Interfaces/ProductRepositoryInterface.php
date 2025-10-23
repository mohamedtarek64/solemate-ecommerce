<?php

namespace App\Repositories\Interfaces;

/**
 * Product Repository Interface
 */
interface ProductRepositoryInterface
{
    public function findById(int $productId, string $productTable): ?array;

    public function findByUserId(int $userId): array;

    public function searchProducts(string $query, string $tab = 'all', int $page = 1, int $perPage = 10): array;

    public function getProductsByTab(string $tab, int $page = 1, int $perPage = 10, array $filters = []): array;

    public function getActiveProducts(string $productTable): array;

    public function getFeaturedProducts(string $productTable, int $limit = 10): array;

    public function getProductColors(int $productId, string $sourceTable): array;

    public function getColorImage(int $productId, string $colorName): ?string;

    public function validateProductExists(int $productId, string $productTable): bool;

    public function getStockQuantity(int $productId, string $productTable): int;

    public function updateStock(int $productId, string $productTable, int $quantity): bool;
}
