import { Head, Link, useForm } from "@inertiajs/react";
import {
    Store,
    MessageCircle,
    ChevronLeft,
    ChevronRight,
    Play,
    ShoppingCart,
    Minus,
    Plus,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { useState } from "react";
import Navbar from "@/Components/Navbar";

export default function ProductShow({ product, auth }) {
    // Terima props auth kalau mau cek login di frontend

    // --- 1. LOGIKA VIDEO SLIDER (Sama seperti sebelumnya) ---
    const getYoutubeId = (url) => {
        if (!url) return null;
        const regExp =
            /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    };
    const videoId = getYoutubeId(product.video_url);

    const mediaList = [];
    if (videoId)
        mediaList.push({
            type: "video",
            content: videoId,
            thumbnail: product.image,
        });
    if (product.image)
        mediaList.push({ type: "image", content: product.image });

    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPlayingVideo, setIsPlayingVideo] = useState(false);

    const nextSlide = () => {
        setCurrentSlide((prev) =>
            prev === mediaList.length - 1 ? 0 : prev + 1
        );
        setIsPlayingVideo(false);
    };
    const prevSlide = () => {
        setCurrentSlide((prev) =>
            prev === 0 ? mediaList.length - 1 : prev - 1
        );
        setIsPlayingVideo(false);
    };

    // --- 2. LOGIKA KERANJANG BELANJA (BARU) ---
    const { data, setData, post, processing } = useForm({
        product_id: product.id,
        qty: 1, // Default beli 1
    });

    const handleIncrement = () => {
        if (data.qty < product.stock) {
            setData("qty", data.qty + 1);
        }
    };

    const handleDecrement = () => {
        if (data.qty > 1) {
            setData("qty", data.qty - 1);
        }
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        post(route("cart.add"), {
            preserveScroll: true,
            onSuccess: () => {
                // Nanti kita bikin notifikasi toast di sini, sementara alert dulu atau biarkan flash message
                // console.log("Berhasil masuk keranjang");
            },
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head title={product.name} />

            {/* 2. PASANG NAVBAR DISINI */}
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                        {/* --- KOLOM KIRI: SLIDER MEDIA (Kode Sama) --- */}
                        <div className="p-6 md:p-8 bg-gray-50/50 flex flex-col justify-start">
                            <div className="relative aspect-square bg-white rounded-xl border overflow-hidden shadow-sm group">
                                {mediaList[currentSlide].type === "video" ? (
                                    isPlayingVideo ? (
                                        <iframe
                                            className="w-full h-full"
                                            src={`https://www.youtube.com/embed/${mediaList[currentSlide].content}?autoplay=1`}
                                            title="Product Video"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    ) : (
                                        <div
                                            className="w-full h-full relative cursor-pointer group-hover:opacity-95 transition-opacity"
                                            onClick={() =>
                                                setIsPlayingVideo(true)
                                            }
                                        >
                                            <img
                                                src={`/storage/${mediaList[currentSlide].thumbnail}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg animate-pulse group-hover:scale-110 transition-transform">
                                                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <img
                                        src={`/storage/${mediaList[currentSlide].content}`}
                                        className="w-full h-full object-cover"
                                    />
                                )}

                                {mediaList.length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                prevSlide();
                                            }}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                nextSlide();
                                            }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                    </>
                                )}
                            </div>
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

                        {/* --- KOLOM KANAN: INFORMASI & ACTION --- */}
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

                            {/* --- BAGIAN ACTION BARU --- */}
                            <div className="mt-auto space-y-6">
                                {/* 1. INFO TOKO */}
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

                                {/* 2. FORM BELANJA (QTY & BUTTONS) */}
                                <div className="flex flex-col gap-4">
                                    {/* Baris Quantity */}
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium text-gray-700">
                                            Jumlah:
                                        </span>
                                        <div className="flex items-center border rounded-lg bg-white">
                                            <button
                                                onClick={handleDecrement}
                                                className="p-3 hover:bg-gray-100 text-gray-600 rounded-l-lg transition-colors"
                                                disabled={data.qty <= 1}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <input
                                                type="text"
                                                className="w-12 text-center border-none p-0 focus:ring-0 text-sm font-semibold"
                                                value={data.qty}
                                                readOnly
                                            />
                                            <button
                                                onClick={handleIncrement}
                                                className="p-3 hover:bg-gray-100 text-gray-600 rounded-r-lg transition-colors"
                                                disabled={
                                                    data.qty >= product.stock
                                                }
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            Stok: {product.stock}
                                        </span>
                                    </div>

                                    {/* Baris Tombol */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Tombol Keranjang (Main Feature) */}
                                        <Button
                                            onClick={handleAddToCart}
                                            disabled={processing}
                                            className="h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-orange-200 shadow-lg"
                                        >
                                            {processing ? (
                                                <span className="animate-spin mr-2">
                                                    ⏳
                                                </span>
                                            ) : (
                                                <ShoppingCart className="w-5 h-5 mr-2" />
                                            )}
                                            {processing
                                                ? "Memproses..."
                                                : "Keranjang"}
                                        </Button>

                                        {/* Tombol WhatsApp (Secondary) */}
                                        <a
                                            href={`https://wa.me/${product.seller.phone}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full"
                                        >
                                            <Button
                                                variant="outline"
                                                className="w-full h-12 border-green-600 text-green-600 hover:bg-green-50"
                                            >
                                                <MessageCircle className="w-5 h-5 mr-2" />
                                                Beli Langsung
                                            </Button>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
