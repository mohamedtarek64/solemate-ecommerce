<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Add indexes to improve query performance across all product tables
     */
    public function up(): void
    {
        // Add indexes to products_women table
        if (Schema::hasTable('products_women')) {
            Schema::table('products_women', function (Blueprint $table) {
                if (Schema::hasColumn('products_women', 'is_active') && 
                    !$this->indexExists('products_women', 'idx_products_women_active')) {
                    $table->index('is_active', 'idx_products_women_active');
                }
                if (Schema::hasColumn('products_women', 'category') && 
                    !$this->indexExists('products_women', 'idx_products_women_category')) {
                    $table->index('category', 'idx_products_women_category');
                }
                if (Schema::hasColumn('products_women', 'brand') && 
                    !$this->indexExists('products_women', 'idx_products_women_brand')) {
                    $table->index('brand', 'idx_products_women_brand');
                }
                if (Schema::hasColumn('products_women', 'price') && 
                    !$this->indexExists('products_women', 'idx_products_women_price')) {
                    $table->index('price', 'idx_products_women_price');
                }
                if (Schema::hasColumn('products_women', 'stock_quantity') && 
                    !$this->indexExists('products_women', 'idx_products_women_stock')) {
                    $table->index('stock_quantity', 'idx_products_women_stock');
                }
                // Composite index for common queries
                if (Schema::hasColumn('products_women', 'is_active') && 
                    Schema::hasColumn('products_women', 'category') &&
                    !$this->indexExists('products_women', 'idx_products_women_active_category')) {
                    $table->index(['is_active', 'category'], 'idx_products_women_active_category');
                }
            });
        }

        // Add indexes to products_men table
        if (Schema::hasTable('products_men')) {
            Schema::table('products_men', function (Blueprint $table) {
                if (Schema::hasColumn('products_men', 'status') && 
                    !$this->indexExists('products_men', 'idx_products_men_status')) {
                    $table->index('status', 'idx_products_men_status');
                }
                if (Schema::hasColumn('products_men', 'category') && 
                    !$this->indexExists('products_men', 'idx_products_men_category')) {
                    $table->index('category', 'idx_products_men_category');
                }
                if (Schema::hasColumn('products_men', 'brand') && 
                    !$this->indexExists('products_men', 'idx_products_men_brand')) {
                    $table->index('brand', 'idx_products_men_brand');
                }
                if (Schema::hasColumn('products_men', 'price') && 
                    !$this->indexExists('products_men', 'idx_products_men_price')) {
                    $table->index('price', 'idx_products_men_price');
                }
                if (Schema::hasColumn('products_men', 'stock') && 
                    !$this->indexExists('products_men', 'idx_products_men_stock')) {
                    $table->index('stock', 'idx_products_men_stock');
                }
                // Composite index for common queries
                if (Schema::hasColumn('products_men', 'status') && 
                    Schema::hasColumn('products_men', 'category') &&
                    !$this->indexExists('products_men', 'idx_products_men_status_category')) {
                    $table->index(['status', 'category'], 'idx_products_men_status_category');
                }
            });
        }

        // Add indexes to products_kids table
        if (Schema::hasTable('products_kids')) {
            Schema::table('products_kids', function (Blueprint $table) {
                if (Schema::hasColumn('products_kids', 'is_active') && 
                    !$this->indexExists('products_kids', 'idx_products_kids_active')) {
                    $table->index('is_active', 'idx_products_kids_active');
                }
                if (Schema::hasColumn('products_kids', 'category') && 
                    !$this->indexExists('products_kids', 'idx_products_kids_category')) {
                    $table->index('category', 'idx_products_kids_category');
                }
                if (Schema::hasColumn('products_kids', 'brand') && 
                    !$this->indexExists('products_kids', 'idx_products_kids_brand')) {
                    $table->index('brand', 'idx_products_kids_brand');
                }
                if (Schema::hasColumn('products_kids', 'price') && 
                    !$this->indexExists('products_kids', 'idx_products_kids_price')) {
                    $table->index('price', 'idx_products_kids_price');
                }
                if (Schema::hasColumn('products_kids', 'stock_quantity') && 
                    !$this->indexExists('products_kids', 'idx_products_kids_stock')) {
                    $table->index('stock_quantity', 'idx_products_kids_stock');
                }
                // Composite index for common queries
                if (Schema::hasColumn('products_kids', 'is_active') && 
                    Schema::hasColumn('products_kids', 'category') &&
                    !$this->indexExists('products_kids', 'idx_products_kids_active_category')) {
                    $table->index(['is_active', 'category'], 'idx_products_kids_active_category');
                }
            });
        }

        // Add indexes to orders table
        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                if (Schema::hasColumn('orders', 'user_id') && 
                    !$this->indexExists('orders', 'idx_orders_user_id')) {
                    $table->index('user_id', 'idx_orders_user_id');
                }
                if (Schema::hasColumn('orders', 'status') && 
                    !$this->indexExists('orders', 'idx_orders_status')) {
                    $table->index('status', 'idx_orders_status');
                }
                if (Schema::hasColumn('orders', 'created_at') && 
                    !$this->indexExists('orders', 'idx_orders_created_at')) {
                    $table->index('created_at', 'idx_orders_created_at');
                }
                // Composite index for user's orders by status
                if (Schema::hasColumn('orders', 'user_id') && 
                    Schema::hasColumn('orders', 'status') &&
                    !$this->indexExists('orders', 'idx_orders_user_status')) {
                    $table->index(['user_id', 'status'], 'idx_orders_user_status');
                }
            });
        }

        // Add indexes to cart_items table
        if (Schema::hasTable('cart_items')) {
            Schema::table('cart_items', function (Blueprint $table) {
                if (Schema::hasColumn('cart_items', 'user_id') && 
                    !$this->indexExists('cart_items', 'idx_cart_items_user_id')) {
                    $table->index('user_id', 'idx_cart_items_user_id');
                }
                if (Schema::hasColumn('cart_items', 'product_id') && 
                    !$this->indexExists('cart_items', 'idx_cart_items_product_id')) {
                    $table->index('product_id', 'idx_cart_items_product_id');
                }
            });
        }

        // Add indexes to wishlist_items table
        if (Schema::hasTable('wishlist_items')) {
            Schema::table('wishlist_items', function (Blueprint $table) {
                if (Schema::hasColumn('wishlist_items', 'user_id') && 
                    !$this->indexExists('wishlist_items', 'idx_wishlist_items_user_id')) {
                    $table->index('user_id', 'idx_wishlist_items_user_id');
                }
                if (Schema::hasColumn('wishlist_items', 'product_id') && 
                    !$this->indexExists('wishlist_items', 'idx_wishlist_items_product_id')) {
                    $table->index('product_id', 'idx_wishlist_items_product_id');
                }
            });
        }

        // Add indexes to product_colors table
        if (Schema::hasTable('product_colors')) {
            Schema::table('product_colors', function (Blueprint $table) {
                if (Schema::hasColumn('product_colors', 'product_id') && 
                    !$this->indexExists('product_colors', 'idx_product_colors_product_id')) {
                    $table->index('product_id', 'idx_product_colors_product_id');
                }
                if (Schema::hasColumn('product_colors', 'source_table') && 
                    !$this->indexExists('product_colors', 'idx_product_colors_source_table')) {
                    $table->index('source_table', 'idx_product_colors_source_table');
                }
            });
        }

        // Add indexes to reviews table
        if (Schema::hasTable('reviews')) {
            Schema::table('reviews', function (Blueprint $table) {
                if (Schema::hasColumn('reviews', 'product_id') && 
                    !$this->indexExists('reviews', 'idx_reviews_product_id')) {
                    $table->index('product_id', 'idx_reviews_product_id');
                }
                if (Schema::hasColumn('reviews', 'user_id') && 
                    !$this->indexExists('reviews', 'idx_reviews_user_id')) {
                    $table->index('user_id', 'idx_reviews_user_id');
                }
                if (Schema::hasColumn('reviews', 'rating') && 
                    !$this->indexExists('reviews', 'idx_reviews_rating')) {
                    $table->index('rating', 'idx_reviews_rating');
                }
            });
        }

        // Add indexes to users table
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (Schema::hasColumn('users', 'email') && 
                    !$this->indexExists('users', 'idx_users_email')) {
                    $table->index('email', 'idx_users_email');
                }
                if (Schema::hasColumn('users', 'role') && 
                    !$this->indexExists('users', 'idx_users_role')) {
                    $table->index('role', 'idx_users_role');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indexes from products_women
        if (Schema::hasTable('products_women')) {
            Schema::table('products_women', function (Blueprint $table) {
                $table->dropIndex('idx_products_women_active');
                $table->dropIndex('idx_products_women_category');
                $table->dropIndex('idx_products_women_brand');
                $table->dropIndex('idx_products_women_price');
                if (Schema::hasColumn('products_women', 'stock_quantity')) {
                    $table->dropIndex('idx_products_women_stock');
                }
                $table->dropIndex('idx_products_women_active_category');
            });
        }

        // Drop indexes from products_men
        if (Schema::hasTable('products_men')) {
            Schema::table('products_men', function (Blueprint $table) {
                $table->dropIndex('idx_products_men_status');
                $table->dropIndex('idx_products_men_category');
                $table->dropIndex('idx_products_men_brand');
                $table->dropIndex('idx_products_men_price');
                if (Schema::hasColumn('products_men', 'stock')) {
                    $table->dropIndex('idx_products_men_stock');
                }
                $table->dropIndex('idx_products_men_status_category');
            });
        }

        // Drop indexes from products_kids
        if (Schema::hasTable('products_kids')) {
            Schema::table('products_kids', function (Blueprint $table) {
                $table->dropIndex('idx_products_kids_active');
                $table->dropIndex('idx_products_kids_category');
                $table->dropIndex('idx_products_kids_brand');
                $table->dropIndex('idx_products_kids_price');
                if (Schema::hasColumn('products_kids', 'stock_quantity')) {
                    $table->dropIndex('idx_products_kids_stock');
                }
                $table->dropIndex('idx_products_kids_active_category');
            });
        }

        // Drop indexes from orders
        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropIndex('idx_orders_user_id');
                $table->dropIndex('idx_orders_status');
                $table->dropIndex('idx_orders_created_at');
                $table->dropIndex('idx_orders_user_status');
            });
        }

        // Drop indexes from cart_items
        if (Schema::hasTable('cart_items')) {
            Schema::table('cart_items', function (Blueprint $table) {
                $table->dropIndex('idx_cart_items_user_id');
                $table->dropIndex('idx_cart_items_product_id');
            });
        }

        // Drop indexes from wishlist_items
        if (Schema::hasTable('wishlist_items')) {
            Schema::table('wishlist_items', function (Blueprint $table) {
                $table->dropIndex('idx_wishlist_items_user_id');
                $table->dropIndex('idx_wishlist_items_product_id');
                $table->dropIndex('idx_wishlist_unique_user_product');
            });
        }

        // Drop indexes from product_colors
        if (Schema::hasTable('product_colors')) {
            Schema::table('product_colors', function (Blueprint $table) {
                $table->dropIndex('idx_product_colors_product_id');
                if (Schema::hasColumn('product_colors', 'source_table')) {
                    $table->dropIndex('idx_product_colors_source_table');
                }
            });
        }

        // Drop indexes from reviews
        if (Schema::hasTable('reviews')) {
            Schema::table('reviews', function (Blueprint $table) {
                $table->dropIndex('idx_reviews_product_id');
                $table->dropIndex('idx_reviews_user_id');
                $table->dropIndex('idx_reviews_rating');
            });
        }

        // Drop indexes from users
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropIndex('idx_users_email');
                if (Schema::hasColumn('users', 'role')) {
                    $table->dropIndex('idx_users_role');
                }
            });
        }
    }

    /**
     * Check if index exists
     */
    private function indexExists(string $table, string $index): bool
    {
        $indexes = Schema::getConnection()
            ->getDoctrineSchemaManager()
            ->listTableIndexes($table);
        
        return isset($indexes[$index]);
    }
};

