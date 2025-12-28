<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreOrderEventRequest;
use App\Http\Requests\UpdateOrderEventRequest;

class OrderEventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DB::table('order_events')
            ->join('orders', 'order_events.order_id', '=', 'orders.id')
            ->select('order_events.*', 'orders.order_number');

        // Filter by order
        if ($request->has('order_id')) {
            $query->where('order_events.order_id', $request->order_id);
        }

        // Filter by event type
        if ($request->has('event_type')) {
            $query->where('order_events.event_type', $request->event_type);
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $events = $query->orderBy('order_events.created_at', 'desc')->paginate($perPage);

        // Decode JSON fields
        foreach ($events->items() as $event) {
            if ($event->data) {
                $event->data = json_decode($event->data, true);
            }
        }

        return response()->json($events);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOrderEventRequest $request)
    {

        $data = [
            'order_id' => $request->order_id,
            'event_type' => $request->event_type,
            'data' => $request->data ? json_encode($request->data) : null,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        $id = DB::table('order_events')->insertGetId($data);
        $event = DB::table('order_events')
            ->join('orders', 'order_events.order_id', '=', 'orders.id')
            ->select('order_events.*', 'orders.order_number')
            ->where('order_events.id', $id)
            ->first();

        if ($event->data) {
            $event->data = json_decode($event->data, true);
        }

        return response()->json($event, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $event = DB::table('order_events')
            ->join('orders', 'order_events.order_id', '=', 'orders.id')
            ->select('order_events.*', 'orders.order_number')
            ->where('order_events.id', $id)
            ->first();

        if (!$event) {
            return response()->json(['message' => 'Order event not found'], 404);
        }

        if ($event->data) {
            $event->data = json_decode($event->data, true);
        }

        return response()->json($event);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOrderEventRequest $request, $id)
    {
        $event = DB::table('order_events')->where('id', $id)->first();

        if (!$event) {
            return response()->json(['message' => 'Order event not found'], 404);
        }

        $data = [
            'updated_at' => now(),
        ];

        if ($request->has('event_type')) $data['event_type'] = $request->event_type;
        if ($request->has('data')) $data['data'] = json_encode($request->data);

        DB::table('order_events')->where('id', $id)->update($data);
        $event = DB::table('order_events')
            ->join('orders', 'order_events.order_id', '=', 'orders.id')
            ->select('order_events.*', 'orders.order_number')
            ->where('order_events.id', $id)
            ->first();

        if ($event->data) {
            $event->data = json_decode($event->data, true);
        }

        return response()->json($event);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $event = DB::table('order_events')->where('id', $id)->first();

        if (!$event) {
            return response()->json(['message' => 'Order event not found'], 404);
        }

        DB::table('order_events')->where('id', $id)->delete();

        return response()->json(['message' => 'Order event deleted successfully']);
    }
}
