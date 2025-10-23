<?php

namespace App\Services;

use App\Enums\ProductTable;
use App\Services\Interfaces\ProductServiceInterface;
use App\Services\BaseService;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use App\Exceptions\ServiceException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProductService extends BaseService implements ProductServiceInterface
{
    private ProductRepositoryInterface $productRepository;

    public function __construct(ProductRepositoryInterface $productRepository)
    {
        $this->productRepository = $productRepository;
    }
    public function getProduct(int $productId, ProductTable $productTable): ?array
    {
        return $this->productRepository->findById($productId, $productTable->value);
    }

    public function getColorImage(int $productId, string $colorName): ?string
    {
        return $this->productRepository->getColorImage($productId, $colorName);
    }

    public function colorExists(int $productId, string $colorName): bool
    {
        try {
            return DB::table('product_colors')
                ->where('product_id', $productId)
                ->where('color', $colorName)
                ->exists();
        } catch (\Exception $e) {
            Log::warning("Failed to check color existence for product {$productId}, color {$colorName}: " . $e->getMessage());
            return false;
        }
    }

    public function getProductFromAnyTable(int $productId, ?ProductTable $productTable = null): ?array
    {
        $productTables = ProductTable::getAll();

        if ($productTable && in_array($productTable->value, $productTables)) {
            // Search in specific table
            $product = $this->getProduct($productId, $productTable);
            if ($product) {
                $product['source_table'] = $productTable->value;
                return $product;
            }
        } else {
            // Search in all tables
            foreach ($productTables as $table) {
                $product = $this->getProduct($productId, ProductTable::from($table));
                if ($product) {
                    $product['source_table'] = $table;
                    return $product;
                }
            }
        }

        return null;
    }

    public function validateProductExists(int $productId, ProductTable $productTable): bool
    {
        $product = $this->getProduct($productId, $productTable);
        return $product !== null && ($product['is_active'] ?? true);
    }

    public function getStockQuantity(int $productId, ProductTable $productTable): int
    {
        $product = $this->getProduct($productId, $productTable);
        return $product ? (int) ($product['stock_quantity'] ?? 0) : 0;
    }
}
