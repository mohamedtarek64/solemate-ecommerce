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
        Schema::table('wishlist_items', function (Blueprint $table) {
            $table->string('product_table')->default('products_women')->after('product_id');
            $table->index(['user_id', 'product_table']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('wishlist_items', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'product_table']);
            $table->dropColumn('product_table');
        });
    }
};
