import { Head, Link, router } from "@inertiajs/react";
import {
    Trash2,
    ShoppingBag,
    ArrowRight,
    Store,
    Minus,
    Plus,
    Loader2,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { useState } from "react";
// Import Navbar biar tetap muncul di atas
import Navbar from "@/Components/Navbar";

export default function CartIndex({ carts }) {
    // --- STATE ---
    const [selectedItems, setSelectedItems] = useState([]);
    const [updatingItemId, setUpdatingItemId] = useState(null);

    // --- HELPER ---
    const formatRupiah = (number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(number);
    };

    // --- LOGIC CHECKBOX ---
    const handleSelect = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const handleSelectAll = () => {
        if (selectedItems.length === carts.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(carts.map((item) => item.id));
        }
    };

    // --- LOGIC UPDATE QTY ---
    const updateQty = (cartId, newQty, maxStock) => {
        if (newQty < 1 || newQty > maxStock) return;
        setUpdatingItemId(cartId);
        router.patch(
            route("cart.update", cartId),
            { qty: newQty },
            {
                preserveScroll: true,
                onFinish: () => setUpdatingItemId(null),
            }
        );
    };

    // --- LOGIC HAPUS ---
    const handleDelete = (cartId) => {
        if (confirm("Yakin mau hapus barang ini?")) {
            router.delete(route("cart.destroy", cartId));
        }
    };

    // --- LOGIC HITUNG TOTAL (Cuma yang dicentang) ---
    const totalSelectedPrice = carts
        .filter((item) => selectedItems.includes(item.id))
        .reduce((acc, item) => acc + item.product.price * item.qty, 0);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head title="Keranjang Belanja" />

            {/* Navbar Global */}
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6" />
                        Keranjang Belanja
                    </h1>
                </div>

                {carts.length > 0 ? (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* --- LIST BARANG (KIRI) --- */}
                        <div className="flex-1 space-y-4">
                            {/* Pilih Semua */}
                            <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500 cursor-pointer"
                                    checked={
                                        selectedItems.length === carts.length &&
                                        carts.length > 0
                                    }
                                    onChange={handleSelectAll}
                                />
                                <span className="font-semibold text-gray-700">
                                    Pilih Semua ({carts.length})
                                </span>
                            </div>

                            {/* Loop Barang */}
                            {carts.map((item) => (
                                <div
                                    key={item.id}
                                    className={`bg-white p-4 rounded-xl border shadow-sm flex gap-4 items-start transition-colors ${
                                        selectedItems.includes(item.id)
                                            ? "border-orange-200 bg-orange-50/30"
                                            : ""
                                    }`}
                                >
                                    {/* CHECKBOX PER ITEM */}
                                    <div className="mt-8">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500 cursor-pointer"
                                            checked={selectedItems.includes(
                                                item.id
                                            )}
                                            onChange={() =>
                                                handleSelect(item.id)
                                            }
                                        />
                                    </div>

                                    {/* GAMBAR */}
                                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border">
                                        <img
                                            src={`/storage/${item.product.image}`}
                                            alt={item.product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* KONTEN TENGAH */}
                                    <div className="flex-1 flex flex-col justify-between h-24">
                                        <div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                                <Store className="w-3 h-3" />
                                                {item.product.user?.store
                                                    ?.name || "Toko"}
                                            </div>
                                            <Link
                                                href={route(
                                                    "product.detail",
                                                    item.product.slug
                                                )}
                                                className="font-semibold text-gray-900 hover:text-primary line-clamp-1 text-lg"
                                            >
                                                {item.product.name}
                                            </Link>
                                            <p className="text-primary font-bold mt-1">
                                                {formatRupiah(
                                                    item.product.price
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* KONTROL KANAN */}
                                    <div className="flex flex-col items-end justify-between h-24">
                                        <button
                                            onClick={() =>
                                                handleDelete(item.id)
                                            }
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                            title="Hapus"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>

                                        <div className="flex items-center border rounded-lg bg-white h-9 shadow-sm">
                                            <button
                                                onClick={() =>
                                                    updateQty(
                                                        item.id,
                                                        item.qty - 1,
                                                        item.product.stock
                                                    )
                                                }
                                                className="px-3 h-full text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-l-lg disabled:opacity-30 transition-colors"
                                                disabled={
                                                    item.qty <= 1 ||
                                                    updatingItemId === item.id
                                                }
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="w-10 text-center text-sm font-bold text-gray-700 flex justify-center items-center">
                                                {updatingItemId === item.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                                                ) : (
                                                    item.qty
                                                )}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    updateQty(
                                                        item.id,
                                                        item.qty + 1,
                                                        item.product.stock
                                                    )
                                                }
                                                className="px-3 h-full text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-r-lg disabled:opacity-30 transition-colors"
                                                disabled={
                                                    item.qty >=
                                                        item.product.stock ||
                                                    updatingItemId === item.id
                                                }
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* --- RINGKASAN BELANJA (KANAN) --- */}
                        <div className="lg:w-1/3">
                            <div className="bg-white p-6 rounded-xl border shadow-sm sticky top-24">
                                <h3 className="font-bold text-lg mb-4">
                                    Ringkasan Belanja
                                </h3>
                                <div className="space-y-3 mb-6 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Total Barang Dipilih</span>
                                        <span className="font-medium text-gray-900">
                                            {selectedItems.length} Barang
                                        </span>
                                    </div>
                                    <hr className="border-gray-100" />
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-gray-900 text-lg">
                                            Total Harga
                                        </span>
                                        <span className="font-bold text-xl text-primary">
                                            {formatRupiah(totalSelectedPrice)}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-12 text-lg font-bold bg-primary hover:bg-orange-600 shadow-lg shadow-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={selectedItems.length === 0}
                                    // --- BAGIAN INI YANG DIUBAH ---
                                    onClick={() => {
                                        // Kirim ID barang yang dipilih ke route checkout
                                        router.get(route("checkout.index"), {
                                            ids: selectedItems,
                                        });
                                    }}
                                    // ------------------------------
                                >
                                    Checkout ({selectedItems.length}){" "}
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="w-10 h-10 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Keranjangmu Kosong
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Wah, sepertinya kamu belum belanja apa-apa nih.
                        </p>
                        <Link href="/">
                            <Button>Mulai Belanja</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
