<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     */
    public function store(Request $request): RedirectResponse
    {
        // 1. Cek dulu, jangan-jangan user iseng klik tombol ini padahal udah verif
        if ($request->user()->hasVerifiedEmail()) {
            // Kalau udah verif, lempar ke dashboard masing-masing (Logic Pintar)
            return $this->redirectBasedOnRole($request->user());
        }

        // 2. Kalau belum verif, baru kirim email
        $request->user()->sendEmailVerificationNotification();

        // 3. Balik ke halaman sebelumnya dengan pesan sukses
        return back()->with('status', 'verification-link-sent');
    }

    /**
     * Helper Redirect (Sama persis dengan yang di VerifyEmailController)
     */
    protected function redirectBasedOnRole($user)
    {
        if ($user->role === 'admin') {
            return redirect()->intended(route('admin.dashboard'));
        }

        if ($user->role === 'seller') {
            return redirect()->intended(route('seller.dashboard'));
        }

        return redirect()->intended(route('home'));
    }
}