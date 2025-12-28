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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->nullOnDelete();
            $table->string('order_number')->unique();
            $table->foreignId('shipping_address_id')->nullable()->constrained('addresses')->nullOnDelete();
            $table->foreignId('billing_address_id')->nullable()->constrained('addresses')->nullOnDelete();
            $table->decimal('subtotal',10,2);
            $table->decimal('shipping_amount',10,2)->default(0);
            $table->decimal('tax_amount',10,2)->default(0);
            $table->decimal('total_amount',10,2);
            $table->enum('status',['pending','processing','shipped','delivered','cancelled','returned'])->default('pending');
            $table->enum('payment_status',['pending','paid','failed','refunded'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
