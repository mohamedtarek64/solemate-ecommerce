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
        Schema::create('discount_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['percentage', 'fixed']); // نسبة مئوية أو مبلغ ثابت
            $table->decimal('value', 10, 2); // قيمة الخصم
            $table->decimal('minimum_amount', 10, 2)->nullable(); // الحد الأدنى للطلب
            $table->integer('usage_limit')->nullable(); // حد الاستخدام
            $table->integer('used_count')->default(0); // عدد مرات الاستخدام
            $table->datetime('starts_at')->nullable(); // تاريخ البداية
            $table->datetime('expires_at')->nullable(); // تاريخ الانتهاء
            $table->boolean('is_active')->default(true);
            $table->json('applicable_products')->nullable(); // المنتجات المطبقة عليها
            $table->json('applicable_categories')->nullable(); // الفئات المطبقة عليها
            $table->timestamps();

            $table->index(['code', 'is_active']);
            $table->index(['expires_at', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discount_codes');
    }
};
