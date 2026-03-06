<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia; // <-- Tambahin ini

class NotificationController extends Controller
{
    // 1. TAMPILKAN HALAMAN SEMUA NOTIFIKASI
    public function index()
    {
        // Ambil semua notifikasi dan di-paginate biar enteng
        $notifications = auth()->user()->notifications()->paginate(15);

        return Inertia::render('Seller/Notification/Index', [
            'notifications' => $notifications
        ]);
    }

    // 2. TANDAI SEMUA SUDAH DIBACA
    public function markAllRead()
    {
        auth()->user()->unreadNotifications->markAsRead();

        return redirect()->back()->with('message', 'Semua notifikasi telah ditandai sudah dibaca.');
    }

    // 3. FUNGSI KLIK SATUAN (Yang kemarin lu bikin, biarin aja)
    public function markAsRead($id)
    {
        $notification = auth()->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        $type = $notification->data['icon_type'] ?? 'info';

        // TANGANI NOTIF ORDER & PAYMENT
        if ($type === 'order' || $type === 'payment') {
            $transactionId = $notification->data['transaction_id'] ?? null;
            if ($transactionId) {
                return redirect()->route('admin.transactions.show', $transactionId);
            }
            return redirect()->route('admin.transactions.index');
        }

        // TANGANI NOTIF STOK
        if ($type === 'stock') {
            return redirect()->route('admin.products.index');
        }

        // 🔥 PERBAIKAN: TANGANI NOTIF INFO (PESANAN BATAL) 🔥
        if ($type === 'info') {
            $transactionId = $notification->data['transaction_id'] ?? null;
            if ($transactionId) {
                // Arahin ke halaman detail transaksi tersebut
                return redirect()->route('admin.transactions.show', $transactionId);
            }
            return redirect()->route('admin.transactions.index');
        }

        return redirect()->route('admin.dashboard');
    }
}