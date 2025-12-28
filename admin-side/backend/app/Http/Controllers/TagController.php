<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Http\Requests\StoreTagRequest;
use App\Http\Requests\UpdateTagRequest;

class TagController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DB::table('tags');

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
        $tags = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($tags);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTagRequest $request)
    {

        $data = [
            'name' => $request->name,
            'slug' => $request->slug ?? Str::slug($request->name),
        ];

        $id = DB::table('tags')->insertGetId($data);
        $tag = DB::table('tags')->where('id', $id)->first();

        return response()->json($tag, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $tag = DB::table('tags')->where('id', $id)->first();

        if (!$tag) {
            return response()->json(['message' => 'Tag not found'], 404);
        }

        return response()->json($tag);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTagRequest $request, $id)
    {
        $tag = DB::table('tags')->where('id', $id)->first();

        if (!$tag) {
            return response()->json(['message' => 'Tag not found'], 404);
        }

        $data = [];

        if ($request->has('name')) {
            $data['name'] = $request->name;
            if (!$request->has('slug')) {
                $data['slug'] = Str::slug($request->name);
            }
        }

        if ($request->has('slug')) {
            $data['slug'] = $request->slug;
        }

        DB::table('tags')->where('id', $id)->update($data);
        $tag = DB::table('tags')->where('id', $id)->first();

        return response()->json($tag);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $tag = DB::table('tags')->where('id', $id)->first();

        if (!$tag) {
            return response()->json(['message' => 'Tag not found'], 404);
        }

        DB::table('tags')->where('id', $id)->delete();

        return response()->json(['message' => 'Tag deleted successfully']);
    }
}
