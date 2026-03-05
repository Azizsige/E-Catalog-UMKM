<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;
    protected $fillable = [
    'user_id',
    'store_id',
    'invoice_code',
    'total_price',
    'shipping_cost',
    'shipping_address_snapshot',
    'order_status',
    'payment_status',
    'payment_method',
    'snap_token',
];

    protected $guarded = ['id'];

    // Relasi ke User (Pembeli)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi ke Store (Penjual) - INI PENTING KARENA KITA MARKETPLACE
    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    // Relasi ke Detail Barang
    public function details()
    {
        return $this->hasMany(TransactionDetail::class);
    }

    public function transactionDetails()
    {
        return $this->hasMany(TransactionDetail::class);
    }
}