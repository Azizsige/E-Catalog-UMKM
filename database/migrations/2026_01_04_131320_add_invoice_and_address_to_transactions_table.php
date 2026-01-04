<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Kita tambah kolom Invoice Code biar kelihatan pro
            $table->string('invoice_code')->unique()->after('id')->nullable(); 
            
            // Kita simpan alamat lengkap di sini sebagai text JSON
            // Jadi kalau User Address dihapus, data di transaksi tetap aman
            $table->text('shipping_address_snapshot')->nullable()->after('resi_number');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['invoice_code', 'shipping_address_snapshot']);
        });
    }
};
