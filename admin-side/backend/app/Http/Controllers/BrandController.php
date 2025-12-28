<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Http\Requests\StoreBrandRequest;
use App\Http\Requests\UpdateBrandRequest;

class BrandController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DB::table('brands');

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $brands = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($brands);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBrandRequest $request)
    {

        $data = [
            'name' => $request->name,
            'slug' => $request->slug ?? Str::slug($request->name),
            'created_at' => now(),
            'updated_at' => now(),
        ];

        $id = DB::table('brands')->insertGetId($data);
        $brand = DB::table('brands')->where('id', $id)->first();

        return response()->json($brand, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $brand = DB::table('brands')->where('id', $id)->first();

        if (!$brand) {
            return response()->json(['message' => 'Brand not found'], 404);
        }

        return response()->json($brand);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBrandRequest $request, $id)
    {
        $brand = DB::table('brands')->where('id', $id)->first();

        if (!$brand) {
            return response()->json(['message' => 'Brand not found'], 404);
        }

        $data = [
            'updated_at' => now(),
        ];

        if ($request->has('name')) {
            $data['name'] = $request->name;
            if (!$request->has('slug')) {
                $data['slug'] = Str::slug($request->name);
            }
        }

        if ($request->has('slug')) {
            $data['slug'] = $request->slug;
        }

        DB::table('brands')->where('id', $id)->update($data);
        $brand = DB::table('brands')->where('id', $id)->first();

        return response()->json($brand);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $brand = DB::table('brands')->where('id', $id)->first();

        if (!$brand) {
            return response()->json(['message' => 'Brand not found'], 404);
        }

        DB::table('brands')->where('id', $id)->delete();

        return response()->json(['message' => 'Brand deleted successfully']);
    }
}
