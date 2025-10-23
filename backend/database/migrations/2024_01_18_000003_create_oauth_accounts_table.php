<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('oauth_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('provider'); // google, facebook, twitter
            $table->string('provider_id');
            $table->string('name');
            $table->string('email');
            $table->string('avatar')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'provider']);
            $table->index(['provider', 'provider_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('oauth_accounts');
    }
};

