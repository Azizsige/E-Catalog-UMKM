import { Head, Link } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { ArrowLeft, ShoppingBag, Store, Tag } from "lucide-react";

export default function ProductShow({ product }) {
    // Helper format rupiah
    const formatRupiah = (number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(number);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head title={product.name} />

            {/* Navbar Simple */}
            <nav className="bg-white border-b p-4">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="font-semibold text-lg">Detail Produk</h1>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto p-4 md:p-8">
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Kolom Kiri: Gambar */}
                        <div className="bg-gray-100 aspect-square relative flex items-center justify-center">
                            {product.image ? (
                                <img
                                    src={`/storage/${product.image}`}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <ShoppingBag className="w-20 h-20 text-gray-300" />
                            )}
                        </div>

                        {/* Kolom Kanan: Info */}
                        <div className="p-6 md:p-8 flex flex-col h-full">
                            {/* Kategori */}
                            <div className="flex items-center gap-2 text-sm text-primary font-medium mb-2">
                                <Tag className="w-4 h-4" />
                                {product.category?.name || "Umum"}
                            </div>

                            {/* Judul */}
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {product.name}
                            </h1>

                            {/* Harga */}
                            <div className="text-3xl font-bold text-primary mb-6">
                                {formatRupiah(product.price)}
                            </div>

                            <hr className="mb-6" />

                            {/* Deskripsi */}
                            <div className="prose prose-sm text-gray-600 mb-8 flex-grow">
                                <h3 className="text-gray-900 font-semibold mb-2">
                                    Deskripsi Produk
                                </h3>
                                <p className="whitespace-pre-line">
                                    {product.description ||
                                        "Tidak ada deskripsi."}
                                </p>
                            </div>

                            {/* Info Penjual & Tombol Beli */}
                            <div className="mt-auto bg-gray-50 p-4 rounded-lg border">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                        <Store className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Dijual oleh:
                                        </p>
                                        <p className="font-semibold text-gray-900">
                                            {product.seller?.name}
                                        </p>
                                    </div>
                                </div>

                                <Button className="w-full h-12 text-lg">
                                    Hubungi Penjual (WhatsApp)
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
