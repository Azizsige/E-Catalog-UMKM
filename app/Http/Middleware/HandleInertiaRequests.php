<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),

                'cart' => $request->user() ? [
                    // Hitung total semua barang
                    'count' => $request->user()->carts()->count(),
                    
                    // Ambil 5 barang terakhir buat preview di Popup Navbar
                    // Kita perlu relasi 'product' buat ambil nama, gambar, harga
                    'items' => $request->user()->carts()
                                ->with('product')
                                ->latest()
                                ->take(5) // Cukup 5 aja biar ringan
                                ->get()
                ] : null,
            ],
            // PASTIKAN BAGIAN INI ADA DAN SAMA PERSIS:
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'error'   => fn () => $request->session()->get('error'),
            ],
            'notifications' => function () use ($request) {
                if ($request->user()) {
                    // Ambil 5 notifikasi terbaru aja biar gak berat
                    $notifs = $request->user()->notifications()->take(5)->get();
                    
                    return [
                        'data' => $notifs->map(function ($notif) {
                            return [
                                'id' => $notif->id,
                                'title' => $notif->data['title'] ?? 'Info',
                                'desc' => $notif->data['message'] ?? '',
                                'icon_type' => $notif->data['icon_type'] ?? 'info', // 'order', 'stock', 'payment'
                                'time' => $notif->created_at->diffForHumans(),
                                'unread' => is_null($notif->read_at),
                            ];
                        }),
                        'unread_count' => $request->user()->unreadNotifications()->count(),
                    ];
                }
                return null;
            },
        ];
    }
}
