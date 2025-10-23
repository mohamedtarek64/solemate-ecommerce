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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('short_description')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('compare_price', 10, 2)->nullable();
            $table->decimal('cost_price', 10, 2)->nullable();
            $table->string('sku')->unique();
            $table->string('barcode')->nullable();
            $table->boolean('track_quantity')->default(true);
            $table->integer('quantity')->default(0);
            $table->integer('min_quantity')->default(1);
            $table->integer('max_quantity')->nullable();
            $table->decimal('weight', 8, 2)->nullable();
            $table->json('dimensions')->nullable();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->foreignId('brand_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('status', ['active', 'inactive', 'draft'])->default('draft');
            $table->boolean('featured')->default(false);
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->json('tags')->nullable();
            $table->json('images')->nullable();
            $table->json('attributes')->nullable();
            $table->json('variants')->nullable();
            $table->timestamps();
            
            $table->index(['category_id', 'status']);
            $table->index(['brand_id', 'status']);
            $table->index(['status', 'featured']);
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
        Schema::dropIfExists('products');
    }
};
