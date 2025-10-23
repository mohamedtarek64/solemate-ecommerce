<?php

namespace App\Enums;

class ProductTable
{
    public const PRODUCTS_WOMEN = 'products_women';
    public const PRODUCTS_MEN = 'products_men';
    public const PRODUCTS_KIDS = 'products_kids';

    public static function getAll(): array
    {
        return [
            self::PRODUCTS_WOMEN,
            self::PRODUCTS_MEN,
            self::PRODUCTS_KIDS
        ];
    }

    public static function isValid(string $table): bool
    {
        return in_array($table, self::getAll());
    }

    public static function getDisplayName(string $table): string
    {
        return match($table) {
            self::PRODUCTS_WOMEN => 'Women\'s Products',
            self::PRODUCTS_MEN => 'Men\'s Products',
            self::PRODUCTS_KIDS => 'Kids\' Products',
            default => 'Unknown Products'
        };
    }

    public static function getCategory(string $table): string
    {
        return match($table) {
            self::PRODUCTS_WOMEN => 'women',
            self::PRODUCTS_MEN => 'men',
            self::PRODUCTS_KIDS => 'kids',
            default => 'unknown'
        };
    }
}
