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
        Schema::table('orders', function (Blueprint $table) {
            // Add shipping method and cost
            $table->string('shipping_method')->nullable()->after('payment_status');
            $table->decimal('shipping_cost', 10, 2)->default(0)->after('shipping_method');
            $table->decimal('subtotal', 10, 2)->after('shipping_cost');
            $table->decimal('tax_amount', 10, 2)->default(0)->after('subtotal');

            // Add customer contact info
            $table->string('customer_email')->nullable()->after('tax_amount');
            $table->string('customer_phone')->nullable()->after('customer_email');

            // Add Stripe payment info
            $table->string('stripe_payment_intent_id')->nullable()->after('customer_phone');
            $table->string('stripe_charge_id')->nullable()->after('stripe_payment_intent_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'shipping_method',
                'shipping_cost',
                'subtotal',
                'tax_amount',
                'customer_email',
                'customer_phone',
                'stripe_payment_intent_id',
                'stripe_charge_id'
            ]);
        });
    }
};
