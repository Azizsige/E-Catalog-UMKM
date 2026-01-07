<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Seller\DashboardController as SellerDashboardController;
use App\Http\Controllers\Public\ProductController as PublicProductController;
use App\Http\Controllers\Seller\StoreController as SellerStoreController;
use App\Http\Controllers\Public\StoreController as PublicStoreController;
use App\Http\Controllers\Public\CartController; 
use App\Http\Controllers\Admin\TransactionController as AdminTransactionController;
use App\Http\Controllers\Admin\UserController; // Pastikan ini diimport

// --- ROUTE PUBLIK ---
Route::get('/', [PublicProductController::class, 'index'])->name('home');
Route::get('/p/{slug}', [PublicProductController::class, 'show'])->name('product.detail');
Route::get('/toko/{slug}', [PublicStoreController::class, 'show'])->name('store.show');
Route::post('/cart/add', [CartController::class, 'store'])->name('cart.add');

// --- ROUTE APPROVAL (Auth Only) ---
Route::get('/approval', function () {
    return Inertia::render('Auth/Approval'); 
})->name('approval.notice')->middleware('auth');

// --- GROUP ROUTE KHUSUS YANG SUDAH LOGIN ---
Route::middleware(['auth', 'verified'])->group(function () {

    // --- FITUR CUSTOMER UMUM ---
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::patch('/cart/{id}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/{id}', [CartController::class, 'destroy'])->name('cart.destroy');
    
    Route::get('/checkout', [\App\Http\Controllers\Public\CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/checkout/process', [\App\Http\Controllers\Public\CheckoutController::class, 'store'])->name('checkout.store');
    
    Route::get('/my-orders', [\App\Http\Controllers\Public\TransactionController::class, 'index'])->name('transactions.index');
    
    // Perbaikan konsistensi nama route (transactions vs transaction)
    Route::get('/transaction/{id}', [\App\Http\Controllers\Public\TransactionController::class, 'show'])->name('transaction.show'); 
    // Note: Pastikan di React pakai route('transaction.show', id)

    Route::put('/my-orders/{id}', [\App\Http\Controllers\Public\TransactionController::class, 'update'])->name('my.orders.update');

    // --- GRUP KHUSUS ADMIN ---
    Route::middleware(['role:admin', 'check.status'])->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
        
        Route::resource('/categories', \App\Http\Controllers\Admin\CategoryController::class)->names('admin.categories');
        
        Route::get('/store-approval', [\App\Http\Controllers\Admin\StoreApprovalController::class, 'index'])->name('admin.store-approval.index');
        Route::put('/store-approval/{user}/approve', [\App\Http\Controllers\Admin\StoreApprovalController::class, 'approve'])->name('admin.store-approval.approve');
        Route::delete('/store-approval/{user}/reject', [\App\Http\Controllers\Admin\StoreApprovalController::class, 'reject'])->name('admin.store-approval.reject');
        
        Route::get('/transactions', [AdminTransactionController::class, 'index'])->name('admin.transactions.index');
        Route::patch('/transactions/{id}', [AdminTransactionController::class, 'update'])->name('admin.transactions.update');

        // 👇 PERBAIKAN PENTING: Tambahkan 'admin.' di nama route
        Route::get('/users', [UserController::class, 'index'])->name('admin.users.index');
        Route::put('/users/{id}/toggle', [UserController::class, 'toggleStatus'])->name('admin.users.toggle');
    });

    // --- GRUP KHUSUS SELLER ---
    Route::prefix('seller')->group(function () {

        // A. AREA BEBAS (Boleh diakses saat status 'pending')
        Route::middleware(['auth', 'role:seller'])->group(function () {
            Route::get('/register', [SellerStoreController::class, 'edit'])->name('seller.register');
            Route::get('/store/settings', [SellerStoreController::class, 'edit'])->name('seller.store.edit');
            Route::post('/store/settings', [SellerStoreController::class, 'update'])->name('seller.store.update');
            
            Route::get('/rejected', function () {
                return Inertia::render('Seller/Rejected');
            })->name('seller.rejected');
        });

        // B. AREA TERKUNCI (Wajib status 'approved')
        Route::middleware(['auth', 'role:seller', 'check.status'])->group(function () {
            Route::get('/dashboard', [SellerDashboardController::class, 'index'])->name('seller.dashboard');
            
            Route::resource('/products', \App\Http\Controllers\Seller\ProductController::class)->names('seller.products');
            
            Route::resource('/transactions', \App\Http\Controllers\Seller\TransactionController::class)
                ->names('seller.transactions')
                ->only(['index', 'show', 'update']);

            // 👇 PERBAIKAN: Print Label dipindah ke sini (aman)
            Route::get('/transactions/{id}/print-label', [\App\Http\Controllers\Seller\TransactionController::class, 'printLabel'])
                ->name('seller.transactions.print');
            
            Route::post('/products/generate-ai', [\App\Http\Controllers\Seller\ProductController::class, 'generateDescription'])->name('seller.products.generate-ai');
        });
    });

});

// Profile Standard Breeze
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';