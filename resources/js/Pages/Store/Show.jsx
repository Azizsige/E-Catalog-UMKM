import { Head, Link } from "@inertiajs/react";
import { ShoppingBag, Store, MapPin, Phone } from "lucide-react";
import { Button } from "@/Components/ui/button";

// Kita pakai GuestLayout atau Navbar bawaan kalau ada,
// tapi untuk sekarang kita pakai div biasa biar aman dulu.
export default function StoreShow({ seller, products, store }) {
    // Helper: Ambil data store dari relasi user
    // Gunakan optional chaining (?.) jaga-jaga kalau datanya null
    // const store = seller.store;

    const formatRupiah = (number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(number);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head title={store?.name || seller.name} />

            {/* HEADER TOKO */}
            <div className="bg-white border-b">
                {/* 1. BANNER AREA */}
                <div className="h-48 md:h-64 bg-gray-200 w-full relative overflow-hidden">
                    {store?.banner ? (
                        <img
                            src={`/storage/${store.banner}`}
                            className="w-full h-full object-cover"
                            alt="Banner Toko"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                            <span className="text-sm">Belum ada banner</span>
                        </div>
                    )}
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                    <div className="relative -mt-16 flex flex-col md:flex-row items-end md:items-center gap-6">
                        {/* 2. LOGO TOKO */}
                        <div className="w-32 h-32 bg-white rounded-full p-1 shadow-lg overflow-hidden relative z-10 flex-shrink-0">
                            {store?.logo ? (
                                <img
                                    src={`/storage/${store.logo}`}
                                    className="w-full h-full object-cover rounded-full"
                                    alt="Logo Toko"
                                />
                            ) : (
                                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary">
                                    <Store className="w-12 h-12" />
                                </div>
                            )}
                        </div>

                        {/* 3. INFO TOKO */}
                        <div className="flex-1 text-center md:text-left pt-4 md:pt-0">
                            <h1 className="text-3xl font-bold text-gray-900">
                                {store?.name || seller.name}
                            </h1>

                            {/* Slogan / Deskripsi Singkat */}
                            {store?.description && (
                                <p className="text-gray-600 mt-1 max-w-2xl text-sm md:text-base">
                                    {store.description}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm text-gray-500">
                                {store?.address && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {store.address}
                                    </div>
                                )}
                                {(store?.phone_number || seller.phone) && (
                                    <div className="flex items-center gap-1">
                                        <Phone className="w-4 h-4" />
                                        {store?.phone_number || seller.phone}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tombol Aksi */}
                        <div className="flex gap-2 mt-4 md:mt-0">
                            <Link href="/">
                                <Button variant="outline">
                                    Kembali ke Home
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* DAFTAR PRODUK (Etalase) */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Etalase Toko</h2>
                    <span className="text-sm text-gray-500">
                        {products.length} Produk
                    </span>
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                href={route("product.detail", product.slug)}
                                className="group block"
                            >
                                <div className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div className="aspect-square bg-gray-100 relative">
                                        {product.image ? (
                                            <img
                                                src={`/storage/${product.image}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400">
                                                <ShoppingBag className="w-12 h-12 opacity-20" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 truncate">
                                            {product.name}
                                        </h3>
                                        <p className="font-bold text-primary mt-2">
                                            {formatRupiah(product.price)}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed">
                        <Store className="mx-auto h-12 w-12 text-gray-300" />
                        <p className="mt-2 text-gray-500">
                            Toko ini belum memajang produk apapun.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
