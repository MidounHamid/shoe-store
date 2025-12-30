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
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            // product_id comes first
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();

            // size_id follows product_id naturally (no ->after() needed)
            $table->foreignId('size_id')->nullable()
                ->constrained('sizes')->nullOnDelete();

            // SKU and other details
            $table->string('sku')->nullable()->unique();
            $table->string('color', 100)->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('original_price', 10, 2)->nullable();
            $table->integer('stock')->default(0);
            $table->json('attributes')->nullable();
            $table->timestamps();

            // Unique constraint
            $table->unique(['product_id', 'size_id', 'color'], 'pv_product_size_color_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
