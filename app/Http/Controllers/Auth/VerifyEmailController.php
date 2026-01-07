<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        // 1. Kalau user klik link tapi sebenernya udah verif sebelumnya
        if ($request->user()->hasVerifiedEmail()) {
            return $this->redirectBasedOnRole($request->user());
        }

        // 2. Proses Verifikasi (Update database)
        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));
        }

        // 3. Redirect sesuai Role
        return $this->redirectBasedOnRole($request->user());
    }

    /**
     * Helper untuk menentukan tujuan redirect
     */
    protected function redirectBasedOnRole($user)
    {
        // Parameter ?verified=1 itu bawaan Laravel biar bisa nampilin notif sukses (opsional)
        
        if ($user->role === 'admin') {
            return redirect()->intended(route('admin.dashboard') . '?verified=1');
        }

        if ($user->role === 'seller') {
            // Arahkan ke dashboard seller. 
            // Tenang, kalau statusnya masih 'pending', Middleware 'check.status' 
            // kamu yang canggih itu akan otomatis membelokkan dia ke halaman tunggu.
            return redirect()->intended(route('seller.dashboard') . '?verified=1');
        }

        // Default: Customer lempar ke Home
        return redirect()->intended(route('home') . '?verified=1');
    }
}