<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Seller\DashboardController as SellerDashboardController;
use App\Models\Product;
use App\Http\Controllers\Public\ProductController as PublicProductController;
use App\Http\Controllers\Seller\StoreController as SellerStoreController;
use App\Http\Controllers\Public\StoreController as PublicStoreController;
use App\Http\Controllers\Public\CartController; // Import CartController biar rapi

// --- ROUTE PUBLIK ---
Route::get('/', [PublicProductController::class, 'index'])->name('home');
Route::get('/p/{slug}', [PublicProductController::class, 'show'])->name('product.detail');
Route::get('/toko/{slug}', [PublicStoreController::class, 'show'])->name('store.show');

// ❌ HAPUS BARIS INI DARI SINI (Karena ini area public)
// Route::post('/cart/add', [\App\Http\Controllers\Public\CartController::class, 'store'])->name('cart.add');


// --- ROUTE APPROVAL (Auth Only) ---
Route::get('/approval', function () {
    return Inertia::render('Auth/Approval'); 
})->name('approval.notice')->middleware('auth');


// --- GROUP ROUTE KHUSUS YANG SUDAH LOGIN ---
// Route di dalam sini WAJIB Login dulu
Route::middleware(['auth', 'verified'])->group(function () {

    // ✅ PINDAHKAN KESINI (Area Wajib Login)
    // Add to Cart
    Route::post('/cart/add', [CartController::class, 'store'])->name('cart.add');

    // Lihat Keranjang
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');

    Route::patch('/cart/{id}', [CartController::class, 'update'])->name('cart.update');
    
    // Hapus Item
    Route::delete('/cart/{id}', [CartController::class, 'destroy'])->name('cart.destroy');

    Route::get('/checkout', [\App\Http\Controllers\Public\CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/checkout/address', [\App\Http\Controllers\Public\CheckoutController::class, 'storeAddress'])->name('checkout.address.store');

    Route::delete('/checkout/address/{id}', [\App\Http\Controllers\Public\CheckoutController::class, 'destroyAddress'])->name('checkout.address.destroy');

    // BARU: Proses Buat Pesanan
    Route::post('/checkout/process', [\App\Http\Controllers\Public\CheckoutController::class, 'store'])->name('checkout.store');

    // Halaman List Pesanan Saya
    Route::get('/my-orders', [\App\Http\Controllers\Public\TransactionController::class, 'index'])->name('transactions.index');

    // BARU: Halaman Detail Transaksi / Pembayaran (Kita buat Controller-nya nanti)
    Route::get('/transaction/{id}', [\App\Http\Controllers\Public\TransactionController::class, 'show'])->name('transactions.show');


    // --- GRUP KHUSUS ADMIN ---
    Route::middleware(['role:admin', 'check.status'])->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
        Route::resource('/categories', \App\Http\Controllers\Admin\CategoryController::class)->names('admin.categories');
        Route::get('/store-approval', [\App\Http\Controllers\Admin\StoreApprovalController::class, 'index'])->name('admin.store-approval.index');
        Route::put('/store-approval/{user}/approve', [\App\Http\Controllers\Admin\StoreApprovalController::class, 'approve'])->name('admin.store-approval.approve');
        Route::delete('/store-approval/{user}/reject', [\App\Http\Controllers\Admin\StoreApprovalController::class, 'reject'])->name('admin.store-approval.reject');
    });

    // --- GRUP KHUSUS SELLER ---
    Route::middleware(['role:seller', 'check.status'])->prefix('seller')->group(function () {
        Route::get('/dashboard', [SellerDashboardController::class, 'index'])->name('seller.dashboard');
        Route::resource('/products', \App\Http\Controllers\Seller\ProductController::class)->names('seller.products');
        Route::post('/products/generate-ai', [\App\Http\Controllers\Seller\ProductController::class, 'generateDescription'])->name('seller.products.generate-ai');
        Route::get('/store/settings', [SellerStoreController::class, 'edit'])->name('seller.store.edit');
        Route::post('/store/settings', [SellerStoreController::class, 'update'])->name('seller.store.update');
    });

});

// ... sisa kode ke bawah aman ...
Route::get('/cek-model-ai', function () {
    try {
        $response = Gemini\Laravel\Facades\Gemini::models()->list();
        return response()->json($response);
    } catch (\Exception $e) {
        return "Error: " . $e->getMessage();
    }
});

require __DIR__.'/auth.php';