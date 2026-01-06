<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Transaction;
use App\Models\Product;

class DashboardController extends Controller
{
    public function index()
{
    $user = Auth::user();
    $store = $user->store;

    if (!$store) {
        return redirect()->route('index');
    }

    $stats = [
        'total_revenue' => Transaction::where('store_id', $store->id)
            ->where('payment_status', 'paid')
            ->sum('total_price'),
            
        'total_orders' => Transaction::where('store_id', $store->id)->count(),
        
        'pending_orders' => Transaction::where('store_id', $store->id)
            ->where('order_status', 'pending')
            ->count(),
        
        // ✅ SEKARANG SUDAH SESUAI DENGAN KOLOM DATABASE KAMU
        'total_products' => Product::where('user_id', $user->id)->count(), 
    ];

    $recent_orders = Transaction::with('user')
        ->where('store_id', $store->id)
        ->latest()
        ->limit(5)
        ->get();

    return Inertia::render('Seller/Dashboard', [
        'stats' => $stats,
        'recent_orders' => $recent_orders
    ]);
}
}