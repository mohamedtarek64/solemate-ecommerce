<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Check if color_name column exists
        if (Schema::hasColumn('cart_items', 'color_name')) {
            // Rename color_name to color
            Schema::table('cart_items', function (Blueprint $table) {
                $table->renameColumn('color_name', 'color');
            });
        } elseif (!Schema::hasColumn('cart_items', 'color')) {
            // Add color column if it doesn't exist
            Schema::table('cart_items', function (Blueprint $table) {
                $table->string('color')->nullable()->after('quantity');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('cart_items', 'color')) {
            Schema::table('cart_items', function (Blueprint $table) {
                $table->renameColumn('color', 'color_name');
            });
        }
    }
};
