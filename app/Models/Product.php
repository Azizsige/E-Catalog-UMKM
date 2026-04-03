<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'category_id',
        'name',
        'slug',
        'price',
        'weight', // <--- TAMBAHIN INI YA BRO!
        'stock',
        'description',
        'image',
        'video_url',
        'is_active',
    ];

    // --- RELASI (JEMBATAN) ---

    // 1. Produk ini punya Kategori apa?
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // 2. Produk ini milik User siapa? (INI YANG BIKIN ERROR)
    // Kalau fungsi ini gak ada, CheckoutController bakal teriak "Produk tidak memiliki penjual"
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // 3. (Opsional) Relasi ke Store lewat User
    // Ini shortcut biar bisa panggil $product->store
    public function store()
    {
        return $this->hasOneThrough(
            Store::class,
            User::class,
            'id', // FK di table users
            'user_id', // FK di table stores
            'user_id', // Local key di table products
            'id' // Local key di table users
        );
    }

    public function images()
{
    return $this->hasMany(ProductImage::class);
}
}