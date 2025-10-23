<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalyticsSearch extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'search_query',
        'search_filters',
        'results_count',
        'clicked_result',
        'page_url',
        'user_agent',
        'ip_address',
        'country',
        'city',
        'device_type',
        'browser',
        'os',
        'timestamp',
    ];

    protected $casts = [
        'search_filters' => 'array',
        'results_count' => 'integer',
        'timestamp' => 'datetime',
    ];

    /**
     * Get the user that owns the search.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for specific search query.
     */
    public function scopeSearchQuery($query, $queryText)
    {
        return $query->where('search_query', 'like', "%{$queryText}%");
    }

    /**
     * Scope for searches with results.
     */
    public function scopeWithResults($query)
    {
        return $query->where('results_count', '>', 0);
    }

    /**
     * Scope for searches without results.
     */
    public function scopeWithoutResults($query)
    {
        return $query->where('results_count', 0);
    }

    /**
     * Scope for date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('timestamp', [$startDate, $endDate]);
    }

    /**
     * Get popular search queries.
     */
    public static function getPopularSearches($limit = 10, $startDate = null, $endDate = null)
    {
        $query = static::selectRaw('search_query, COUNT(*) as search_count')
                       ->groupBy('search_query')
                       ->orderBy('search_count', 'desc')
                       ->limit($limit);
        
        if ($startDate && $endDate) {
            $query->dateRange($startDate, $endDate);
        }
        
        return $query->get();
    }

    /**
     * Get search success rate.
     */
    public static function getSearchSuccessRate($startDate = null, $endDate = null)
    {
        $query = static::query();
        
        if ($startDate && $endDate) {
            $query->dateRange($startDate, $endDate);
        }
        
        $totalSearches = $query->count();
        $successfulSearches = $query->clone()->withResults()->count();
        
        return $totalSearches > 0 ? ($successfulSearches / $totalSearches) * 100 : 0;
    }
}
