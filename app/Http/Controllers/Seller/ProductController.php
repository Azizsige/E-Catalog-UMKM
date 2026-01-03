<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage; // Buat upload gambar
use Illuminate\Support\Str; // Buat bikin slug otomatis
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with('category')
            ->where('user_id', Auth::id())
            ->latest()
            ->get();

        return Inertia::render('Seller/Product/Index', [
            'products' => $products
        ]);
    }

    // 1. Tampilkan Form Tambah Produk
    public function create()
    {
        // Kita butuh data kategori buat Dropdown
        $categories = Category::all();
        return Inertia::render('Seller/Product/Create', [
            'categories' => $categories
        ]);
    }

    // 2. Proses Simpan Data
    public function store(Request $request)
    {
        // Validasi Input
        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048', // Max 2MB
        ]);

        // Handle Upload Gambar
        $imagePath = null;
        if ($request->hasFile('image')) {
            // Simpan ke folder 'products' di storage public
            $imagePath = $request->file('image')->store('products', 'public');
        }

        // Simpan ke Database
        Product::create([
            'user_id' => Auth::id(), // Otomatis set pemiliknya seller yg login
            'category_id' => $request->category_id,
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . Str::random(5), // Slug unik
            'price' => $request->price,
            'stock' => $request->stock,
            'description' => $request->description,
            'image' => $imagePath,
            'is_active' => true,
        ]);

        return redirect()->route('seller.products.index')
            ->with('message', 'Produk berhasil ditambahkan!');
    }

    // 3. Tampilkan Form Edit
    public function edit(Product $product)
    {
        // Pastikan yang diedit adalah produk miliknya sendiri
        if ($product->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('Seller/Product/Edit', [
            'product' => $product,
            'categories' => Category::all()
        ]);
    }

    // 4. Proses Update Data
    public function update(Request $request, Product $product)
    {
        // Security Check
        if ($product->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $data = $request->only(['name', 'category_id', 'price', 'stock', 'description']);

        // Jika user upload gambar baru
        if ($request->hasFile('image')) {
            // Hapus gambar lama jika ada
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            // Upload gambar baru
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        // Update slug jika nama berubah
        if ($request->name !== $product->name) {
            $data['slug'] = Str::slug($request->name) . '-' . Str::random(5);
        }

        $product->update($data);

        return redirect()->route('seller.products.index')
            ->with('message', 'Produk berhasil diperbarui!');
    }

    // 5. Hapus Produk
    public function destroy(Product $product)
    {
        if ($product->user_id !== Auth::id()) {
            abort(403);
        }

        // Hapus file gambar dari storage
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return redirect()->back()
            ->with('message', 'Produk berhasil dihapus.');
    }
}