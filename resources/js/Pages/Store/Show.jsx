import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import Navbar from "@/Components/Navbar";
import {
    ShoppingBag,
    Store,
    MapPin,
    Phone,
    Search,
    Share2,
    MessageCircle,
    ShieldCheck,
    Calendar,
    X,
    Copy,
    Check,
    Facebook,
} from "lucide-react";
import { Button } from "@/Components/ui/button";

export default function StoreShow({ seller, products, store }) {
    // --- STATE ---
    const [searchTerm, setSearchTerm] = useState("");

    // State untuk Modal Share
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    // --- HELPER ---
    const formatRupiah = (number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(number);
    };

    // Fungsi Salin Link di dalam Modal
    const copyToClipboard = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setIsCopied(true);

        // Reset status "Copied" setelah 2 detik
        setTimeout(() => setIsCopied(false), 2000);
    };

    // Filter Produk
    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            <Head title={store?.name || seller.name} />
            <Navbar />

            {/* --- HEADER TOKO AREA --- */}
            <div className="bg-white border-b shadow-sm relative">
                {/* 1. BANNER BACKGROUND */}
                <div className="h-48 md:h-64 bg-gray-200 w-full relative overflow-hidden group">
                    {store?.banner ? (
                        <>
                            <img
                                src={`/storage/${store.banner.replace(
                                    "public/",
                                    ""
                                )}`}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                alt="Banner Toko"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                        </>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
                            <Store className="w-12 h-12 mb-2 opacity-20" />
                            <span className="text-sm font-medium">
                                Banner Toko Belum Diatur
                            </span>
                        </div>
                    )}
                </div>

                {/* 2. INFO PROFILE CONTAINER */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 mt-4">
                    <div className="relative -mt-16 flex flex-col md:flex-row items-end md:items-start gap-6">
                        {/* A. LOGO AVATAR */}
                        <div className="w-32 h-32 bg-white rounded-full p-1.5 shadow-xl overflow-hidden relative z-10 flex-shrink-0 border-4 border-white">
                            {store?.logo ? (
                                <img
                                    src={`/storage/${store.logo.replace(
                                        "public/",
                                        ""
                                    )}`}
                                    className="w-full h-full object-cover rounded-full"
                                    alt="Logo Toko"
                                />
                            ) : (
                                <div className="w-full h-full bg-orange-50 flex items-center justify-center text-orange-500 rounded-full">
                                    <Store className="w-14 h-14" />
                                </div>
                            )}
                        </div>

                        {/* B. TEKS INFO UTAMA */}
                        <div className="flex-1 text-center md:text-left pt-2 md:pt-16 w-full">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center justify-center md:justify-start gap-2">
                                        {store?.name || seller.name}
                                        <span
                                            className="bg-blue-100 text-blue-600 p-1 rounded-full"
                                            title="Terverifikasi"
                                        >
                                            <ShieldCheck className="w-5 h-5" />
                                        </span>
                                    </h1>
                                    <p className="text-gray-600 mt-2 max-w-2xl text-sm md:text-base leading-relaxed">
                                        {store?.description ||
                                            "Selamat datang di toko kami! Kami menyediakan produk berkualitas."}
                                    </p>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-sm text-gray-500">
                                        {store?.address && (
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4 text-orange-600" />
                                                <span>{store.address}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 text-orange-600" />
                                            <span>
                                                Bergabung{" "}
                                                {new Date(
                                                    seller.created_at
                                                ).getFullYear()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* C. TOMBOL AKSI */}
                                <div className="flex gap-3 mt-4 md:mt-0 justify-center md:justify-end">
                                    {/* TRIGGER MODAL SHARE */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 border-gray-300 hover:bg-gray-50"
                                        onClick={() => setIsShareOpen(true)}
                                    >
                                        <Share2 className="w-4 h-4" /> Share
                                    </Button>

                                    {(store?.phone_number || seller.phone) && (
                                        <a
                                            href={`https://wa.me/62${(
                                                store?.phone_number ||
                                                seller.phone
                                            ).replace(/^0/, "")}`}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700 gap-2 shadow-lg shadow-green-200"
                                            >
                                                <MessageCircle className="w-4 h-4" />{" "}
                                                Chat Penjual
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT (ETALASE) --- */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* TOOLBAR */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            Etalase Toko
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                {products.length} Item
                            </span>
                        </h2>
                    </div>
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Cari produk di toko ini..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-gray-50 focus:bg-white"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                {/* GRID PRODUK */}
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {filteredProducts.map((product) => (
                            <Link
                                key={product.id}
                                href={route("product.detail", product.slug)}
                                className="group block bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                    <img
                                        src={
                                            product.image
                                                ? product.image.startsWith(
                                                      "http"
                                                  )
                                                    ? product.image
                                                    : `/storage/${product.image.replace(
                                                          "public/",
                                                          ""
                                                      )}`
                                                : "/images/placeholder.jpg"
                                        }
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        alt={product.name}
                                    />
                                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                                        <div className="bg-white p-2 rounded-full shadow-lg text-orange-600">
                                            <ShoppingBag className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3
                                            className="font-semibold text-gray-900 truncate flex-1"
                                            title={product.name}
                                        >
                                            {product.name}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-1 mb-3">
                                        {product.description ||
                                            "Tidak ada deskripsi"}
                                    </p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <p className="font-bold text-lg text-orange-600">
                                            {formatRupiah(product.price)}
                                        </p>
                                        <span className="text-xs text-gray-400">
                                            Stok: {product.stock}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <ShoppingBag className="h-8 w-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                            Produk tidak ditemukan
                        </h3>
                        <p className="mt-1 text-gray-500 text-sm">
                            {searchTerm
                                ? `Tidak ada hasil untuk pencarian "${searchTerm}"`
                                : "Toko ini belum memajang produk apapun."}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="mt-4 text-orange-600 hover:underline text-sm font-medium"
                            >
                                Reset Pencarian
                            </button>
                        )}
                    </div>
                )}
            </main>

            {/* --- SHARE MODAL / POPUP --- */}
            {isShareOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800 text-lg">
                                Bagikan Toko
                            </h3>
                            <button
                                onClick={() => setIsShareOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Section 1: Copy Link */}
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                                    Salin Tautan Toko
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-100 border rounded-lg px-3 py-2.5 text-sm text-gray-600 truncate font-mono">
                                        {window.location.href}
                                    </div>
                                    <button
                                        onClick={copyToClipboard}
                                        className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
                                            isCopied
                                                ? "bg-green-600 text-white shadow-md"
                                                : "bg-gray-900 text-white hover:bg-gray-800"
                                        }`}
                                    >
                                        {isCopied ? (
                                            <>
                                                {" "}
                                                <Check className="w-4 h-4" />{" "}
                                                Disalin!{" "}
                                            </>
                                        ) : (
                                            <>
                                                {" "}
                                                <Copy className="w-4 h-4" />{" "}
                                                Salin{" "}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
