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
        Schema::table('products_men', function (Blueprint $table) {
            // Add columns only if they don't exist
            if (!Schema::hasColumn('products_men', 'name')) {
                $table->string('name')->after('id');
            }
            if (!Schema::hasColumn('products_men', 'brand')) {
                $table->string('brand')->after('name');
            }
            if (!Schema::hasColumn('products_men', 'price')) {
                $table->decimal('price', 10, 2)->after('brand');
            }
            if (!Schema::hasColumn('products_men', 'original_price')) {
                $table->decimal('original_price', 10, 2)->nullable()->after('price');
            }
            if (!Schema::hasColumn('products_men', 'description')) {
                $table->text('description')->nullable()->after('original_price');
            }
            if (!Schema::hasColumn('products_men', 'image_url')) {
                $table->string('image_url')->nullable()->after('description');
            }
            if (!Schema::hasColumn('products_men', 'category')) {
                $table->string('category')->nullable()->after('image_url');
            }
            if (!Schema::hasColumn('products_men', 'is_featured')) {
                $table->boolean('is_featured')->default(false)->after('category');
            }
            if (!Schema::hasColumn('products_men', 'stock_quantity')) {
                $table->integer('stock_quantity')->default(0)->after('is_featured');
            }
            if (!Schema::hasColumn('products_men', 'slug')) {
                $table->string('slug')->unique()->nullable()->after('name');
            }
            if (!Schema::hasColumn('products_men', 'subcategory')) {
                $table->string('subcategory')->nullable()->after('category');
            }
            if (!Schema::hasColumn('products_men', 'rating')) {
                $table->decimal('rating', 3, 2)->default(0)->after('is_featured');
            }
            if (!Schema::hasColumn('products_men', 'reviews_count')) {
                $table->integer('reviews_count')->default(0)->after('rating');
            }
            if (!Schema::hasColumn('products_men', 'images')) {
                $table->json('images')->nullable()->after('image_url');
            }
            if (!Schema::hasColumn('products_men', 'additional_images')) {
                $table->json('additional_images')->nullable()->after('images');
            }
            if (!Schema::hasColumn('products_men', 'videos')) {
                $table->json('videos')->nullable()->after('additional_images');
            }
            if (!Schema::hasColumn('products_men', 'size')) {
                $table->string('size')->nullable()->after('subcategory');
            }
            if (!Schema::hasColumn('products_men', 'color')) {
                $table->string('color')->nullable()->after('size');
            }
            if (!Schema::hasColumn('products_men', 'sku')) {
                $table->string('sku')->nullable()->after('color');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products_men', function (Blueprint $table) {
            $table->dropColumn([
                'name',
                'brand', 
                'price',
                'original_price',
                'description',
                'image_url',
                'category',
                'is_featured',
                'stock_quantity',
                'slug',
                'subcategory',
                'rating',
                'reviews_count',
                'images',
                'additional_images',
                'videos',
                'size',
                'color',
                'sku'
            ]);
        });
    }
};