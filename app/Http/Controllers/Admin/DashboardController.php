<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Hitung Total Omzet (GMV) - Hanya yang statusnya PAID
        $totalRevenue = Transaction::where('payment_status', 'paid')->sum('total_price');

        // 2. Hitung Total Toko
        $totalStores = Store::count();

        // 3. Hitung Toko Pending (Call to Action buat Admin)
        $pendingStores = Store::where('status', 'pending')->count();

        // 4. Hitung Total User
        $totalUsers = User::count();

        // 5. Ambil 5 Transaksi Terbaru
        $latestTransactions = Transaction::with(['user', 'store'])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_revenue' => $totalRevenue,
                'total_stores' => $totalStores,
                'pending_stores' => $pendingStores,
                'total_users' => $totalUsers,
            ],
            'latestTransactions' => $latestTransactions
        ]);
    }
}