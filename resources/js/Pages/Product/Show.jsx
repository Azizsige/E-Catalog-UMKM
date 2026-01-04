import { Head, Link } from "@inertiajs/react";
import {
    Store,
    MessageCircle,
    ChevronLeft,
    ChevronRight,
    Play,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { useState } from "react";

export default function ProductShow({ product }) {
    // --- 1. LOGIKA HELPER & STATE ---

    // Helper: Ambil ID YouTube
    const getYoutubeId = (url) => {
        if (!url) return null;
        const regExp =
            /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    };

    const videoId = getYoutubeId(product.video_url);

    // Siapkan Daftar Media untuk Slider
    // Urutan: Video (jika ada) -> Gambar Utama
    const mediaList = [];

    // Jika ada video, jadikan urutan pertama (Index 0)
    if (videoId) {
        mediaList.push({
            type: "video",
            content: videoId,
            thumbnail: product.image, // Thumbnail video pakai gambar produk
        });
    }

    // Gambar Utama (Selalu ada)
    if (product.image) {
        mediaList.push({
            type: "image",
            content: product.image,
        });
    }

    // State untuk Slider
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPlayingVideo, setIsPlayingVideo] = useState(false);

    // Navigasi Slider
    const nextSlide = () => {
        setCurrentSlide((prev) =>
            prev === mediaList.length - 1 ? 0 : prev + 1
        );
        setIsPlayingVideo(false); // Reset video kalau ganti slide
    };

    const prevSlide = () => {
        setCurrentSlide((prev) =>
            prev === 0 ? mediaList.length - 1 : prev - 1
        );
        setIsPlayingVideo(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 font-sans">
            <Head title={product.name} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link
                        href="/"
                        className="text-sm text-gray-500 hover:text-primary flex items-center gap-1"
                    >
                        &larr; Kembali ke Home
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
                        {/* --- KOLOM KIRI: SLIDER MEDIA --- */}
                        <div className="p-6 md:p-8 bg-gray-50/50 flex flex-col justify-start">
                            {/* LAYAR UTAMA SLIDER */}
                            <div className="relative aspect-square bg-white rounded-xl border overflow-hidden shadow-sm group">
                                {/* KONTEN SLIDE */}
                                {mediaList[currentSlide].type === "video" ? (
                                    // --- LOGIKA SLIDE VIDEO ---
                                    isPlayingVideo ? (
                                        // 1. Jika sudah di-play: Tampilkan Iframe
                                        <iframe
                                            className="w-full h-full"
                                            src={`https://www.youtube.com/embed/${mediaList[currentSlide].content}?autoplay=1`}
                                            title="Product Video"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    ) : (
                                        // 2. Jika belum di-play: Tampilkan Thumbnail Gambar + Tombol Play
                                        <div
                                            className="w-full h-full relative cursor-pointer group-hover:opacity-95 transition-opacity"
                                            onClick={() =>
                                                setIsPlayingVideo(true)
                                            }
                                        >
                                            <img
                                                src={`/storage/${mediaList[currentSlide].thumbnail}`}
                                                alt="Video Thumbnail"
                                                className="w-full h-full object-cover"
                                            />
                                            {/* Overlay Gelap */}
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                {/* Tombol Play Keren */}
                                                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-900/50 animate-pulse group-hover:scale-110 transition-transform">
                                                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-4 left-0 right-0 text-center">
                                                <span className="bg-black/70 text-white text-xs px-3 py-1 rounded-full">
                                                    Klik untuk memutar video
                                                </span>
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    // --- LOGIKA SLIDE GAMBAR BIASA ---
                                    <img
                                        src={`/storage/${mediaList[currentSlide].content}`}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                )}

                                {/* TOMBOL NAVIGASI KANAN KIRI (Cuma muncul kalau item > 1) */}
                                {mediaList.length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                prevSlide();
                                            }}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                nextSlide();
                                            }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* DOTS INDICATOR (Biar tau ada berapa slide) */}
                            {mediaList.length > 1 && (
                                <div className="flex justify-center gap-2 mt-4">
                                    {mediaList.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setCurrentSlide(index);
                                                setIsPlayingVideo(false);
                                            }}
                                            className={`w-2.5 h-2.5 rounded-full transition-all ${
                                                currentSlide === index
                                                    ? "bg-primary w-6"
                                                    : "bg-gray-300 hover:bg-gray-400"
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* --- KOLOM KANAN: INFORMASI (Tetap Sama) --- */}
                        <div className="p-6 md:p-8 flex flex-col h-full">
                            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full w-fit mb-4">
                                {product.category?.name || "Umum"}
                            </span>

                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {product.name}
                            </h1>
                            <p className="text-2xl font-bold text-primary mb-6">
                                {new Intl.NumberFormat("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                }).format(product.price)}
                            </p>

                            <hr className="border-gray-100 mb-6" />

                            <div className="prose prose-sm text-gray-600 mb-8 flex-1">
                                <h3 className="text-gray-900 font-semibold mb-2">
                                    Deskripsi Produk
                                </h3>
                                <p className="whitespace-pre-line leading-relaxed">
                                    {product.description}
                                </p>
                            </div>

                            <div className="mt-auto space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 border">
                                        <Store className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Dijual oleh:
                                        </p>
                                        <Link
                                            href={route(
                                                "store.show",
                                                product.seller.store?.slug ||
                                                    "error"
                                            )}
                                            className="font-semibold text-gray-900 hover:text-primary hover:underline"
                                        >
                                            {product.seller.store?.name ||
                                                product.seller.name}
                                        </Link>
                                    </div>
                                </div>

                                <a
                                    href={`https://wa.me/${product.seller.phone}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full"
                                >
                                    <Button className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200">
                                        <MessageCircle className="w-5 h-5 mr-2" />
                                        Beli via WhatsApp
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
