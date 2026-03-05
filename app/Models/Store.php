<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'description',
        'address',
        'logo',
        'banner',
        // --- TAMBAHKAN 2 BARIS INI ---
        'checkout_mode',
        'phone_number', 
        'bank_name',     // <--- WAJIB DITAMBAHIN
        'bank_account',  // <--- WAJIB DITAMBAHIN
    ];

    // Relasi ke User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi ke Product
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}