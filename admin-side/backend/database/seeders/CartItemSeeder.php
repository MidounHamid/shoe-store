<?php

namespace Database\Seeders;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;

class CartItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $carts = Cart::all();
        $variants = ProductVariant::all();

        foreach ($carts as $cart) {
            // Add 1-3 items to each cart
            $itemCount = rand(1, 3);
            $selectedVariants = $variants->random($itemCount);

            foreach ($selectedVariants as $variant) {
                CartItem::create([
                    'cart_id' => $cart->id,
                    'variant_id' => $variant->id,
                    'quantity' => rand(1, 3),
                    'price' => $variant->price,
                ]);
            }
        }
    }
}

