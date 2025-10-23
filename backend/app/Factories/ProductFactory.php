<?php

namespace App\Factories;

use App\DTOs\ProductDTO;
use App\Enums\ProductTable;
use App\ValueObjects\Money;
use App\ValueObjects\ProductVariant;

/**
 * Product Factory
 *
 * Creates ProductDTO instances with proper validation and defaults
 */
class ProductFactory
{
    /**
     * Create ProductDTO from database array
     */
    public static function createFromDatabase(array $data, string $sourceTable): ProductDTO
    {
        // Ensure required fields have defaults
        $productData = self::normalizeProductData($data, $sourceTable);

        return new ProductDTO(
            id: $productData['id'],
            name: $productData['name'],
            description: $productData['description'],
            price: $productData['price'],
            originalPrice: $productData['original_price'],
            imageUrl: $productData['image_url'],
            sku: $productData['sku'],
            stockQuantity: $productData['stock_quantity'],
            category: $productData['category'],
            brand: $productData['brand'],
            isActive: $productData['is_active'],
            isFeatured: $productData['is_featured'],
            rating: $productData['rating'],
            reviewsCount: $productData['reviews_count'],
            sizes: $productData['sizes'],
            colors: $productData['colors'],
            additionalImages: $productData['additional_images'],
            videos: $productData['videos'],
            sourceTable: $sourceTable,
            createdAt: $productData['created_at'],
            updatedAt: $productData['updated_at']
        );
    }

    /**
     * Create ProductDTO from API request
     */
    public static function createFromRequest(array $data, string $sourceTable): ProductDTO
    {
        // Validate and normalize request data
        $productData = self::validateRequestData($data);

        return self::createFromDatabase($productData, $sourceTable);
    }

    /**
     * Create multiple ProductDTOs from collection
     */
    public static function createCollection(array $products, string $sourceTable): array
    {
        return array_map(function($product) use ($sourceTable) {
            return self::createFromDatabase($product, $sourceTable);
        }, $products);
    }

    /**
     * Create ProductDTO for testing
     */
    public static function createForTesting(array $overrides = []): ProductDTO
    {
        $defaults = [
            'id' => 1,
            'name' => 'Test Product',
            'description' => 'Test product description',
            'price' => 100.00,
            'original_price' => 120.00,
            'image_url' => 'https://example.com/image.jpg',
            'sku' => 'TEST-SKU-001',
            'stock_quantity' => 10,
            'category' => 'Test Category',
            'brand' => 'Test Brand',
            'is_active' => true,
            'is_featured' => false,
            'rating' => 4.5,
            'reviews_count' => 0,
            'sizes' => ['S', 'M', 'L'],
            'colors' => [],
            'additional_images' => [],
            'videos' => [],
            'created_at' => now()->toDateTimeString(),
            'updated_at' => now()->toDateTimeString()
        ];

        $data = array_merge($defaults, $overrides);

        return self::createFromDatabase($data, ProductTable::PRODUCTS_WOMEN);
    }

    /**
     * Normalize product data from database
     */
    private static function normalizeProductData(array $data, string $sourceTable): array
    {
        return [
            'id' => (int) $data['id'],
            'name' => $data['name'] ?? 'Unknown Product',
            'description' => $data['description'] ?? '',
            'price' => (float) ($data['price'] ?? 0),
            'original_price' => (float) ($data['original_price'] ?? $data['price'] ?? 0),
            'image_url' => $data['image_url'] ?? $data['image'] ?? '',
            'sku' => $data['sku'] ?? '',
            'stock_quantity' => (int) ($data['stock_quantity'] ?? $data['quantity'] ?? 0),
            'category' => $data['category'] ?? '',
            'brand' => $data['brand'] ?? '',
            'is_active' => self::getActiveStatus($data, $sourceTable),
            'is_featured' => (bool) ($data['is_featured'] ?? false),
            'rating' => (float) ($data['rating'] ?? 4.5),
            'reviews_count' => (int) ($data['reviews_count'] ?? 0),
            'sizes' => self::parseSizes($data['sizes'] ?? ''),
            'colors' => self::parseColors($data['colors'] ?? ''),
            'additional_images' => self::parseAdditionalImages($data['additional_images'] ?? ''),
            'videos' => self::parseVideos($data['videos'] ?? ''),
            'created_at' => $data['created_at'] ?? now()->toDateTimeString(),
            'updated_at' => $data['updated_at'] ?? now()->toDateTimeString()
        ];
    }

    /**
     * Validate request data
     */
    private static function validateRequestData(array $data): array
    {
        // Ensure required fields
        if (!isset($data['name']) || empty($data['name'])) {
            throw new \InvalidArgumentException('Product name is required');
        }

        if (!isset($data['price']) || !is_numeric($data['price'])) {
            throw new \InvalidArgumentException('Valid product price is required');
        }

        // Set defaults for optional fields
        $data['description'] = $data['description'] ?? '';
        $data['original_price'] = $data['original_price'] ?? $data['price'];
        $data['image_url'] = $data['image_url'] ?? '';
        $data['sku'] = $data['sku'] ?? '';
        $data['stock_quantity'] = $data['stock_quantity'] ?? 0;
        $data['category'] = $data['category'] ?? '';
        $data['brand'] = $data['brand'] ?? '';
        $data['is_active'] = $data['is_active'] ?? true;
        $data['is_featured'] = $data['is_featured'] ?? false;
        $data['rating'] = $data['rating'] ?? 4.5;
        $data['reviews_count'] = $data['reviews_count'] ?? 0;
        $data['sizes'] = $data['sizes'] ?? '';
        $data['colors'] = $data['colors'] ?? '';
        $data['additional_images'] = $data['additional_images'] ?? '';
        $data['videos'] = $data['videos'] ?? '';

        return $data;
    }

    /**
     * Get active status based on source table
     */
    private static function getActiveStatus(array $data, string $sourceTable): bool
    {
        if ($sourceTable === ProductTable::PRODUCTS_MEN) {
            return ($data['status'] ?? 'inactive') === 'active';
        }

        return (bool) ($data['is_active'] ?? true);
    }

    /**
     * Parse sizes from string or array
     */
    private static function parseSizes($sizes): array
    {
        if (is_array($sizes)) {
            return $sizes;
        }

        if (is_string($sizes)) {
            // Handle JSON string
            $decoded = json_decode($sizes, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }

            // Handle space-separated string
            return array_filter(explode(' ', trim($sizes)));
        }

        return [];
    }

    /**
     * Parse colors from string or array
     */
    private static function parseColors($colors): array
    {
        if (is_array($colors)) {
            return $colors;
        }

        if (is_string($colors)) {
            // Handle JSON string
            $decoded = json_decode($colors, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }

            // Handle space-separated string
            return array_filter(explode(' ', trim($colors)));
        }

        return [];
    }

    /**
     * Parse additional images from string or array
     */
    private static function parseAdditionalImages($images): array
    {
        if (is_array($images)) {
            return $images;
        }

        if (is_string($images)) {
            // Handle JSON string
            $decoded = json_decode($images, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }

            // Handle space-separated string
            return array_filter(explode(' ', trim($images)));
        }

        return [];
    }

    /**
     * Parse videos from string or array
     */
    private static function parseVideos($videos): array
    {
        if (is_array($videos)) {
            return $videos;
        }

        if (is_string($videos)) {
            // Handle JSON string
            $decoded = json_decode($videos, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }

            // Handle space-separated string
            return array_filter(explode(' ', trim($videos)));
        }
       
        return [];
    }
}
