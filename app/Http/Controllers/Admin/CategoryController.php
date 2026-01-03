<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str; // <--- PENTING: Untuk bikin slug otomatis
use Illuminate\Support\Facades\Storage; // <--- PENTING: Untuk upload gambar

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::latest()->get();

        return Inertia::render('Admin/Category/Index', [
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        // 1. Validasi Input
        $request->validate([
            'name' => 'required|string|max:255',
            'icon' => 'required|image|mimes:jpeg,png,jpg,svg|max:2048', // Max 2MB
        ]);

        // 2. Upload Gambar
        // Gambar akan disimpan di folder: storage/app/public/categories
        $iconPath = $request->file('icon')->store('categories', 'public');

        // 3. Simpan ke Database
        Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name), // Contoh: "Makanan Ringan" jadi "makanan-ringan"
            'icon' => $iconPath,
        ]);

        // 4. Kembali ke halaman index
        return redirect()->route('admin.categories.index')
            ->with('message', 'Kategori berhasil ditambahkan!');
    }

    public function update(Request $request, Category $category)
    {
        // 1. Validasi (Icon jadi nullable/tidak wajib karena user mungkin gak ganti gambar)
        $request->validate([
            'name' => 'required|string|max:255',
            'icon' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:2048',
        ]);

        $data = [
            'name' => $request->name,
            'slug' => Str::slug($request->name),
        ];

        // 2. Cek apakah user upload gambar baru?
        if ($request->hasFile('icon')) {
            // Hapus gambar lama dulu biar bersih
            if ($category->icon) {
                Storage::disk('public')->delete($category->icon);
            }
            // Upload gambar baru
            $data['icon'] = $request->file('icon')->store('categories', 'public');
        }

        // 3. Update database
        $category->update($data);

        return redirect()->route('admin.categories.index')
            ->with('message', 'Kategori berhasil diperbarui!');
    }

    public function destroy(Category $category)
    {
        // 1. Hapus gambar fisiknya
        if ($category->icon) {
            Storage::disk('public')->delete($category->icon);
        }

        // 2. Hapus datanya
        $category->delete();

        return redirect()->route('admin.categories.index')
            ->with('message', 'Kategori berhasil dihapus!');
    }
}