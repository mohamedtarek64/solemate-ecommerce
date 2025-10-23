<?php

namespace App\ValueObjects;

class Money
{
    private float $amount;
    private string $currency;

    public function __construct(float $amount, string $currency = 'USD')
    {
        if ($amount < 0) {
            throw new \InvalidArgumentException('Amount cannot be negative');
        }

        $this->amount = $amount;
        $this->currency = $currency;
    }

    public function getAmount(): float
    {
        return $this->amount;
    }

    public function getCurrency(): string
    {
        return $this->currency;
    }

    public static function fromCents(int $cents, string $currency = 'USD'): self
    {
        return new self($cents / 100, $currency);
    }

    public function toCents(): int
    {
        return (int) round($this->amount * 100);
    }

    public function add(Money $other): self
    {
        if ($this->currency !== $other->getCurrency()) {
            throw new \InvalidArgumentException('Cannot add different currencies');
        }

        return new self($this->amount + $other->getAmount(), $this->currency);
    }

    public function subtract(Money $other): self
    {
        if ($this->currency !== $other->getCurrency()) {
            throw new \InvalidArgumentException('Cannot subtract different currencies');
        }

        return new self($this->amount - $other->getAmount(), $this->currency);
    }

    public function multiply(float $multiplier): self
    {
        return new self($this->amount * $multiplier, $this->currency);
    }

    public function equals(Money $other): bool
    {
        return $this->amount === $other->getAmount() && $this->currency === $other->getCurrency();
    }

    public function isGreaterThan(Money $other): bool
    {
        if ($this->currency !== $other->getCurrency()) {
            throw new \InvalidArgumentException('Cannot compare different currencies');
        }

        return $this->amount > $other->getAmount();
    }

    public function isLessThan(Money $other): bool
    {
        if ($this->currency !== $other->getCurrency()) {
            throw new \InvalidArgumentException('Cannot compare different currencies');
        }

        return $this->amount < $other->getAmount();
    }

    public function format(): string
    {
        return '$' . number_format($this->amount, 2);
    }

    public function __toString(): string
    {
        return $this->format();
    }
}
