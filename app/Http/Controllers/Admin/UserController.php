<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        // 1. Filter Keyword (Nama/Email)
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        // 2. Filter Role (BARU)
        if ($request->has('role') && $request->role != '') {
            $query->where('role', $request->role);
        }

        $users = $query->latest()->paginate(10);

        return Inertia::render('Admin/User/Index', [
            'users' => $users,
            // Kembalikan state filter ke frontend biar gak hilang pas refresh
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    // Update pesan feedback biar lebih sopan
    public function toggleStatus($id)
    {
        $user = User::findOrFail($id);
        
        if($user->id == auth()->id()) {
            return back()->with('error', 'Tidak bisa menonaktifkan akun sendiri!');
        }

        $user->is_active = !$user->is_active;
        $user->save();

        $status = $user->is_active ? 'diaktifkan kembali' : 'dinonaktifkan';
        return back()->with('message', "User berhasil $status.");
    }
}