<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    /**
     * Menampilkan daftar semua transaksi (Sisi Admin)
     */
    public function index()
    {
        // 1. Ambil data transaksi dengan Eager Loading
        // Kita butuh 'user' untuk tahu siapa yang beli
        // Kita butuh 'details.product' untuk tahu barang apa yang dibeli
        $transactions = Transaction::with(['user', 'details.product'])
            ->orderBy('created_at', 'desc') // Yang terbaru di atas
            ->paginate(10); // Task Jira: Pagination 10 data

        // 2. Lempar ke View Admin (akan kita buat di Task 3)
        return Inertia::render('Admin/Transaction/Index', [
            'transactions' => $transactions
        ]);
    }

    /**
     * Opsi: Jika nanti mau update status secara manual (Misal: Input Resi)
     */
    public function update(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);
        
        // Contoh update status atau catatan admin
        $transaction->update([
            'payment_status' => $request->status // Misal: manual update ke 'success'
        ]);

        return redirect()->back()->with('success', 'Status transaksi berhasil diperbarui');
    }
}