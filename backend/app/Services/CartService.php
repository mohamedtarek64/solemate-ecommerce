<?php

namespace App\Services;

use App\DTOs\CartItemDTO;
use App\Repositories\Interfaces\CartRepositoryInterface;
use App\Services\Interfaces\ProductServiceInterface;
use App\ValueObjects\ProductVariant;
use App\Enums\ProductTable;
use App\Exceptions\ServiceException;
use App\Events\Cart\CartItemAdded;
use App\Events\Cart\CartItemUpdated;
use App\Events\Cart\CartItemRemoved;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Event;

/**
 * Cart Service
 *
 * Handles all cart-related business logic
 */
class CartService extends BaseService
{
    private CartRepositoryInterface $cartRepository;
    private ProductServiceInterface $productService;

    public function __construct(
        CartRepositoryInterface $cartRepository,
        ProductServiceInterface $productService
    ) {
        $this->cartRepository = $cartRepository;
        $this->productService = $productService;
    }

    /**
     * Add item to cart
     */
    public function addToCart(int $userId, int $productId, int $quantity, ProductVariant $variant, string $productTable): CartItemDTO
    {
        $this->logOperation('addToCart', [
            'user_id' => $userId,
            'product_id' => $productId,
            'quantity' => $quantity,
            'variant' => $variant->toArray(),
            'product_table' => $productTable
        ]);

        return $this->executeInTransaction(function () use ($userId, $productId, $quantity, $variant, $productTable) {
            // Validate product exists and is active
            $product = $this->productService->getProductFromAnyTable($productId, $productTable);
            if (!$product) {
                throw new ServiceException('Product not found or inactive');
            }

            // Check stock availability
            if ($product['stock_quantity'] < $quantity) {
                throw new ServiceException('Insufficient stock. Available: ' . $product['stock_quantity']);
            }

            // Check if item already exists
            $existingItem = $this->cartRepository->findExistingItem($userId, $productId, $variant, $productTable);

            if ($existingItem) {
                // Update existing item quantity
                $newQuantity = $existingItem->quantity + $quantity;

                // Check total stock again
                if ($product['stock_quantity'] < $newQuantity) {
                    throw new ServiceException('Insufficient stock for updated quantity. Available: ' . $product['stock_quantity']);
                }

                $this->cartRepository->updateQuantity($existingItem->id, $newQuantity);

                return $this->cartRepository->findById($existingItem->id, $userId);
            }

            // Create new cart item
            $cartData = [
                'user_id' => $userId,
                'product_id' => $productId,
                'product_table' => $productTable,
                'quantity' => $quantity,
                'color' => $variant->getColor(),
                'size' => $variant->getSize(),
                'created_at' => now(),
                'updated_at' => now()
            ];

            $cartItem = $this->cartRepository->create($cartData);

            // Fire event
            Event::dispatch(new CartItemAdded($cartItem, $userId, [
                'product_table' => $productTable,
                'variant' => $variant->toArray()
            ]));

            return $cartItem;
        });
    }

    /**
     * Get all cart items for user
     */
    public function getCartItems(int $userId): array
    {
        $this->logOperation('getCartItems', ['user_id' => $userId]);

        return $this->cartRepository->findByUserId($userId);
    }

    /**
     * Get cart summary
     */
    public function getCartSummary(int $userId): array
    {
        $items = $this->getCartItems($userId);

        $totalQuantity = array_sum(array_column($items, 'quantity'));
        $totalPrice = array_sum(array_map(function($item) {
            return $item->quantity * $item->productPrice;
        }, $items));

        return [
            'items' => $items,
            'total_quantity' => $totalQuantity,
            'total_price' => round($totalPrice, 2),
            'items_count' => count($items)
        ];
    }

    /**
     * Update cart item quantity
     */
    public function updateCartItem(int $userId, int $itemId, int $quantity): CartItemDTO
    {
        $this->logOperation('updateCartItem', [
            'user_id' => $userId,
            'item_id' => $itemId,
            'quantity' => $quantity
        ]);

        return $this->executeInTransaction(function () use ($userId, $itemId, $quantity) {
            $item = $this->cartRepository->findById($itemId, $userId);
            if (!$item) {
                throw new ServiceException('Cart item not found');
            }

            // Get product to check stock
            $product = $this->productService->getProductFromAnyTable($item->productId, $item->productTable);
            if (!$product) {
                throw new ServiceException('Product not found');
            }

            // Check stock availability
            if ($product['stock_quantity'] < $quantity) {
                throw new ServiceException('Insufficient stock. Available: ' . $product['stock_quantity']);
            }

            // Update quantity
            $this->cartRepository->updateQuantity($itemId, $quantity);

            return $this->cartRepository->findById($itemId, $userId);
        });
    }

    /**
     * Remove item from cart
     */
    public function removeCartItem(int $userId, int $itemId): bool
    {
        $this->logOperation('removeCartItem', [
            'user_id' => $userId,
            'item_id' => $itemId
        ]);

        return $this->executeInTransaction(function () use ($userId, $itemId) {
            $item = $this->cartRepository->findById($itemId, $userId);
            if (!$item) {
                throw new ServiceException('Cart item not found');
            }

            return $this->cartRepository->delete($itemId, $userId);
        });
    }

    /**
     * Clear user's cart
     */
    public function clearCart(int $userId): int
    {
        $this->logOperation('clearCart', ['user_id' => $userId]);

        return $this->executeInTransaction(function () use ($userId) {
            return $this->cartRepository->clear($userId);
        });
    }

    /**
     * Get cart item count
     */
    public function getCartCount(int $userId): array
    {
        $items = $this->getCartItems($userId);

        return [
            'count' => array_sum(array_column($items, 'quantity')),
            'items_count' => count($items)
        ];
    }
}
