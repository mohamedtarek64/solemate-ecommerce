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
        Schema::table('products_women', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('status');
            $table->integer('stock_quantity')->default(0)->after('quantity');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('products_women', function (Blueprint $table) {
            $table->dropColumn(['is_active', 'stock_quantity']);
        });
    }
};
