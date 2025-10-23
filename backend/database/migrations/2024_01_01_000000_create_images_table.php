<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('images', function (Blueprint $table) {
            $table->id();
            $table->string('image_url', 500)->comment('URL or path to the image file');
            $table->enum('image_type', ['hero', 'featured', 'category', 'instagram', 'product', 'banner', 'logo'])
                  ->comment('Type of image for categorization');
            $table->string('title')->nullable()->comment('Image title or description');
            $table->string('alt_text')->nullable()->comment('Alt text for accessibility');
            $table->integer('sort_order')->default(0)->comment('Order for displaying images of same type');
            $table->boolean('is_active')->default(true)->comment('Whether image is active/visible');
            $table->timestamps();

            // Indexes for better performance
            $table->index('image_type');
            $table->index(['image_type', 'is_active']);
            $table->index('sort_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('images');
    }
};
