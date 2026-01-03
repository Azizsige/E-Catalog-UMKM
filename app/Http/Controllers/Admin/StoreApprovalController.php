<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StoreApprovalController extends Controller
{
    // 1. Menampilkan daftar toko yang Pending
    public function index()
    {
        $pendingSellers = User::where('role', 'seller')
            ->where('status', 'pending')
            ->latest()
            ->get();

        return Inertia::render('Admin/Store/Approval', [
            'sellers' => $pendingSellers
        ]);
    }

    // 2. Aksi Menyetujui (Approve)
    public function approve(User $user)
    {
        $user->update(['status' => 'active']);

        return redirect()->back()
            ->with('message', 'Toko berhasil disetujui! Seller sekarang bisa login.');
    }
    
    // 3. Aksi Menolak (Hapus Akun) - Opsional
    public function reject(User $user)
    {
        $user->delete();

        return redirect()->back()
            ->with('message', 'Pengajuan toko ditolak dan data dihapus.');
    }
}