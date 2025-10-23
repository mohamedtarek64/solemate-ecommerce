<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'original_price',
        'discount_percentage',
        'material',
        'care_instructions',
        'origin',
        'images',
        'colors',
        'sizes',
        'size',
        'stock_quantity',
        'is_available',
        'is_active',
        'slug',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'original_price' => 'decimal:2',
        'discount_percentage' => 'integer',
        'stock_quantity' => 'integer',
        'is_active' => 'boolean',
        'is_available' => 'boolean',
        'images' => 'array',
        'colors' => 'array',
        'sizes' => 'array',
    ];

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    public function wishlistItems()
    {
        return $this->hasMany(WishlistItem::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function customerReviews()
    {
        return $this->hasMany(CustomerReview::class);
    }

    public function productSizes()
    {
        return $this->hasMany(ProductSize::class);
    }

    public function visualSearches()
    {
        return $this->hasMany(VisualSearch::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByBrand($query, $brand)
    {
        return $query->where('brand', $brand);
    }

    public function scopeByPriceRange($query, $minPrice, $maxPrice)
    {
        return $query->whereBetween('price', [$minPrice, $maxPrice]);
    }
}
