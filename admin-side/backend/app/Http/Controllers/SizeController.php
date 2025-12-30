<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SizeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DB::table('sizes');

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        // Order by display_order
        $sizes = $query->orderBy('display_order', 'asc')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json($sizes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:50|unique:sizes,name',
            'code' => 'nullable|string|max:20|unique:sizes,code',
            'display_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $data = [
            'name' => $request->name,
            'code' => $request->code,
            'display_order' => $request->get('display_order', 0),
            'is_active' => $request->get('is_active', true),
            'created_at' => now(),
            'updated_at' => now(),
        ];

        $id = DB::table('sizes')->insertGetId($data);
        $size = DB::table('sizes')->where('id', $id)->first();

        return response()->json($size, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $size = DB::table('sizes')->where('id', $id)->first();

        if (!$size) {
            return response()->json(['message' => 'Size not found'], 404);
        }

        return response()->json($size);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $size = DB::table('sizes')->where('id', $id)->first();

        if (!$size) {
            return response()->json(['message' => 'Size not found'], 404);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:50|unique:sizes,name,' . $id,
            'code' => 'nullable|string|max:20|unique:sizes,code,' . $id,
            'display_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $data = ['updated_at' => now()];

        if ($request->has('name')) $data['name'] = $request->name;
        if ($request->has('code')) $data['code'] = $request->code;
        if ($request->has('display_order')) $data['display_order'] = $request->display_order;
        if ($request->has('is_active')) $data['is_active'] = $request->is_active;

        DB::table('sizes')->where('id', $id)->update($data);
        $size = DB::table('sizes')->where('id', $id)->first();

        return response()->json($size);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $size = DB::table('sizes')->where('id', $id)->first();

        if (!$size) {
            return response()->json(['message' => 'Size not found'], 404);
        }

        DB::table('sizes')->where('id', $id)->delete();

        return response()->json(['message' => 'Size deleted successfully']);
    }
}

