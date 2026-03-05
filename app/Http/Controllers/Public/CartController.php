<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class CartController extends Controller
{
    // Hanya me-render halaman, datanya di-load via LocalStorage di React
    public function index()
    {
        return Inertia::render('Cart/Index');
    }
}