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
        Schema::create('product_sizes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->string('size'); // e.g., "37", "39", "40", "S", "M", "L"
            $table->integer('stock_quantity')->default(0);
            $table->boolean('is_available')->default(true);
            $table->timestamps();

            // Unique constraint to prevent duplicate sizes for same product
            $table->unique(['product_id', 'size']);

            // Indexes for better performance
            $table->index(['product_id', 'is_available']);
            $table->index(['size', 'is_available']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('product_sizes');
    }
};
