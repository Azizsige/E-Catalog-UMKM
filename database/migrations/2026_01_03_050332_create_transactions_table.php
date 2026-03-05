<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            // user_id dibikin nullable biar Guest bisa belanja
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null'); 
            $table->foreignId('store_id')->constrained(); 
            
            // --- INI YANG TADI KETINGGALAN ---
            $table->string('invoice_code')->unique(); 
            $table->text('shipping_address_snapshot')->nullable(); 
            $table->string('payment_method')->default('manual');
            // ---------------------------------
            
            $table->decimal('total_price', 15, 2);
            $table->decimal('shipping_cost', 15, 2);
            
            $table->string('courier_name')->nullable(); 
            $table->string('resi_number')->nullable();
            
            $table->enum('payment_status', ['pending', 'paid', 'expired', 'cancelled'])->default('pending');
            $table->enum('order_status', ['pending', 'processing', 'shipped', 'completed', 'cancelled'])->default('pending');
            
            $table->string('snap_token')->nullable(); // Untuk Midtrans
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};