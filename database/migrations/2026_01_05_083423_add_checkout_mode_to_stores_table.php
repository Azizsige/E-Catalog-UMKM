<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    Schema::table('stores', function (Blueprint $table) {
        // Kita hanya tambah checkout_mode
        // Cek dulu biar aman, takutnya tadi sempat tereksekusi sebagian
        if (!Schema::hasColumn('stores', 'checkout_mode')) {
            $table->string('checkout_mode')->default('midtrans')->after('name');
        }
        
        // HAPUS ATAU KOMENTARI BARIS INI KARENA KOLOMNYA SUDAH ADA
        // $table->string('phone_number')->nullable()->after('checkout_mode'); 
    });
}

public function down(): void
{
    Schema::table('stores', function (Blueprint $table) {
        // Hapus hanya checkout_mode saat rollback
        if (Schema::hasColumn('stores', 'checkout_mode')) {
            $table->dropColumn(['checkout_mode']);
        }
        // Jangan drop phone_number karena itu data lama kamu
    });
}
};
