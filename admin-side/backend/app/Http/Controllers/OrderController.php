<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DB::table('orders')
            ->leftJoin('users', 'orders.user_id', '=', 'users.id')
            ->select('orders.*', 'users.email as user_email');

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('orders.user_id', $request->user_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('orders.status', $request->status);
        }

        // Filter by payment_status
        if ($request->has('payment_status')) {
            $query->where('orders.payment_status', $request->payment_status);
        }

        // Search by order number
        if ($request->has('search')) {
            $query->where('orders.order_number', 'like', "%{$request->search}%");
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $orders = $query->orderBy('orders.created_at', 'desc')->paginate($perPage);

        return response()->json($orders);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOrderRequest $request)
    {

        // Generate unique order number
        $orderNumber = 'ORD-' . strtoupper(Str::random(10));

        $data = [
            'user_id' => $request->user_id,
            'order_number' => $orderNumber,
            'shipping_address_id' => $request->shipping_address_id,
            'billing_address_id' => $request->billing_address_id,
            'subtotal' => $request->subtotal,
            'shipping_amount' => $request->get('shipping_amount', 0),
            'tax_amount' => $request->get('tax_amount', 0),
            'total_amount' => $request->total_amount,
            'status' => $request->get('status', 'pending'),
            'payment_status' => $request->get('payment_status', 'pending'),
            'notes' => $request->notes,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        $id = DB::table('orders')->insertGetId($data);
        $order = DB::table('orders')
            ->leftJoin('users', 'orders.user_id', '=', 'users.id')
            ->select('orders.*', 'users.email as user_email')
            ->where('orders.id', $id)
            ->first();

        return response()->json($order, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $order = DB::table('orders')
            ->leftJoin('users', 'orders.user_id', '=', 'users.id')
            ->select('orders.*', 'users.email as user_email')
            ->where('orders.id', $id)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        // Get order items
        $items = DB::table('order_items')
            ->join('product_variants', 'order_items.variant_id', '=', 'product_variants.id')
            ->where('order_items.order_id', $id)
            ->select('order_items.*', 'product_variants.sku')
            ->get();

        $order->items = $items;

        return response()->json($order);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOrderRequest $request, $id)
    {
        $order = DB::table('orders')->where('id', $id)->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $data = [
            'updated_at' => now(),
        ];

        if ($request->has('user_id')) $data['user_id'] = $request->user_id;
        if ($request->has('shipping_address_id')) $data['shipping_address_id'] = $request->shipping_address_id;
        if ($request->has('billing_address_id')) $data['billing_address_id'] = $request->billing_address_id;
        if ($request->has('subtotal')) $data['subtotal'] = $request->subtotal;
        if ($request->has('shipping_amount')) $data['shipping_amount'] = $request->shipping_amount;
        if ($request->has('tax_amount')) $data['tax_amount'] = $request->tax_amount;
        if ($request->has('total_amount')) $data['total_amount'] = $request->total_amount;
        if ($request->has('status')) $data['status'] = $request->status;
        if ($request->has('payment_status')) $data['payment_status'] = $request->payment_status;
        if ($request->has('notes')) $data['notes'] = $request->notes;

        DB::table('orders')->where('id', $id)->update($data);
        $order = DB::table('orders')
            ->leftJoin('users', 'orders.user_id', '=', 'users.id')
            ->select('orders.*', 'users.email as user_email')
            ->where('orders.id', $id)
            ->first();

        return response()->json($order);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $order = DB::table('orders')->where('id', $id)->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        DB::table('orders')->where('id', $id)->delete();

        return response()->json(['message' => 'Order deleted successfully']);
    }
}
