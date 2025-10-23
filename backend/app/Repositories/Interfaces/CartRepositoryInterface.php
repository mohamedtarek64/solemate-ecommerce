<?php

namespace App\Repositories\Interfaces;

use App\DTOs\CartItemDTO;
use App\Enums\ProductTable;
use App\ValueObjects\ProductVariant;

interface CartRepositoryInterface
{
    public function findByUserId(int $userId): array;

    public function findById(int $id, int $userId): ?CartItemDTO;

    public function findExistingItem(int $userId, int $productId, ProductVariant $variant, ProductTable $productTable): ?CartItemDTO;

    public function create(array $data): CartItemDTO;

    public function update(int $id, array $data): bool;

    public function delete(int $id, int $userId): bool;

    public function clear(int $userId): int;

    public function count(int $userId): int;

    public function getTotal(int $userId): float;

    public function exists(int $id, int $userId): bool;
}
