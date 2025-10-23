<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'product_table',
        'rating',
        'comment',
        'is_verified',
        'is_approved',
        'helpful_count',
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_verified' => 'boolean',
        'is_approved' => 'boolean',
        'helpful_count' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
