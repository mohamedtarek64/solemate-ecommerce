<?php

namespace App\DTOs;

class WishlistItemDTO
{
    public function __construct(
        public int $id,
        public int $userId,
        public int $productId,
        public string $productTable,
        public ?string $color,
        public ?string $size,
        public ?string $productName,
        public float $productPrice,
        public ?string $productImage,
        public ?string $productSku,
        public int $stockQuantity,
        public string $sourceTable,
        public string $createdAt,
        public string $updatedAt
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            id: (int) $data['id'],
            userId: (int) $data['user_id'],
            productId: (int) $data['product_id'],
            productTable: (string) $data['product_table'],
            color: $data['color'] ?? null,
            size: $data['size'] ?? null,
            productName: $data['product_name'] ?? null,
            productPrice: (float) $data['product_price'],
            productImage: $data['product_image'] ?? null,
            productSku: $data['product_sku'] ?? null,
            stockQuantity: (int) $data['stock_quantity'],
            sourceTable: (string) $data['source_table'],
            createdAt: $data['created_at'],
            updatedAt: $data['updated_at']
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->userId,
            'product_id' => $this->productId,
            'product_table' => $this->productTable,
            'color' => $this->color,
            'size' => $this->size,
            'product_name' => $this->productName,
            'product_price' => $this->productPrice,
            'product_image' => $this->productImage,
            'product_sku' => $this->productSku,
            'stock_quantity' => $this->stockQuantity,
            'source_table' => $this->sourceTable,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt
        ];
    }

    public function isInStock(): bool
    {
        return $this->stockQuantity > 0;
    }

    public function getDisplayName(): string
    {
        $name = $this->productName ?? 'Product';
        if ($this->color) {
            $name .= " ({$this->color})";
        }
        if ($this->size) {
            $name .= " - Size {$this->size}";
        }
        return $name;
    }
}
