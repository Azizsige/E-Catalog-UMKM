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
                'phone_number' => $user->phone ?? '', // Aman meskipun user.phone kosong
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

        if (!$store) {
            $store = Store::create([
                'user_id' => $user->id,
                'name' => $user->name,
                'slug' => Str::slug($user->name) . '-' . rand(100,999),
                'checkout_mode' => 'midtrans',
            ]);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'nullable|string',
            'logo' => 'nullable|image|max:1024',
            'banner' => 'nullable|image|max:2048',
            'checkout_mode' => 'required|in:midtrans,whatsapp',
            'phone_number' => 'nullable|required_if:checkout_mode,whatsapp|string|max:20', 
        ]);

        $data = $request->only(['name', 'description', 'phone_number', 'address', 'checkout_mode']);

        if ($request->name !== $store->name) {
            $data['slug'] = Str::slug($request->name) . '-' . Str::random(3);
        }

        if ($request->hasFile('logo')) {
            if ($store->logo) Storage::disk('public')->delete($store->logo);
            $data['logo'] = $request->file('logo')->store('stores/logos', 'public');
        }

        if ($request->hasFile('banner')) {
            if ($store->banner) Storage::disk('public')->delete($store->banner);
            $data['banner'] = $request->file('banner')->store('stores/banners', 'public');
        }

        $store->update($data);

    // Ubah bagian ini:
    return redirect()->route('approval.notice')
        ->with('message', 'Profil toko berhasil disimpan! Mohon tunggu verifikasi admin.');
    }
}