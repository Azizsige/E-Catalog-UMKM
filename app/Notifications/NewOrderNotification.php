<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast; // 🔥 1. Tambahin ini
use Illuminate\Notifications\Messages\BroadcastMessage; // 🔥 2. Tambahin ini

class NewOrderNotification extends Notification implements ShouldBroadcast // 🔥 3. Implementasi interface ini
{
    use Queueable;

    public $transaction;

    public function __construct($transaction)
    {
        $this->transaction = $transaction;
    }

    // Kita pakai channel 'database' aja
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast']; // <--- Tambahin ini aja!
    }

    // Format data yang akan masuk ke tabel database
    public function toArray(object $notifiable): array
    {
        // Hitung Grand Total (Total Produk + Ongkir)
        $grandTotal = $this->transaction->total_price + $this->transaction->shipping_cost;

        return [
            'title' => 'Pesanan Baru #' . $this->transaction->invoice_code,
            'message' => 'Pesanan baru senilai Rp ' . number_format($grandTotal, 0, ',', '.') . ' menunggu diproses.',
            'icon_type' => 'order',
            'transaction_id' => $this->transaction->id,
        ];
    }

    // Format data untuk broadcast (Realtime)
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        // Hitung Grand Total (Total Produk + Ongkir)
        $grandTotal = $this->transaction->total_price + $this->transaction->shipping_cost;
        return new BroadcastMessage([
            'title' => 'Pesanan Baru #' . $this->transaction->invoice_code,
            'message' => 'Pesanan baru senilai Rp ' . number_format($grandTotal, 0, ',', '.') . ' menunggu diproses.',
            'icon_type' => 'order',
            'transaction_id' => $this->transaction->id,
        ]);
    }
}