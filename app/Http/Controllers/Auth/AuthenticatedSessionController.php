<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // 1. Authenticate & Regenerate Session
        $request->authenticate();
        $request->session()->regenerate();

        // 2. --- LOGIC PINDAHKAN KERANJANG DARI SESI (FIX BUG DOUBLE) ---
        $pendingCart = session('pending_cart');

        // Tambahkan 'is_array($pendingCart)' untuk mencegah error "offset on int"
        if ($pendingCart && is_array($pendingCart)) {
            
            $user = auth()->user();
            
            // Gunakan null coalescing operator (??) biar gak error kalau key gak ada
            $productId = $pendingCart['product_id'] ?? null;
            $qty = $pendingCart['qty'] ?? 1;

            if ($productId) { // Pastikan ID produk valid
                $existingCart = \App\Models\Cart::where('user_id', $user->id)
                    ->where('product_id', $productId)
                    ->first();
                
                $product = \App\Models\Product::find($productId);

                if ($product) {
                    if ($existingCart) {
                        $newQty = $existingCart->qty + $qty;
                        $existingCart->qty = $newQty > $product->stock ? $product->stock : $newQty;
                        $existingCart->save();
                    } else {
                        \App\Models\Cart::create([
                            'user_id' => $user->id,
                            'product_id' => $productId,
                            'qty' => $qty
                        ]);
                    }
                }
            }

            // Hapus sesi setelah diproses
            session()->forget('pending_cart');

            // Redirect Khusus Beli Sekarang (Prioritas Utama)
            if (isset($pendingCart['is_buy_now']) && $pendingCart['is_buy_now']) {
                return redirect()->route('cart.index', ['checked' => $productId]);
            }
        }
        // -----------------------------------------------------------------------


        // 3. --- LOGIKA REDIRECT BERDASARKAN ROLE ---
        // (Hanya jalan kalau BUKAN "Beli Sekarang")
        $role = $request->user()->role;

        if ($role === 'admin') {
            return redirect(route('admin.dashboard'));
        }

        if ($role === 'seller') {
            return redirect(route('seller.dashboard'));
        }

        // Kalau Customer biasa, lempar ke Homepage (bukan dashboard)
        return redirect()->intended('/');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}