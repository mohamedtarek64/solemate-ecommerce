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
        // Add performance indexes to products tables
        Schema::table('products_women', function (Blueprint $table) {
            $table->index(['is_active', 'created_at'], 'idx_women_active_created');
            $table->index(['category', 'is_active'], 'idx_women_category_active');
            $table->index(['price'], 'idx_women_price');
            $table->index(['brand'], 'idx_women_brand');
        });

        Schema::table('products_men', function (Blueprint $table) {
            $table->index(['is_active', 'created_at'], 'idx_men_active_created');
            $table->index(['category', 'is_active'], 'idx_men_category_active');
            $table->index(['price'], 'idx_men_price');
            $table->index(['brand'], 'idx_men_brand');
        });

        Schema::table('products_kids', function (Blueprint $table) {
            $table->index(['is_active', 'created_at'], 'idx_kids_active_created');
            $table->index(['category', 'is_active'], 'idx_kids_category_active');
            $table->index(['price'], 'idx_kids_price');
            $table->index(['brand'], 'idx_kids_brand');
        });

        // Add indexes to cart table
        Schema::table('cart_items', function (Blueprint $table) {
            $table->index(['user_id', 'created_at'], 'idx_cart_user_created');
            $table->index(['product_id'], 'idx_cart_product');
        });

        // Add indexes to orders table
        Schema::table('orders', function (Blueprint $table) {
            $table->index(['user_id', 'created_at'], 'idx_orders_user_created');
            $table->index(['status'], 'idx_orders_status');
            $table->index(['order_number'], 'idx_orders_number');
        });

        // Add indexes to order_items table
        Schema::table('order_items', function (Blueprint $table) {
            $table->index(['order_id'], 'idx_order_items_order');
            $table->index(['product_id'], 'idx_order_items_product');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop performance indexes
        Schema::table('products_women', function (Blueprint $table) {
            $table->dropIndex('idx_women_active_created');
            $table->dropIndex('idx_women_category_active');
            $table->dropIndex('idx_women_price');
            $table->dropIndex('idx_women_brand');
        });

        Schema::table('products_men', function (Blueprint $table) {
            $table->dropIndex('idx_men_active_created');
            $table->dropIndex('idx_men_category_active');
            $table->dropIndex('idx_men_price');
            $table->dropIndex('idx_men_brand');
        });

        Schema::table('products_kids', function (Blueprint $table) {
            $table->dropIndex('idx_kids_active_created');
            $table->dropIndex('idx_kids_category_active');
            $table->dropIndex('idx_kids_price');
            $table->dropIndex('idx_kids_brand');
        });

        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropIndex('idx_cart_user_created');
            $table->dropIndex('idx_cart_product');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('idx_orders_user_created');
            $table->dropIndex('idx_orders_status');
            $table->dropIndex('idx_orders_number');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex('idx_order_items_order');
            $table->dropIndex('idx_order_items_product');
        });
    }
};
