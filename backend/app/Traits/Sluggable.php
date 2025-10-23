<?php

namespace App\Traits;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Model;

trait Sluggable
{
    /**
     * Boot the sluggable trait.
     */
    protected static function bootSluggable()
    {
        static::creating(function (Model $model) {
            $model->generateSlug();
        });

        static::updating(function (Model $model) {
            if ($model->isDirty($model->getSlugSourceColumn())) {
                $model->generateSlug();
            }
        });
    }

    /**
     * Generate a unique slug for the model.
     */
    public function generateSlug(): void
    {
        $sourceColumn = $this->getSlugSourceColumn();
        $slugColumn = $this->getSlugColumn();
        
        if (empty($this->$sourceColumn)) {
            return;
        }

        $slug = $this->createSlug($this->$sourceColumn);
        $originalSlug = $slug;
        $counter = 1;

        // Ensure slug is unique
        while ($this->slugExists($slug)) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        $this->$slugColumn = $slug;
    }

    /**
     * Create a slug from the given string.
     */
    protected function createSlug(string $string): string
    {
        // Convert to lowercase
        $slug = strtolower($string);
        
        // Replace spaces and special characters with hyphens
        $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
        
        // Remove leading and trailing hyphens
        $slug = trim($slug, '-');
        
        // Limit length
        $slug = Str::limit($slug, 50, '');
        
        return $slug;
    }

    /**
     * Check if a slug already exists.
     */
    protected function slugExists(string $slug): bool
    {
        $query = static::where($this->getSlugColumn(), $slug);
        
        // Exclude current model if updating
        if ($this->exists) {
            $query->where($this->getKeyName(), '!=', $this->getKey());
        }
        
        return $query->exists();
    }

    /**
     * Get the source column for slug generation.
     */
    protected function getSlugSourceColumn(): string
    {
        return $this->slugSource ?? 'name';
    }

    /**
     * Get the slug column name.
     */
    protected function getSlugColumn(): string
    {
        return $this->slugColumn ?? 'slug';
    }

    /**
     * Find a model by its slug.
     */
    public static function findBySlug(string $slug): ?Model
    {
        $model = new static();
        return static::where($model->getSlugColumn(), $slug)->first();
    }

    /**
     * Find a model by its slug or fail.
     */
    public static function findBySlugOrFail(string $slug): Model
    {
        $model = static::findBySlug($slug);
        
        if (!$model) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException();
        }
        
        return $model;
    }

    /**
     * Get the route key name for model binding.
     */
    public function getRouteKeyName(): string
    {
        return $this->getSlugColumn();
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKey(): string
    {
        return $this->getAttribute($this->getSlugColumn());
    }

    /**
     * Scope to find by slug.
     */
    public function scopeBySlug($query, string $slug)
    {
        return $query->where($this->getSlugColumn(), $slug);
    }

    /**
     * Scope to find by multiple slugs.
     */
    public function scopeBySlugs($query, array $slugs)
    {
        return $query->whereIn($this->getSlugColumn(), $slugs);
    }

    /**
     * Get all unique slugs.
     */
    public static function getAllSlugs(): array
    {
        $model = new static();
        return static::pluck($model->getSlugColumn())->toArray();
    }

    /**
     * Regenerate slug for the model.
     */
    public function regenerateSlug(): void
    {
        $this->generateSlug();
        $this->save();
    }

    /**
     * Regenerate slugs for all models.
     */
    public static function regenerateAllSlugs(): void
    {
        static::all()->each(function ($model) {
            $model->regenerateSlug();
        });
    }
}
