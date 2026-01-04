<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    Schema::table('stores', function (Blueprint $table) {
        // Kita tambah kolom branding setelah slug
        $table->string('logo')->nullable()->after('slug');
        $table->string('banner')->nullable()->after('logo');
        $table->string('phone_number')->nullable()->after('description'); // No HP Khusus Toko
    });
}

public function down(): void
{
    Schema::table('stores', function (Blueprint $table) {
        $table->dropColumn(['logo', 'banner', 'phone_number']);
    });
}
};
