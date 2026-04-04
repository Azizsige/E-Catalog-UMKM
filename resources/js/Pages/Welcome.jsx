import { Head, Link, router } from "@inertiajs/react";
import {
    ShoppingBag,
    Search,
    X,
    Store,
    Plus,
    CheckCircle2,
    PackageX,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { useState, useEffect } from "react";
import Navbar from "@/Components/Navbar";

export default function Welcome({
    auth,
    products,
    categories,
    filters,
    storeInfo,
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const isFiltering = filters.search || filters.category;

    const [toastMessage, setToastMessage] = useState(null);

    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => {
                setToastMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    const formatRupiah = (number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(number);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            "/",
            { search: searchTerm, category: filters.category },
            { preserveState: true },
        );
    };

    const handleCategory = (categorySlug) => {
        router.get(
            "/",
            { search: filters.search, category: categorySlug },
            { preserveState: true },
        );
    };

    const clearFilters = () => {
        setSearchTerm("");
        router.get("/");
    };

    const addToLocalCart = (e, product) => {
        e.preventDefault();
        e.stopPropagation();

        if (product.stock < 1) return;

        let currentCart = { items: [], count: 0 };
        const storedCart = localStorage.getItem("guest_cart");

        if (storedCart) {
            currentCart = JSON.parse(storedCart);
        }

        const existingItemIndex = currentCart.items.findIndex(
            (item) => item.product.id === product.id,
        );

        if (existingItemIndex > -1) {
            if (currentCart.items[existingItemIndex].qty < product.stock) {
                currentCart.items[existingItemIndex].qty += 1;
            } else {
                setToastMessage(`Stok ${product.name} sudah maksimal!`);
                return;
            }
        } else {
            currentCart.items.push({
                id: `local_${product.id}_${Date.now()}`,
                product: product,
                qty: 1,
            });
        }

        // FIX BUG: Hitung jumlah JENIS item, bukan total QTY
        currentCart.count = currentCart.items.length;

        localStorage.setItem("guest_cart", JSON.stringify(currentCart));
        window.dispatchEvent(new Event("guest-cart-updated"));

        setToastMessage(`Berhasil menambahkan ${product.name} ke keranjang!`);
    };

    // --- HELPER UNTUK MENGAMBIL INISIAL KATEGORI (Maks 2 Huruf) ---
    const getCategoryInitials = (name) => {
        if (!name) return "";
        const words = name.split(" ");
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase(); // Ambil 2 huruf pertama jika cuma 1 kata
    };

    return (
        <div className="relative min-h-screen font-sans text-gray-900 bg-gray-50">
            <Head title={storeInfo?.name || "Katalog Produk"} />
            <Navbar />

            {/* --- TOAST NOTIFICATION --- */}
            {toastMessage && (
                <div className="fixed z-[100] duration-300 bottom-6 right-6 animate-in slide-in-from-bottom-5 fade-in">
                    <div className="flex items-center gap-3 px-6 py-3 text-white bg-gray-900 shadow-2xl rounded-xl">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <p className="text-sm font-medium">{toastMessage}</p>
                    </div>
                </div>
            )}

            {/* --- 1. HERO SECTION DINAMIS DARI INFO BISNIS --- */}
            {!isFiltering && (
                <>
                    <div
                        className="relative bg-white bg-center bg-cover border-b"
                        style={
                            storeInfo?.banner
                                ? {
                                      backgroundImage: `url('/storage/${storeInfo.banner}')`,
                                  }
                                : {}
                        }
                    >
                        {/* Overlay Gelap Jika Ada Banner */}
                        {storeInfo?.banner && (
                            <div className="absolute inset-0 bg-black/60"></div>
                        )}

                        <div
                            className={`max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 flex flex-col items-center text-center relative z-10 ${storeInfo?.banner ? "text-white" : ""}`}
                        >
                            {/* Logo Toko */}
                            {storeInfo?.logo && (
                                <div className="mb-6 overflow-hidden bg-white border-4 border-white rounded-full shadow-xl w-28 h-28">
                                    <img
                                        src={`/storage/${storeInfo.logo}`}
                                        alt="Logo"
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            )}

                            {/* Nama & Deskripsi Toko */}
                            <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-6xl">
                                {storeInfo?.name ? (
                                    <>
                                        Selamat Datang di <br />
                                        <span className="text-orange-500">
                                            {storeInfo.name}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        Katalog{" "}
                                        <span className="text-orange-500">
                                            Terbaik
                                        </span>
                                        <br />
                                        Untuk Anda
                                    </>
                                )}
                            </h1>
                            <p
                                className={`mt-4 text-xl max-w-2xl mb-8 ${storeInfo?.banner ? "text-gray-200" : "text-gray-500"}`}
                            >
                                {storeInfo?.description ||
                                    "Pilih produk favoritmu sekarang. Belanja gampang, gak pake ribet."}
                            </p>

                            <form
                                onSubmit={handleSearch}
                                className="flex w-full max-w-xl gap-2 p-2 bg-white border rounded-full shadow-lg"
                            >
                                <Input
                                    placeholder="Cari produk favoritmu..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="h-12 pl-4 text-lg text-gray-900 bg-transparent border-0 shadow-none focus-visible:ring-0"
                                />
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="h-12 px-8 bg-orange-600 rounded-full hover:bg-orange-700"
                                >
                                    Cari
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* --- Section Kategori --- */}
                    <div className="py-12 bg-gray-50">
                        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                            <h2 className="flex items-center gap-2 mb-6 text-xl font-bold">
                                <ShoppingBag className="w-5 h-5 text-orange-600" />{" "}
                                Kategori Pilihan
                            </h2>

                            {/* FIX BUG: Tampilan Kategori Kosong & Logika Icon */}
                            {categories.length > 0 ? (
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                                    {categories.map((cat) => (
                                        <div
                                            key={cat.id}
                                            onClick={() =>
                                                handleCategory(cat.slug)
                                            }
                                            className="p-4 text-center transition-all bg-white border cursor-pointer rounded-xl hover:border-orange-500 hover:-translate-y-1 hover:shadow-md group"
                                        >
                                            {/* Logic Gambar atau Inisial */}
                                            <div
                                                className={
                                                    cat.icon
                                                        ? "flex items-center justify-center w-12 h-12 mx-auto mb-3 overflow-hidden transition-colors"
                                                        : "flex items-center justify-center w-12 h-12 mx-auto mb-3 overflow-hidden transition-colors bg-orange-100 rounded-full group-hover:bg-orange-600"
                                                }
                                            >
                                                {cat.icon ? ( // GANTI 'image' DENGAN NAMA FIELD ICON DI DATABASE LU KALAU BEDA (misal 'icon' atau 'image_path')
                                                    <img
                                                        src={`/storage/${cat.icon}`} // Sesuaikan fieldnya
                                                        alt={cat.name}
                                                        className="object-cover w-full h-full"
                                                    />
                                                ) : (
                                                    <span className="font-bold text-orange-600 transition-colors group-hover:text-white">
                                                        {getCategoryInitials(
                                                            cat.name,
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600">
                                                {cat.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-white border border-gray-300 border-dashed rounded-xl">
                                    <Store className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="font-medium text-gray-500">
                                        Belum ada kategori yang ditambahkan oleh
                                        penjual.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* --- 2. COMPACT HEADER --- */}
            {isFiltering && (
                <div className="sticky z-10 px-4 py-4 bg-white border-b shadow-sm top-16">
                    <div className="flex flex-col items-center justify-between gap-4 mx-auto max-w-7xl md:flex-row">
                        <form
                            onSubmit={handleSearch}
                            className="flex w-full gap-2 md:max-w-md"
                        >
                            <Input
                                placeholder="Cari produk..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-10"
                            />
                            <Button
                                type="submit"
                                size="sm"
                                className="h-10 px-4"
                            >
                                <Search className="w-4 h-4" />
                            </Button>
                        </form>

                        <div className="flex w-full gap-2 pb-2 overflow-x-auto md:pb-0 md:w-auto no-scrollbar">
                            {categories.map((cat) => (
                                <Button
                                    key={cat.id}
                                    variant={
                                        filters.category === cat.slug
                                            ? "default"
                                            : "outline"
                                    }
                                    onClick={() =>
                                        handleCategory(
                                            cat.slug === filters.category
                                                ? null
                                                : cat.slug,
                                        )
                                    }
                                    className="h-8 text-xs rounded-full"
                                    size="sm"
                                >
                                    {cat.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- 3. CATALOG PRODUCT --- */}
            <main className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {filters.search
                                ? `Hasil pencarian: "${filters.search}"`
                                : filters.category
                                  ? `Kategori: ${filters.category}`
                                  : "Produk Kami"}
                        </h2>
                    </div>
                    {isFiltering && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                            <X className="w-4 h-4 mr-1" /> Reset Filter
                        </Button>
                    )}
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                        {products.map((product) => {
                            const isOutofStock = product.stock < 1;

                            return (
                                <Link
                                    key={product.id}
                                    href={
                                        isOutofStock
                                            ? "#"
                                            : route(
                                                  "product.detail",
                                                  product.slug,
                                              )
                                    }
                                    onClick={(e) => {
                                        if (isOutofStock) {
                                            e.preventDefault();
                                        }
                                    }}
                                    className={`group flex flex-col bg-white border rounded-xl overflow-hidden transition-all duration-300 relative ${
                                        isOutofStock
                                            ? "opacity-75 cursor-not-allowed"
                                            : "hover:shadow-lg"
                                    }`}
                                >
                                    <div className="relative overflow-hidden bg-gray-200 aspect-square">
                                        {/* Overlay Gelap & Tulisan Habis di Tengah */}
                                        {isOutofStock && (
                                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                                <span className="px-4 py-2 text-sm font-black tracking-wider text-white transform bg-red-600 border-2 rounded-lg shadow-xl -rotate-12 md:text-base border-white/20">
                                                    STOK HABIS
                                                </span>
                                            </div>
                                        )}

                                        {product.image ? (
                                            <img
                                                src={`/storage/${product.image}`}
                                                alt={product.name}
                                                className={`object-cover w-full h-full transition-transform duration-500 ${
                                                    isOutofStock
                                                        ? "grayscale"
                                                        : "group-hover:scale-110"
                                                }`}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400">
                                                <ShoppingBag className="w-12 h-12 opacity-20" />
                                            </div>
                                        )}

                                        {/* Badge Kecil di Pojok Kiri Atas */}
                                        {!isOutofStock && (
                                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur text-white text-[10px] px-2 py-1 rounded font-medium z-10">
                                                Stok: {product.stock}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col flex-1 p-4">
                                        <h3
                                            className={`font-bold mb-1 line-clamp-2 transition-colors ${
                                                isOutofStock
                                                    ? "text-gray-500"
                                                    : "text-gray-900 group-hover:text-orange-600"
                                            }`}
                                        >
                                            {product.name}
                                        </h3>
                                        <div className="z-20 flex items-center justify-between pt-3 mt-auto">
                                            <span
                                                className={`font-extrabold text-lg ${
                                                    isOutofStock
                                                        ? "text-gray-400 line-through"
                                                        : "text-orange-600"
                                                }`}
                                            >
                                                {formatRupiah(product.price)}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();

                                                    if (!isOutofStock) {
                                                        addToLocalCart(
                                                            e,
                                                            product,
                                                        );
                                                    }
                                                }}
                                                disabled={isOutofStock}
                                                className={`flex items-center justify-center w-10 h-10 transition-colors rounded-full shadow-sm ${
                                                    isOutofStock
                                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        : "bg-orange-100 text-orange-600 hover:bg-orange-600 hover:text-white"
                                                }`}
                                                title={
                                                    isOutofStock
                                                        ? "Stok Habis"
                                                        : "Tambah ke Keranjang"
                                                }
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-white border border-gray-200 shadow-sm rounded-2xl">
                        <PackageX className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-bold text-gray-900">
                            Yahh, belum ada produk nih! 😕
                        </h3>
                        <p className="max-w-md mx-auto mt-2 text-gray-500">
                            {isFiltering
                                ? "Produk yang kamu cari atau kategori ini belum tersedia. Coba kata kunci pencarian yang lain ya."
                                : "Penjual belum menambahkan produk ke dalam katalog. Silakan kembali lagi nanti."}
                        </p>
                        {isFiltering && (
                            <Button
                                onClick={clearFilters}
                                variant="default"
                                className="mt-6 font-bold text-white bg-orange-600 hover:bg-orange-700"
                            >
                                <X className="w-4 h-4 mr-2" /> Hapus Pencarian &
                                Filter
                            </Button>
                        )}
                    </div>
                )}
            </main>

            {/* --- 4. FOOTER DINAMIS --- */}
            <footer className="py-12 mt-20 text-white bg-gray-900 border-t-4 border-orange-500">
                <div className="px-4 mx-auto text-center max-w-7xl">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        {storeInfo?.logo ? (
                            <img
                                src={`/storage/${storeInfo.logo}`}
                                alt="Logo Footer"
                                className="w-10 h-10 rounded-full object-cover bg-white p-0.5"
                            />
                        ) : (
                            <Store className="w-8 h-8 text-orange-500" />
                        )}
                        <h3 className="text-2xl font-bold">
                            {storeInfo?.name || "Toko Kami"}
                        </h3>
                    </div>
                    <p className="max-w-md mx-auto mb-8 text-gray-400">
                        {storeInfo?.address
                            ? `📍 ${storeInfo.address}`
                            : "Melayani pelanggan dengan sepenuh hati."}
                    </p>
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-sm text-gray-500">
                            &copy; {new Date().getFullYear()}{" "}
                            {storeInfo?.name || "Toko Kami"}. All rights
                            reserved.
                        </p>
                        {/* Pintu Rahasia Admin */}
                        <Link
                            href={route("login")}
                            className="mt-2 text-xs text-gray-800 transition-colors hover:text-gray-400"
                        >
                            Admin Area
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
