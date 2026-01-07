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
        $query = Product::with(['category', 'store'])
            ->where('is_active', true)
            // 👇 PERBAIKAN DISINI: Tambahkan 'stores.' sebelum 'status'
            ->whereHas('store', function($q) {
                $q->where('stores.status', 'approved'); 
            });

        // 1. Logic Search
        if ($request->has('search') && $request->search != '') {
            $keyword = $request->search;
            $query->where(function($q) use ($keyword) {
                $q->where('name', 'like', '%' . $keyword . '%')
                  ->orWhere('description', 'like', '%' . $keyword . '%');
            });
        }

        // 2. Logic Filter Kategori
        if ($request->has('category') && $request->category != '') {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        $products = $query->latest()->get();
        $categories = Category::all();

        return Inertia::render('Welcome', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category']),
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
        ]);
    }

    // --- METHOD DETAIL PRODUK ---
    public function show($slug)
    {
        $product = Product::with(['category', 'store', 'images'])
            ->where('slug', $slug)
            ->where('is_active', true)
            // 👇 PERBAIKAN DISINI JUGA
            ->whereHas('store', function($q) {
                $q->where('stores.status', 'approved');
            })
            ->firstOrFail();

        $relatedProducts = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('is_active', true)
            // 👇 PERBAIKAN DISINI JUGA
            ->whereHas('store', function($q) {
                $q->where('stores.status', 'approved');
            })
            ->limit(4)
            ->inRandomOrder()
            ->get();

        return Inertia::render('Product/Show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts
        ]);
    }
}