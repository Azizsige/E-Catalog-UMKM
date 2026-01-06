<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserAddress extends Model
{
    use HasFactory;
    protected $guarded = ['id'];

    protected $fillable = [
        'user_id',
        'recipient_name',
        'phone_number',
        'address_line',
        'city',
        'postal_code',
        'is_primary'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}