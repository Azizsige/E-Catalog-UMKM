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

// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

// Route::middleware('auth')->group(function () {
//     Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//     Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
//     Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
// });

// Group Route untuk yang SUDAH LOGIN (Auth)
Route::middleware(['auth', 'verified'])->group(function () {

    // KUNCI: Cuma boleh diakses user dgn role 'admin'
    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])
        ->middleware('role:admin') // <--- Pasang gembok
        ->name('admin.dashboard');

    Route::resource('/admin/categories', \App\Http\Controllers\Admin\CategoryController::class)
    ->names('admin.categories');

    // KUNCI: Cuma boleh diakses user dgn role 'seller'
    Route::get('/seller/dashboard', [SellerDashboardController::class, 'index'])
        ->middleware('role:seller') // <--- Pasang gembok
        ->name('seller.dashboard');

    // 3. Dashboard Customer (Sementara redirect ke Homepage dulu)
    // Nanti kita buat profile page khusus
});

require __DIR__.'/auth.php';
