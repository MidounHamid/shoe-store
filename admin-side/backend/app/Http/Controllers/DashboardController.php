<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->get('start', Carbon::now()->startOfYear()->toDateString());
        $endDate = $request->get('end', Carbon::now()->endOfYear()->toDateString());

        // Total Revenue
        $totalRevenue = DB::table('orders')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'paid')
            ->sum('total_amount');

        // Previous period revenue for growth calculation
        $periodDays = Carbon::parse($endDate)->diffInDays(Carbon::parse($startDate));
        $previousStart = Carbon::parse($startDate)->subDays($periodDays + 1)->toDateString();
        $previousEnd = Carbon::parse($startDate)->subDay()->toDateString();
        
        $previousRevenue = DB::table('orders')
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->where('payment_status', 'paid')
            ->sum('total_amount');

        $revenueGrowth = $previousRevenue > 0 
            ? (($totalRevenue - $previousRevenue) / $previousRevenue) * 100 
            : 0;

        // Active Users (users who made orders in the period)
        $activeUsers = DB::table('orders')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereNotNull('user_id')
            ->distinct('user_id')
            ->count('user_id');

        $previousActiveUsers = DB::table('orders')
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->whereNotNull('user_id')
            ->distinct('user_id')
            ->count('user_id');

        $usersGrowth = $previousActiveUsers > 0 
            ? (($activeUsers - $previousActiveUsers) / $previousActiveUsers) * 100 
            : 0;

        // Total Orders
        $orders = DB::table('orders')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $previousOrders = DB::table('orders')
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->count();

        $ordersGrowth = $previousOrders > 0 
            ? (($orders - $previousOrders) / $previousOrders) * 100 
            : 0;

        // Conversion Rate (orders / total users)
        $totalUsers = DB::table('users')->count();
        $conversionRate = $totalUsers > 0 ? ($orders / $totalUsers) * 100 : 0;

        $previousConversionRate = $totalUsers > 0 ? ($previousOrders / $totalUsers) * 100 : 0;
        $conversionGrowth = $previousConversionRate > 0 
            ? (($conversionRate - $previousConversionRate) / $previousConversionRate) * 100 
            : 0;

        // Monthly Revenue Curve
        $monthlyRevenue = DB::table('orders')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'paid')
            ->select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('SUM(total_amount) as revenue')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => $item->month,
                    'revenue' => (float) $item->revenue,
                ];
            });

        // Recent Activities (recent orders)
        $recentActivities = DB::table('orders')
            ->leftJoin('users', 'orders.user_id', '=', 'users.id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->select(
                'orders.id',
                DB::raw("CONCAT('Order #', orders.order_number, ' - ', orders.status) as description"),
                'orders.order_number as log_name',
                'orders.created_at',
                DB::raw("COALESCE(CONCAT(users.first_name, ' ', users.last_name), 'Guest') as user_name")
            )
            ->orderBy('orders.created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'description' => $item->description,
                    'log_name' => $item->log_name,
                    'created_at' => $item->created_at,
                    'user_name' => $item->user_name,
                ];
            });

        return response()->json([
            'total_revenue' => (float) $totalRevenue,
            'revenue_growth' => round($revenueGrowth, 2),
            'active_users' => $activeUsers,
            'users_growth' => round($usersGrowth, 2),
            'orders' => $orders,
            'orders_growth' => round($ordersGrowth, 2),
            'conversion_rate' => round($conversionRate, 2),
            'conversion_growth' => round($conversionGrowth, 2),
            'monthly_revenue_curve' => $monthlyRevenue,
            'recent_activities' => $recentActivities,
        ]);
    }
}

