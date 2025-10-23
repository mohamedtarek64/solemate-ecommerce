<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'price' => $this->price,
            'formatted_price' => $this->formatted_price,
            'final_price' => $this->final_price,
            'description' => $this->description,
            'category' => $this->category,
            'brand' => $this->brand,
            'size' => $this->size,
            'color' => $this->color,
            'material' => $this->material,
            'image_url' => $this->image_url,
            'stock_quantity' => $this->stock_quantity,
            'is_active' => $this->is_active,
            'featured' => $this->featured,
            'discount_percentage' => $this->discount_percentage,
            'original_price' => $this->original_price,
            'sku' => $this->sku,
            'weight' => $this->weight,
            'dimensions' => $this->dimensions,
            'care_instructions' => $this->care_instructions,
            'tags' => $this->tags ? explode(',', $this->tags) : [],
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'slug' => $this->slug,
            'is_in_stock' => $this->isInStock(),
            'is_on_sale' => $this->isOnSale(),
            'average_rating' => $this->getAverageRating(),
            'total_reviews' => $this->getTotalReviews(),
            'table_source' => $this->table_source ?? 'products_women',
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            // Additional computed fields
            'availability_status' => $this->getAvailabilityStatus(),
            'price_range' => $this->getPriceRange(),
            'image_gallery' => $this->getImageGallery(),
            'related_products' => $this->getRelatedProducts(),
        ];
    }

    private function getAvailabilityStatus()
    {
        if ($this->stock_quantity > 10) {
            return 'in_stock';
        } elseif ($this->stock_quantity > 0) {
            return 'low_stock';
        } else {
            return 'out_of_stock';
        }
    }

    private function getPriceRange()
    {
        if ($this->discount_percentage > 0) {
            return [
                'original' => $this->original_price,
                'discounted' => $this->final_price,
                'savings' => $this->discount_amount
            ];
        }

        return [
            'original' => $this->price,
            'discounted' => null,
            'savings' => 0
        ];
    }

    private function getImageGallery()
    {
        // Return array of images if multiple images exist
        $images = [];

        if ($this->image_url) {
            $images[] = [
                'url' => $this->image_url,
                'alt' => $this->name,
                'primary' => true
            ];
        }

        // Add color variant images if they exist
        if (isset($this->colors) && $this->colors->count() > 0) {
            foreach ($this->colors as $color) {
                if ($color->color_image) {
                    $images[] = [
                        'url' => $color->color_image,
                        'alt' => $this->name . ' - ' . $color->color_name,
                        'primary' => false,
                        'color' => $color->color_name
                    ];
                }
            }
        }

        return $images;
    }

    private function getRelatedProducts()
    {
        // This would typically fetch related products from the same category
        // For now, return empty array
        return [];
    }
}
