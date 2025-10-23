<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

trait Searchable
{
    /**
     * Scope a query to search for a term in the specified columns.
     */
    public function scopeSearch(Builder $query, string $term, array $columns = []): Builder
    {
        if (empty($term)) {
            return $query;
        }

        $columns = empty($columns) ? $this->getSearchableColumns() : $columns;

        return $query->where(function ($q) use ($term, $columns) {
            foreach ($columns as $column) {
                $q->orWhere($column, 'like', "%{$term}%");
            }
        });
    }

    /**
     * Scope a query to search for a term with full-text search.
     */
    public function scopeFullTextSearch(Builder $query, string $term, array $columns = []): Builder
    {
        if (empty($term)) {
            return $query;
        }

        $columns = empty($columns) ? $this->getSearchableColumns() : $columns;
        $searchTerm = $this->prepareSearchTerm($term);

        return $query->whereRaw("MATCH(" . implode(',', $columns) . ") AGAINST(? IN BOOLEAN MODE)", [$searchTerm]);
    }

    /**
     * Scope a query to search with filters.
     */
    public function scopeSearchWithFilters(Builder $query, string $term, array $filters = []): Builder
    {
        $query = $this->scopeSearch($query, $term);

        foreach ($filters as $column => $value) {
            if (!empty($value)) {
                if (is_array($value)) {
                    $query->whereIn($column, $value);
                } else {
                    $query->where($column, $value);
                }
            }
        }

        return $query;
    }

    /**
     * Scope a query to search with date range.
     */
    public function scopeSearchWithDateRange(Builder $query, string $term, string $startDate = null, string $endDate = null): Builder
    {
        $query = $this->scopeSearch($query, $term);

        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        return $query;
    }

    /**
     * Scope a query to search with price range.
     */
    public function scopeSearchWithPriceRange(Builder $query, string $term, float $minPrice = null, float $maxPrice = null): Builder
    {
        $query = $this->scopeSearch($query, $term);

        if ($minPrice !== null) {
            $query->where('price', '>=', $minPrice);
        }

        if ($maxPrice !== null) {
            $query->where('price', '<=', $maxPrice);
        }

        return $query;
    }

    /**
     * Get searchable columns for the model.
     */
    protected function getSearchableColumns(): array
    {
        return $this->searchable ?? ['name', 'description'];
    }

    /**
     * Prepare search term for full-text search.
     */
    protected function prepareSearchTerm(string $term): string
    {
        // Remove special characters and split into words
        $words = preg_split('/\s+/', trim(preg_replace('/[^\w\s]/', ' ', $term)));
        
        // Add wildcards for partial matching
        return '+' . implode('* +', $words) . '*';
    }

    /**
     * Get search suggestions based on the model.
     */
    public static function getSearchSuggestions(string $term, int $limit = 10): array
    {
        $model = new static();
        $columns = $model->getSearchableColumns();
        
        $suggestions = [];
        
        foreach ($columns as $column) {
            $columnSuggestions = static::select($column)
                ->where($column, 'like', "%{$term}%")
                ->distinct()
                ->limit($limit)
                ->pluck($column)
                ->toArray();
            
            $suggestions = array_merge($suggestions, $columnSuggestions);
        }
        
        return array_unique(array_slice($suggestions, 0, $limit));
    }

    /**
     * Get search statistics.
     */
    public static function getSearchStats(string $term): array
    {
        $model = new static();
        $columns = $model->getSearchableColumns();
        
        $totalResults = static::search($term)->count();
        $exactMatches = static::where(function ($q) use ($term, $columns) {
            foreach ($columns as $column) {
                $q->orWhere($column, 'like', "%{$term}%");
            }
        })->count();
        
        return [
            'total_results' => $totalResults,
            'exact_matches' => $exactMatches,
            'search_term' => $term,
            'searchable_columns' => $columns,
        ];
    }
}
