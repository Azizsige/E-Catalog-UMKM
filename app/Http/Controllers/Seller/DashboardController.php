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
        // KARENA INI APLIKASI 1 UMKM:
        // Kita hitung semua data secara global, gak peduli user ini punya "store" atau nggak.
        
        $stats = [
            'total_revenue' => Transaction::where('payment_status', 'paid')->sum('total_price'),
            
            'total_orders' => Transaction::count(),
            
            'pending_orders' => Transaction::where('order_status', 'pending')->count(),
            
            'total_products' => Product::count(), 
        ];

        $recent_orders = Transaction::with('user')
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('Seller/Dashboard', [
            'stats' => $stats,
            'recent_orders' => $recent_orders
        ]);
    }
}