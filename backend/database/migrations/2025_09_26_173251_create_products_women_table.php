<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('products_women', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('price', 10, 2);
            $table->text('description')->nullable();
            $table->string('image_url')->nullable();
            $table->string('category')->nullable();
            $table->string('brand')->nullable();
            $table->string('size')->nullable();
            $table->string('color')->nullable();
            $table->string('material')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('stock_quantity')->default(0);
            $table->string('sku')->nullable();
            $table->decimal('weight', 8, 2)->nullable();
            $table->string('dimensions')->nullable();
            $table->text('care_instructions')->nullable();
            $table->string('tags')->nullable();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('slug')->nullable();
            $table->boolean('featured')->default(false);
            $table->decimal('discount_percentage', 5, 2)->nullable();
            $table->decimal('original_price', 10, 2)->nullable();
            $table->timestamps();

            $table->index(['category', 'is_active']);
            $table->index(['brand', 'is_active']);
            $table->index(['is_active', 'featured']);
            $table->index('sku');
            $table->index('slug');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('products_women');
    }
};
