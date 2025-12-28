<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreProductFeatureRequest;
use App\Http\Requests\UpdateProductFeatureRequest;

class ProductFeatureController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DB::table('product_features')
            ->join('products', 'product_features.product_id', '=', 'products.id')
            ->select('product_features.*', 'products.name as product_name');

        // Filter by product
        if ($request->has('product_id')) {
            $query->where('product_features.product_id', $request->product_id);
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $features = $query->orderBy('product_features.display_order', 'asc')
            ->orderBy('product_features.id', 'asc')
            ->paginate($perPage);

        return response()->json($features);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductFeatureRequest $request)
    {

        $data = [
            'product_id' => $request->product_id,
            'feature_text' => $request->feature_text,
            'display_order' => $request->get('display_order', 0),
        ];

        $id = DB::table('product_features')->insertGetId($data);
        $feature = DB::table('product_features')
            ->join('products', 'product_features.product_id', '=', 'products.id')
            ->select('product_features.*', 'products.name as product_name')
            ->where('product_features.id', $id)
            ->first();

        return response()->json($feature, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $feature = DB::table('product_features')
            ->join('products', 'product_features.product_id', '=', 'products.id')
            ->select('product_features.*', 'products.name as product_name')
            ->where('product_features.id', $id)
            ->first();

        if (!$feature) {
            return response()->json(['message' => 'Product feature not found'], 404);
        }

        return response()->json($feature);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductFeatureRequest $request, $id)
    {
        $feature = DB::table('product_features')->where('id', $id)->first();

        if (!$feature) {
            return response()->json(['message' => 'Product feature not found'], 404);
        }

        $data = [];

        if ($request->has('product_id')) $data['product_id'] = $request->product_id;
        if ($request->has('feature_text')) $data['feature_text'] = $request->feature_text;
        if ($request->has('display_order')) $data['display_order'] = $request->display_order;

        DB::table('product_features')->where('id', $id)->update($data);
        $feature = DB::table('product_features')
            ->join('products', 'product_features.product_id', '=', 'products.id')
            ->select('product_features.*', 'products.name as product_name')
            ->where('product_features.id', $id)
            ->first();

        return response()->json($feature);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $feature = DB::table('product_features')->where('id', $id)->first();

        if (!$feature) {
            return response()->json(['message' => 'Product feature not found'], 404);
        }

        DB::table('product_features')->where('id', $id)->delete();

        return response()->json(['message' => 'Product feature deleted successfully']);
    }
}
