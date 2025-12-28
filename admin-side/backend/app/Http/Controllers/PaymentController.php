<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DB::table('payments')
            ->join('orders', 'payments.order_id', '=', 'orders.id')
            ->select('payments.*', 'orders.order_number');

        // Filter by order
        if ($request->has('order_id')) {
            $query->where('payments.order_id', $request->order_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('payments.status', $request->status);
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $payments = $query->orderBy('payments.created_at', 'desc')->paginate($perPage);

        // Decode JSON fields
        foreach ($payments->items() as $payment) {
            if ($payment->metadata) {
                $payment->metadata = json_decode($payment->metadata, true);
            }
        }

        return response()->json($payments);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'provider' => 'nullable|string',
            'provider_payment_id' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'currency' => 'sometimes|string|size:3',
            'status' => 'sometimes|in:pending,paid,failed,refunded',
            'method' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = [
            'order_id' => $request->order_id,
            'provider' => $request->provider,
            'provider_payment_id' => $request->provider_payment_id,
            'amount' => $request->amount,
            'currency' => $request->get('currency', 'USD'),
            'status' => $request->get('status', 'pending'),
            'method' => $request->method,
            'metadata' => $request->metadata ? json_encode($request->metadata) : null,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        $id = DB::table('payments')->insertGetId($data);
        $payment = DB::table('payments')
            ->join('orders', 'payments.order_id', '=', 'orders.id')
            ->select('payments.*', 'orders.order_number')
            ->where('payments.id', $id)
            ->first();

        if ($payment->metadata) {
            $payment->metadata = json_decode($payment->metadata, true);
        }

        return response()->json($payment, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $payment = DB::table('payments')
            ->join('orders', 'payments.order_id', '=', 'orders.id')
            ->select('payments.*', 'orders.order_number')
            ->where('payments.id', $id)
            ->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        if ($payment->metadata) {
            $payment->metadata = json_decode($payment->metadata, true);
        }

        return response()->json($payment);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $payment = DB::table('payments')->where('id', $id)->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'provider' => 'nullable|string',
            'provider_payment_id' => 'nullable|string',
            'amount' => 'sometimes|required|numeric|min:0',
            'currency' => 'sometimes|string|size:3',
            'status' => 'sometimes|in:pending,paid,failed,refunded',
            'method' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = [
            'updated_at' => now(),
        ];

        if ($request->has('provider')) $data['provider'] = $request->provider;
        if ($request->has('provider_payment_id')) $data['provider_payment_id'] = $request->provider_payment_id;
        if ($request->has('amount')) $data['amount'] = $request->amount;
        if ($request->has('currency')) $data['currency'] = $request->currency;
        if ($request->has('status')) $data['status'] = $request->status;
        if ($request->has('method')) $data['method'] = $request->method;
        if ($request->has('metadata')) $data['metadata'] = json_encode($request->metadata);

        DB::table('payments')->where('id', $id)->update($data);
        $payment = DB::table('payments')
            ->join('orders', 'payments.order_id', '=', 'orders.id')
            ->select('payments.*', 'orders.order_number')
            ->where('payments.id', $id)
            ->first();

        if ($payment->metadata) {
            $payment->metadata = json_decode($payment->metadata, true);
        }

        return response()->json($payment);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $payment = DB::table('payments')->where('id', $id)->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        DB::table('payments')->where('id', $id)->delete();

        return response()->json(['message' => 'Payment deleted successfully']);
    }
}
