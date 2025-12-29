<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderEvent;
use Illuminate\Database\Seeder;

class OrderEventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $orders = Order::all();
        $eventTypes = ['order_created', 'payment_received', 'order_shipped', 'order_delivered', 'order_cancelled'];

        foreach ($orders as $order) {
            // Create initial order created event
            OrderEvent::create([
                'order_id' => $order->id,
                'event_type' => 'order_created',
                'data' => ['status' => $order->status, 'description' => 'Order was created'],
            ]);

            // Create additional events based on order status
            if ($order->status === 'shipped') {
                OrderEvent::create([
                    'order_id' => $order->id,
                    'event_type' => 'order_shipped',
                    'data' => [
                        'description' => 'Order has been shipped',
                        'tracking_number' => 'TRK-' . strtoupper(uniqid()),
                    ],
                ]);
            }

            if ($order->status === 'delivered') {
                OrderEvent::create([
                    'order_id' => $order->id,
                    'event_type' => 'order_delivered',
                    'data' => [
                        'description' => 'Order has been delivered',
                        'delivered_at' => now()->toDateTimeString(),
                    ],
                ]);
            }

            if ($order->payment_status === 'paid') {
                OrderEvent::create([
                    'order_id' => $order->id,
                    'event_type' => 'payment_received',
                    'data' => [
                        'description' => 'Payment has been received',
                        'amount' => $order->total_amount,
                    ],
                ]);
            }
        }
    }
}

