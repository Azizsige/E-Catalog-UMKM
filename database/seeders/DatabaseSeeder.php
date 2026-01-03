<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Store; // Import Model Store
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat Akun Super Admin
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'), // Passwordnya: password
            'role' => 'admin',
        ]);

        // 2. Buat Akun Seller (UMKM)
        $seller = User::create([
            'name' => 'Pak Budi',
            'email' => 'seller@test.com',
            'password' => bcrypt('password'),
            'role' => 'seller',
        ]);

        // 3. Buat Data Toko untuk Seller tadi
        Store::create([
            'user_id' => $seller->id,
            'name' => 'Keripik Budi Jaya',
            'slug' => 'keripik-budi-jaya',
            'description' => 'Menjual aneka keripik pisang khas Malang.',
            'city_id' => '256', // Contoh ID Kota Malang (RajaOngkir)
            'is_approved' => true,
            'balance' => 0,
        ]);

        // 4. Buat Akun Customer (Pembeli)
        User::create([
            'name' => 'Andi Pembeli',
            'email' => 'buyer@test.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);
        
        // 5. Buat Akun Seller 2 (Belum diapprove admin)
        $seller2 = User::create([
            'name' => 'Bu Susi',
            'email' => 'susi@test.com',
            'password' => bcrypt('password'),
            'role' => 'seller',
        ]);
        
        Store::create([
            'user_id' => $seller2->id,
            'name' => 'Susi Craft',
            'slug' => 'susi-craft',
            'description' => 'Kerajinan tangan dari anyaman bambu.',
            'city_id' => '444', // Contoh Surabaya
            'is_approved' => false, // Ceritanya belum di-acc admin
            'balance' => 0,
        ]);
    }
}