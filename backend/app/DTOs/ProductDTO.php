<?php

namespace App\DTOs;

use App\ValueObjects\Money;

/**
 * Product Data Transfer Object
 */
class ProductDTO
{
    public int $id;
    public string $name;
    public string $description;
    public float $price;
    public float $originalPrice;
    public string $imageUrl;
    public string $sku;
    public int $stockQuantity;
    public string $category;
    public string $brand;
    public bool $isActive;
    public bool $isFeatured;
    public float $rating;
    public int $reviewsCount;
    public array $sizes;
    public array $colors;
    public array $additionalImages;
    public array $videos;
    public string $sourceTable;
    public string $createdAt;
    public string $updatedAt;

    public function __construct(
        int $id,
        string $name,
        string $description,
        float $price,
        float $originalPrice,
        string $imageUrl,
        string $sku,
        int $stockQuantity,
        string $category,
        string $brand,
        bool $isActive,
        bool $isFeatured,
        float $rating,
        int $reviewsCount,
        array $sizes,
        array $colors,
        array $additionalImages,
        array $videos,
        string $sourceTable,
        string $createdAt,
        string $updatedAt
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->description = $description;
        $this->price = $price;
        $this->originalPrice = $originalPrice;
        $this->imageUrl = $imageUrl;
        $this->sku = $sku;
        $this->stockQuantity = $stockQuantity;
        $this->category = $category;
        $this->brand = $brand;
        $this->isActive = $isActive;
        $this->isFeatured = $isFeatured;
        $this->rating = $rating;
        $this->reviewsCount = $reviewsCount;
        $this->sizes = $sizes;
        $this->colors = $colors;
        $this->additionalImages = $additionalImages;
        $this->videos = $videos;
        $this->sourceTable = $sourceTable;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
    }

    /**
     * Create ProductDTO from array
     */
    public static function fromArray(array $data): self
    {
        return new self(
            id: (int) $data['id'],
            name: $data['name'],
            description: $data['description'] ?? '',
            price: (float) $data['price'],
            originalPrice: (float) ($data['original_price'] ?? $data['price']),
            imageUrl: $data['image_url'] ?? '',
            sku: $data['sku'] ?? '',
            stockQuantity: (int) ($data['stock_quantity'] ?? 0),
            category: $data['category'] ?? '',
            brand: $data['brand'] ?? '',
            isActive: (bool) ($data['is_active'] ?? true),
            isFeatured: (bool) ($data['is_featured'] ?? false),
            rating: (float) ($data['rating'] ?? 4.5),
            reviewsCount: (int) ($data['reviews_count'] ?? 0),
            sizes: $data['sizes'] ?? [],
            colors: $data['colors'] ?? [],
            additionalImages: $data['additional_images'] ?? [],
            videos: $data['videos'] ?? [],
            sourceTable: $data['source_table'] ?? '',
            createdAt: $data['created_at'] ?? now()->toDateTimeString(),
            updatedAt: $data['updated_at'] ?? now()->toDateTimeString()
        );
    }

    /**
     * Convert to array
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'price' => $this->price,
            'original_price' => $this->originalPrice,
            'image_url' => $this->imageUrl,
            'sku' => $this->sku,
            'stock_quantity' => $this->stockQuantity,
            'category' => $this->category,
            'brand' => $this->brand,
            'is_active' => $this->isActive,
            'is_featured' => $this->isFeatured,
            'rating' => $this->rating,
            'reviews_count' => $this->reviewsCount,
            'sizes' => $this->sizes,
            'colors' => $this->colors,
            'additional_images' => $this->additionalImages,
            'videos' => $this->videos,
            'source_table' => $this->sourceTable,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt
        ];
    }

    /**
     * Get formatted price
     */
    public function getFormattedPrice(): string
    {
        return '$' . number_format($this->price, 2);
    }

    /**
     * Get formatted original price
     */
    public function getFormattedOriginalPrice(): string
    {
        return '$' . number_format($this->originalPrice, 2);
    }

    /**
     * Get discount percentage
     */
    public function getDiscountPercentage(): float
    {
        if ($this->originalPrice <= $this->price) {
            return 0;
        }

        return round((($this->originalPrice - $this->price) / $this->originalPrice) * 100, 2);
    }

    /**
     * Get savings amount
     */
    public function getSavings(): float
    {
        return max(0, $this->originalPrice - $this->price);
    }

    /**
     * Check if product is on sale
     */
    public function isOnSale(): bool
    {
        return $this->originalPrice > $this->price;
    }

    /**
     * Check if product is in stock
     */
    public function isInStock(): bool
    {
        return $this->stockQuantity > 0;
    }

    /**
     * Check if product is low stock
     */
    public function isLowStock(int $threshold = 10): bool
    {
        return $this->stockQuantity <= $threshold && $this->stockQuantity > 0;
    }

    /**
     * Get stock status
     */
    public function getStockStatus(): string
    {
        if ($this->stockQuantity === 0) {
            return 'out_of_stock';
        }

        if ($this->stockQuantity <= 5) {
            return 'low_stock';
        }

        if ($this->stockQuantity <= 10) {
            return 'limited_stock';
        }

        return 'in_stock';
    }

    /**
     * Get stock status message
     */
    public function getStockStatusMessage(): string
    {
        return match($this->getStockStatus()) {
            'out_of_stock' => 'Out of Stock',
            'low_stock' => 'Only ' . $this->stockQuantity . ' left in stock',
            'limited_stock' => 'Limited stock available',
            'in_stock' => 'In Stock',
            default => 'Stock information unavailable'
        };
    }

    /**
     * Get primary image URL
     */
    public function getPrimaryImageUrl(): string
    {
        return $this->imageUrl ?: '/images/placeholder-product.jpg';
    }

    /**
     * Get all image URLs
     */
    public function getAllImageUrls(): array
    {
        $images = [$this->imageUrl];

        if (!empty($this->additionalImages)) {
            $images = array_merge($images, $this->additionalImages);
        }

        return array_filter($images);
    }

    /**
     * Get available sizes
     */
    public function getAvailableSizes(): array
    {
        return array_filter($this->sizes, function($size) {
            return !empty(trim($size));
        });
    }

    /**
     * Get available colors
     */
    public function getAvailableColors(): array
    {
        return array_filter($this->colors, function($color) {
            return !empty(trim($color));
        });
    }

    /**
     * Get rating stars
     */
    public function getRatingStars(): array
    {
        $stars = [];
        $fullStars = floor($this->rating);
        $hasHalfStar = ($this->rating - $fullStars) >= 0.5;

        for ($i = 1; $i <= 5; $i++) {
            if ($i <= $fullStars) {
                $stars[] = 'full';
            } elseif ($i === $fullStars + 1 && $hasHalfStar) {
                $stars[] = 'half';
            } else {
                $stars[] = 'empty';
            }
        }

        return $stars;
    }

    /**
     * Get formatted rating
     */
    public function getFormattedRating(): string
    {
        return number_format($this->rating, 1) . '/5.0';
    }

    /**
     * Get category display name
     */
    public function getCategoryDisplayName(): string
    {
        return ucwords(str_replace('_', ' ', $this->category));
    }

    /**
     * Get brand display name
     */
    public function getBrandDisplayName(): string
    {
        return ucwords($this->brand);
    }

    /**
     * Check if product has variants
     */
    public function hasVariants(): bool
    {
        return !empty($this->sizes) || !empty($this->colors);
    }

    /**
     * Get product summary
     */
    public function getSummary(int $length = 150): string
    {
        return strlen($this->description) > $length
            ? substr($this->description, 0, $length) . '...'
            : $this->description;
    }
}
