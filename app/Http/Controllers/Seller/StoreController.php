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

    // 1. Validasi Input
    $data = $request->validate([
        'name' => 'required|string|max:255', // Pastikan form React kirim 'name', bukan 'store_name'
        'address' => 'required|string',
        'phone_number' => 'required|string',
        'description' => 'nullable|string',
        'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    ]);

    // 2. Handle Upload Logo (Jika ada)
    if ($request->hasFile('logo')) {
        // Hapus logo lama jika ada
        if ($store->logo) {
            Storage::disk('public')->delete($store->logo);
        }
        $data['logo'] = $request->file('logo')->store('store-logos', 'public');
    }

    // 3. Update Slug (Biar URL tokonya ikut berubah kalau nama berubah)
    // Cek apakah nama berubah?
    if ($request->name !== $store->name) {
        $data['slug'] = Str::slug($request->name) . '-' . Str::random(5);
    }

    // 4. Update Database
    $store->update($data); 

    // 5. Reset Status & Redirect
    $user->update(['status' => 'pending']);

    return redirect()->route('approval.notice')
        ->with('message', 'Perbaikan data disimpan!');
}
}