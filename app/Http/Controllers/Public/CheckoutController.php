<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Product;
use App\Models\User; // <-- PENTING: Tambahin ini buat manggil Admin
use App\Notifications\NewOrderNotification; // <-- PENTING: Tambahin class notifikasi kita
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Midtrans\Config;
use Midtrans\Snap;
use App\Notifications\LowStockNotification; // <-- PENTING: Tambahin ini buat notifikasi stok menipis

class CheckoutController extends Controller
{
    // 1. TAMPILKAN HALAMAN CHECKOUT
    public function index(Request $request)
    {
        // Ambil data toko untuk tau dia pakai WA atau Midtrans
        $store = \App\Models\Store::latest('updated_at')->first();
        
        return Inertia::render('Checkout/Index', [
            'store' => $store,
            // Lempar Client Key Midtrans ke Frontend buat load popup Snap
            'midtransClientKey' => config('midtrans.client_key', env('MIDTRANS_CLIENT_KEY'))
        ]);
    }

    // 2. PROSES CHECKOUT (GUEST)
    // 2. PROSES CHECKOUT (GUEST)
    public function store(Request $request)
    {
        $request->validate([
            'recipient_name' => 'required|string|max:255',
            'phone_number'   => 'required|string|max:20',
            'address_line'   => 'required|string',
            'city'           => 'required|string',
            'postal_code'    => 'required|string|max:10',
            'items'          => 'required|array|min:1', 
            'items.*.id'     => 'required|exists:products,id',
            'items.*.qty'    => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            $store = \App\Models\Store::latest('updated_at')->first();

            $addressSnapshot = json_encode([
                'recipient_name' => $request->recipient_name,
                'phone_number'   => $request->phone_number,
                'address_line'   => $request->address_line,
                'city'           => $request->city,
                'postal_code'    => $request->postal_code,
            ]);

            $totalPrice = 0;
            $processedItems = [];

            foreach ($request->items as $item) {
                $product = Product::find($item['id']);
                if (!$product || $product->stock < $item['qty']) {
                    throw new \Exception("Stok produk '{$product->name}' tidak mencukupi.");
                }
                
                // =======================================================
                // 🔥 FIX PERHITUNGAN HARGA 🔥
                // Ambil harga murni dari database, hiraukan format Rupiah
                $rawPrice = $product->getRawOriginal('price') ?? $product->price;
                
                // Bersihkan dari titik/koma/huruf, paksa jadi Integer murni
                $cleanPrice = (int) preg_replace('/[^0-9]/', '', (string) $rawPrice);
                $qty = (int) $item['qty'];
                
                // Hitung subtotal dan masukkan ke keranjang total
                $subtotal = $cleanPrice * $qty;
                $totalPrice += $subtotal;
                // =======================================================

                $processedItems[] = [
                    'product' => $product,
                    'qty' => $qty,
                    'price' => $cleanPrice // Simpan harga bersihnya
                ];
            }
            
            $shippingCost = 15000; 
            
            // Hitung Grand Total dari awal biar gak miss
            $grossAmount = $totalPrice + $shippingCost;

            // Tentukan Metode Pembayaran berdasarkan settingan toko
            $paymentMethod = ($store->checkout_mode === 'midtrans') ? 'midtrans' : 'whatsapp';

            $transaction = Transaction::create([
                'user_id'       => null, 
                'store_id'      => $store->id,
                'invoice_code'  => 'INV/' . date('Ymd') . '/' . Str::upper(Str::random(5)),
                'total_price'   => $totalPrice, // Sekarang harganya pasti masuk!
                'shipping_cost' => $shippingCost,
                'shipping_address_snapshot' => $addressSnapshot,
                'order_status'  => 'pending',
                'payment_status'=> 'pending',
                'payment_method'=> $paymentMethod, 
            ]);

            foreach ($processedItems as $data) {
                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'product_id'     => $data['product']->id,
                    'qty'            => $data['qty'],
                    'price_at_transaction' => $data['price'] // Pakai harga bersih
                ]);
                
                // Kurangi stok
                $data['product']->decrement('stock', $data['qty']);

                // Cek stok menipis
                if ($data['product']->stock <= 5) {
                    $admin = User::find(1);
                    if ($admin) {
                        $admin->notify(new LowStockNotification($data['product']));
                    }
                }
            }

            DB::commit(); // <-- Data 100% aman tersimpan di sini

            // Trigger Notifikasi Pesanan Baru
            $admin = User::find(1);
            if ($admin) {
                $admin->notify(new NewOrderNotification($transaction));
            }

            // --- CABANG LOGIC PEMBAYARAN ---
            if ($paymentMethod === 'midtrans') {
                Config::$serverKey = config('midtrans.server_key');
                Config::$isProduction = config('midtrans.is_production');
                Config::$isSanitized = true;
                Config::$is3ds = true;

                $midtransParams = [
                    'transaction_details' => [
                        'order_id' => $transaction->invoice_code . '-' . rand(100,999),
                        'gross_amount' => $grossAmount, // <-- Kirim Grand Total ke Midtrans
                    ],
                    'customer_details' => [
                        'first_name' => $request->recipient_name,
                        'email' => 'guest@' . strtolower(str_replace(' ', '', $store->name)) . '.com', 
                        'phone' => $request->phone_number,
                    ],
                ];

                $snapToken = Snap::getSnapToken($midtransParams);
                $transaction->update(['snap_token' => $snapToken]);

                return response()->json([
                    'success' => true,
                    'is_midtrans' => true,
                    'snap_token' => $snapToken,
                    'invoice_code' => $transaction->invoice_code
                ]);
            } else {
                return response()->json([
                    'success' => true,
                    'is_midtrans' => false,
                    'invoice_code' => $transaction->invoice_code 
                ]);
            }

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }
}