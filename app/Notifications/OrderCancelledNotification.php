<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;

class OrderCancelledNotification extends Notification implements ShouldBroadcast 
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
        return [
            'title' => 'Pesanan Kadaluarsa ❌',
            'message' => "Pesanan #{$this->transaction->invoice_code} otomatis dibatalkan karena melewati batas waktu pembayaran. Stok telah dikembalikan.",
            'icon_type' => 'info', // Bakal pakai warna abu-abu dari helper lu
            'transaction_id' => $this->transaction->id,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title' => 'Pesanan Kadaluarsa ❌',
            'message' => "Pesanan #{$this->transaction->invoice_code} otomatis dibatalkan. Stok telah dikembalikan.",
            'icon_type' => 'info',
            'transaction_id' => $this->transaction->id,
        ]);
    }
}