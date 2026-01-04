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
        // 1. Pastikan User Login
        if (!Auth::check()) {
            return redirect()->route('login')->with('message', 'Silakan login dulu buat belanja ya!');
        }

        $user = Auth::user();
        
        // 2. Validasi Input
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'qty' => 'required|integer|min:1'
        ]);

        // 3. Cek Stok Produk (Opsional tapi penting)
        $product = Product::findOrFail($request->product_id);
        if ($product->stock < $request->qty) {
            return back()->withErrors(['qty' => 'Stok tidak cukup!']);
        }

        // 4. Cek apakah barang ini SUDAH ADA di keranjang user?
        $existingCart = Cart::where('user_id', $user->id)
                            ->where('product_id', $product->id)
                            ->first();

        if ($existingCart) {
            // SKENARIO A: Barang udah ada -> Tambahkan Qty
            $existingCart->increment('qty', $request->qty);
        } else {
            // SKENARIO B: Barang baru -> Buat baru
            Cart::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
                'qty' => $request->qty
            ]);
        }

        // 5. Balikin User ke halaman sebelumnya dengan pesan sukses
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