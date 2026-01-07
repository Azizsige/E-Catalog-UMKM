<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
{
    Schema::table('stores', function (Blueprint $table) {
        // Tambahkan kolom status setalah kolom user_id (atau kolom terakhir)
        // Defaultnya 'pending' biar toko baru harus diapprove dulu
        $table->enum('status', ['pending', 'approved', 'rejected', 'suspended'])
              ->default('pending')
              ->after('user_id'); 
    });
}

public function down()
{
    Schema::table('stores', function (Blueprint $table) {
        $table->dropColumn('status');
    });
}
};
