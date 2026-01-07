<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserStatus
{
    public function handle(Request $request, Closure $next)
    {
        // 1. Cek apakah user login
        if (!Auth::check()) {
            return $next($request);
        }

        $user = Auth::user();

        // --- [BARU] FITUR BANNED USER ---
        // Cek kolom 'is_active'. Jika 0 (false), tendang keluar!
        if ($user->is_active == 0) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'email' => 'Akun Anda telah dinonaktifkan oleh Admin. Silakan hubungi support.',
            ]);
        }

        // --- FITUR LAMA (SELLER FLOW) ---
        // Hanya jalankan logic ini kalau user adalah SELLER
        if ($user->role === 'seller') {
            $store = $user->store;
            
            // Safety check: Kalau role seller tapi belum punya record store di db
            if (!$store) {
                 return $next($request); 
            }

            // Kita ambil status dari tabel STORES (sesuai update controller tadi)
            // Bukan $user->status, tapi $store->status
            $storeStatus = $store->status; 
            
            // Cek kelengkapan data
            $hasFilledStoreData = !empty($store->address);

            // 1. Jika PENDING dan BELUM isi data -> Penjara di Settings
            if ($storeStatus === 'pending' && !$hasFilledStoreData) {
                if (!$request->routeIs('seller.store.settings') && !$request->routeIs('seller.store.update')) {
                    return redirect()->route('seller.store.settings');
                }
            } 
            // 2. Jika PENDING tapi SUDAH isi data -> Penjara di Approval Notice
            elseif ($storeStatus === 'pending' && $hasFilledStoreData) {
                if (!$request->routeIs('approval.notice')) {
                    return redirect()->route('approval.notice');
                }
            } 
            // 3. Jika REJECTED -> Penjara di Halaman Rejected
            elseif ($storeStatus === 'rejected') {
                if (!$request->routeIs('seller.rejected')) {
                    return redirect()->route('seller.rejected');
                }
            }
            // 4. Jika SUSPENDED (Toko dibekukan Admin) -> Penjara
            elseif ($storeStatus === 'suspended') {
                 // Bisa diarahkan ke halaman rejected atau suspended khusus
                 if (!$request->routeIs('seller.rejected')) {
                    return redirect()->route('seller.rejected');
                }
            }
        }

        return $next($request);
    }
}