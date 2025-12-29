<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;

class OrderItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $orders = Order::all();
        $variants = ProductVariant::all();

        foreach ($orders as $order) {
            // Each order has 1-4 items
            $itemCount = rand(1, 4);
            $selectedVariants = $variants->random($itemCount);

            foreach ($selectedVariants as $variant) {
                $quantity = rand(1, 3);
                $price = $variant->price;

                OrderItem::create([
                    'order_id' => $order->id,
                    'variant_id' => $variant->id,
                    'quantity' => $quantity,
                    'unit_price' => $price,
                    'line_total' => $price * $quantity,
                    'product_snapshot' => [
                        'product' => $variant->product->only(['id','name','slug']),
                        'variant' => $variant->only(['id','sku','size','color']),
                    ],
                ]);
            }
        }
    }
}

