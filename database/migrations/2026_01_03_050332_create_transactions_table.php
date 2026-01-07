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
        Schema::create('transactions', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained(); // Pembeli
        $table->foreignId('store_id')->constrained(); // Penjual
        
        $table->decimal('total_price', 15, 2);
        $table->decimal('shipping_cost', 15, 2);
        $table->string('courier_name')->nullable(); // JNE REG
        $table->string('resi_number')->nullable();
        
        $table->enum('payment_status', ['pending', 'paid', 'expired', 'cancelled'])->default('pending');
        // GANTI 'done' JADI 'completed'
$table->enum('order_status', ['pending', 'processing', 'shipped', 'completed', 'cancelled'])->default('pending');
        
        $table->string('snap_token')->nullable(); // Midtrans
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
