<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StoreApprovalController extends Controller
{
    // 1. Menampilkan daftar toko yang Pending BESERTA detail tokonya
    public function index()
    {
        $pendingSellers = User::with('store') // <--- PENTING: Load relasi store
            ->where('role', 'seller')
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
        // Ubah status jadi 'active' agar bisa login & akses dashboard
        $user->update(['status' => 'active']);

        return redirect()->back()
            ->with('message', 'Toko berhasil disetujui! Seller sekarang statusnya Active.');
    }
    
    // 3. Aksi Menolak (Hapus Akun)
    public function reject(User $user)
{
    // Jangan delete(), tapi ubah status
    $user->update(['status' => 'rejected']); 

    return redirect()->back()
        ->with('message', 'Pengajuan toko ditolak. Status seller diubah menjadi Rejected.');
}
}