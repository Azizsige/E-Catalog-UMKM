<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function show($slug)
    {
        // Cari produk berdasarkan slug
        // Load relasi seller & category
        $product = Product::with(['seller', 'category'])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail(); // Kalau gak ketemu, otomatis 404

        return Inertia::render('Product/Show', [
            'product' => $product
        ]);
    }
}