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
        if (!Schema::hasTable('user_addresses')) {
            Schema::create('user_addresses', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->enum('type', ['shipping', 'billing', 'both'])->default('both');
                $table->string('first_name');
                $table->string('last_name');
                $table->string('company')->nullable();
                $table->string('address_line_1');
                $table->string('address_line_2')->nullable();
                $table->string('city');
                $table->string('state')->nullable();
                $table->string('postal_code');
                $table->string('country')->default('United States');
                $table->string('phone')->nullable();
                $table->boolean('is_default')->default(false);
                $table->boolean('is_billing')->default(false);
                $table->boolean('is_shipping')->default(false);
                $table->timestamps();

                // Add indexes
                $table->index('user_id');
                $table->index(['user_id', 'is_default']);
                $table->index(['user_id', 'type']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_addresses');
    }
};
