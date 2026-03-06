<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class LowStockNotification extends Notification
{
    use Queueable;

    public $product;

    public function __construct($product)
    {
        $this->product = $product;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast']; // <--- Tambahin ini aja!
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Peringatan: Stok Menipis!',
            'message' => "Stok produk '{$this->product->name}' tersisa {$this->product->stock} item. Segera restock!",
            'icon_type' => 'stock', // <-- Ini yang bikin warnanya kuning dan di-redirect ke halaman Produk
        ];
    }
}