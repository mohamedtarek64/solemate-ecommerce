<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_colors', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->string('source_table')->default('products_women');
            $table->string('color_name');
            $table->string('color_code')->nullable();
            $table->string('image_url')->nullable();
            $table->json('additional_images')->nullable();
            $table->json('videos')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->integer('quantity')->default(0);
            $table->boolean('is_available')->default(true);
            $table->timestamps();

            $table->index(['product_id', 'source_table']);
            $table->index('color_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_colors');
    }
};
