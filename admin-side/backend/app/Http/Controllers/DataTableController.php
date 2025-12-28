<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\DataTables\UserDataTable;
use App\Http\DataTables\BrandDataTable;
use App\Http\DataTables\CategoryDataTable;
use App\Http\DataTables\AddressDataTable;
use App\Http\DataTables\ProductDataTable;
use App\Http\DataTables\ProductVariantDataTable;
use App\Http\DataTables\ProductImageDataTable;
use App\Http\DataTables\ProductFeatureDataTable;
use App\Http\DataTables\TagDataTable;
use App\Http\DataTables\CartDataTable;
use App\Http\DataTables\CartItemDataTable;
use App\Http\DataTables\FavoriteDataTable;
use App\Http\DataTables\OrderDataTable;
use App\Http\DataTables\OrderItemDataTable;
use App\Http\DataTables\PaymentDataTable;
use App\Http\DataTables\OrderEventDataTable;
use App\Http\DataTables\ProductReviewDataTable;
use App\Http\DataTables\ReviewVoteDataTable;

class DataTableController extends Controller
{
    protected $dataTables = [
        'users' => UserDataTable::class,
        'brands' => BrandDataTable::class,
        'categories' => CategoryDataTable::class,
        'addresses' => AddressDataTable::class,
        'products' => ProductDataTable::class,
        'product-variants' => ProductVariantDataTable::class,
        'product-images' => ProductImageDataTable::class,
        'product-features' => ProductFeatureDataTable::class,
        'tags' => TagDataTable::class,
        'carts' => CartDataTable::class,
        'cart-items' => CartItemDataTable::class,
        'favorites' => FavoriteDataTable::class,
        'orders' => OrderDataTable::class,
        'order-items' => OrderItemDataTable::class,
        'payments' => PaymentDataTable::class,
        'order-events' => OrderEventDataTable::class,
        'product-reviews' => ProductReviewDataTable::class,
        'review-votes' => ReviewVoteDataTable::class,
    ];

    public function index(Request $request, $table)
    {
        if (!isset($this->dataTables[$table])) {
            return response()->json(['error' => 'Table not found'], 404);
        }

        $dataTableClass = $this->dataTables[$table];
        $dataTable = new $dataTableClass();

        return response()->json($dataTable->getData($request));
    }
}

