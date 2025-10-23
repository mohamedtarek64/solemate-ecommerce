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
        Schema::table('products', function (Blueprint $table) {
            // Add missing columns first
            $table->decimal('original_price', 10, 2)->nullable()->after('price');
            $table->integer('discount_percentage')->nullable()->after('original_price');
            $table->string('material')->nullable()->after('description');
            $table->text('care_instructions')->nullable()->after('material');
            $table->string('origin')->nullable()->after('care_instructions');
            $table->json('colors')->nullable()->after('images');
            $table->json('sizes')->nullable()->after('colors');
            $table->string('category')->nullable()->after('origin');
            $table->string('brand')->nullable()->after('category');
            $table->boolean('is_active')->default(true)->after('featured');
            $table->boolean('is_featured')->default(false)->after('is_active');

            // Add size-related columns
            $table->string('size')->nullable()->after('sizes');
            $table->integer('stock_quantity')->default(0)->after('size');
            $table->boolean('is_available')->default(true)->after('stock_quantity');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['size', 'stock_quantity', 'is_available']);
        });
    }
};
