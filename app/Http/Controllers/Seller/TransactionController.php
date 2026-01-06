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

    public function update(Request $request, Transaction $transaction)
    {
        // Security Check
        if ($transaction->store_id !== Auth::user()->store->id) {
            abort(403);
        }

        $request->validate([
            'order_status' => 'required|in:pending,processing,shipped,completed,cancelled'
        ]);

        $transaction->update([
            'order_status' => $request->order_status
        ]);

        return back()->with('message', 'Status pesanan berhasil diperbarui!');
    }
}