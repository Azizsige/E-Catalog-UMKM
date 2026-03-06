<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PaymentSuccessNotification extends Notification
{
    use Queueable;

    public $transaction;

    public function __construct($transaction)
    {
        $this->transaction = $transaction;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast']; // <--- Tambahin ini aja!
    }

    public function toArray(object $notifiable): array
    {
        // Hitung Grand Total (Total Produk + Ongkir)
        $grandTotal = $this->transaction->total_price + $this->transaction->shipping_cost;

        return [
            'title' => 'Pembayaran Berhasil! 💸',
            'message' => "Pesanan #{$this->transaction->invoice_code} senilai Rp " . number_format($grandTotal, 0, ',', '.') . " telah LUNAS.",
            'icon_type' => 'payment', 
            'transaction_id' => $this->transaction->id, 
        ];
    }
}