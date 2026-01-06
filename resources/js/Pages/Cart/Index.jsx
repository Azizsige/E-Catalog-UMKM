import { Head, Link, router } from "@inertiajs/react";
import {
    Trash2,
    ShoppingBag,
    ArrowRight,
    Store,
    Minus,
    Plus,
    Loader2,
    AlertTriangle, // Icon peringatan buat modal
    X, // Icon silang
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { useState, useEffect } from "react";
import Navbar from "@/Components/Navbar";

export default function CartIndex({ carts }) {
    // --- STATE ---
    const [selectedItems, setSelectedItems] = useState([]);
    const [updatingItemId, setUpdatingItemId] = useState(null);

    // 1. STATE UNTUK MODAL HAPUS
    const [deleteId, setDeleteId] = useState(null); // Kalau ada ID, modal muncul
    const [isDeleting, setIsDeleting] = useState(false); // Loading state saat hapus

    // --- LOGIC AUTO-CHECK ---
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const checkedProductId = params.get("checked");

        if (checkedProductId && carts.length > 0) {
            const productId = parseInt(checkedProductId);
            const targetCartItem = carts.find(
                (item) => item.product.id === productId
            );

            if (targetCartItem) {
                setSelectedItems([targetCartItem.id]);
                const newUrl = window.location.pathname;
                window.history.replaceState({}, "", newUrl);
            }
        }
    }, [carts]);

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

    // --- 2. LOGIC BUKA MODAL ---
    const confirmDelete = (cartId) => {
        setDeleteId(cartId); // Set ID, Modal otomatis muncul
    };

    // --- 3. LOGIC EKSEKUSI HAPUS ---
    const executeDelete = () => {
        if (!deleteId) return;

        setIsDeleting(true);
        router.delete(route("cart.destroy", deleteId), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteId(null); // Tutup modal
                setIsDeleting(false);
                // Jika item yang dihapus sedang dicentang, buang dari selectedItems
                setSelectedItems((prev) =>
                    prev.filter((id) => id !== deleteId)
                );
            },
            onError: () => setIsDeleting(false),
            onFinish: () => setIsDeleting(false),
        });
    };

    // Cari nama barang yang mau dihapus buat ditampilkan di modal
    const itemToDelete = carts.find((c) => c.id === deleteId);

    // --- LOGIC HITUNG TOTAL ---
    const totalSelectedPrice = carts
        .filter((item) => selectedItems.includes(item.id))
        .reduce((acc, item) => acc + item.product.price * item.qty, 0);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head title="Keranjang Belanja" />
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* ... Header ... */}
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
                                        selectedItems.length === carts.length
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
                                    {/* CHECKBOX */}
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

                                    {/* INFO TENGAH */}
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
                                        {/* --- 4. GANTI ONCLICK HAPUS --- */}
                                        <button
                                            onClick={() =>
                                                confirmDelete(item.id)
                                            }
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                            title="Hapus"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        {/* ----------------------------- */}

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

                        {/* RINGKASAN BELANJA */}
                        <div className="lg:w-1/3">
                            <div className="bg-white p-6 rounded-xl border shadow-sm sticky top-24">
                                <h3 className="font-bold text-lg mb-4">
                                    Ringkasan Belanja
                                </h3>
                                <div className="space-y-3 mb-6 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Total Barang</span>
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
                                    onClick={() =>
                                        router.get(route("checkout.index"), {
                                            ids: selectedItems,
                                        })
                                    }
                                >
                                    Checkout ({selectedItems.length}){" "}
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Tampilan Kosong (Sama kayak sebelumnya)
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

            {/* --- 5. MODAL KONFIRMASI HAPUS (BACKDROP BLUR) --- */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header Modal */}
                        <div className="p-6 text-center">
                            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-7 h-7" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                Hapus Produk?
                            </h3>
                            <p className="text-gray-500 text-sm">
                                Apakah kamu yakin ingin menghapus <br />
                                <span className="font-bold text-gray-800">
                                    "{itemToDelete?.product?.name}"
                                </span>{" "}
                                <br />
                                dari keranjang belanja?
                            </p>
                        </div>

                        {/* Footer Modal (Tombol) */}
                        <div className="flex border-t divide-x">
                            <button
                                onClick={() => setDeleteId(null)} // Batal
                                className="flex-1 py-4 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                                disabled={isDeleting}
                            >
                                Batal
                            </button>
                            <button
                                onClick={executeDelete} // Hapus
                                className="flex-1 py-4 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors flex justify-center items-center gap-2"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />{" "}
                                        Menghapus...
                                    </>
                                ) : (
                                    "Ya, Hapus"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ------------------------------------------------ */}
        </div>
    );
}
