<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserStatus
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        // 1. Cek apakah user sudah login?
        if (auth()->check()) {
            
            // 2. Ambil data user
            $user = auth()->user();

            // 3. Kalau statusnya PENDING, dan dia BUKAN sedang di halaman 'approval'
            // (Kita harus kasih pengecualian biar gak looping redirect terus)
            if ($user->status === 'pending' && !$request->routeIs('approval.notice')) {
                return redirect()->route('approval.notice');
            }

            // 4. Kalau statusnya SUSPENDED/DIBLOKIR (Opsional buat masa depan)
            if ($user->status === 'suspended') {
                 auth()->guard('web')->logout();
                 $request->session()->invalidate();
                 $request->session()->regenerateToken();
                 return redirect()->route('login')->with('error', 'Akun Anda dibekukan.');
            }
        }

        return $next($request);
    }
}
