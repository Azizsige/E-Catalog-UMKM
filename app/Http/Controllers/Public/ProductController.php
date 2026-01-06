<?php

namespace App\Http\Controllers\Public;
use App\Models\Category; // <--- Jangan lupa import ini
use Illuminate\Http\Request; // <--- Dan ini

use App\Http\Controllers\Controller;
use App\Models\Product;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

class ProductController extends Controller
{

    // --- METHOD BARU: HOMEPAGE ---
    public function index(Request $request)
    {
        // Query Dasar
        // PERBAIKAN 1: Ganti 'seller' menjadi 'store'
        $query = Product::with(['category', 'store'])
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
            'filters' => $request->only(['search', 'category']),
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
        ]);
    }

    public function show($slug)
    {
        $product = Product::with(['category', 'store', 'images'])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        // 👇 LOGIC BARU: AMBIL PRODUK SERUPA 👇
        $relatedProducts = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id) // Jangan tampilkan produk yg lagi dibuka
            ->where('is_active', true)
            ->limit(4) // Ambil 4 aja
            ->inRandomOrder() // Acak biar fresh
            ->get();

        return Inertia::render('Product/Show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts // <-- Kirim ke Props
        ]);
    }
}