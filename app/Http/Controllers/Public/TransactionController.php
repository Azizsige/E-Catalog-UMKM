<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;
use Midtrans\Config;
use Midtrans\Snap;

class TransactionController extends Controller
{
    public function show($id)
    {
        // 1. Ambil Data Transaksi
        $transaction = Transaction::with(['details.product', 'user', 'store'])
                        ->where('id', $id)
                        ->where('user_id', Auth::id())
                        ->firstOrFail();

        // 2. LOGIC MINTA TOKEN (REVISI DI SINI)
        // Dulu: if ($transaction->status === 'pending' ...
        // Sekarang: Ganti jadi 'payment_status' sesuai database kamu
        
        if ($transaction->payment_status === 'pending' && empty($transaction->snap_token)) {
            
            // Konfigurasi Midtrans
            Config::$serverKey = env('MIDTRANS_SERVER_KEY');
            Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);
            Config::$isSanitized = true;
            Config::$is3ds = true;

            // Siapkan Payload
            $params = [
                'transaction_details' => [
                    'order_id' => $transaction->invoice_code,
                    // Pastikan dikonversi ke Integer biar aman
                    'gross_amount' => (int) ($transaction->total_price + $transaction->shipping_cost),
                ],
                'customer_details' => [
                    'first_name' => $transaction->user->name,
                    'email' => $transaction->user->email,
                ],
            ];

            // Minta Snap Token
            try {
                $snapToken = Snap::getSnapToken($params);
                
                // Simpan Token ke Database
                $transaction->snap_token = $snapToken;
                $transaction->save();
            } catch (\Exception $e) {
                // Kalau error, biarkan snap_token null dulu, nanti user refresh halaman biar coba lagi
                // Atau dd($e->getMessage()) buat debugging kalau masih error
            }
        }

        // 3. Tampilkan Halaman
        return Inertia::render('Transaction/Show', [
            'transaction' => $transaction,
            'clientKey' => env('MIDTRANS_CLIENT_KEY'),
        ]);
    }

    public function index()
    {
        // Ambil semua transaksi milik user yang sedang login
        $transactions = Transaction::with(['details.product', 'store'])
                        ->where('user_id', Auth::id())
                        ->orderBy('created_at', 'desc') // Yang terbaru paling atas
                        ->paginate(5); // Atau pakai ->paginate(10) kalau mau ada halaman

        return Inertia::render('Transaction/Index', [
            'transactions' => $transactions
        ]);
    }
}