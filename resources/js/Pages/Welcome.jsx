import { Head, Link, router } from "@inertiajs/react";
import { ShoppingBag, Search, X } from "lucide-react"; // 'User' dihapus karena sudah diurus Navbar
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { useState } from "react";
// Import Navbar Komponen kita
import Navbar from "@/Components/Navbar";

export default function Welcome({ auth, products, categories, filters }) {
    // --- LOGIC SEARCH & FILTER (TETAP SAMA) ---
    const [searchTerm, setSearchTerm] = useState(filters.search || "");

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

            {/* --- BAGIAN INI YANG KITA GANTI --- */}
            {/* Cukup panggil 1 baris ini, dia otomatis bawa Logo, Menu User, & Keranjang */}
            <Navbar />

            {/* HERO & SEARCH SECTION */}
            <div className="bg-white border-b pt-12 pb-8 text-center px-4">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-4">
                    Mau cari apa hari ini?
                </h1>

                {/* SEARCH BAR */}
                <form
                    onSubmit={handleSearch}
                    className="max-w-xl mx-auto flex gap-2 mb-8"
                >
                    <Input
                        placeholder="Cari nasi goreng, kopi, keripik..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-12 text-lg"
                    />
                    <Button type="submit" size="lg" className="h-12 px-6">
                        <Search className="w-5 h-5" />
                    </Button>
                </form>

                {/* CATEGORY PILLS */}
                <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
                    <Button
                        variant={!filters.category ? "default" : "outline"}
                        onClick={() => clearFilters()}
                        className="rounded-full"
                        size="sm"
                    >
                        Semua
                    </Button>

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
                            className="rounded-full"
                            size="sm"
                        >
                            {cat.name}
                        </Button>
                    ))}
                </div>
            </div>

            {/* CATALOG SECTION */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">
                        {filters.search
                            ? `Hasil cari: "${filters.search}"`
                            : "Katalog Produk"}
                    </h2>
                    {(filters.search || filters.category) && (
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
                                className="group block"
                            >
                                <div className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                        {product.image ? (
                                            <img
                                                src={`/storage/${product.image}`}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400">
                                                <ShoppingBag className="w-12 h-12 opacity-20" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <p className="text-xs text-muted-foreground mb-1">
                                            {product.category?.name || "Umum"}
                                        </p>
                                        <h3 className="font-semibold text-gray-900 truncate">
                                            {product.name}
                                        </h3>
                                        <div className="flex justify-between items-end mt-2">
                                            <span className="font-bold text-lg text-primary">
                                                {formatRupiah(product.price)}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                Stok: {product.stock}
                                            </span>
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
                            Tidak ditemukan
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Coba kata kunci lain atau reset filter.
                        </p>
                        <Button
                            onClick={clearFilters}
                            variant="outline"
                            className="mt-4"
                        >
                            Tampilkan Semua Produk
                        </Button>
                    </div>
                )}
            </main>

            <footer className="bg-white border-t mt-12 py-8 text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} E-Catalog UMKM. All rights
                reserved.
            </footer>
        </div>
    );
}
