<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index()
    {
        // 1. Ambil ID Toko Seller yang login
        // Asumsi: User -> hasOne -> Store
        $store = Auth::user()->store;

        if (!$store) {
            // Jaga-jaga kalau user role seller tapi belum bikin toko
            return redirect()->route('seller.store.edit')->with('error', 'Silakan lengkapi profil toko dulu.');
        }

        // 2. Ambil Transaksi milik toko ini saja
        $transactions = Transaction::with(['user', 'transactionDetails.product'])
            ->where('store_id', $store->id)
            ->latest()
            ->paginate(10);

        return Inertia::render('Seller/Transaction/Index', [
            'transactions' => $transactions
        ]);
    }

    public function show(Transaction $transaction)
    {
        // Security Check: Pastikan transaksi ini milik toko si seller
        if ($transaction->store_id !== Auth::user()->store->id) {
            abort(403);
        }

        // Load detail produk & info user pembeli
        $transaction->load(['user', 'transactionDetails.product']);

        return Inertia::render('Seller/Transaction/Show', [
            'transaction' => $transaction
        ]);
    }

    public function update(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);

        // Validasi input dari Frontend
        $request->validate([
            'action_type' => 'required|string', // confirm_payment, input_resi, cancel
            'resi_number' => 'nullable|string',
        ]);

        switch ($request->action_type) {
            
            // 1. TERIMA PEMBAYARAN (Pending -> Processing)
            case 'confirm_payment':
                $transaction->update([
                    'order_status' => 'processing',
                    'payment_status' => 'paid', // Tandai lunas
                ]);
                break;

            // 2. INPUT RESI (Processing -> Shipped)
            case 'input_resi':
                $request->validate(['resi_number' => 'required']);
                $transaction->update([
                    'order_status' => 'shipped',
                    'resi_number' => $request->resi_number,
                ]);
                break;

            // 3. SELESAI MANUAL OLEH SELLER (Opsional / Darurat)
            // (Hanya bisa kalau status sudah dikirim)
            case 'complete':
                if ($transaction->order_status == 'shipped') {
                    $transaction->update(['order_status' => 'completed']);
                }
                break;

            // 4. BATALKAN PESANAN
            case 'cancel':
                // Balikin Stok Produk (Looping details)
                foreach ($transaction->transactionDetails as $detail) {
                    $product = $detail->product;
                    if ($product) {
                        $product->increment('stock', $detail->qty);
                    }
                }
                
                $transaction->update([
                    'order_status' => 'cancelled',
                    'payment_status' => 'cancelled' // atau failed
                ]);
                break;
        }

        return redirect()->back()->with('message', 'Status pesanan diperbarui!');
    }

    public function printLabel($id)
    {
        // Ambil transaksi milik toko yang sedang login
        $store = \App\Models\Store::where('user_id', \Illuminate\Support\Facades\Auth::id())->firstOrFail();

        $transaction = \App\Models\Transaction::with(['user', 'details.product'])
            ->where('store_id', $store->id)
            ->where('id', $id)
            ->firstOrFail();

        return \Inertia\Inertia::render('Seller/Transaction/PrintLabel', [
            'transaction' => $transaction,
            'store' => $store
        ]);
    }
}