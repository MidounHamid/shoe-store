<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductImageRequest;
use App\Http\Requests\UpdateProductImageRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductImageController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('product_images')
            ->join('products', 'product_images.product_id', '=', 'products.id')
            ->select('product_images.*', 'products.name as product_name');

        if ($request->has('product_id')) {
            $query->where('product_images.product_id', $request->product_id);
        }

        if ($request->has('variant_id')) {
            $query->where('product_images.variant_id', $request->variant_id);
        }

        $perPage = $request->get('per_page', 15);
        $images = $query->orderBy('product_images.display_order', 'asc')
            ->orderBy('product_images.id', 'asc')
            ->paginate($perPage);

        $images->getCollection()->transform(function ($image) {
            $this->formatImageUrls($image);
            return $image;
        });

        return response()->json($images);
    }

    public function store(StoreProductImageRequest $request)
    {
        // Validation is handled automatically before this point
        $data = [
            'product_id' => $request->product_id,
            'variant_id' => $request->variant_id,
            'display_order' => $request->get('display_order', 0),
            'created_at' => now(),
            'updated_at' => now(),
            'second_images' => null,
        ];

        if ($request->hasFile('main_image')) {
            $file = $request->file('main_image');
            $fileName = 'product_' . $request->product_id . '_main_' . time() . '.' . $file->getClientOriginalExtension();
            $data['main_image'] = $file->storeAs('product_images', $fileName, 'public');
        }

        if ($request->hasFile('second_images')) {
            $secondaryPaths = [];
            foreach ($request->file('second_images') as $index => $file) {
                $fileName = 'product_' . $request->product_id . '_sec_' . time() . '_' . $index . '.' . $file->getClientOriginalExtension();
                $secondaryPaths[] = $file->storeAs('product_images', $fileName, 'public');
            }
            $data['second_images'] = json_encode($secondaryPaths);
        }

        if (!isset($data['main_image']) && empty($data['second_images'])) {
            return response()->json(['message' => 'At least one image is required'], 422);
        }

        $id = DB::table('product_images')->insertGetId($data);

        $image = DB::table('product_images')
            ->join('products', 'product_images.product_id', '=', 'products.id')
            ->select('product_images.*', 'products.name as product_name')
            ->where('product_images.id', $id)
            ->first();

        $this->formatImageUrls($image);

        return response()->json($image, 201);
    }

    public function show($id)
    {
        $image = DB::table('product_images')
            ->join('products', 'product_images.product_id', '=', 'products.id')
            ->select('product_images.*', 'products.name as product_name')
            ->where('product_images.id', $id)
            ->first();

        if (!$image) {
            return response()->json(['message' => 'Product image not found'], 404);
        }

        $this->formatImageUrls($image);

        return response()->json($image);
    }

    public function update(UpdateProductImageRequest $request, $id)
    {
        $image = DB::table('product_images')->where('id', $id)->first();
        if (!$image) {
            return response()->json(['message' => 'Product image not found'], 404);
        }

        $data = ['updated_at' => now()];

        if ($request->has('product_id')) $data['product_id'] = $request->product_id;
        if ($request->has('variant_id')) $data['variant_id'] = $request->variant_id;
        if ($request->has('display_order')) $data['display_order'] = $request->display_order;

        if ($request->has('delete_main_image') && $request->delete_main_image == '1') {
            if ($image->main_image && Storage::disk('public')->exists($image->main_image)) {
                Storage::disk('public')->delete($image->main_image);
            }
            $data['main_image'] = null;
        }

        if ($request->hasFile('main_image')) {
            if ($image->main_image && Storage::disk('public')->exists($image->main_image)) {
                Storage::disk('public')->delete($image->main_image);
            }
            $file = $request->file('main_image');
            $fileName = 'product_' . ($image->product_id) . '_main_' . time() . '.' . $file->getClientOriginalExtension();
            $data['main_image'] = $file->storeAs('product_images', $fileName, 'public');
        }

        $existingPaths = $image->second_images ? json_decode($image->second_images, true) : [];
        if (!is_array($existingPaths)) $existingPaths = [];

        $keepUrls = $request->has('keep_second_images')
            ? json_decode($request->keep_second_images, true)
            : [];

        $keepPaths = [];
        if (is_array($keepUrls)) {
            foreach ($keepUrls as $url) {
                if (strpos($url, '/storage/') !== false) {
                    $path = substr($url, strpos($url, '/storage/') + 9);
                    $keepPaths[] = $path;
                }
            }
        }

        foreach ($existingPaths as $path) {
            if (!in_array($path, $keepPaths)) {
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }
        }

        $finalPaths = $keepPaths;

        if ($request->hasFile('second_images')) {
            foreach ($request->file('second_images') as $index => $file) {
                $fileName = 'product_' . ($image->product_id) . '_sec_' . time() . '_' . $index . '.' . $file->getClientOriginalExtension();
                $finalPaths[] = $file->storeAs('product_images', $fileName, 'public');
            }
        }

        $data['second_images'] = empty($finalPaths) ? null : json_encode($finalPaths);

        DB::table('product_images')->where('id', $id)->update($data);

        $updatedImage = DB::table('product_images')->where('id', $id)->first();
        $this->formatImageUrls($updatedImage);

        return response()->json($updatedImage);
    }

    public function destroy($id)
    {
        $image = DB::table('product_images')->where('id', $id)->first();
        if (!$image) return response()->json(['message' => 'Not found'], 404);

        if ($image->main_image && Storage::disk('public')->exists($image->main_image)) {
            Storage::disk('public')->delete($image->main_image);
        }

        if ($image->second_images) {
            $paths = json_decode($image->second_images, true);
            if (is_array($paths)) {
                foreach ($paths as $path) {
                    if (Storage::disk('public')->exists($path)) {
                        Storage::disk('public')->delete($path);
                    }
                }
            }
        }

        DB::table('product_images')->where('id', $id)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    private function formatImageUrls($image)
    {
        $image->main_image = $image->main_image
            ? asset('storage/' . $image->main_image)
            : null;

        $secPaths = $image->second_images ? json_decode($image->second_images, true) : [];

        if (!is_array($secPaths)) {
            $secPaths = [];
        }

        $image->second_images = array_map(function($path) {
            return asset('storage/' . $path);
        }, $secPaths);
    }
}
