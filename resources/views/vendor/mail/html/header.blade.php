<tr>
    <td class="header">
        <a href="{{ $url }}" style="display: inline-block; text-decoration: none;">
            {{-- OPSI 1: Kalau mau pakai LOGO GAMBAR (Harus hosting online biar muncul di email) --}}
            {{-- <img src="https://juraganlapak.com/logo.png" class="logo" alt="Juragan Lapak" style="height: 50px;"> --}}

            {{-- OPSI 2: Pakai TEKS BERGAYA (Lebih aman buat localhost) --}}
            <div style="display: flex; align-items: center; gap: 10px;">
                {{-- Ikon Toko Sederhana (SVG Inline biar pasti muncul) --}}
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">
                    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
                    <path d="M2 7h20"/>
                    <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/>
                </svg>
                
                {{-- Teks Nama Aplikasi --}}
                <span style="font-size: 24px; font-weight: 800; color: #111827; margin-left: 8px; vertical-align: middle;">
                    Juragan<span style="color: #ea580c;">Lapak</span>
                </span>
            </div>
        </a>
    </td>
</tr>