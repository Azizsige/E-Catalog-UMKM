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
        Schema::create('user_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('recipient_name'); // Nama Penerima
            $table->string('phone_number');   // No HP
            $table->text('address_line');     // Alamat Lengkap
            $table->string('city');           // Kota
            $table->string('postal_code')->nullable();
            $table->boolean('is_primary')->default(false); // Alamat Utama?
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_addresses');
    }
};
