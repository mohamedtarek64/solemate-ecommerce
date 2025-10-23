<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'product_table',
        'quantity',
        'color',
        'size',
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    /**
     * Get the user that owns the cart item
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product from any table
     */
    public function product()
    {
        // Dynamic relationship based on product_table
        if ($this->product_table === 'products_women') {
            return $this->belongsTo(ProductWomen::class, 'product_id');
        }

        // Add more product tables as needed
        return null;
    }
}
