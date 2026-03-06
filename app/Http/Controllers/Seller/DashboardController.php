<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Transaction;
use App\Models\Product;
use App\Models\TransactionDetail; // PENTING: Tambahkan ini
use Carbon\Carbon; // PENTING: Tambahkan ini untuk kelola tanggal

class DashboardController extends Controller
{
    public function index()
    {
        // KARENA INI APLIKASI 1 UMKM:
        // Kita hitung semua data secara global, gak peduli user ini punya "store" atau nggak.
        
        // 1. STATISTIK KARTU ATAS
        $stats = [
            'total_revenue' => Transaction::where('payment_status', 'paid')->sum('total_price'),
            'total_orders' => Transaction::count(),
            'pending_orders' => Transaction::where('order_status', 'pending')->count(),
            'total_products' => Product::count(), 
        ];

        // 2. PESANAN TERBARU
        $recent_orders = Transaction::with('user')
            ->latest()
            ->limit(5)
            ->get();

        // ==========================================
        // 3. GRAFIK PENJUALAN 7 HARI TERAKHIR
        // ==========================================
        $chartDataArray = collect();
        
        // Siapkan array 7 hari ke belakang dengan nilai 0
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $chartDataArray->put($date->format('Y-m-d'), [
                'name' => $date->translatedFormat('l'), // Nama hari (Senin, Selasa)
                'total' => 0
            ]);
        }

        // Ambil total penjualan per hari (Hanya yang sudah dibayar / 'paid')
        $sales = Transaction::where('payment_status', 'paid')
            ->where('created_at', '>=', Carbon::now()->subDays(6)->startOfDay())
            ->selectRaw('DATE(created_at) as date, SUM(total_price) as total')
            ->groupBy('date')
            ->get();

        // Gabungkan data penjualan ke array template hari
        foreach ($sales as $sale) {
            if ($chartDataArray->has($sale->date)) {
                $item = $chartDataArray->get($sale->date);
                $item['total'] = (int) $sale->total;
                $chartDataArray->put($sale->date, $item);
            }
        }
        
        $chartData = $chartDataArray->values()->toArray(); // Format akhir untuk React


        // ==========================================
        // 4. PRODUK TERLARIS BULAN INI
        // ==========================================
       $topProducts = TransactionDetail::selectRaw('product_id, SUM(qty) as sold')
            ->whereHas('transaction', function ($q) {
                // Hanya hitung produk dari transaksi yang sudah DIBAYAR bulan ini
                $q->where('payment_status', 'paid')
                  ->whereMonth('created_at', Carbon::now()->month)
                  ->whereYear('created_at', Carbon::now()->year);
            })
            ->with(['product:id,name,price']) // Ambil detail nama & harga produknya
            ->groupBy('product_id')
            ->orderByDesc('sold')
            ->limit(4) // Ambil 4 produk teratas
            ->get()
            ->map(function ($detail) {
                return [
                    'id' => $detail->product_id,
                    'name' => $detail->product ? $detail->product->name : 'Produk Dihapus',
                    'price' => $detail->product ? $detail->product->price : 0,
                    'sold' => (int) $detail->sold
                ];
            });

        // 5. RENDER KE REACT
        return Inertia::render('Seller/Dashboard', [
            'stats' => $stats,
            'recent_orders' => $recent_orders,
            'chart_data' => $chartData,     // Lempar data asli grafik
            'top_products' => $topProducts  // Lempar data asli top produk
        ]);
    }
}