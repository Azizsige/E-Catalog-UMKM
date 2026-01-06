<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserStatus
{
    // app/Http/Middleware/CheckUserStatus.php

public function handle(Request $request, Closure $next)
{
    if (!Auth::check()) return $next($request);

    $user = Auth::user();
    $store = $user->store;

    if ($user->role === 'seller') {
        // Cek apakah sudah isi alamat toko
        $hasFilledStoreData = $store && !empty($store->address);

        // Jika PENDING dan BELUM isi data -> Penjara di halaman Settings
        if ($user->status === 'pending' && !$hasFilledStoreData) {
            if (!$request->is('seller/store/settings*')) {
                return redirect()->route('seller.store.edit');
            }
        } 
        // Jika PENDING tapi SUDAH isi data -> Penjara di halaman Approval
        elseif ($user->status === 'pending' && $hasFilledStoreData) {
            if (!$request->is('approval')) {
                return redirect()->route('approval.notice');
            }
        } elseif ($user->status === 'rejected') {
    // Kita arahkan ke halaman khusus penolakan
    if (!$request->routeIs('seller.rejected')) {
        return redirect()->route('seller.rejected');
    }
}
    }

    return $next($request);
}
}