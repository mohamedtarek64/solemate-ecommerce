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
        // Create payments table if not exists
        if (!Schema::hasTable('payments')) {
            Schema::create('payments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
                $table->foreignId('order_id')->nullable()->constrained('orders')->onDelete('cascade');
                $table->string('payment_intent_id')->unique();
                $table->decimal('amount', 10, 2);
                $table->string('currency', 3)->default('usd');
                $table->string('status')->default('pending'); // pending, succeeded, failed, refunded
                $table->string('payment_method')->nullable();
                $table->text('error_message')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamps();

                $table->index('user_id');
                $table->index('order_id');
                $table->index('status');
                $table->index('created_at');
            });
        }

        // Create stripe_customers table if not exists
        if (!Schema::hasTable('stripe_customers')) {
            Schema::create('stripe_customers', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
                $table->string('stripe_customer_id')->unique();
                $table->timestamps();

                $table->index('user_id');
                $table->index('stripe_customer_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('stripe_customers');
    }
};
