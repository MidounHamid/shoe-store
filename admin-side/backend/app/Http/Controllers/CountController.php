<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CountController extends Controller
{
    public function getCounts(Request $request)
    {
        $counts = [
            'users' => DB::table('users')->count(),
            'products' => DB::table('products')->count(),
            'orders' => DB::table('orders')->where('status', '!=', 'cancelled')->count(),
            'pending_orders' => DB::table('orders')->where('status', 'pending')->count(),
            'carts' => DB::table('carts')->count(),
            'favorites' => DB::table('favorites')->count(),
            'reviews' => DB::table('product_reviews')->count(),
            'pending_payments' => DB::table('payments')->where('status', 'pending')->count(),
        ];

        return response()->json($counts);
    }
}

