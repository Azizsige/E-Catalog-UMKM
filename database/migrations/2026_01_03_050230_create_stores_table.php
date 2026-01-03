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
        Schema::create('stores', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Relasi ke User
        $table->string('name');
        $table->string('slug')->unique();
        $table->text('description')->nullable();
        $table->text('address')->nullable();
        $table->string('city_id')->nullable(); // ID Kota RajaOngkir
        $table->boolean('is_approved')->default(false); // Perlu Acc Admin
        $table->decimal('balance', 15, 2)->default(0); // Saldo Toko
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stores');
    }
};
