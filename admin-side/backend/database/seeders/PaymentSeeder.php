<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Database\Seeder;

class PaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $orders = Order::all();
        $paymentMethods = ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer'];
        $statuses = ['pending', 'paid', 'failed', 'refunded'];

        foreach ($orders as $order) {
            // Create payment for each order
            Payment::create([
                'order_id' => $order->id,
                'provider' => $paymentMethods[array_rand($paymentMethods)],
                'provider_payment_id' => 'PAY-' . strtoupper(uniqid()),
                'amount' => $order->total_amount,
                'currency' => 'USD',
                'status' => $order->payment_status,
                'method' => $paymentMethods[array_rand($paymentMethods)],
                'metadata' => json_encode([
                    'transaction_date' => now()->toDateTimeString(),
                    'order_number' => $order->order_number,
                ]),
            ]);
        }
    }
}

