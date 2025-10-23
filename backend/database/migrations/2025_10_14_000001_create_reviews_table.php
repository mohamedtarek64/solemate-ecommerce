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
        if (!Schema::hasTable('reviews')) {
            Schema::create('reviews', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->unsignedBigInteger('product_id');
                $table->string('product_table')->default('products_women');
                $table->integer('rating')->unsigned()->default(5);
                $table->text('comment')->nullable();
                $table->boolean('is_verified')->default(false);
                $table->boolean('is_approved')->default(true);
                $table->integer('helpful_count')->default(0);
                $table->timestamps();

                // Add indexes
                $table->index(['product_id', 'product_table']);
                $table->index('user_id');
                $table->index('rating');
                $table->index('is_approved');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
