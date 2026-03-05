<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function track($invoice)
    {
        // 1. Cari transaksi berdasarkan invoice_code
        // WAJIB ADA 'store' DI DALAM SINI BIAR REACT TAU DATA BANKNYA
        $transaction = Transaction::with(['details.product', 'store']) 
                        ->where('invoice_code', $invoice)
                        ->firstOrFail(); 

        // 2. Decode string snapshot alamat
        $address = json_decode($transaction->shipping_address_snapshot);

        // 3. Ambil Client Key Midtrans
        $midtransClientKey = config('midtrans.client_key', env('MIDTRANS_CLIENT_KEY'));

        return Inertia::render('Order/Track', [
            'transaction' => $transaction,
            'address'     => $address,
            'midtransClientKey' => $midtransClientKey
        ]);
    }
}