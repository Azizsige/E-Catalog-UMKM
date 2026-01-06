<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CartController extends Controller
{
    // Masukkan barang ke keranjang
    public function store(Request $request)
    {
        // 1. Jika User Belum Login
        if (!Auth::check()) {
            // Simpan data item ini ke session sementara
            session(['pending_cart' => [
                'product_id' => $request->product_id,
                'qty' => $request->qty,
                'is_buy_now' => $request->boolean('is_buy_now')
            ]]);

            // Redirect ke halaman login (Stop proses disini)
            return redirect()->route('login');
        }

        // --- JIKA SUDAH LOGIN (Logic di bawah ini TETAP SAMA, tidak ada yang dibuang) ---
        $user = Auth::user();
        
        // 2. Validasi Input
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'qty' => 'required|integer|min:1'
        ]);

        // 3. Cek Stok Produk
        $product = \App\Models\Product::findOrFail($request->product_id); // Tambahkan \App\Models jika perlu
        if ($product->stock < $request->qty) {
            return back()->withErrors(['qty' => 'Stok tidak cukup!']);
        }

        $existingCart = \App\Models\Cart::where('user_id', $user->id)
            ->where('product_id', $request->product_id)
            ->first();

        // 4. Update atau Create di Database
        if ($existingCart) {
            // SKENARIO A: Barang Sudah Ada -> Tambah Qty
            $existingCart->qty = $existingCart->qty + $request->qty;
            
            // Mentokin ke stok max
            if ($existingCart->qty > $product->stock) {
                $existingCart->qty = $product->stock; 
            }
            
            $existingCart->save();
        } else {
            // SKENARIO B: Barang Baru -> Create
            \App\Models\Cart::create([
                'user_id' => $user->id,
                'product_id' => $request->product_id,
                'qty' => $request->qty
            ]);
        }

        // --- DIRECT REDIRECT (Logic Tiket Sekali Jalan) ---
        if ($request->boolean('is_buy_now')) {
            return redirect()->route('cart.index', ['checked' => $request->product_id]);
        }

        return back()->with('message', 'Produk berhasil masuk keranjang! 🛒');
    }

    public function index()
    {
        $user = Auth::user();

        // Ambil data keranjang user ini
        // Kita butuh relasi 'product' dan 'product.store' (biar tau tokonya siapa)
        $carts = Cart::with(['product.user.store']) 
                    ->where('user_id', $user->id)
                    ->latest()
                    ->get();

        return Inertia::render('Cart/Index', [
            'carts' => $carts
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'qty' => 'required|integer|min:1'
        ]);

        $cart = Cart::findOrFail($id);

        // Security Check: Punya user sendiri gak?
        if ($cart->user_id !== Auth::id()) {
            abort(403);
        }

        // Cek Stok (Biar gak bablas)
        if ($request->qty > $cart->product->stock) {
            return back()->withErrors(['qty' => 'Stok mentok, Bos!']);
        }

        // Update Database
        $cart->update([
            'qty' => $request->qty
        ]);

        return back(); // Balik ke halaman asal (popup tetap terbuka nanti)
    }

    // HAPUS ITEM DARI KERANJANG
    public function destroy($id)
    {
        $cart = Cart::findOrFail($id);

        // Pastikan yang ngehapus adalah pemilik keranjang (Security)
        if ($cart->user_id !== Auth::id()) {
            abort(403);
        }

        $cart->delete();

        return back()->with('message', 'Barang dihapus dari keranjang.');
    }
}