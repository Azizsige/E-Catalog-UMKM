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
        $store = Store::where('user_id', $user->id)->first();

        // 2. Kalau bener-bener gak punya, baru buatkan (Self Healing)
        if (!$store) {
            $store = Store::create([
                'user_id' => $user->id,
                'name' => $user->name,
                'slug' => Str::slug($user->name) . '-' . rand(100,999),
                'phone_number' => $user->phone, // Pastikan di tabel user ada kolom phone, atau hapus baris ini jika error
                'checkout_mode' => 'midtrans', // Default mode
            ]);
        }

        return Inertia::render('Seller/Store/Edit', [
            'store' => $store
        ]);
    }

    // 2. Proses Update Data Toko (MERGED VERSION)
    public function update(Request $request)
    {
        $user = Auth::user();
        $store = $user->store;

        // --- SELF HEALING (Jaga-jaga kalau toko belum ada saat di-save) ---
        if (!$store) {
            $store = Store::create([
                'user_id' => $user->id,
                'name' => $user->name,
                'slug' => Str::slug($user->name) . '-' . rand(100,999),
                'checkout_mode' => 'midtrans',
            ]);
        }

        // --- VALIDASI (UPDATE: Tambah checkout_mode) ---
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'nullable|string',
            'logo' => 'nullable|image|max:1024', // Max 1MB
            'banner' => 'nullable|image|max:2048', // Max 2MB
            
            // LOGIC BARU: Validasi Mode Checkout
            'checkout_mode' => 'required|in:midtrans,whatsapp',
            // Jika pilih WA, nomor HP Wajib diisi
            'phone_number' => 'nullable|required_if:checkout_mode,whatsapp|string|max:20', 
        ]);

        // Ambil semua data input yang diperbolehkan
        $data = $request->only([
            'name', 
            'description', 
            'phone_number', 
            'address', 
            'checkout_mode' // <--- Jangan lupa masukkan ini
        ]);

        // Update Slug otomatis kalau ganti nama
        if ($request->name !== $store->name) {
            $data['slug'] = Str::slug($request->name) . '-' . Str::random(3);
        }

        // Handle Upload Logo (Kode Lama Tetap Ada)
        if ($request->hasFile('logo')) {
            if ($store->logo) Storage::disk('public')->delete($store->logo);
            $data['logo'] = $request->file('logo')->store('stores/logos', 'public');
        }

        // Handle Upload Banner (Kode Lama Tetap Ada)
        if ($request->hasFile('banner')) {
            if ($store->banner) Storage::disk('public')->delete($store->banner);
            $data['banner'] = $request->file('banner')->store('stores/banners', 'public');
        }

        // Eksekusi Update
        $store->update($data);

        return redirect()->back()->with('message', 'Pengaturan toko berhasil disimpan!');
    }
}