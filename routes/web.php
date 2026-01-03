<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Seller\DashboardController as SellerDashboardController;
use App\Models\Product;
use App\Http\Controllers\Public\ProductController as PublicProductController;

Route::get('/', function () {
    // Ambil produk yang Active, urutkan terbaru
    $products = Product::with('category', 'seller') // Load relasi biar nama seller & kategori muncul
        ->where('is_active', true)
        ->latest()
        ->get();

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'products' => $products, // <--- Lempar data produk ke Frontend
    ]);
});

Route::get('/approval', function () {
    // Cukup Inertia::render, jangan Inertia\Inertia::render
    return Inertia::render('Auth/Approval'); 
})->name('approval.notice')->middleware('auth');

// Group Route untuk yang SUDAH LOGIN (Auth)
Route::middleware(['auth', 'verified'])->group(function () {

    // --- GRUP KHUSUS ADMIN ---
    // Semua route di dalam sini otomatis dijaga oleh:
    // 1. role:admin (Hanya Admin)
    // 2. check.status (Hanya yang Active)
    Route::middleware(['role:admin', 'check.status'])->prefix('admin')->group(function () {
        
        // Dashboard Admin
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])
            ->name('admin.dashboard');

        // CRUD Categories (Sekarang aman, ikut terjaga!)
        Route::resource('/categories', \App\Http\Controllers\Admin\CategoryController::class)
            ->names('admin.categories');

            // --- TAMBAHAN BARU: STORE APPROVAL ---
        Route::get('/store-approval', [\App\Http\Controllers\Admin\StoreApprovalController::class, 'index'])
            ->name('admin.store-approval.index');
            
        Route::put('/store-approval/{user}/approve', [\App\Http\Controllers\Admin\StoreApprovalController::class, 'approve'])
            ->name('admin.store-approval.approve');

        Route::delete('/store-approval/{user}/reject', [\App\Http\Controllers\Admin\StoreApprovalController::class, 'reject'])
            ->name('admin.store-approval.reject');

        // Nanti route admin lainnya (validasi toko, user, dll) taruh sini...
    });


    // --- GRUP KHUSUS SELLER ---
    Route::middleware(['role:seller', 'check.status'])->prefix('seller')->group(function () {
        
        Route::get('/dashboard', [SellerDashboardController::class, 'index'])
            ->name('seller.dashboard');
            
        // --- TAMBAHAN BARU: PRODUK SAYA ---
        Route::resource('/products', \App\Http\Controllers\Seller\ProductController::class)
            ->names('seller.products'); // Ini ngasih nama route otomatis: seller.products.index, store, dll
    });

});

Route::get('/p/{slug}', [PublicProductController::class, 'show'])->name('product.detail');

require __DIR__.'/auth.php';
