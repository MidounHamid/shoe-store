<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DB::table('categories');

        // Filter by parent_id
        if ($request->has('parent_id')) {
            $query->where('parent_id', $request->parent_id);
        } else if ($request->has('root_only') && $request->root_only) {
            $query->whereNull('parent_id');
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $categories = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($categories);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request)
    {

        $data = [
            'name' => $request->name,
            'slug' => $request->slug ?? Str::slug($request->name),
            'parent_id' => $request->parent_id,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        $id = DB::table('categories')->insertGetId($data);
        $category = DB::table('categories')->where('id', $id)->first();

        return response()->json($category, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $category = DB::table('categories')->where('id', $id)->first();

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        return response()->json($category);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, $id)
    {
        $category = DB::table('categories')->where('id', $id)->first();

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
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

        if ($request->has('parent_id')) {
            $data['parent_id'] = $request->parent_id;
        }

        DB::table('categories')->where('id', $id)->update($data);
        $category = DB::table('categories')->where('id', $id)->first();

        return response()->json($category);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $category = DB::table('categories')->where('id', $id)->first();

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        // Check if category has children
        $hasChildren = DB::table('categories')->where('parent_id', $id)->exists();
        if ($hasChildren) {
            return response()->json(['message' => 'Cannot delete category with child categories'], 422);
        }

        DB::table('categories')->where('id', $id)->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }
}
