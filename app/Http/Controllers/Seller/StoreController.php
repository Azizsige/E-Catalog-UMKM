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
    public function edit()
    {
        $user = Auth::user();
        
        // Cari toko berdasarkan user_id
        $store = Store::where('user_id', $user->id)->first();

        // Self Healing: Jika belum punya, buatkan otomatis
        if (!$store) {
            $store = Store::create([
                'user_id' => $user->id,
                'name' => 'Toko ' . $user->name,
                'slug' => Str::slug($user->name) . '-' . rand(100,999),
                'phone_number' => $user->phone ?? '',
                'checkout_mode' => 'midtrans',
            ]);
        }

        return Inertia::render('Seller/Store/Edit', [
            'store' => $store
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();
        $store = $user->store;

        // 1. Validasi Input (LENGKAP)
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'phone_number' => 'required|string',
            'description' => 'nullable|string',
            // Data Baru
            'checkout_mode' => 'required|in:midtrans,whatsapp',
            'bank_name' => 'nullable|string|max:50',
            'bank_account' => 'nullable|string|max:100',
            // Gambar
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'banner' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Tambahan banner
        ]);

        // 2. Handle Upload Logo
        if ($request->hasFile('logo')) {
            if ($store->logo) {
                Storage::disk('public')->delete($store->logo);
            }
            $validated['logo'] = $request->file('logo')->store('store-logos', 'public');
        }

        // 3. Handle Upload Banner (Baru)
        if ($request->hasFile('banner')) {
            if ($store->banner) {
                Storage::disk('public')->delete($store->banner);
            }
            $validated['banner'] = $request->file('banner')->store('store-banners', 'public');
        }

        // 4. Update Slug (Jika nama berubah)
        if ($request->name !== $store->name) {
            $validated['slug'] = Str::slug($request->name) . '-' . Str::random(5);
        }

        // 5. Update Database
        // Kita pakai variabel $validated karena isinya sudah bersih dan lengkap
        $store->update($validated); 

        // 6. Redirect (Balik ke halaman edit saja, JANGAN ke approval)
        return redirect()->back()->with('message', 'Pengaturan toko berhasil disimpan!');
    }
}