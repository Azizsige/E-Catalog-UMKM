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
use App\Http\Controllers\Public\CartController; 
use App\Http\Controllers\Admin\TransactionController as AdminTransactionController;

// --- ROUTE PUBLIK ---
Route::get('/', [PublicProductController::class, 'index'])->name('home');
Route::get('/p/{slug}', [PublicProductController::class, 'show'])->name('product.detail');
Route::get('/toko/{slug}', [PublicStoreController::class, 'show'])->name('store.show');

// Add to Cart (Publik agar session jalan)
Route::post('/cart/add', [CartController::class, 'store'])->name('cart.add');

// --- ROUTE APPROVAL (Auth Only) ---
Route::get('/approval', function () {
    return Inertia::render('Auth/Approval'); 
})->name('approval.notice')->middleware('auth');


// --- GROUP ROUTE KHUSUS YANG SUDAH LOGIN ---
Route::middleware(['auth', 'verified'])->group(function () {

    // Lihat Keranjang
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::patch('/cart/{id}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/{id}', [CartController::class, 'destroy'])->name('cart.destroy');

    // Checkout & Order
    Route::get('/checkout', [\App\Http\Controllers\Public\CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/checkout/address', [\App\Http\Controllers\Public\CheckoutController::class, 'storeAddress'])->name('checkout.address.store');
    Route::delete('/checkout/address/{id}', [\App\Http\Controllers\Public\CheckoutController::class, 'destroyAddress'])->name('checkout.address.destroy');
    Route::post('/checkout/process', [\App\Http\Controllers\Public\CheckoutController::class, 'store'])->name('checkout.store');

    // Transaksi Customer
    Route::get('/my-orders', [\App\Http\Controllers\Public\TransactionController::class, 'index'])->name('transactions.index');
    Route::get('/transaction/{id}', [\App\Http\Controllers\Public\TransactionController::class, 'show'])->name('transactions.show');


    // --- GRUP KHUSUS ADMIN ---
    Route::middleware(['role:admin', 'check.status'])->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
        
        // Resource Categories
        Route::resource('/categories', \App\Http\Controllers\Admin\CategoryController::class)->names('admin.categories');
        
        // Store Approval
        Route::get('/store-approval', [\App\Http\Controllers\Admin\StoreApprovalController::class, 'index'])->name('admin.store-approval.index');
        Route::put('/store-approval/{user}/approve', [\App\Http\Controllers\Admin\StoreApprovalController::class, 'approve'])->name('admin.store-approval.approve');
        Route::delete('/store-approval/{user}/reject', [\App\Http\Controllers\Admin\StoreApprovalController::class, 'reject'])->name('admin.store-approval.reject');
        
        // Transaksi Admin
        Route::get('/transactions', [AdminTransactionController::class, 'index'])->name('admin.transactions.index');
        Route::patch('/transactions/{id}', [AdminTransactionController::class, 'update'])->name('admin.transactions.update');

        // ❌ JANGAN TARUH ROUTE SELLER DI SINI! (Sudah saya hapus)
    });


    // --- GRUP KHUSUS SELLER ---
    Route::middleware(['role:seller', 'check.status'])->prefix('seller')->group(function () {
        Route::get('/dashboard', [SellerDashboardController::class, 'index'])->name('seller.dashboard');
        
        // Produk Seller
        Route::resource('/products', \App\Http\Controllers\Seller\ProductController::class)->names('seller.products');
       Route::resource('/transactions', \App\Http\Controllers\Seller\TransactionController::class)
            ->names('seller.transactions')
            ->only(['index', 'show', 'update']);
        Route::post('/products/generate-ai', [\App\Http\Controllers\Seller\ProductController::class, 'generateDescription'])->name('seller.products.generate-ai');
        
        // ✅ ROUTE PENGATURAN TOKO (Posisi Benar Disini)
        // URL jadi: /seller/store/settings
        Route::get('/store/settings', [SellerStoreController::class, 'edit'])->name('seller.store.edit');
        Route::post('/store/settings', [SellerStoreController::class, 'update'])->name('seller.store.update');
    });

});

// Helper / Debug
Route::get('/cek-model-ai', function () {
    try {
        $response = Gemini\Laravel\Facades\Gemini::models()->list();
        return response()->json($response);
    } catch (\Exception $e) {
        return "Error: " . $e->getMessage();
    }
});

// Profile Standard Breeze
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';