<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::where('role', 'customer')->get();
        $statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        $paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

        foreach ($users as $user) {
            // Each user has 1-3 orders
            $orderCount = rand(1, 3);
            $addresses = Address::where('user_id', $user->id)->get();

            for ($i = 0; $i < $orderCount; $i++) {
                $subtotal = rand(5000, 50000) / 100; // $50.00 to $500.00
                $shippingAmount = rand(500, 2000) / 100; // $5.00 to $20.00
                $taxAmount = round($subtotal * 0.08, 2); // 8% tax
                $totalAmount = $subtotal + $shippingAmount + $taxAmount;

                $shippingAddress = $addresses->first();
                $billingAddress = $addresses->first();

                Order::create([
                    'user_id' => $user->id,
                    'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                    'shipping_address_id' => $shippingAddress?->id,
                    'billing_address_id' => $billingAddress?->id,
                    'subtotal' => $subtotal,
                    'shipping_amount' => $shippingAmount,
                    'tax_amount' => $taxAmount,
                    'total_amount' => $totalAmount,
                    'status' => $statuses[array_rand($statuses)],
                    'payment_status' => $paymentStatuses[array_rand($paymentStatuses)],
                    'notes' => rand(0, 1) ? 'Please deliver during business hours.' : null,
                ]);
            }
        }
    }
}

