<?php

namespace App\ValueObjects;

class ProductVariant
{
    private ?string $color;
    private ?string $size;

    public function __construct(?string $color = null, ?string $size = null)
    {
        $this->color = $color;
        $this->size = $size;
    }

    public function getColor(): ?string
    {
        return $this->color;
    }

    public function getSize(): ?string
    {
        return $this->size;
    }

    public static function create(?string $color = null, ?string $size = null): self
    {
        return new self($color, $size);
    }

    public function isEmpty(): bool
    {
        return empty($this->color) && empty($this->size);
    }

    public function hasColor(): bool
    {
        return !empty($this->color);
    }

    public function hasSize(): bool
    {
        return !empty($this->size);
    }

    public function getDisplayName(): string
    {
        $parts = [];

        if ($this->color) {
            $parts[] = "Color: {$this->color}";
        }

        if ($this->size) {
            $parts[] = "Size: {$this->size}";
        }

        return empty($parts) ? 'Default' : implode(', ', $parts);
    }

    public function getShortDisplay(): string
    {
        $parts = [];

        if ($this->color) {
            $parts[] = $this->color;
        }

        if ($this->size) {
            $parts[] = $this->size;
        }

        return empty($parts) ? 'Standard' : implode(' - ', $parts);
    }

    public function equals(ProductVariant $other): bool
    {
        return $this->color === $other->getColor() && $this->size === $other->getSize();
    }

    public function toArray(): array
    {
        return [
            'color' => $this->color,
            'size' => $this->size
        ];
    }

    public function __toString(): string
    {
        return $this->getDisplayName();
    }
}
