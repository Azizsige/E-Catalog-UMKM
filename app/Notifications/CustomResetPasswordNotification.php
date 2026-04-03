<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CustomResetPasswordNotification extends Notification
{
    use Queueable;

    public $token;

    /**
     * Create a new notification instance.
     */
    public function __construct($token)
    {
        $this->token = $token;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        // Generate URL Reset Password
        // Link ini mengarah ke: http://127.0.0.1:8000/reset-password/{token}?email=...
        $url = url(route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ]));

        return (new MailMessage)
            ->subject('Permintaan Reset Password - Juragan Lapak') // Judul Email
            ->greeting('Halo, Juragan!') // Sapaan
            ->line('Kami menerima permintaan untuk mengatur ulang password akun Anda.')
            ->action('Reset Password Sekarang', $url) // Tombol
            ->line('Link ini hanya berlaku selama 5 menit demi keamanan akun Anda.')
            ->line('Jika Anda tidak merasa meminta reset password, silakan abaikan email ini.')
            ->salutation('Salam Sukses, Tim Juragan Lapak'); // Penutup
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}