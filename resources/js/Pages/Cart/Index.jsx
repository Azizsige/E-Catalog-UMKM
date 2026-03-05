import { Head, Link, router } from "@inertiajs/react";
import {
    Trash2,
    ShoppingBag,
    ArrowRight,
    Store,
    Minus,
    Plus,
    AlertTriangle,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { useState, useEffect } from "react";
import Navbar from "@/Components/Navbar";

export default function CartIndex() {
    const [cartItems, setCartItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [deleteId, setDeleteId] = useState(null);

    // Ambil data dari Local Storage saat halaman dimuat
    useEffect(() => {
        const storedCart = localStorage.getItem("guest_cart");
        if (storedCart) {
            const parsedCart = JSON.parse(storedCart);
            setCartItems(parsedCart.items || []);
        }
    }, []);

    // Helper update Local Storage
    const saveToLocalStorage = (newItems) => {
        const newCount = newItems.reduce((acc, item) => acc + item.qty, 0);
        localStorage.setItem(
            "guest_cart",
            JSON.stringify({ items: newItems, count: newCount }),
        );
        setCartItems(newItems);
        window.dispatchEvent(new Event("guest-cart-updated"));
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(number);
    };

    // Logic Checkbox
    const handleSelect = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const handleSelectAll = () => {
        if (selectedItems.length === cartItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cartItems.map((item) => item.id));
        }
    };

    // Logic Update Qty
    const updateQty = (itemId, newQty, maxStock) => {
        if (newQty < 1 || newQty > maxStock) return;
        const newItems = cartItems.map((item) => {
            if (item.id === itemId) return { ...item, qty: newQty };
            return item;
        });
        saveToLocalStorage(newItems);
    };

    // Logic Hapus
    const confirmDelete = () => {
        if (!deleteId) return;
        const newItems = cartItems.filter((item) => item.id !== deleteId);
        saveToLocalStorage(newItems);
        setSelectedItems(selectedItems.filter((id) => id !== deleteId)); // Hapus dari selected kalau ada
        setDeleteId(null);
    };

    const itemToDelete = cartItems.find((c) => c.id === deleteId);

    const totalSelectedPrice = cartItems
        .filter((item) => selectedItems.includes(item.id))
        .reduce((acc, item) => acc + item.product.price * item.qty, 0);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head title="Keranjang Belanja" />
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6" /> Keranjang Belanja
                    </h1>
                </div>

                {cartItems.length > 0 ? (
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1 space-y-4">
                            <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 text-orange-600 rounded cursor-pointer"
                                    checked={
                                        selectedItems.length ===
                                            cartItems.length &&
                                        cartItems.length > 0
                                    }
                                    onChange={handleSelectAll}
                                />
                                <span className="font-semibold text-gray-700">
                                    Pilih Semua ({cartItems.length})
                                </span>
                            </div>

                            {cartItems.map((item) => (
                                <div
                                    key={item.id}
                                    className={`bg-white p-4 rounded-xl border shadow-sm flex gap-4 items-start ${selectedItems.includes(item.id) ? "border-orange-200 bg-orange-50/30" : ""}`}
                                >
                                    <div className="mt-8">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 text-orange-600 rounded cursor-pointer"
                                            checked={selectedItems.includes(
                                                item.id,
                                            )}
                                            onChange={() =>
                                                handleSelect(item.id)
                                            }
                                        />
                                    </div>
                                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border">
                                        <img
                                            src={`/storage/${item.product.image}`}
                                            alt={item.product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between h-24">
                                        <div>
                                            <p className="font-semibold text-gray-900 line-clamp-1 text-lg">
                                                {item.product.name}
                                            </p>
                                            <p className="text-primary font-bold mt-1">
                                                {formatRupiah(
                                                    item.product.price,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end justify-between h-24">
                                        <button
                                            onClick={() => setDeleteId(item.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <div className="flex items-center border rounded-lg bg-white h-9 shadow-sm">
                                            <button
                                                onClick={() =>
                                                    updateQty(
                                                        item.id,
                                                        item.qty - 1,
                                                        item.product.stock,
                                                    )
                                                }
                                                className="px-3 h-full text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-l-lg disabled:opacity-30"
                                                disabled={item.qty <= 1}
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="w-10 text-center text-sm font-bold text-gray-700">
                                                {item.qty}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    updateQty(
                                                        item.id,
                                                        item.qty + 1,
                                                        item.product.stock,
                                                    )
                                                }
                                                className="px-3 h-full text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-r-lg disabled:opacity-30"
                                                disabled={
                                                    item.qty >=
                                                    item.product.stock
                                                }
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

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
                                    className="w-full h-12 text-lg font-bold bg-primary hover:bg-orange-600 disabled:opacity-50"
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

            {/* Modal Hapus */}
            {deleteId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
                        <AlertTriangle className="w-10 h-10 text-red-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold mb-2">
                            Hapus Produk?
                        </h3>
                        <p className="text-gray-500 text-sm mb-6">
                            Hapus "{itemToDelete?.product?.name}" dari
                            keranjang?
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setDeleteId(null)}
                            >
                                Batal
                            </Button>
                            <Button
                                className="flex-1 bg-red-600 hover:bg-red-700"
                                onClick={confirmDelete}
                            >
                                Ya, Hapus
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
