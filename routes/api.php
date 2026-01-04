<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
// Pastikan baris ini ada!
use App\Http\Controllers\API\MidtransCallbackController; 

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// ROUTE PENERIMA LAPORAN
// Perhatikan: JANGAN pakai awalan '/api' di sini. Cukup '/midtrans-callback'
// Karena file ini api.php, Laravel otomatis nambahin '/api' di depannya.
Route::post('/midtrans-callback', [MidtransCallbackController::class, 'callback']);