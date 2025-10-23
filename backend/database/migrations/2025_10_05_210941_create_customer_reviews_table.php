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
        Schema::create('customer_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('customer_name');
            $table->string('customer_email')->nullable();
            $table->integer('rating')->unsigned()->min(1)->max(5);
            $table->text('review_text');
            $table->string('customer_location')->nullable();
            $table->boolean('is_verified_purchase')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->json('images')->nullable(); // For review images
            $table->timestamps();

            // Indexes for better performance
            $table->index(['product_id', 'rating']);
            $table->index(['is_featured', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('customer_reviews');
    }
};
