<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    protected $fillable = [
    'user_id', 
    'name', // <--- WAJIB ADA!
    'slug', 'description', 'address', 
    'city_id', 'is_approved', 'balance',
    'logo', 'banner', 'phone_number'
];

// Relasi: Toko dimiliki oleh User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi: Toko punya banyak Produk (Opsional, buat jaga-jaga nanti)
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
