import { Head, Link } from "@inertiajs/react";
import { ShoppingBag, User, LogIn } from "lucide-react";
import { Button } from "@/Components/ui/button";

export default function Welcome({ auth, products }) {
    // Helper format rupiah
    const formatRupiah = (number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(number);
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <Head title="Selamat Datang" />

            {/* NAVBAR SEDERHANA */}
            <nav className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                <ShoppingBag className="w-6 h-6 text-primary" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">
                                E-Catalog UMKM
                            </span>
                        </div>

                        {/* Menu Kanan (Login/Dashboard) */}
                        <div className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={
                                        auth.user.role === "admin"
                                            ? route("admin.dashboard")
                                            : route("seller.dashboard")
                                    }
                                >
                                    <Button variant="outline">
                                        <User className="mr-2 h-4 w-4" />
                                        Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <div className="flex gap-2">
                                    <Link href={route("login")}>
                                        <Button variant="ghost">Masuk</Button>
                                    </Link>
                                    <Link href={route("register")}>
                                        <Button>Daftar Toko</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <div className="bg-white border-b py-16 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">
                    Temukan Produk UMKM Terbaik
                </h1>
                <p className="max-w-xl mx-auto text-lg text-gray-500">
                    Jelajahi ribuan produk unik dari penjual lokal terpercaya.
                    Dukung ekonomi lokal dengan belanja di sini.
                </p>
            </div>

            {/* CATALOG SECTION */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Produk Terbaru</h2>
                    {/* Nanti bisa tambah filter kategori di sini */}
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                href={route("product.detail", product.slug)} // Sesi 9 nanti kita ganti ini ke Detail Produk
                                className="group block"
                            >
                                <div className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                                    {/* Gambar Produk */}
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

                                    {/* Info Produk */}
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

                                        {/* Nama Toko */}
                                        <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs text-gray-500">
                                            <User className="w-3 h-3" />
                                            <span className="truncate">
                                                {product.seller?.name ||
                                                    "Seller"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                        <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">
                            Belum ada produk
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Jadilah penjual pertama yang mengisi katalog ini!
                        </p>
                    </div>
                )}
            </main>

            {/* FOOTER */}
            <footer className="bg-white border-t mt-12 py-8 text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} E-Catalog UMKM. All rights
                reserved.
            </footer>
        </div>
    );
}
