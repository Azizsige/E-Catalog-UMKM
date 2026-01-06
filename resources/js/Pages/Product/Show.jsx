import React, { useState, useEffect, useRef } from "react";
import { Head, useForm, Link, router } from "@inertiajs/react";
import Navbar from "@/Components/Navbar";
import {
    ShoppingCart,
    Minus,
    Plus,
    MessageCircle,
    Store,
    ShieldCheck,
    Truck,
    ChevronLeft,
    ChevronRight,
    Play,
    AlertCircle,
} from "lucide-react";
import { Button } from "@/Components/ui/button";

export default function ProductShow({ product, auth, relatedProducts }) {
    // --- 1. GUARD CLAUSE ---
    if (!product) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <p className="text-gray-500 font-medium">Memuat Produk...</p>
            </div>
        );
    }

    // --- 2. MEDIA LOGIC (VIDEO + IMAGES) ---
    const getYoutubeId = (url) => {
        if (!url) return null;
        const regExp =
            /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    };

    const videoId = getYoutubeId(product.video_url);

    // Kumpulkan semua media
    const mediaList = [];

    // 1. Video (Jika ada)
    if (videoId) {
        mediaList.push({
            id: "video-main",
            type: "video",
            src: videoId,
            thumb: product.image, // Thumbnail video pakai gambar utama dulu
        });
    }

    // 2. Gambar Utama
    mediaList.push({
        id: "img-main",
        type: "image",
        src: product.image,
        thumb: product.image,
    });

    // 3. Gallery Images
    if (product.images && product.images.length > 0) {
        product.images.forEach((img) => {
            mediaList.push({
                id: img.id,
                type: "image",
                src: img.image_path,
                thumb: img.image_path,
            });
        });
    }

    // --- STATE SLIDER ---
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const thumbnailRef = useRef(null);

    // Reset video player saat ganti slide
    useEffect(() => {
        setIsPlaying(false);
    }, [activeIndex]);

    // Auto Scroll Thumbnail agar yang aktif selalu terlihat
    useEffect(() => {
        if (thumbnailRef.current) {
            const activeThumb = thumbnailRef.current.children[activeIndex];
            if (activeThumb) {
                activeThumb.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "center",
                });
            }
        }
    }, [activeIndex]);

    const handleNext = () => {
        setActiveIndex((prev) =>
            prev === mediaList.length - 1 ? 0 : prev + 1
        );
    };

    const handlePrev = () => {
        setActiveIndex((prev) =>
            prev === 0 ? mediaList.length - 1 : prev - 1
        );
    };

    // --- FORM & CART LOGIC ---
    const { data, setData, post, processing } = useForm({
        product_id: product.id,
        qty: 1,
    });

    const formatRupiah = (number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(number);
    };

    const handleAddToCart = () => {
        post(route("cart.add"), {
            preserveScroll: true,
            onSuccess: () => console.log("Masuk keranjang!"),
        });
    };

    const handleBuyNow = () => {
        router.post(
            route("cart.add"),
            {
                product_id: product.id,
                qty: data.qty,
                is_buy_now: true,
            },
            { preserveScroll: true }
        );
    };

    const isWhatsAppMode = product?.store?.checkout_mode === "whatsapp";
    const sellerPhone = product?.store?.phone_number;
    const waMessage = `Halo ${
        product?.store?.name || "Seller"
    }, saya tertarik dengan produk *${product.name}* seharga ${formatRupiah(
        product.price
    )}. Apakah stok masih ready?`;
    const waLink = `https://wa.me/62${sellerPhone}?text=${encodeURIComponent(
        waMessage
    )}`;

    return (
        <>
            <Head title={product.name} />
            <Navbar />

            <div className="bg-gray-50 min-h-screen py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* BREADCRUMB */}
                    <div className="text-sm text-gray-500 mb-4 flex gap-2">
                        <Link href="/" className="hover:text-orange-600">
                            Beranda
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium truncate">
                            {product.name}
                        </span>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
                            {/* --- KOLOM KIRI: MEDIA SLIDER + THUMBNAILS --- */}
                            <div className="p-6 md:p-8 bg-white select-none flex flex-col gap-4">
                                {/* 1. LAYAR UTAMA */}
                                <div className="aspect-square rounded-xl overflow-hidden border bg-gray-100 relative group">
                                    {mediaList[activeIndex].type === "video" ? (
                                        isPlaying ? (
                                            <iframe
                                                className="w-full h-full"
                                                src={`https://www.youtube.com/embed/${mediaList[activeIndex].src}?autoplay=1&rel=0`}
                                                title="YouTube video player"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        ) : (
                                            <div
                                                className="w-full h-full relative cursor-pointer"
                                                onClick={() =>
                                                    setIsPlaying(true)
                                                }
                                            >
                                                <img
                                                    src={`/storage/${mediaList[activeIndex].thumb}`}
                                                    className="w-full h-full object-cover opacity-90"
                                                    alt="Video Cover"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors">
                                                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                                        <Play
                                                            className="w-8 h-8 text-white ml-1"
                                                            fill="currentColor"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    ) : (
                                        <img
                                            // PENTING: key ini memaksa React me-render ulang saat index berubah
                                            key={activeIndex}
                                            src={`/storage/${mediaList[activeIndex].src}`}
                                            alt={product.name}
                                            className="w-full h-full object-cover animate-in fade-in duration-300"
                                        />
                                    )}

                                    {/* NAVIGASI PREV & NEXT */}
                                    {mediaList.length > 1 && (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePrev();
                                                }}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-md transition-all md:opacity-0 md:group-hover:opacity-100 z-10"
                                            >
                                                <ChevronLeft className="w-6 h-6" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleNext();
                                                }}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-md transition-all md:opacity-0 md:group-hover:opacity-100 z-10"
                                            >
                                                <ChevronRight className="w-6 h-6" />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* 2. THUMBNAIL SLIDER (DIBAGIAN BAWAH) */}
                                {mediaList.length > 1 && (
                                    <div
                                        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
                                        ref={thumbnailRef}
                                    >
                                        {mediaList.map((media, index) => (
                                            <button
                                                key={`${media.id}-${index}`}
                                                onClick={() =>
                                                    setActiveIndex(index)
                                                }
                                                className={`relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                                    activeIndex === index
                                                        ? "border-orange-600 ring-2 ring-orange-100 opacity-100"
                                                        : "border-transparent opacity-60 hover:opacity-100"
                                                }`}
                                            >
                                                <img
                                                    src={`/storage/${media.thumb}`}
                                                    alt="Thumb"
                                                    className="w-full h-full object-cover"
                                                />
                                                {/* Ikon Play Kecil untuk Thumbnail Video */}
                                                {media.type === "video" && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                        <Play
                                                            className="w-6 h-6 text-white drop-shadow-md"
                                                            fill="currentColor"
                                                        />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* --- KOLOM KANAN: INFO PRODUK (TETAP SAMA) --- */}
                            <div className="p-6 md:p-8 md:border-l">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                    {product.name}
                                </h1>
                                <div className="text-3xl font-bold text-orange-600 mb-6">
                                    {formatRupiah(product.price)}
                                </div>

                                <hr className="border-gray-100 mb-6" />

                                {/* Info Toko */}
                                <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                                        <Store className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Dijual oleh
                                        </p>
                                        <h3 className="font-bold text-gray-900">
                                            {product.store ? (
                                                <Link
                                                    href={route(
                                                        "store.show",
                                                        product.store.slug
                                                    )}
                                                    className="hover:text-orange-600 hover:underline transition-colors"
                                                >
                                                    {product.store.name}
                                                </Link>
                                            ) : (
                                                "Juragan Seller"
                                            )}
                                        </h3>
                                    </div>
                                    <div className="ml-auto">
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3" />{" "}
                                            Terpercaya
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h3 className="font-semibold text-gray-900 mb-2">
                                        Deskripsi Produk
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                                        {product.description ||
                                            "Tidak ada deskripsi."}
                                    </p>
                                </div>

                                {/* ACTION AREA */}
                                <div className="space-y-4">
                                    {!isWhatsAppMode && (
                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="text-sm font-medium text-gray-700">
                                                Jumlah:
                                            </span>
                                            <div className="flex items-center border rounded-md">
                                                <button
                                                    onClick={() =>
                                                        setData(
                                                            "qty",
                                                            Math.max(
                                                                1,
                                                                data.qty - 1
                                                            )
                                                        )
                                                    }
                                                    className="p-2 hover:bg-gray-100 text-gray-500"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-12 text-center font-bold text-gray-900">
                                                    {data.qty}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        setData(
                                                            "qty",
                                                            data.qty + 1
                                                        )
                                                    }
                                                    className="p-2 hover:bg-gray-100 text-gray-500"
                                                    disabled={
                                                        data.qty >=
                                                        product.stock
                                                    }
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                Stok: {product.stock}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        {isWhatsAppMode ? (
                                            <a
                                                href={waLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full"
                                            >
                                                <Button className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2">
                                                    <MessageCircle className="w-5 h-5" />{" "}
                                                    Chat Penjual & Beli
                                                </Button>
                                            </a>
                                        ) : (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 h-12 text-lg border-orange-600 text-orange-600 hover:bg-orange-50"
                                                    onClick={handleAddToCart}
                                                    disabled={
                                                        processing ||
                                                        product.stock < 1
                                                    }
                                                >
                                                    <ShoppingCart className="w-5 h-5 mr-2" />
                                                    {processing
                                                        ? "Memproses..."
                                                        : "+ Keranjang"}
                                                </Button>
                                                <Button
                                                    className="flex-1 h-12 text-lg bg-orange-600 hover:bg-orange-700"
                                                    onClick={handleBuyNow}
                                                    disabled={
                                                        processing ||
                                                        product.stock < 1
                                                    }
                                                >
                                                    Beli Sekarang
                                                </Button>
                                            </>
                                        )}
                                    </div>

                                    {isWhatsAppMode && (
                                        <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-xs flex gap-2 items-start">
                                            <Truck className="w-4 h-4 mt-0.5 shrink-0" />
                                            <p>
                                                Toko ini menggunakan{" "}
                                                <b>Transaksi Manual</b> via
                                                WhatsApp.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RELATED PRODUCTS */}
                    <div className="mt-12 border-t pt-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-1">
                            <h2 className="text-xl font-bold text-gray-900">
                                Produk Serupa Lainnya
                            </h2>

                            {/* TOMBOL LIHAT SEMUA (Link ke Filter Kategori) */}
                            {product.category && (
                                <Link
                                    href={`/?category=${product.category.slug}`}
                                    className="text-orange-600 font-medium hover:text-orange-700 hover:underline text-sm flex items-center gap-1"
                                >
                                    Lihat semua di kategori{" "}
                                    {product.category.name}
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            )}
                        </div>
                        {relatedProducts.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {relatedProducts.map((rel) => (
                                    <Link
                                        key={rel.id}
                                        href={route("product.detail", rel.slug)}
                                        className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition-all group"
                                    >
                                        <div className="aspect-square bg-gray-100 overflow-hidden">
                                            <img
                                                src={`/storage/${rel.image}`}
                                                alt={rel.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-medium text-gray-900 truncate text-sm">
                                                {rel.name}
                                            </h3>
                                            <p className="font-bold text-orange-600 mt-1">
                                                {formatRupiah(rel.price)}
                                            </p>
                                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                                <Store className="w-3 h-3" />
                                                <span className="truncate">
                                                    {product.store?.name ||
                                                        "UMKM"}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">
                                Belum ada produk sejenis.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
