<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $storeId = auth()->user()->store->id ?? null;

        $query = \App\Models\Transaction::with(['user', 'details'])
                    ->when($storeId, function ($q) use ($storeId) {
                        return $q->where('store_id', $storeId);
                    });

        // --- 1. FILTER STATUS ---
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('order_status', $request->status);
        }

        // --- 2. FILTER METODE PEMBAYARAN (BARU) ---
        if ($request->filled('payment_method') && $request->payment_method !== 'all') {
            $query->where('payment_method', $request->payment_method);
        }

        // --- 3. FILTER TANGGAL (CALENDAR PICKER BARU) ---
        if ($request->filled('start_date')) {
            // Filter pesanan dari tanggal sekian
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            // Sampai tanggal sekian
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // --- 4. FILTER PENCARIAN (INVOICE / NAMA PEMBELI) ---
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_code', 'LIKE', "%{$search}%")
                  ->orWhereHas('user', function ($u) use ($search) {
                      $u->where('name', 'LIKE', "%{$search}%");
                  })
                  ->orWhere('shipping_address_snapshot', 'LIKE', "%{$search}%");
            });
        }

        $transactions = $query->latest()->paginate(10)->withQueryString();

        return \Inertia\Inertia::render('Seller/Transaction/Index', [
            'transactions' => $transactions,
            // Lempar semua state filter ke React
            'filters' => $request->only(['search', 'status', 'start_date', 'end_date', 'payment_method'])
        ]);
    }
}