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
        // Add size column to products_women table
        if (!Schema::hasColumn('products_women', 'size')) {
            Schema::table('products_women', function (Blueprint $table) {
                $table->json('size')->nullable()->after('category')->comment('Available sizes for the product');
            });
        }

        // Add size column to products_men table
        if (!Schema::hasColumn('products_men', 'size')) {
            Schema::table('products_men', function (Blueprint $table) {
                $table->json('size')->nullable()->after('category')->comment('Available sizes for the product');
            });
        }

        // Add size column to products_kids table
        if (!Schema::hasColumn('products_kids', 'size')) {
            Schema::table('products_kids', function (Blueprint $table) {
                $table->json('size')->nullable()->after('category')->comment('Available sizes for the product');
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Remove size column from products_women table
        if (Schema::hasColumn('products_women', 'size')) {
            Schema::table('products_women', function (Blueprint $table) {
                $table->dropColumn('size');
            });
        }

        // Remove size column from products_men table
        if (Schema::hasColumn('products_men', 'size')) {
            Schema::table('products_men', function (Blueprint $table) {
                $table->dropColumn('size');
            });
        }

        // Remove size column from products_kids table
        if (Schema::hasColumn('products_kids', 'size')) {
            Schema::table('products_kids', function (Blueprint $table) {
                $table->dropColumn('size');
            });
        }
    }
};
