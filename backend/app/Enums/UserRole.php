<?php

namespace App\Enums;

class UserRole
{
    public const ADMIN = 'admin';
    public const VENDOR = 'vendor';
    public const USER = 'user';

    public static function getAll(): array
    {
        return [
            self::ADMIN,
            self::VENDOR,
            self::USER
        ];
    }

    public static function isValid(string $role): bool
    {
        return in_array($role, self::getAll());
    }

    public static function getDisplayName(string $role): string
    {
        return match($role) {
            self::ADMIN => 'Administrator',
            self::VENDOR => 'Vendor',
            self::USER => 'User',
            default => 'Unknown'
        };
    }

    public static function getPermissions(string $role): array
    {
        return match($role) {
            self::ADMIN => ['read', 'write', 'delete', 'manage_users', 'manage_products'],
            self::VENDOR => ['read', 'write', 'manage_products'],
            self::USER => ['read'],
            default => []
        };
    }

    public static function can(string $role, string $permission): bool
    {
        return in_array($permission, self::getPermissions($role));
    }
}
