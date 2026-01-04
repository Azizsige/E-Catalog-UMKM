<?php

namespace App\Http\Controllers\Public;
use App\Models\Category; // <--- Jangan lupa import ini
use Illuminate\Http\Request; // <--- Dan ini

use App\Http\Controllers\Controller;
use App\Models\Product;
use Inertia\Inertia;

class ProductController extends Controller
{

    // --- METHOD BARU: HOMEPAGE ---
    public function index(Request $request)
    {
        // Query Dasar
        $query = Product::with(['category', 'seller'])
            ->where('is_active', true);

        // 1. Logic Search (Kalau ada input search)
        if ($request->has('search') && $request->search != '') {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // 2. Logic Filter Kategori (Kalau ada input category slug)
        if ($request->has('category') && $request->category != '') {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // Eksekusi Query
        $products = $query->latest()->get();

        // Ambil semua kategori buat tombol filter
        $categories = Category::all();

        return Inertia::render('Welcome', [
            'products' => $products,
            'categories' => $categories,
            // Balikin lagi filter yang dipilih ke frontend biar input gak reset
            'filters' => $request->only(['search', 'category']),
            'canLogin' => \Illuminate\Support\Facades\Route::has('login'),
            'canRegister' => \Illuminate\Support\Facades\Route::has('register'),
        ]);
    }

    public function show($slug)
    {
        // Cari produk berdasarkan slug
        // Load relasi seller & category
        $product = Product::with(['category', 'seller.store'])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail(); // Kalau gak ketemu, otomatis 404

        return Inertia::render('Product/Show', [
            'product' => $product
        ]);
    }
}