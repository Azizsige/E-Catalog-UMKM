<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            // Tambahin 2 kolom baru setelah kolom checkout_mode
            $table->string('bank_name')->nullable()->after('checkout_mode');
            $table->string('bank_account')->nullable()->after('bank_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            // Hapus kolom kalau migration di-rollback
            $table->dropColumn(['bank_name', 'bank_account']);
        });
    }
};