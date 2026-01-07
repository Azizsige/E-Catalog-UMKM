<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

class CustomVerifyEmail extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        //
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
        // 1. Generate Link Verifikasi yang Valid (Ada tanda tangan digitalnya)
        $verificationUrl = $this->verificationUrl($notifiable);

        // 2. Susun Isi Email Bahasa Indonesia
        return (new MailMessage)
            ->subject('Aktivasi Akun - Juragan Lapak') // Judul Email
            ->greeting('Halo, Juragan ' . $notifiable->name . '!') // Sapaan pakai nama user
            ->line('Terima kasih telah mendaftar di Juragan Lapak.')
            ->line('Tinggal satu langkah lagi. Silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda dan mulai berjualan/belanja.')
            ->action('Verifikasi Email Saya', $verificationUrl) // Tombol Utama
            ->line('Jika Anda tidak merasa mendaftar akun di Juragan Lapak, silakan abaikan email ini.')
            ->salutation('Salam Sukses, Tim Juragan Lapak'); // Penutup
    }

    /**
     * Generate URL verifikasi (Rumus Bawaan Laravel)
     */
    protected function verificationUrl($notifiable)
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );
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