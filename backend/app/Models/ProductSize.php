<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductSize extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'size',
        'stock_quantity',
        'is_available'
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'stock_quantity' => 'integer'
    ];

    /**
     * Get the product that owns the size.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Scope to get available sizes
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    /**
     * Scope to get sizes with stock
     */
    public function scopeInStock($query)
    {
        return $query->where('stock_quantity', '>', 0);
    }

    /**
     * Scope to get sizes by size value
     */
    public function scopeBySize($query, $size)
    {
        return $query->where('size', $size);
    }
}
