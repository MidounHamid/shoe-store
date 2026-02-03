<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ShopProductController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->get('per_page', 12);
        $sortBy = $request->get('sort', 'featured');

        $minPrice = $request->get('min_price');
        $maxPrice = $request->get('max_price');
        $brand = $request->get('brand');
        $category = $request->get('category');
        $q = $request->get('q');
        $color = $request->get('color');
        $size = $request->get('size');

        // 1. Aggregates for Variants (Price)
        $variantsAgg = DB::table('product_variants')
            ->select(
                'product_id',
                DB::raw('MIN(price) as min_price'),
                DB::raw('MIN(original_price) as min_original_price')
            )
            ->groupBy('product_id');

        // 2. Aggregates for Reviews
        $reviewsAgg = DB::table('product_reviews')
            ->select(
                'product_id',
                DB::raw('AVG(rating) as avg_rating'),
                DB::raw('COUNT(*) as reviews_count')
            )
            ->groupBy('product_id');

        // 3. Main Query
        $query = DB::table('products')
            ->join('brands', 'products.brand_id', '=', 'brands.id')
            // Join the images table
            ->leftJoin('product_images', function ($join) {
                $join->on('products.id', '=', 'product_images.product_id')
                    ->whereNull('product_images.variant_id');
            })
            ->leftJoinSub($variantsAgg, 'pv', 'pv.product_id', '=', 'products.id')
            ->leftJoinSub($reviewsAgg, 'pr', 'pr.product_id', '=', 'products.id')
            ->leftJoin('product_categories', 'products.id', '=', 'product_categories.product_id')
            ->leftJoin('categories', 'product_categories.category_id', '=', 'categories.id')
            ->where('products.is_active', '=', 1);

        // --- Filters ---
        if ($q) {
            $query->where(function ($sub) use ($q) {
                $sub->where('products.name', 'like', '%'.$q.'%')
                    ->orWhere('brands.name', 'like', '%'.$q.'%');
            });
        }
        if ($brand) $query->where('brands.slug', $brand);
        if ($category) $query->where('categories.slug', $category);
        if ($minPrice) $query->where('pv.min_price', '>=', (float) $minPrice);
        if ($maxPrice) $query->where('pv.min_price', '<=', (float) $maxPrice);


        // Filter by color - check if product has variants with this color
        if ($color) {
            $query->whereExists(function ($subquery) use ($color) {
                $subquery->select(DB::raw(1))
                    ->from('product_variants')
                    ->whereColumn('product_variants.product_id', 'products.id')
                    ->where('product_variants.color', $color);
            });
        }

        // Filter by size - check if product has variants with this size
        if ($size) {
            $query->whereExists(function ($subquery) use ($size) {
                $subquery->select(DB::raw(1))
                    ->from('product_variants')
                    ->whereColumn('product_variants.product_id', 'products.id')
                    ->join('sizes', 'product_variants.size_id', '=', 'sizes.id')
                    ->where('sizes.name', $size);
            });
        }


        // --- Selection & Grouping (The Fix for NULL Images) ---
        $query->select(
            'products.id',
            'products.name',
            'products.slug',
            'products.short_description',
            'products.created_at',
            'brands.name as brand_name',
            DB::raw('MAX(categories.name) as category_name'),
            // We use MAX here so SQL picks the image string during grouping
            DB::raw('MAX(product_images.main_image) as main_image'),
            DB::raw('MAX(product_images.second_images) as second_images'),
            'pv.min_price',
            'pv.min_original_price',
            'pr.avg_rating',
            'pr.reviews_count'
        )
        ->groupBy(
            'products.id',
            'products.name',
            'products.slug',
            'products.short_description',
            'products.created_at',
            'brands.name',
            'pv.min_price',
            'pv.min_original_price',
            'pr.avg_rating',
            'pr.reviews_count'
        );

        // --- Sorting ---
        switch ($sortBy) {
            case 'price-low': $query->orderBy('pv.min_price', 'asc'); break;
            case 'price-high': $query->orderBy('pv.min_price', 'desc'); break;
            case 'rating': $query->orderBy('pr.avg_rating', 'desc'); break;
            case 'name': $query->orderBy('products.name', 'asc'); break;
            default: $query->orderBy('products.created_at', 'desc'); break;
        }

        $paginator = $query->paginate($perPage);

        // 4. Fetch Variants for the paginated set
        $productIds = $paginator->getCollection()->pluck('id')->toArray();
        $variants = [];

        if (!empty($productIds)) {
            $variantsRows = DB::table('product_variants')
                ->leftJoin('sizes', 'product_variants.size_id', '=', 'sizes.id')
                ->whereIn('product_variants.product_id', $productIds)
                ->select('product_id', 'sizes.name as size_name', 'color')
                ->get();

            foreach ($variantsRows as $row) {
                $pid = $row->product_id;
                if (!isset($variants[$pid])) $variants[$pid] = ['sizes' => [], 'colors' => []];
                if ($row->size_name && !in_array($row->size_name, $variants[$pid]['sizes'])) $variants[$pid]['sizes'][] = $row->size_name;
                if ($row->color && !in_array($row->color, $variants[$pid]['colors'])) $variants[$pid]['colors'][] = $row->color;
            }
        }

        // 5. Map results to JSON format
        $paginator->setCollection(
            $paginator->getCollection()->map(function ($p) use ($variants) {

                // Formatter for URLs
                $formatUrl = function($path) {
                    if (!$path) return null;
                    if (str_starts_with($path, 'http')) return $path;
                    $cleanPath = ltrim(str_replace('public/', '', $path), '/');
                    return asset('storage/' . $cleanPath);
                };

                $secondary = [];
                if ($p->second_images) {
                    $decoded = json_decode($p->second_images, true);
                    if (is_array($decoded)) {
                        $secondary = array_map(fn($path) => $formatUrl($path), $decoded);
                    }
                }

                return [
                    'id' => (int) $p->id,
                    'name' => $p->name,
                    'brand' => $p->brand_name,
                    'price' => (float) ($p->min_price ?? 0),
                    'originalPrice' => $p->min_original_price ? (float) $p->min_original_price : null,
                    'image' => $formatUrl($p->main_image),
                    'images' => $secondary,
                    'rating' => round((float) ($p->avg_rating ?? 0), 1),
                    'reviews' => (int) ($p->reviews_count ?? 0),
                    'isNew' => Carbon::parse($p->created_at)->greaterThan(Carbon::now()->subDays(30)),
                    'category' => $p->category_name,
                    'sizes' => $variants[$p->id]['sizes'] ?? [],
                    'colors' => $variants[$p->id]['colors'] ?? [],
                    'description' => $p->short_description ?? '',
                    'features' => [],
                ];
            })
        );

        return response()->json($paginator);
    }

    public function show($id)
    {
        // 1. Get the product with brand
        $product = DB::table('products')
            ->join('brands', 'products.brand_id', '=', 'brands.id')
            ->leftJoin('product_categories', 'products.id', '=', 'product_categories.product_id')
            ->leftJoin('categories', 'product_categories.category_id', '=', 'categories.id')
            ->where('products.id', $id)
            ->where('products.is_active', '=', 1)
            ->select(
                'products.id',
                'products.name',
                'products.slug',
                'products.short_description',
                'products.description',
                'products.created_at',
                'brands.name as brand_name',
                DB::raw('MAX(categories.name) as category_name')
            )
            ->groupBy(
                'products.id',
                'products.name',
                'products.slug',
                'products.short_description',
                'products.description',
                'products.created_at',
                'brands.name'
            )
            ->first();

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        // 2. Get product images
        $images = DB::table('product_images')
            ->where('product_id', $id)
            ->whereNull('variant_id')
            ->select('main_image', 'second_images')
            ->first();

        // 3. Get variants with sizes
        $variants = DB::table('product_variants')
            ->leftJoin('sizes', 'product_variants.size_id', '=', 'sizes.id')
            ->where('product_variants.product_id', $id)
            ->select('product_variants.id', 'product_variants.price', 'product_variants.original_price', 'sizes.name as size_name', 'product_variants.color')
            ->get();

        // 4. Get reviews
        $reviewsData = DB::table('product_reviews')
            ->where('product_id', $id)
            ->select(
                DB::raw('AVG(rating) as avg_rating'),
                DB::raw('COUNT(*) as reviews_count')
            )
            ->first();

        // 5. Get product features
        $features = DB::table('product_features')
            ->where('product_id', $id)
            ->pluck('feature_text')
            ->toArray();

        // Formatter for URLs
        $formatUrl = function($path) {
            if (!$path) return null;
            if (str_starts_with($path, 'http')) return $path;
            $cleanPath = ltrim(str_replace('public/', '', $path), '/');
            return asset('storage/' . $cleanPath);
        };

        // Parse images
        $mainImage = $images ? $formatUrl($images->main_image) : null;
        $secondaryImages = [];
        if ($images && $images->second_images) {
            $decoded = json_decode($images->second_images, true);
            if (is_array($decoded)) {
                $secondaryImages = array_map(fn($path) => $formatUrl($path), $decoded);
            }
        }

        // Extract unique sizes and colors
        $sizes = [];
        $colors = [];
        $minPrice = null;
        $minOriginalPrice = null;

        foreach ($variants as $variant) {
            if ($variant->size_name && !in_array($variant->size_name, $sizes)) {
                $sizes[] = $variant->size_name;
            }
            if ($variant->color && !in_array($variant->color, $colors)) {
                $colors[] = $variant->color;
            }
            if ($minPrice === null || $variant->price < $minPrice) {
                $minPrice = $variant->price;
            }
            if ($variant->original_price && ($minOriginalPrice === null || $variant->original_price < $minOriginalPrice)) {
                $minOriginalPrice = $variant->original_price;
            }
        }

        return response()->json([
            'id' => (int) $product->id,
            'name' => $product->name,
            'brand' => $product->brand_name,
            'price' => (float) ($minPrice ?? 0),
            'originalPrice' => $minOriginalPrice ? (float) $minOriginalPrice : null,
            'image' => $mainImage,
            'images' => $secondaryImages,
            'rating' => round((float) ($reviewsData->avg_rating ?? 0), 1),
            'reviews' => (int) ($reviewsData->reviews_count ?? 0),
            'isNew' => Carbon::parse($product->created_at)->greaterThan(Carbon::now()->subDays(30)),
            'category' => $product->category_name,
            'sizes' => $sizes,
            'colors' => $colors,
            'description' => $product->description ?? $product->short_description ?? '',
            'features' => $features,
        ]);
    }
}
