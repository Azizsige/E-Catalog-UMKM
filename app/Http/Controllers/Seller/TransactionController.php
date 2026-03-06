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

    public function show($id)
    {
        // 1. Ambil data toko milik admin yang lagi login
        $storeId = auth()->user()->store->id ?? null;

        // 2. Cari transaksi berdasarkan ID. 
        // Pastikan transaksinya beneran punya toko ini (biar admin lain gak bisa ngintip)
        $transaction = \App\Models\Transaction::with(['user', 'details.product'])
                        ->where('store_id', $storeId)
                        ->where('id', $id)
                        ->firstOrFail();

        // 3. Render ke halaman Detail Transaction React lu
        return \Inertia\Inertia::render('Seller/Transaction/Show', [
            'transaction' => $transaction
        ]);
    }

    // Tambahkan fungsi ini di dalam TransactionController lu
    public function update(\Illuminate\Http\Request $request, $id)
    {
        $transaction = \App\Models\Transaction::with('details.product')->findOrFail($id);

        $actionType = $request->action_type;

        // 1. Aksi: Terima Pesanan (Konfirmasi Pembayaran Manual)
        if ($actionType === 'confirm_payment') {
            $transaction->update([
                'payment_status' => 'paid',
                'order_status' => 'processing'
            ]);
        } 
        
        // 2. Aksi: Kirim Pesanan (Input Resi)
        elseif ($actionType === 'input_resi') {
            $request->validate([
                'resi_number' => 'required|string|max:255'
            ]);
            $transaction->update([
                'order_status' => 'shipped',
                'resi_number' => $request->resi_number
            ]);
        } 
        
        // 3. Aksi: Selesaikan Pesanan
        elseif ($actionType === 'complete') {
            $transaction->update([
                'order_status' => 'completed'
            ]);
        } 
        
        // 4. Aksi: Batalkan Pesanan
        elseif ($actionType === 'cancel') {
            // Ubah status
            $transaction->update([
                'order_status' => 'cancelled',
                'payment_status' => 'failed'
            ]);

            // Kembalikan stok produk karena batal beli
            foreach ($transaction->details as $detail) {
                if ($detail->product) {
                    $detail->product->increment('stock', $detail->qty);
                }
            }
        }

        // Kembalikan ke halaman yang sama beserta flash message sukses
        return redirect()->back()->with('message', 'Status pesanan berhasil diperbarui!');
    }

    public function printLabel($id)
    {
        $storeId = auth()->user()->store->id ?? null;

        // Ambil data transaksi beserta detail produk dan toko
        $transaction = \App\Models\Transaction::with(['user', 'details.product'])
                        ->where('store_id', $storeId)
                        ->where('id', $id)
                        ->firstOrFail();

        // Kita lempar ke file View React yang KHUSUS untuk print (tanpa layout sidebar)
        return \Inertia\Inertia::render('Seller/Transaction/PrintLabel', [
            'transaction' => $transaction,
            'store' => auth()->user()->store // Lempar data toko buat info Pengirim
        ]);
    }
}