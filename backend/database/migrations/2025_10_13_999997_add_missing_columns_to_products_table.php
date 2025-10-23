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
        if (Schema::hasTable('products')) {
            Schema::table('products', function (Blueprint $table) {
                // Add additional_images column if not exists
                if (!Schema::hasColumn('products', 'additional_images')) {
                    $table->json('additional_images')->nullable()->after('images');
                }

                // Add videos column if not exists
                if (!Schema::hasColumn('products', 'videos')) {
                    $table->json('videos')->nullable()->after('additional_images');
                }

                // Add rating column if not exists
                if (!Schema::hasColumn('products', 'rating')) {
                    $table->decimal('rating', 3, 2)->default(0)->after('is_featured');
                }

                // Add reviews_count column if not exists
                if (!Schema::hasColumn('products', 'reviews_count')) {
                    $table->integer('reviews_count')->default(0)->after('rating');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('products')) {
            Schema::table('products', function (Blueprint $table) {
                $columns = ['additional_images', 'videos', 'rating', 'reviews_count'];

                foreach ($columns as $column) {
                    if (Schema::hasColumn('products', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }
};
