<?php

namespace App\Services;

use App\DTOs\WishlistItemDTO;
use App\Repositories\Interfaces\WishlistRepositoryInterface;
use App\Services\Interfaces\ProductServiceInterface;
use App\ValueObjects\ProductVariant;
use App\Enums\ProductTable;
use App\Exceptions\ServiceException;
use Illuminate\Support\Facades\Log;

/**
 * Wishlist Service
 *
 * Handles all wishlist-related business logic
 */
class WishlistService extends BaseService
{
    private WishlistRepositoryInterface $wishlistRepository;
    private ProductServiceInterface $productService;

    public function __construct(
        WishlistRepositoryInterface $wishlistRepository,
        ProductServiceInterface $productService
    ) {
        $this->wishlistRepository = $wishlistRepository;
        $this->productService = $productService;
    }

    /**
     * Add item to wishlist
     */
    public function addToWishlist(int $userId, int $productId, ProductVariant $variant, string $productTable): WishlistItemDTO
    {
        $this->logOperation('addToWishlist', [
            'user_id' => $userId,
            'product_id' => $productId,
            'variant' => $variant->toArray(),
            'product_table' => $productTable
        ]);

        return $this->executeInTransaction(function () use ($userId, $productId, $variant, $productTable) {
            // Validate product exists and is active
            $product = $this->productService->getProductFromAnyTable($productId, $productTable);
            if (!$product) {
                throw new ServiceException('Product not found or inactive');
            }

            // Check if item already exists
            $existingItem = $this->wishlistRepository->findExistingItem($userId, $productId, $variant, $productTable);
            if ($existingItem) {
                throw new ServiceException('Product already in wishlist');
            }

            // Create new wishlist item
            $wishlistData = [
                'user_id' => $userId,
                'product_id' => $productId,
                'product_table' => $productTable,
                'color' => $variant->getColor(),
                'size' => $variant->getSize(),
                'created_at' => now(),
                'updated_at' => now()
            ];

            return $this->wishlistRepository->create($wishlistData);
        });
    }

    /**
     * Get all wishlist items for user
     */
    public function getWishlistItems(int $userId): array
    {
        $this->logOperation('getWishlistItems', ['user_id' => $userId]);

        return $this->wishlistRepository->findByUserId($userId);
    }

    /**
     * Get wishlist summary
     */
    public function getWishlistSummary(int $userId): array
    {
        $items = $this->getWishlistItems($userId);

        return [
            'items' => $items,
            'count' => count($items)
        ];
    }

    /**
     * Remove item from wishlist
     */
    public function removeFromWishlist(int $userId, int $itemId): bool
    {
        $this->logOperation('removeFromWishlist', [
            'user_id' => $userId,
            'item_id' => $itemId
        ]);

        return $this->executeInTransaction(function () use ($userId, $itemId) {
            $item = $this->wishlistRepository->findById($itemId, $userId);
            if (!$item) {
                throw new ServiceException('Wishlist item not found');
            }

            return $this->wishlistRepository->delete($itemId, $userId);
        });
    }

    /**
     * Clear user's wishlist
     */
    public function clearWishlist(int $userId): int
    {
        $this->logOperation('clearWishlist', ['user_id' => $userId]);

        return $this->executeInTransaction(function () use ($userId) {
            return $this->wishlistRepository->clear($userId);
        });
    }

    /**
     * Check if product is in wishlist
     */
    public function isInWishlist(int $userId, int $productId): bool
    {
        $this->logOperation('isInWishlist', [
            'user_id' => $userId,
            'product_id' => $productId
        ]);

        $items = $this->getWishlistItems($userId);

        return in_array($productId, array_column($items, 'productId'));
    }

    /**
     * Get wishlist count
     */
    public function getWishlistCount(int $userId): array
    {
        $items = $this->getWishlistItems($userId);

        return [
            'count' => count($items)
        ];
    }

    /**
     * Move item from wishlist to cart
     */
    public function moveToCart(int $userId, int $itemId, int $quantity = 1): array
    {
        $this->logOperation('moveToCart', [
            'user_id' => $userId,
            'item_id' => $itemId,
            'quantity' => $quantity
        ]);

        return $this->executeInTransaction(function () use ($userId, $itemId, $quantity) {
            $item = $this->wishlistRepository->findById($itemId, $userId);
            if (!$item) {
                throw new ServiceException('Wishlist item not found');
            }

            // Create variant from wishlist item
            $variant = new ProductVariant($item->color, $item->size);

            // Add to cart using CartService
            $cartService = app(CartService::class);
            $cartItem = $cartService->addToCart(
                $userId,
                $item->productId,
                $quantity,
                $variant,
                $item->productTable
            );

            // Remove from wishlist
            $this->removeFromWishlist($userId, $itemId);

            return [
                'cart_item' => $cartItem,
                'message' => 'Item moved to cart successfully'
            ];
        });
    }
}
