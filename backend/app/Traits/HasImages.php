<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Facades\Storage;

trait HasImages
{
    /**
     * Get all images for the model.
     */
    public function images(): MorphMany
    {
        return $this->morphMany(\App\Models\Image::class, 'imageable');
    }

    /**
     * Get the primary image for the model.
     */
    public function primaryImage()
    {
        return $this->images()->where('is_primary', true)->first();
    }

    /**
     * Get the main image URL.
     */
    public function getImageUrlAttribute(): ?string
    {
        $image = $this->primaryImage();
        
        if (!$image) {
            return $this->getDefaultImageUrl();
        }
        
        return $this->getImageUrl($image->path);
    }

    /**
     * Get image URL by path.
     */
    public function getImageUrl(string $path): string
    {
        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }
        
        return Storage::url($path);
    }

    /**
     * Get thumbnail URL.
     */
    public function getThumbnailUrlAttribute(): ?string
    {
        $image = $this->primaryImage();
        
        if (!$image) {
            return $this->getDefaultImageUrl();
        }
        
        return $this->getThumbnailUrl($image->path);
    }

    /**
     * Get thumbnail URL by path.
     */
    public function getThumbnailUrl(string $path): string
    {
        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }
        
        $thumbnailPath = $this->getThumbnailPath($path);
        
        if (Storage::exists($thumbnailPath)) {
            return Storage::url($thumbnailPath);
        }
        
        return Storage::url($path);
    }

    /**
     * Get thumbnail path.
     */
    protected function getThumbnailPath(string $path): string
    {
        $pathInfo = pathinfo($path);
        return $pathInfo['dirname'] . '/thumbnails/' . $pathInfo['filename'] . '_thumb.' . $pathInfo['extension'];
    }

    /**
     * Get default image URL.
     */
    protected function getDefaultImageUrl(): string
    {
        return asset('images/default-placeholder.png');
    }

    /**
     * Add an image to the model.
     */
    public function addImage(string $path, bool $isPrimary = false): \App\Models\Image
    {
        // If this is the primary image, unset other primary images
        if ($isPrimary) {
            $this->images()->update(['is_primary' => false]);
        }
        
        return $this->images()->create([
            'path' => $path,
            'is_primary' => $isPrimary,
        ]);
    }

    /**
     * Set primary image.
     */
    public function setPrimaryImage(\App\Models\Image $image): void
    {
        $this->images()->update(['is_primary' => false]);
        $image->update(['is_primary' => true]);
    }

    /**
     * Remove an image.
     */
    public function removeImage(\App\Models\Image $image): bool
    {
        // Delete file from storage
        if (Storage::exists($image->path)) {
            Storage::delete($image->path);
        }
        
        // Delete thumbnail if exists
        $thumbnailPath = $this->getThumbnailPath($image->path);
        if (Storage::exists($thumbnailPath)) {
            Storage::delete($thumbnailPath);
        }
        
        return $image->delete();
    }

    /**
     * Remove all images.
     */
    public function removeAllImages(): void
    {
        foreach ($this->images as $image) {
            $this->removeImage($image);
        }
    }

    /**
     * Get image gallery.
     */
    public function getImageGallery(): array
    {
        return $this->images()->orderBy('is_primary', 'desc')->get()->map(function ($image) {
            return [
                'id' => $image->id,
                'url' => $this->getImageUrl($image->path),
                'thumbnail_url' => $this->getThumbnailUrl($image->path),
                'is_primary' => $image->is_primary,
                'alt_text' => $image->alt_text,
            ];
        })->toArray();
    }

    /**
     * Check if model has images.
     */
    public function hasImages(): bool
    {
        return $this->images()->exists();
    }

    /**
     * Check if model has primary image.
     */
    public function hasPrimaryImage(): bool
    {
        return $this->images()->where('is_primary', true)->exists();
    }

    /**
     * Get image count.
     */
    public function getImageCount(): int
    {
        return $this->images()->count();
    }

    /**
     * Scope models with images.
     */
    public function scopeWithImages($query)
    {
        return $query->has('images');
    }

    /**
     * Scope models with primary image.
     */
    public function scopeWithPrimaryImage($query)
    {
        return $query->whereHas('images', function ($q) {
            $q->where('is_primary', true);
        });
    }

    /**
     * Scope models without images.
     */
    public function scopeWithoutImages($query)
    {
        return $query->doesntHave('images');
    }
}
