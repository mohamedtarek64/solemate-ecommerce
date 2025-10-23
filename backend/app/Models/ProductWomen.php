<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductWomen extends Model
{
    use HasFactory;

    protected $table = 'products_women';

    protected $fillable = [
        'name',
        'description',
        'price',
        'original_price',
        'image_url',
        'brand',
        'category',
        'sku',
        'stock_quantity',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'original_price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Get the colors for the product
     */
    public function colors()
    {
        return $this->hasMany(ProductColor::class, 'product_id');
    }

    /**
     * Get cart items for this product
     */
    public function cartItems()
    {
        return $this->hasMany(CartItem::class, 'product_id')->where('product_table', 'products_women');
    }

    /**
     * Get wishlist items for this product
     */
    public function wishlistItems()
    {
        return $this->hasMany(WishlistItem::class, 'product_id')->where('product_table', 'products_women');
    }
}
