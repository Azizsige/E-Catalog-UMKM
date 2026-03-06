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
use Gemini\Laravel\Facades\Gemini;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        // 1. Siapkan query dasar
        $query = Product::with('category')->where('user_id', Auth::id())->latest();

        // 2. Logic Filter Pencarian Nama
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // 3. Logic Filter Kategori Dropdown
        if ($request->filled('category_id') && $request->category_id !== 'all') {
            $query->where('category_id', $request->category_id);
        }

        // 4. PENTING: Gunakan paginate(10) bukan get()
        // Ini yang bikin products.data.map di React bisa jalan
        $products = $query->paginate(10)->withQueryString();
        
        // Ambil data kategori untuk isi dropdown filter
        $categories = Category::orderBy('name')->get();

        return Inertia::render('Seller/Product/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id']),
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
        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|numeric|min:0',
            'description' => 'required|string',
            'video_url' => 'nullable|url',
            
            // Validasi Main Image (Wajib 1)
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            
            // Validasi Gallery (Boleh banyak, max 5 foto misalnya)
            'extra_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        // 1. Upload Main Image (Thumbnail Utama)
        $mainImagePath = null;
        if ($request->hasFile('image')) {
            $mainImagePath = $request->file('image')->store('products', 'public');
        }

        // 2. Simpan Data Produk Utama
        $product = \App\Models\Product::create([
            'user_id'     => auth()->id(),
            'category_id' => $request->category_id,
            'name'        => $request->name,
            'slug'        => Str::slug($request->name) . '-' . Str::random(5),
            'price'       => $request->price,
            'stock'       => $request->stock,
            'description' => $request->description,
            'image'       => $mainImagePath, // Foto Utama
            'video_url'   => $request->video_url,
            'is_active'   => true,
        ]);

        // 3. Upload Gallery Images (Looping)
        if ($request->hasFile('extra_images')) {
            foreach ($request->file('extra_images') as $file) {
                $path = $file->store('product_galleries', 'public');
                
                // Masukkan ke tabel product_images
                \App\Models\ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path
                ]);
            }
        }

        return redirect()->route('admin.products.index')->with('message', 'Produk berhasil ditambahkan!');
    }

    // 3. Tampilkan Form Edit
    public function edit(Product $product)
    {
        // Pastikan yang diedit adalah produk miliknya sendiri
        if ($product->user_id !== Auth::id()) {
            abort(403);
        }

        $product->load('images'); 

        return Inertia::render('Seller/Product/Edit', [
            'product' => $product,
            'categories' => Category::all()
        ]);
    }

    // 4. Proses Update Data
    public function update(Request $request, Product $product)
    {
        // 1. Security Check
        if ($product->user_id !== Auth::id()) {
            abort(403);
        }

        // 2. Validasi
        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'video_url' => 'nullable|url',
            
            // Validasi Image
            'image' => 'nullable|image|max:2048', // Main Image
            'extra_images.*' => 'nullable|image|max:2048', // Gallery Baru
            'deleted_images' => 'nullable|array', // List ID Gallery yg dihapus
        ]);

        // 3. Update Data Utama (Tanpa Gambar dulu)
        $data = $request->only(['name', 'category_id', 'price', 'stock', 'description', 'video_url']);
        
        // Update slug cuma kalau nama berubah
        if ($request->name !== $product->name) {
            $data['slug'] = Str::slug($request->name) . '-' . Str::random(5);
        }

        // 4. Handle Ganti Main Image (Thumbnail)
        if ($request->hasFile('image')) {
            // Hapus file lama di storage
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            // Upload baru
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($data);

        // 5. Handle Hapus Galeri Lama (Sesuai request frontend)
        if ($request->deleted_images) {
            foreach ($request->deleted_images as $imageId) {
                $gallery = \App\Models\ProductImage::find($imageId);
                // Pastikan gambar ini beneran punya produk ini (Security)
                if ($gallery && $gallery->product_id == $product->id) {
                    // Hapus file fisik
                    Storage::disk('public')->delete($gallery->image_path);
                    // Hapus record DB
                    $gallery->delete();
                }
            }
        }

        // 6. Handle Tambah Galeri Baru
        if ($request->hasFile('extra_images')) {
            foreach ($request->file('extra_images') as $file) {
                $path = $file->store('product_galleries', 'public');
                \App\Models\ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path
                ]);
            }
        }

        return redirect()->route('admin.products.index')
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

    // --- FITUR MAGIC DESCRIPTION (AI) ---
    public function generateDescription(Request $request)
    {
        // 1. Validasi: Harus ada nama produk minimal biar AI tau mau bikin apa
        $request->validate([
            'name' => 'required|string|min:3',
            'keywords' => 'nullable|string' // Opsional: kata kunci tambahan
        ]);

        $name = $request->name;
        $keywords = $request->keywords ? "Fokus pada keunggulan: " . $request->keywords : "";

        // 2. Siapkan Mantra (Prompt) untuk Gemini
        // Kita suruh dia jadi Copywriter handal
        $prompt = "
            Bertindaklah sebagai Copywriter Profesional untuk E-Commerce.
            Tuliskan deskripsi penjualan yang SANGAT MENARIK, PERSUASIF, dan MENGGUGAH SELERA untuk produk bernama: '{$name}'.
            {$keywords}
            
            Panduan:
            - Gunakan Bahasa Indonesia yang luwes, akrab, tapi tetap sopan.
            - Gunakan teknik copywriting AIDA (Attention, Interest, Desire, Action).
            - Sertakan emoji yang relevan biar seru.
            - Buat paragraf pendek-pendek biar enak dibaca di HP.
            - Jangan terlalu panjang, cukup 100-150 kata.
            - Output hanya teks deskripsi saja, tanpa pembuka 'Tentu, ini deskripsinya...'.
        ";

        try {
            // 3. Kirim ke Gemini
            // Kita panggil model secara spesifik pakai nama string 'gemini-2.5-flash'
            $result = Gemini::generativeModel('gemini-2.5-flash')->generateContent($prompt);
            
            // 4. Ambil teks balasannya
            $generatedText = $result->text();

            return response()->json([
                'success' => true,
                'description' => $generatedText
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghubungi AI: ' . $e->getMessage()
            ], 500);
        }
    }
}