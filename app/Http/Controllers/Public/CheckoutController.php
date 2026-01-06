<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Cart;
use App\Models\UserAddress;
use Illuminate\Support\Facades\DB;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Midtrans\Config;
use Midtrans\Snap;

class CheckoutController extends Controller
{
    // 1. TAMPILKAN HALAMAN CHECKOUT
    public function index(Request $request)
    {
        $cartIds = $request->query('ids');

        if (!$cartIds) {
            return redirect()->route('cart.index')->withErrors('Pilih barang dulu bos!');
        }

        $carts = Cart::with(['product.user.store']) 
                    ->whereIn('id', $cartIds)
                    ->where('user_id', Auth::id())
                    ->get();

        $addresses = UserAddress::where('user_id', Auth::id())->get();

        return Inertia::render('Checkout/Index', [
            'carts' => $carts,
            'addresses' => $addresses,
            'user' => Auth::user()
        ]);
    }

    // 2. SIMPAN ALAMAT BARU
    public function storeAddress(Request $request)
{
    // 1. Validasi
    $validated = $request->validate([
        'recipient_name' => 'required|string|max:255',
        'phone_number' => 'required|string|max:20',
        'address_line' => 'required|string',
        'city' => 'required|string',
        'postal_code' => 'required|string|max:10',
    ]);

    // 2. Simpan ke Database (Tabel User Addresses atau Users kolom address)
    // Asumsi: Kamu punya tabel `user_addresses`. Kalau cuma kolom di user, sesuaikan.
    
    // Contoh kalau pakai tabel terpisah (Recommended):
    $request->user()->addresses()->create($validated);

    // ATAU Contoh kalau update profil user (Simple):
    // $request->user()->update(['address' => $validated['address_line'] ... ]);

    // 3. REDIRECT BACK (PENTING!)
    // Ini akan menyuruh Inertia me-reload halaman checkout dengan data alamat baru
    return redirect()->back()->with('message', 'Alamat berhasil ditambahkan!');
}

    // 3. HAPUS ALAMAT
    public function destroyAddress($id)
    {
        $address = UserAddress::findOrFail($id);

        if ($address->user_id !== Auth::id()) {
            abort(403);
        }

        $address->delete();

        return back()->with('message', 'Alamat berhasil dihapus.');
    }

    // 4. PROSES CHECKOUT (SIMPAN TRANSAKSI)
    public function store(Request $request)
    {
        // 1. Validasi Input
        $request->validate([
            'address_id' => 'required|exists:user_addresses,id',
            'cart_ids'   => 'required|array',
            'cart_ids.*' => 'exists:carts,id',
        ]);

        DB::beginTransaction();
        try {
            $user = Auth::user();
            
            // 2. Ambil Data Keranjang & Produknya
            $carts = Cart::with(['product.store'])->whereIn('id', $request->cart_ids)->get();

            // Security: Pastikan cart tidak kosong & punya user yang benar
            if ($carts->isEmpty()) {
                return back()->withErrors(['error' => 'Keranjang belanja kosong atau tidak valid.']);
            }

            // Asumsi: Dalam 1 checkout, semua produk berasal dari 1 Toko yang sama
            // (Sesuai logic sederhana E-Catalog UMKM)
            $firstProduct = $carts->first()->product;
            $store = $firstProduct->store;

            // 3. Ambil Data Alamat untuk Snapshot
            $address = UserAddress::find($request->address_id);
            
            // Bikin JSON Snapshot (PENTING: Biar kalau user ubah alamat profil, data transaksi aman)
            $addressSnapshot = json_encode([
                'recipient_name' => $address->recipient_name,
                'phone_number'   => $address->phone_number,
                'address_line'   => $address->address_line,
                'city'           => $address->city,
                'postal_code'    => $address->postal_code,
            ]);

            // String Alamat Simpel (untuk display cepat)
            $simpleAddress = "{$address->address_line}, {$address->city}, {$address->postal_code}";

            // 4. Hitung Total & Cek Stok
            $totalPrice = 0;
            foreach ($carts as $cart) {
                if ($cart->product->stock < $cart->qty) {
                    throw new \Exception("Stok produk '{$cart->product->name}' tidak mencukupi.");
                }
                $totalPrice += $cart->product->price * $cart->qty;
            }
            $shippingCost = 15000; // Flat rate sementara

            // 5. Buat Header Transaksi
            $transaction = Transaction::create([
                'user_id'       => $user->id,
                'store_id'      => $store->id,
                'invoice_code'  => 'INV/' . date('Ymd') . '/' . Str::upper(Str::random(5)),
                'total_price'   => $totalPrice,
                'shipping_cost' => $shippingCost,
                'address'       => $simpleAddress, // String biasa
                'shipping_address_snapshot' => $addressSnapshot, // JSON Lengkap
                'order_status'  => 'pending',
                'payment_status'=> 'pending',
                'payment_method'=> ($store->checkout_mode === 'midtrans') ? 'midtrans' : 'manual',
            ]);

            // 6. Buat Detail Transaksi & Kurangi Stok
            foreach ($carts as $cart) {
                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'product_id'     => $cart->product_id,
                    'qty'            => $cart->qty,
                    'price_at_transaction' => $cart->product->price
                ]);

                // Kurangi stok produk
                $cart->product->decrement('stock', $cart->qty);
            }

            // 👇👇👇 7. THE FIX: HAPUS DARI KERANJANG 👇👇👇
            // Hanya hapus item yang dipilih saat checkout
            Cart::whereIn('id', $request->cart_ids)->delete();
            // 👆👆👆 ----------------------------------- 👆👆👆

            // 8. Logic Pembayaran (Hybrid)
            
            // SKENARIO A: MIDTRANS (Otomatis)
            if ($store->checkout_mode === 'midtrans') {
                // Setup Midtrans
                Config::$serverKey = config('midtrans.server_key');
                Config::$isProduction = config('midtrans.is_production');
                Config::$isSanitized = true;
                Config::$is3ds = true;

                $midtransParams = [
                    'transaction_details' => [
                        'order_id' => $transaction->invoice_code . '-' . rand(100,999), // Unik biar gak error duplicate order_id midtrans
                        'gross_amount' => $totalPrice + $shippingCost,
                    ],
                    'customer_details' => [
                        'first_name' => $address->recipient_name,
                        'email' => $user->email,
                        'phone' => $address->phone_number,
                    ],
                ];

                $snapToken = Snap::getSnapToken($midtransParams);
                $transaction->update(['snap_token' => $snapToken]);
                
                DB::commit();

                // Redirect ke halaman detail transaksi (Customer bisa bayar disana)
                // Atau langsung pop-up Snap (tergantung implementasi frontend kamu)
                // Disini kita redirect ke halaman riwayat pesanan (Detail)
                return redirect()->route('transactions.show', $transaction->id);
            }

            // SKENARIO B: MANUAL (WhatsApp)
            else {
                DB::commit();

                // Format Pesan WA
                $waPhone = $store->phone_number; // Pastikan format 628xxx
                // Jika user input 08xxx, ubah ke 628xxx
                if (str_starts_with($waPhone, '0')) {
                    $waPhone = '62' . substr($waPhone, 1);
                }

                $message = "Halo kak, saya mau konfirmasi pesanan *{$transaction->invoice_code}*.\n";
                $message .= "Total: Rp " . number_format($totalPrice + $shippingCost, 0, ',', '.') . "\n";
                $message .= "Mohon info rekening pembayarannya ya. Terima kasih!";
                
                $waUrl = "https://wa.me/{$waPhone}?text=" . urlencode($message);

                // Redirect Inertia ke External URL (WA)
                return \Inertia\Inertia::location($waUrl);
            }

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal memproses pesanan: ' . $e->getMessage()]);
        }
    }
}