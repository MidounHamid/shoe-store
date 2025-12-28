<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('product_variants', 'order_items.variant_id', '=', 'product_variants.id')
            ->select('order_items.*', 'orders.order_number', 'product_variants.sku');

        // Filter by order
        if ($request->has('order_id')) {
            $query->where('order_items.order_id', $request->order_id);
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $items = $query->orderBy('order_items.id', 'desc')->paginate($perPage);

        // Decode JSON fields
        foreach ($items->items() as $item) {
            if ($item->product_snapshot) {
                $item->product_snapshot = json_decode($item->product_snapshot, true);
            }
        }

        return response()->json($items);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'variant_id' => 'required|exists:product_variants,id',
            'product_snapshot' => 'required|array',
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
            'line_total' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = [
            'order_id' => $request->order_id,
            'variant_id' => $request->variant_id,
            'product_snapshot' => json_encode($request->product_snapshot),
            'quantity' => $request->quantity,
            'unit_price' => $request->unit_price,
            'line_total' => $request->line_total,
        ];

        $id = DB::table('order_items')->insertGetId($data);
        $item = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('product_variants', 'order_items.variant_id', '=', 'product_variants.id')
            ->select('order_items.*', 'orders.order_number', 'product_variants.sku')
            ->where('order_items.id', $id)
            ->first();

        if ($item->product_snapshot) {
            $item->product_snapshot = json_decode($item->product_snapshot, true);
        }

        return response()->json($item, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $item = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('product_variants', 'order_items.variant_id', '=', 'product_variants.id')
            ->select('order_items.*', 'orders.order_number', 'product_variants.sku')
            ->where('order_items.id', $id)
            ->first();

        if (!$item) {
            return response()->json(['message' => 'Order item not found'], 404);
        }

        if ($item->product_snapshot) {
            $item->product_snapshot = json_decode($item->product_snapshot, true);
        }

        return response()->json($item);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $item = DB::table('order_items')->where('id', $id)->first();

        if (!$item) {
            return response()->json(['message' => 'Order item not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'quantity' => 'sometimes|required|integer|min:1',
            'unit_price' => 'sometimes|required|numeric|min:0',
            'line_total' => 'sometimes|required|numeric|min:0',
            'product_snapshot' => 'sometimes|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = [];

        if ($request->has('quantity')) $data['quantity'] = $request->quantity;
        if ($request->has('unit_price')) $data['unit_price'] = $request->unit_price;
        if ($request->has('line_total')) $data['line_total'] = $request->line_total;
        if ($request->has('product_snapshot')) $data['product_snapshot'] = json_encode($request->product_snapshot);

        DB::table('order_items')->where('id', $id)->update($data);
        $item = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('product_variants', 'order_items.variant_id', '=', 'product_variants.id')
            ->select('order_items.*', 'orders.order_number', 'product_variants.sku')
            ->where('order_items.id', $id)
            ->first();

        if ($item->product_snapshot) {
            $item->product_snapshot = json_decode($item->product_snapshot, true);
        }

        return response()->json($item);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $item = DB::table('order_items')->where('id', $id)->first();

        if (!$item) {
            return response()->json(['message' => 'Order item not found'], 404);
        }

        DB::table('order_items')->where('id', $id)->delete();

        return response()->json(['message' => 'Order item deleted successfully']);
    }
}
