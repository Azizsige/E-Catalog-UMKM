<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\User;
use App\Notifications\PaymentSuccessNotification;
use Illuminate\Support\Facades\Log;

class MidtransWebhookController extends Controller
{
    public function handle(Request $request)
    {
        try {
            // 1. Ambil data dari payload Midtrans
            $payload = $request->all();
            $orderId = $payload['order_id'];
            $statusCode = $payload['status_code'];
            $grossAmount = $payload['gross_amount'];
            $serverKey = config('midtrans.server_key');

            // 2. Validasi Keamanan (Signature Key)
            $signatureKey = hash("sha512", $orderId . $statusCode . $grossAmount . $serverKey);
            
            if ($signatureKey !== $payload['signature_key']) {
                return response()->json(['message' => 'Invalid Signature'], 403);
            }

            // 3. Cari Transaksi di Database
            $invoiceCode = explode('-', $orderId)[0];
            
            // 🔥 PERBAIKAN: Wajib tambahin with('details.product') di sini
            // Biar Laravel narik data produknya juga buat ngebalikin stok nanti
            $transaction = Transaction::with('details.product')->where('invoice_code', $invoiceCode)->first();

            if (!$transaction) {
                return response()->json(['message' => 'Transaction not found'], 404);
            }

            // 4. Update Status Pembayaran & Kirim Notif
            $transactionStatus = $payload['transaction_status'];

            // Jika LUNAS
            if ($transactionStatus == 'settlement' || $transactionStatus == 'capture') {
                if ($transaction->payment_status !== 'paid') {
                    $transaction->update(['payment_status' => 'paid']);

                    $admin = User::find(1);
                    if ($admin) {
                        $admin->notify(new \App\Notifications\PaymentSuccessNotification($transaction));
                    }
                }
            } 
            // Jika KEDALUWARSA / BATAL
            // Jika KEDALUWARSA / BATAL
            // PERBAIKAN: Pakai kata 'cancel', bukan 'cancelled'
            else if ($transactionStatus == 'expire' || $transactionStatus == 'cancel' || $transactionStatus == 'deny') {
                
                Log::info("WEBHOOK BATAL JALAN! Status Midtrans: " . $transactionStatus);
                
                // PERBAIKAN: Cek order_status, bukan payment_status
                if ($transaction->order_status !== 'cancelled') {
                    
                    Log::info("Order belum dibatalkan, memproses cancel sekarang...");

                    $transaction->update([
                        'order_status' => 'cancelled' // Otomatis batalkan order
                    ]);

                    // Safety Check buat ngebalikin stok
                    if ($transaction->details) {
                        foreach ($transaction->details as $detail) {
                            if ($detail->product) { // Cek dulu produknya beneran ada/gak dihapus
                                $detail->product->increment('stock', $detail->qty);
                                Log::info("Stok dikembalikan untuk produk ID: " . $detail->product->id);
                            }
                        }
                    }

                    // Notif ke Admin
                    $admin = User::find(1);
                    if ($admin) {
                        $admin->notify(new \App\Notifications\OrderCancelledNotification($transaction));
                        Log::info("Notifikasi Batal Sukses Dikirim!");
                    }
                } else {
                    Log::info("Order sudah berstatus cancelled, skip notifikasi.");
                }
            }

            return response()->json(['message' => 'Webhook processed successfully']);

        } catch (\Exception $e) {
            // 🔥 PERBAIKAN: Catat pesan error aslinya biar kita tau rusaknya di mana
            Log::error('Midtrans Webhook Error: ' . $e->getMessage() . ' Line: ' . $e->getLine());
            return response()->json(['message' => 'Internal Server Error', 'error' => $e->getMessage()], 500);
        }
    }
}