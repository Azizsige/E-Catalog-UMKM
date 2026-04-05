<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        @php
            // Ambil data toko secara global (kalau ada)
            $store = \App\Models\Store::latest('updated_at')->first();
            
            // Cek kondisi: Kalau logo ada pakai itu, kalau null pakai favicon default
            $favicon = $store && $store->logo ? asset('storage/' . $store->logo) : asset('favicon.ico');
        @endphp

        <link rel="icon" type="image/png" href="{{ $favicon }}">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
