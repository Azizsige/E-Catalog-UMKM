<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\TransactionDetail; // Opsional kalau mau update stok nanti
use Midtrans\Config;
use Midtrans\Notification;

class MidtransCallbackController extends Controller
{
    public function callback(Request $request)
    {
        // 1. Set Konfigurasi Midtrans
        Config::$serverKey = env('MIDTRANS_SERVER_KEY');
        Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);
        Config::$isSanitized = true;
        Config::$is3ds = true;

        // 2. Buat Instance Notifikasi dari Midtrans
        // Library ini otomatis ngebaca data JSON yang dikirim Midtrans
        try {
            $notification = new Notification();
        } catch (\Exception $e) {
            // Kalau bukan dari Midtrans atau data gak valid, tolak.
            return response()->json(['message' => 'Invalid notification'], 400);
        }

        // 3. Ambil Data Penting
        $status = $notification->transaction_status;
        $type = $notification->payment_type;
        $fraud = $notification->fraud_status;
        $order_id = $notification->order_id; // Ini adalah Invoice Code kita

        // 4. Cari Transaksi di Database
        $transaction = Transaction::where('invoice_code', $order_id)->first();

        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        // 5. Logic Update Status (Penerjemah Bahasa Midtrans -> Database Kita)
        
        // Default status
        $paymentStatus = null;
        $orderStatus = null;

        if ($status == 'capture') {
            if ($fraud == 'challenge') {
                $paymentStatus = 'pending'; // Masih dicek bank
            } else {
                $paymentStatus = 'paid'; // Sukses (Kartu Kredit)
                $orderStatus = 'processing';
            }
        } 
        else if ($status == 'settlement') {
            $paymentStatus = 'paid'; // Sukses (Transfer/VA/Gopay)
            $orderStatus = 'processing'; // Siap diproses penjual
        } 
        else if ($status == 'pending') {
            $paymentStatus = 'pending';
        } 
        else if ($status == 'deny' || $status == 'expire' || $status == 'cancel') {
            $paymentStatus = 'failed'; // Gagal/Kadaluarsa
            $orderStatus = 'cancelled';
        }

        // 6. Simpan Perubahan ke Database
        if ($paymentStatus) {
            $transaction->payment_status = $paymentStatus;
            
            // Update order_status juga kalau sukses
            if ($orderStatus) {
                $transaction->order_status = $orderStatus;
            }
            
            $transaction->save();
        }

        // 7. Balas Midtrans (Wajib 200 OK)
        return response()->json(['message' => 'Callback received successfully']);
    }
}