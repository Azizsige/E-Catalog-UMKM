<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
// Controller Admin (Pemilik UMKM)
use App\Http\Controllers\Seller\DashboardController as MainDashboardController;
use App\Http\Controllers\Seller\ProductController as MainProductController;
use App\Http\Controllers\Seller\StoreController as MainStoreController;
use App\Http\Controllers\Seller\TransactionController as MainTransactionController;
use App\Http\Controllers\Admin\CategoryController; 
use App\Http\Controllers\Admin\NotificationController; // PENTING: Tambahkan ini untuk notifikasi admin
use App\Http\Controllers\Admin\ReportController;
// Controller Publik (Guest)
use App\Http\Controllers\Public\ProductController as PublicProductController;
use App\Http\Controllers\Public\CartController;
use App\Http\Controllers\Public\CheckoutController;
use App\Http\Controllers\Public\OrderController;
use App\Http\Controllers\RajaOngkirController;

// ==========================================
// 1. AREA PUBLIK (Katalog & Guest Checkout)
// ==========================================
Route::get('/', [PublicProductController::class, 'index'])->name('home');
Route::get('/p/{slug}', [PublicProductController::class, 'show'])->name('product.detail');

// Keranjang (Akses Publik)
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart/add', [CartController::class, 'store'])->name('cart.add');
Route::patch('/cart/{id}', [CartController::class, 'update'])->name('cart.update');
Route::delete('/cart/{id}', [CartController::class, 'destroy'])->name('cart.destroy');

// Checkout (Akses Publik)
Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
Route::post('/checkout/process', [CheckoutController::class, 'store'])->name('checkout.store');

// Route untuk Lacak Pesanan / Invoice Publik
Route::get('/order/{invoice}', [\App\Http\Controllers\Public\OrderController::class, 'track'])
    ->name('order.track')
    ->where('invoice', '.*'); // <--- INI KUNCI MAGIC-NYA

    Route::get('/api/provinces', [App\Http\Controllers\RajaOngkirController::class, 'getProvinces']);
Route::get('/api/cities/{provinceId}', [App\Http\Controllers\RajaOngkirController::class, 'getCities']);
Route::get('/api/districts/{cityId}', [App\Http\Controllers\RajaOngkirController::class, 'getDistricts']); // <-- TAMBAHAN BARU
Route::post('/api/cost', [App\Http\Controllers\RajaOngkirController::class, 'checkCost']);

// Webhook Midtrans (Jangan dikasih auth/CSRF karena diakses oleh server Midtrans)
// Route::post('/midtrans/callback', [CheckoutController::class, 'callback']); 

// ==========================================
// 2. AREA ADMIN TUNGGAL (Pemilik UMKM)
// ==========================================
Route::middleware(['auth'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [MainDashboardController::class, 'index'])->name('admin.dashboard');
    
    // Kelola Menu & Kategori
    Route::resource('/products', MainProductController::class)->names('admin.products');
    Route::resource('/categories', CategoryController::class)->names('admin.categories');
    
    // Kelola Transaksi Masuk (WA & Midtrans)
    Route::get('/transactions', [MainTransactionController::class, 'index'])->name('admin.transactions.index');
    Route::get('/transactions/{id}', [MainTransactionController::class, 'show'])->name('admin.transactions.show');
    Route::put('/transactions/{id}', [MainTransactionController::class, 'update'])->name('admin.transactions.update');
    Route::get('/transactions/{id}/print-label', [MainTransactionController::class, 'printLabel'])->name('admin.transactions.print');
    
    // Pengaturan Toko
    Route::get('/settings', [MainStoreController::class, 'edit'])->name('admin.store.edit');
    Route::post('/settings', [MainStoreController::class, 'update'])->name('admin.store.update');

    Route::get('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('admin.notifications.read');
    Route::get('/notifications', [NotificationController::class, 'index'])->name('admin.notifications.index');
Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('admin.notifications.readAll');

// Rute Laporan Keuangan
Route::get('/reports', [ReportController::class, 'index'])->name('admin.reports.index');
Route::get('/reports/export', [ReportController::class, 'export'])->name('admin.reports.export');
});

// Profile Standard Breeze
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::fallback(function () {
    return \Inertia\Inertia::render('Errors/404');
});

require __DIR__.'/auth.php';