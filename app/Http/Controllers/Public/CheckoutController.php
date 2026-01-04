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

class CheckoutController extends Controller
{
    // 1. TAMPILKAN HALAMAN CHECKOUT
    public function index(Request $request)
    {
        // Ambil ID cart yang dikirim dari halaman sebelumnya (via Query Param)
        // Contoh URL: /checkout?ids[]=1&ids[]=5
        $cartIds = $request->query('ids');

        if (!$cartIds) {
            return redirect()->route('cart.index')->withErrors('Pilih barang dulu bos!');
        }

        // Ambil data Cart berdasarkan ID yang dipilih & Punya User yang login
        $carts = Cart::with(['product.user.store']) 
                    ->whereIn('id', $cartIds)
                    ->where('user_id', Auth::id())
                    ->get();

        // Ambil data Alamat User
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
        $request->validate([
            'recipient_name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20',
            'address_line' => 'required|string',
            'city' => 'required|string',
            'postal_code' => 'required|numeric',
        ]);

        // Logic: Kalau ini alamat pertama, otomatis jadi Primary
        $isFirstAddress = !UserAddress::where('user_id', Auth::id())->exists();

        UserAddress::create([
            'user_id' => Auth::id(),
            'recipient_name' => $request->recipient_name,
            'phone_number' => $request->phone_number,
            'address_line' => $request->address_line,
            'city' => $request->city,
            'postal_code' => $request->postal_code,
            'is_primary' => $isFirstAddress ? true : false,
        ]);

        return back()->with('message', 'Alamat berhasil ditambahkan!');
    }

    // 3. HAPUS ALAMAT
    public function destroyAddress($id)
    {
        $address = UserAddress::findOrFail($id);

        // Security: Pastikan alamat ini punya user yang login
        if ($address->user_id !== Auth::id()) {
            abort(403);
        }

        $address->delete();

        return back()->with('message', 'Alamat berhasil dihapus.');
    }

    // 4. PROSES CHECKOUT (SIMPAN TRANSAKSI)
    public function store(Request $request)
    {
        // Validasi data yang dikirim Frontend
        $request->validate([
            'address_id' => 'required|exists:user_addresses,id',
            'cart_ids' => 'required|array', // List ID keranjang yang mau dibeli
            'cart_ids.*' => 'exists:carts,id',
        ]);

        // Gunakan DB Transaction biar aman (Atomicity)
        try {
            return DB::transaction(function () use ($request) {
                
                // 1. Ambil Data Alamat
                $address = UserAddress::findOrFail($request->address_id);

                // 2. Ambil Data Keranjang (Hanya punya user ini)
                $carts = Cart::with('product')->whereIn('id', $request->cart_ids)
                            ->where('user_id', Auth::id())
                            ->get();

                if ($carts->isEmpty()) {
                    throw new \Exception("Keranjang kosong atau tidak valid.");
                }

                // 3. Hitung Total Harga (Backend Calculation)
                $totalPrice = 0;
                foreach ($carts as $cart) {
                    $totalPrice += $cart->product->price * $cart->qty;
                }

                $shippingCost = 15000; // Samakan variabel biar enak

                // FIX LOGIC STORE ID:
                // Kita ambil store_id dari relasi: Product -> User -> Store
                // Pastikan user penjual punya toko. Kalau null, ini bakal error.
                $storeId = $carts[0]->product->user->store->id ?? null;
                
                if (!$storeId) {
                     throw new \Exception("Produk ini tidak memiliki data Toko yang valid.");
                }

                // 4. Buat Transaksi Parent (SESUAIKAN DENGAN TABEL KAMU)
                $transaction = Transaction::create([
                    'user_id' => Auth::id(),
                    'store_id' => $storeId, // <--- ID Toko yang benar
                    
                    // Kolom baru
                    'invoice_code' => 'INV/' . Carbon::now()->format('Ymd') . '/' . Str::upper(Str::random(5)),
                    
                    // Struktur tabel kamu: total_price & shipping_cost
                    'total_price' => $totalPrice, 
                    'shipping_cost' => $shippingCost, 
                    
                    // HAPUS 'grand_total' KARENA DI TABEL KAMU GAK ADA
                    // 'grand_total' => ... (HAPUS)

                    'payment_status' => 'pending', // Sesuai enum kamu
                    'order_status' => 'pending',   // Sesuai enum kamu
                    
                    'shipping_address_snapshot' => json_encode([
                        'recipient_name' => $address->recipient_name,
                        'phone_number' => $address->phone_number,
                        'address_line' => $address->address_line,
                        'city' => $address->city,
                        'postal_code' => $address->postal_code,
                    ]),
                ]);

                // 5. Simpan Detail Barang
                foreach ($carts as $cart) {
                    TransactionDetail::create([
                        'transaction_id' => $transaction->id,
                        'product_id' => $cart->product_id,
                        'qty' => $cart->qty,
                        'price' => $cart->product->price, // Harga saat beli
                        // Snapshot nama & gambar (sesuai migrasi 'transaction_details' kamu sebelumnya, kelihatannya kamu belum punya kolom snapshot nama/gambar di detail?
                        // Cek migrasi kamu: 'price_at_transaction' ada. 
                        // Oke sesuaikan nama kolom:
                        'price_at_transaction' => $cart->product->price,
                    ]);
                }

                // 6. Hapus Keranjang
                Cart::whereIn('id', $request->cart_ids)->delete();

                // 7. Redirect ke Halaman Pembayaran (Next Session)
                // Untuk sekarang kita redirect ke halaman "My Orders" atau halaman sukses sementara
                return redirect()->route('transactions.show', $transaction->id);
            });

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal memproses pesanan: ' . $e->getMessage()]);
        }
    }
}