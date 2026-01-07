<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Notifications\CustomVerifyEmail;

use App\Notifications\CustomResetPasswordNotification; 
use Illuminate\Contracts\Auth\MustVerifyEmail;


class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
   protected $fillable = [
        'name',
        'email',
        'password',
        'role',   // Pastikan ini ada (dari sesi 1)
        'status', // <--- TAMBAHKAN INI
        'avatar_url', // (Opsional, kalau kemarin sempet nambahin)
        'phone',
        'status'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new CustomResetPasswordNotification($token));
    }

    public function sendEmailVerificationNotification()
    {
        $this->notify(new CustomVerifyEmail());
    }

    // User (Seller) punya banyak Produk
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    // Relasi: User punya banyak item di Keranjang
    public function carts()
    {
        return $this->hasMany(Cart::class); // Pastikan Model Cart terpanggil
    }

    // Relasi: User punya satu Toko (Kalau dia Seller) - Ini yg sblmnya udh ada
    public function store()
    {
        return $this->hasOne(Store::class);
    }

    public function addresses()
    {
        return $this->hasMany(UserAddress::class);
    }
}
