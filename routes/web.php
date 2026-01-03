<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Seller\DashboardController as SellerDashboardController;


Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
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
    // Dijaga oleh: role:seller & check.status
    Route::middleware(['role:seller', 'check.status'])->prefix('seller')->group(function () {
        
        // Dashboard Seller
        Route::get('/dashboard', [SellerDashboardController::class, 'index'])
            ->name('seller.dashboard');

        // Nanti route seller lainnya (produk, pesanan, dll) taruh sini...
    });

});

require __DIR__.'/auth.php';
