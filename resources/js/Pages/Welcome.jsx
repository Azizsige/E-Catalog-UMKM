import { Head, Link, router } from "@inertiajs/react";
import { ShoppingBag, Search, X, ArrowRight, Store, Star } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { useState } from "react";
import Navbar from "@/Components/Navbar";

export default function Welcome({ auth, products, categories, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || "");

    // Cek apakah user sedang melakukan filtering/pencarian
    const isFiltering = filters.search || filters.category;

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
            { preserveState: true }
        );
    };

    const handleCategory = (categorySlug) => {
        router.get(
            "/",
            { search: filters.search, category: categorySlug },
            { preserveState: true }
        );
    };

    const clearFilters = () => {
        setSearchTerm("");
        router.get("/");
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <Head title="Selamat Datang" />
            <Navbar />

            {/* --- 1. HERO SECTION (Hanya Muncul Jika TIDAK Sedang Filter) --- */}
            {!isFiltering && (
                <>
                    {/* Banner Besar */}
                    <div className="bg-white border-b">
                        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
                                Jajanan UMKM{" "}
                                <span className="text-orange-600">Pilihan</span>{" "}
                                <br />
                                Langsung dari Tetangga!
                            </h1>
                            <p className="mt-4 text-xl text-gray-500 max-w-2xl mb-8">
                                Dukung ekonomi lokal dengan rasa bintang lima
                                harga kaki lima.
                            </p>

                            {/* Search Bar Besar di Hero */}
                            <form
                                onSubmit={handleSearch}
                                className="w-full max-w-xl flex gap-2 shadow-lg p-2 bg-white rounded-full border"
                            >
                                <Input
                                    placeholder="Lagi ngidam apa hari ini? (ex: Seblak, Kopi)"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="border-0 shadow-none focus-visible:ring-0 text-lg h-12 bg-transparent pl-4"
                                />
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="rounded-full h-12 px-8 bg-orange-600 hover:bg-orange-700"
                                >
                                    Cari
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Section Kategori (Icon Grid) */}
                    <div className="py-12 bg-gray-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-orange-600" />{" "}
                                Kategori Populer
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {categories.map((cat) => (
                                    <div
                                        key={cat.id}
                                        onClick={() => handleCategory(cat.slug)}
                                        className="bg-white p-4 rounded-xl border hover:border-orange-500 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md text-center group"
                                    >
                                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 text-orange-600 font-bold group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                            {cat.name.charAt(0)}
                                        </div>
                                        <span className="font-medium text-sm text-gray-700 group-hover:text-orange-600">
                                            {cat.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* --- 2. COMPACT HEADER (Hanya Muncul Jika SEDANG Filter/Search) --- */}
            {isFiltering && (
                <div className="bg-white border-b py-4 px-4 sticky top-16 z-10 shadow-sm">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
                        <form
                            onSubmit={handleSearch}
                            className="flex gap-2 w-full md:max-w-md"
                        >
                            <Input
                                placeholder="Cari produk lain..."
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

                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
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
                                                : cat.slug
                                        )
                                    }
                                    className="rounded-full text-xs h-8"
                                    size="sm"
                                >
                                    {cat.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- 3. CATALOG PRODUCT (Main Content) --- */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Judul Section */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {filters.search
                                ? `Hasil pencarian: "${filters.search}"`
                                : filters.category
                                ? `Kategori: ${filters.category}`
                                : "Rekomendasi Terbaru"}
                        </h2>
                        {!isFiltering && (
                            <p className="text-gray-500 text-sm mt-1">
                                Produk terbaru yang baru aja di-restock!
                            </p>
                        )}
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                href={route("product.detail", product.slug)}
                                className="group flex flex-col bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                            >
                                {/* Image Wrapper */}
                                <div className="aspect-square bg-gray-200 relative overflow-hidden">
                                    {product.image ? (
                                        <img
                                            src={`/storage/${product.image}`}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <ShoppingBag className="w-12 h-12 opacity-20" />
                                        </div>
                                    )}
                                    {/* Badge Stok */}
                                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur text-white text-[10px] px-2 py-1 rounded font-medium">
                                        Stok: {product.stock}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 flex-1 flex flex-col">
                                    {/* Nama Toko */}
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                                        <Store className="w-3 h-3" />
                                        <span className="truncate">
                                            {product.store?.name || "UMKM"}
                                        </span>
                                    </div>

                                    {/* Nama Produk */}
                                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors">
                                        {product.name}
                                    </h3>

                                    {/* Rating Fake (Pemanis) */}
                                    <div className="flex items-center gap-1 mb-3">
                                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                        <span className="text-xs text-gray-500">
                                            4.8
                                        </span>
                                    </div>

                                    {/* Footer Card: Harga & Button */}
                                    <div className="mt-auto flex items-center justify-between">
                                        <span className="font-extrabold text-lg text-orange-600">
                                            {formatRupiah(product.price)}
                                        </span>
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                            <ShoppingBag className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                        <Search className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">
                            Produk tidak ditemukan
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Coba kata kunci lain atau reset filter.
                        </p>
                        <Button
                            onClick={clearFilters}
                            variant="outline"
                            className="mt-4"
                        >
                            Lihat Semua Produk
                        </Button>
                    </div>
                )}
            </main>

            <footer className="bg-gray-900 text-white mt-20 py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h3 className="text-2xl font-bold mb-4">E-Catalog UMKM</h3>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">
                        Platform digital untuk memajukan UMKM lokal agar bisa
                        bersaing di era digital.
                    </p>
                    <p className="text-sm text-gray-600">
                        &copy; {new Date().getFullYear()} Dibuat dengan ❤️ oleh
                        Mahasiswa Poltek.
                    </p>
                </div>
            </footer>
        </div>
    );
}
