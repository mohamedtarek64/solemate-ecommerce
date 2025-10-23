<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VisualSearch extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'image_path',
        'search_type',
        'status',
        'results_data',
    ];

    protected $casts = [
        'results_data' => 'array',
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

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VisualSearch extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'image_path',
        'search_type',
        'status',
        'results_data',
    ];

    protected $casts = [
        'results_data' => 'array',
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

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VisualSearch extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'image_path',
        'search_type',
        'status',
        'results_data',
    ];

    protected $casts = [
        'results_data' => 'array',
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

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VisualSearch extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'image_path',
        'search_type',
        'status',
        'results_data',
    ];

    protected $casts = [
        'results_data' => 'array',
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

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VisualSearch extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'image_path',
        'search_type',
        'status',
        'results_data',
    ];

    protected $casts = [
        'results_data' => 'array',
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
