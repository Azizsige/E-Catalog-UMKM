<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Product;
use Inertia\Inertia;

class StoreController extends Controller
{
    // Ubah parameter dari $id jadi $slug
    public function show($slug)
    {
        // 1. Cari Toko berdasarkan SLUG
        $store = \App\Models\Store::with('user')
            ->where('slug', $slug)
            ->firstOrFail();

        $seller = $store->user;

        // 2. Ambil produk milik seller ini
        // KITA HAPUS PENCARIAN 'store_id' KARENA KOLOMNYA BELUM ADA
        $products = \App\Models\Product::with('category')
            ->where('user_id', $seller->id) // <--- Cukup pakai ini
            ->where('is_active', true)
            ->latest()
            ->get();

        return Inertia::render('Store/Show', [
            'seller' => $seller,
            'store' => $store, 
            'products' => $products
        ]);
    }
}