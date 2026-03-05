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
    }
}