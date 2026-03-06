<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MidtransWebhookController;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// ROUTE PENERIMA LAPORAN DARI MIDTRANS
// URL-nya tetap '/midtrans-callback' biar cocok sama Dashboard Midtrans lu
// Tapi diarahin ke Controller Notifikasi yang baru kita bikin
Route::post('/midtrans-callback', [MidtransWebhookController::class, 'handle']);