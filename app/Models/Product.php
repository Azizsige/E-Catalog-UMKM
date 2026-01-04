<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
    'store_id', // Pastikan store_id juga ada di sini (buat jaga-jaga relasi nanti)
    'user_id', 
    'category_id', 
    'name', 
    'slug', 
    'price', 
    'stock', 
    'description', 
    'image', 
    'is_active',
    'video_url', // <--- TAMBAHAN BARU
];

    // Relasi ke User (Seller)
    public function seller()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Relasi ke Category
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}