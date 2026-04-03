<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Exports\TransactionsExport;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));

        // 1. BASE QUERY: Tarik SEMUA data (Sukses, Pending, Batal)
        $query = Transaction::whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->orderBy('created_at', 'desc');

        // 2. HITUNG KOTAK SUMMARY
        $allTransactions = (clone $query)->get();
        
        // Cuan & Pesanan Sukses dihitung HANYA dari yang paid (Lunas)
        $paidTransactions = $allTransactions->where('payment_status', 'paid');
        $totalRevenue = $paidTransactions->sum(function($tx) {
            return $tx->total_price + $tx->shipping_cost;
        });
        $totalOrders = $paidTransactions->count();

        // Pesanan Gagal
        $failedOrders = $allTransactions->where('order_status', 'cancelled')->count();

        // 3. DATA TABEL
        $transactions = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Report/Index', [
            'transactions' => $transactions,
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'failed_orders' => $failedOrders,
            ],
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }

    public function export(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));

        $fileName = "Laporan_Penjualan_{$startDate}_sd_{$endDate}.xlsx";

        return Excel::download(new TransactionsExport($startDate, $endDate), $fileName);
    }
}