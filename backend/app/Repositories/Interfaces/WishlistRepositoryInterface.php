<?php

namespace App\Repositories\Interfaces;

use App\DTOs\WishlistItemDTO;
use App\ValueObjects\ProductVariant;
use App\Enums\ProductTable;

/**
 * Wishlist Repository Interface
 */
interface WishlistRepositoryInterface
{
    public function findByUserId(int $userId): array;

    public function findById(int $id, int $userId): ?WishlistItemDTO;

    public function findExistingItem(int $userId, int $productId, ProductVariant $variant, string $productTable): ?WishlistItemDTO;

    public function create(array $data): WishlistItemDTO;

    public function delete(int $id, int $userId): bool;

    public function clear(int $userId): int;
}
