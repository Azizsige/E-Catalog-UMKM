<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Models\Store;

class StoreController extends Controller
{
    // 1. Tampilkan Form Edit Profil Toko
    public function edit()
    {
        $user = Auth::user();
        
        // 1. Cek apakah user punya toko?
        // Kita pakai first() eksplisit biar pasti
        $store = \App\Models\Store::where('user_id', $user->id)->first();

        // 2. Kalau bener-bener gak punya, baru buatkan.
        if (!$store) {
            $store = \App\Models\Store::create([
                'user_id' => $user->id,
                'name' => $user->name,
                'slug' => \Illuminate\Support\Str::slug($user->name) . '-' . rand(100,999),
                'phone_number' => $user->phone,
            ]);
        }

        return Inertia::render('Seller/Store/Edit', [
            'store' => $store
        ]);
    }

    // 2. Proses Update Data Toko
    public function update(Request $request)
    {
        $user = Auth::user();
        $store = $user->store;

        // --- SELF HEALING (Jaga-jaga kalau toko belum ada saat di-save) ---
        if (!$store) {
            $store = \App\Models\Store::create([
                'user_id' => $user->id,
                'name' => $user->name,
                'slug' => Str::slug($user->name) . '-' . rand(100,999),
                'phone_number' => $user->phone,
            ]);
        }

        // Validasi Input
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'phone_number' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'logo' => 'nullable|image|max:1024', // Max 1MB
            'banner' => 'nullable|image|max:2048', // Max 2MB
        ]);

        $data = $request->only(['name', 'description', 'phone_number', 'address']);

        // Update Slug otomatis kalau ganti nama
        if ($request->name !== $store->name) {
            $data['slug'] = Str::slug($request->name) . '-' . Str::random(3);
        }

        // Handle Upload Logo
        if ($request->hasFile('logo')) {
            // Hapus logo lama jika ada
            if ($store->logo) Storage::disk('public')->delete($store->logo);
            $data['logo'] = $request->file('logo')->store('stores/logos', 'public');
        }

        // Handle Upload Banner
        if ($request->hasFile('banner')) {
            // Hapus banner lama jika ada
            if ($store->banner) Storage::disk('public')->delete($store->banner);
            $data['banner'] = $request->file('banner')->store('stores/banners', 'public');
        }

        $store->update($data);

        return redirect()->back()->with('message', 'Pengaturan toko berhasil disimpan!');
    }
}