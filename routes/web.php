<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Seller\DashboardController as SellerDashboardController;
use App\Models\Product;
use App\Http\Controllers\Public\ProductController as PublicProductController;

// --- PERBAIKAN 1: KITA PAKAI ALIAS BIAR JELAS ---
use App\Http\Controllers\Seller\StoreController as SellerStoreController;
use App\Http\Controllers\Public\StoreController as PublicStoreController;

// --- ROUTE PUBLIK ---
Route::get('/', [PublicProductController::class, 'index'])->name('home');

// Route Detail Produk
Route::get('/p/{slug}', [PublicProductController::class, 'show'])->name('product.detail');

// Route Profil Toko (Gunakan PublicStoreController)
Route::get('/toko/{slug}', [PublicStoreController::class, 'show'])->name('store.show');


// --- ROUTE APPROVAL (Auth Only) ---
Route::get('/approval', function () {
    return Inertia::render('Auth/Approval'); 
})->name('approval.notice')->middleware('auth');


// --- GROUP ROUTE KHUSUS YANG SUDAH LOGIN ---
Route::middleware(['auth', 'verified'])->group(function () {

    // --- GRUP KHUSUS ADMIN ---
    Route::middleware(['role:admin', 'check.status'])->prefix('admin')->group(function () {
        
        // Dashboard Admin
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

        // CRUD Categories
        Route::resource('/categories', \App\Http\Controllers\Admin\CategoryController::class)->names('admin.categories');

        // Store Approval
        Route::get('/store-approval', [\App\Http\Controllers\Admin\StoreApprovalController::class, 'index'])->name('admin.store-approval.index');
        Route::put('/store-approval/{user}/approve', [\App\Http\Controllers\Admin\StoreApprovalController::class, 'approve'])->name('admin.store-approval.approve');
        Route::delete('/store-approval/{user}/reject', [\App\Http\Controllers\Admin\StoreApprovalController::class, 'reject'])->name('admin.store-approval.reject');
    });


    // --- GRUP KHUSUS SELLER ---
    Route::middleware(['role:seller', 'check.status'])->prefix('seller')->group(function () {
        
        // Dashboard Seller
        Route::get('/dashboard', [SellerDashboardController::class, 'index'])->name('seller.dashboard');
            
        // CRUD Produk
        Route::resource('/products', \App\Http\Controllers\Seller\ProductController::class)->names('seller.products');

        // --- PERBAIKAN 2: ROUTE SETTINGS PINDAH KE SINI ---
        // (Masuk dalam middleware seller biar aman & Auth::user() terbaca)
        Route::get('/store/settings', [SellerStoreController::class, 'edit'])->name('seller.store.edit');
        Route::post('/store/settings', [SellerStoreController::class, 'update'])->name('seller.store.update');
    });

});

require __DIR__.'/auth.php';