<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

class ProductController extends Controller
{
    // --- METHOD HOMEPAGE ---
    public function index(Request $request)
    {
        // 1. Ambil Produk, cukup filter yang aktif aja.
        // Hapus "whereHas('store', ... status approved)" karena ini aplikasi 1 toko
        $query = Product::with(['category'])
            ->where('is_active', true);

        // 2. Logic Search (Tetap)
        if ($request->has('search') && $request->search != '') {
            $keyword = $request->search;
            $query->where(function($q) use ($keyword) {
                $q->where('name', 'like', '%' . $keyword . '%')
                  ->orWhere('description', 'like', '%' . $keyword . '%');
            });
        }

        // 3. Logic Filter Kategori (Tetap)
        if ($request->has('category') && $request->category != '') {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        $products = $query->latest()->get();
        $categories = Category::all();

        $store = \App\Models\Store::latest('updated_at')->first();

        return Inertia::render('Welcome', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category']),
            'storeInfo' => $store,
            // canLogin & canRegister kita biarkan aja jaga-jaga kalau dibutuhkan di frontend
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
        ]);
    }

    // --- METHOD DETAIL PRODUK ---
    public function show($slug)
    {
        // 1. Ambil detail produk
        $product = Product::with(['category', 'images'])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        // 2. Ambil produk serupa (dari kategori yang sama)
        $relatedProducts = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('is_active', true)
            ->limit(4)
            ->inRandomOrder()
            ->get();

        return Inertia::render('Product/Show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts
        ]);
    }
}