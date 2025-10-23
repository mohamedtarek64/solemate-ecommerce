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
        $tables = ['products_women', 'products_men', 'products_kids'];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $table) {
                    // Add sku column if not exists
                    if (!Schema::hasColumn($table->getTable(), 'sku')) {
                        $table->string('sku')->unique()->nullable()->after('slug');
                    }
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = ['products_women', 'products_men', 'products_kids'];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $table) {
                    if (Schema::hasColumn($table->getTable(), 'sku')) {
                        $table->dropColumn('sku');
                    }
                });
            }
        }
    }
};
