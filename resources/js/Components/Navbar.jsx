import { Link, usePage, router } from "@inertiajs/react";
import {
    ShoppingCart,
    User,
    Store,
    X,
    Minus,
    Plus,
    Trash2,
    AlertTriangle,
    Search,
    FileText,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";

export default function Navbar() {
    const { auth } = usePage().props;

    // State Cart
    const [isCartOpen, setIsCartOpen] = useState(false);
    const cartRef = useRef(null);
    const [guestCart, setGuestCart] = useState({ items: [], count: 0 });

    // State Modal Track Order
    const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
    const [invoiceInput, setInvoiceInput] = useState("");
    const [recentOrders, setRecentOrders] = useState([]);

    // 1. Ambil data keranjang & riwayat order saat komponen dimuat
    useEffect(() => {
        loadGuestCart();
        loadRecentOrders();

        const handleCartUpdate = () => loadGuestCart();
        window.addEventListener("guest-cart-updated", handleCartUpdate);

        return () =>
            window.removeEventListener("guest-cart-updated", handleCartUpdate);
    }, []);

    const loadGuestCart = () => {
        const storedCart = localStorage.getItem("guest_cart");
        if (storedCart) {
            setGuestCart(JSON.parse(storedCart));
        } else {
            setGuestCart({ items: [], count: 0 });
        }
    };

    const loadRecentOrders = () => {
        const orders = JSON.parse(localStorage.getItem("guest_orders") || "[]");
        setRecentOrders(orders);
    };

    const updateLocalCart = (newCart) => {
        localStorage.setItem("guest_cart", JSON.stringify(newCart));
        setGuestCart(newCart);
        window.dispatchEvent(new Event("guest-cart-updated"));
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(number);
    };

    // Tutup dropdown kalau klik di luar
    useEffect(() => {
        function handleClickOutside(event) {
            if (cartRef.current && !cartRef.current.contains(event.target)) {
                if (!document.getElementById("delete-modal")) {
                    setIsCartOpen(false);
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Logic Update Qty
    const updateQty = (productId, newQty, maxStock) => {
        if (newQty < 1 || newQty > maxStock) return;
        let newItems = [...guestCart.items];
        const itemIndex = newItems.findIndex(
            (item) => item.product.id === productId,
        );
        if (itemIndex > -1) {
            newItems[itemIndex].qty = newQty;
            // FIX BUG: Ubah newCount jadi items.length
            const newCount = newItems.length;
            updateLocalCart({ items: newItems, count: newCount });
        }
    };

    // --- TAMBAHAN BARU: Logic Hapus Langsung Tanpa Confirm ---
    const removeItem = (productId) => {
        const newItems = guestCart.items.filter(
            (item) => item.product.id !== productId,
        );
        // FIX BUG: Ubah newCount jadi items.length
        const newCount = newItems.length;
        updateLocalCart({ items: newItems, count: newCount });

        // Kalau keranjang udah kosong setelah dihapus, tutup dropdownnya
        if (newItems.length === 0) {
            setIsCartOpen(false);
        }
    };

    // Fungsi Submit Lacak Pesanan
    const handleTrackOrder = (e) => {
        e.preventDefault();
        if (invoiceInput.trim() !== "") {
            setIsTrackModalOpen(false);
            router.get(`/order/${invoiceInput.trim().toUpperCase()}`);
        }
    };

    return (
        <>
            <nav className="sticky top-0 z-40 bg-white border-b shadow-sm">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* LOGO */}
                        <div className="flex items-center flex-shrink-0">
                            <Link
                                href="/"
                                className="flex items-center gap-2 text-2xl font-bold text-primary"
                            >
                                <Store className="w-8 h-8 text-orange-600" />
                                <span className="tracking-tighter text-gray-900">
                                    Juragan
                                    <span className="text-orange-600">
                                        {" "}
                                        Lapak
                                    </span>
                                </span>
                            </Link>
                        </div>

                        {/* MENU KANAN */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            {/* --- TOMBOL LACAK PESANAN --- */}
                            <button
                                onClick={() => {
                                    loadRecentOrders(); // Refresh data terbaru
                                    setIsTrackModalOpen(true);
                                }}
                                className="flex items-center gap-2 p-2 text-gray-600 transition-colors rounded-full hover:bg-gray-100 hover:text-orange-600"
                                title="Lacak Pesanan"
                            >
                                <Search className="w-5 h-5" />
                                <span className="hidden text-sm font-medium md:inline">
                                    Lacak
                                </span>
                            </button>

                            {/* --- ICON CART PUBLIK --- */}
                            {(!auth.user || auth.user.role !== "admin") && (
                                <div className="relative" ref={cartRef}>
                                    <button
                                        onClick={() =>
                                            setIsCartOpen(!isCartOpen)
                                        }
                                        className="relative flex items-center gap-2 p-2 text-gray-600 transition-colors rounded-full hover:bg-gray-100 hover:text-orange-600 focus:outline-none"
                                    >
                                        <ShoppingCart className="w-6 h-6" />
                                        {guestCart.count > 0 && (
                                            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform bg-red-600 border-2 border-white rounded-full translate-x-1/4 -translate-y-1/4">
                                                {guestCart.count}
                                            </span>
                                        )}
                                        <span className="hidden text-sm font-medium sm:inline">
                                            Keranjang
                                        </span>
                                    </button>

                                    {/* DROPDOWN ISI KERANJANG LOKAL */}
                                    {isCartOpen && (
                                        <div className="absolute right-0 z-50 mt-3 overflow-hidden bg-white border shadow-xl w-80 sm:w-96 rounded-xl">
                                            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                                                <h3 className="font-semibold text-gray-900">
                                                    Keranjang ({guestCart.count}
                                                    )
                                                </h3>
                                                <button
                                                    onClick={() =>
                                                        setIsCartOpen(false)
                                                    }
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="max-h-[60vh] overflow-y-auto">
                                                {guestCart.items.length > 0 ? (
                                                    <div className="text-sm divide-y">
                                                        {guestCart.items.map(
                                                            (item) => (
                                                                <div
                                                                    key={
                                                                        item
                                                                            .product
                                                                            .id
                                                                    }
                                                                    className="relative flex gap-3 p-4 hover:bg-gray-50 group"
                                                                >
                                                                    <div className="flex-shrink-0 w-12 h-12 overflow-hidden bg-gray-100 border rounded-md">
                                                                        <img
                                                                            src={`/storage/${item.product.image}`}
                                                                            className="object-cover w-full h-full"
                                                                            alt={
                                                                                item
                                                                                    .product
                                                                                    .name
                                                                            }
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0 text-left">
                                                                        <div className="relative flex items-start justify-between">
                                                                            <p className="pr-6 text-sm font-medium text-gray-900 truncate">
                                                                                {
                                                                                    item
                                                                                        .product
                                                                                        .name
                                                                                }
                                                                            </p>
                                                                            {/* --- TOMBOL HAPUS (TRASH) BARU --- */}
                                                                            <button
                                                                                onClick={() =>
                                                                                    removeItem(
                                                                                        item
                                                                                            .product
                                                                                            .id,
                                                                                    )
                                                                                }
                                                                                className="absolute top-0 right-0 text-gray-300 hover:text-red-500 transition-colors p-0.5"
                                                                                title="Hapus"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                        <div className="flex items-center justify-between mt-1">
                                                                            <span className="text-xs font-bold text-orange-600">
                                                                                {formatRupiah(
                                                                                    item
                                                                                        .product
                                                                                        .price,
                                                                                )}
                                                                            </span>
                                                                            <div className="flex items-center h-6 border rounded-md">
                                                                                <button
                                                                                    onClick={() =>
                                                                                        updateQty(
                                                                                            item
                                                                                                .product
                                                                                                .id,
                                                                                            item.qty -
                                                                                                1,
                                                                                            item
                                                                                                .product
                                                                                                .stock,
                                                                                        )
                                                                                    }
                                                                                    disabled={
                                                                                        item.qty <=
                                                                                        1
                                                                                    }
                                                                                    className="px-1.5 h-full hover:bg-red-50 disabled:opacity-30"
                                                                                >
                                                                                    <Minus className="w-3 h-3" />
                                                                                </button>
                                                                                <span className="px-2 text-xs font-semibold">
                                                                                    {
                                                                                        item.qty
                                                                                    }
                                                                                </span>
                                                                                <button
                                                                                    onClick={() =>
                                                                                        updateQty(
                                                                                            item
                                                                                                .product
                                                                                                .id,
                                                                                            item.qty +
                                                                                                1,
                                                                                            item
                                                                                                .product
                                                                                                .stock,
                                                                                        )
                                                                                    }
                                                                                    disabled={
                                                                                        item.qty >=
                                                                                        item
                                                                                            .product
                                                                                            .stock
                                                                                    }
                                                                                    className="px-1.5 h-full hover:bg-green-50 disabled:opacity-30"
                                                                                >
                                                                                    <Plus className="w-3 h-3" />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="p-8 text-center text-gray-500">
                                                        <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                                        <p className="text-sm">
                                                            Keranjang masih
                                                            kosong
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 border-t bg-gray-50">
                                                <Link
                                                    href={route("cart.index")}
                                                    onClick={() =>
                                                        setIsCartOpen(false)
                                                    }
                                                    className="block w-full"
                                                >
                                                    <Button className="w-full bg-orange-600 shadow-md hover:bg-orange-700">
                                                        Lihat Semua Keranjang
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* --- MENU LOGIN / PROFILE --- */}
                            {auth.user ? (
                                <div className="relative pl-4 ml-2 border-l border-gray-200 group">
                                    <button className="flex items-center gap-2 px-3 py-2 transition-all border border-transparent rounded-lg hover:bg-gray-100 focus:outline-none">
                                        <div className="flex items-center justify-center w-8 h-8 font-bold text-orange-600 uppercase bg-orange-100 border border-orange-200 rounded-full">
                                            {auth.user.name.charAt(0)}
                                        </div>
                                        <div className="hidden text-left sm:block">
                                            <p className="text-xs font-bold text-gray-900 leading-none truncate max-w-[100px]">
                                                {auth.user.name}
                                            </p>
                                            <p className="text-[10px] text-gray-500 capitalize leading-none mt-1">
                                                {auth.user.role === "seller"
                                                    ? "Admin"
                                                    : auth.user.role}
                                            </p>
                                        </div>
                                    </button>
                                    {/* Dropdown Profile */}
                                    <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[60] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 origin-top-right">
                                        <div className="px-4 py-3 border-b bg-gray-50">
                                            <p className="text-sm font-bold text-gray-900 truncate">
                                                {auth.user.name}
                                            </p>
                                            <p className="text-[10px] text-gray-500 truncate">
                                                {auth.user.email}
                                            </p>
                                        </div>
                                        <div className="p-2 space-y-1">
                                            <Link
                                                href={route("admin.dashboard")}
                                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
                                            >
                                                <User className="w-4 h-4 text-orange-600" />{" "}
                                                Dashboard Admin
                                            </Link>
                                            <hr className="my-1 border-gray-100" />
                                            <Link
                                                href={route("logout")}
                                                method="post"
                                                as="button"
                                                className="flex items-center w-full gap-2 px-3 py-2 text-sm font-bold text-red-600 rounded-lg hover:bg-red-50"
                                            >
                                                <X className="w-4 h-4" /> Keluar
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- MODAL LACAK PESANAN --- */}
            {isTrackModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-2xl">
                        <div className="flex items-center justify-between p-5 border-b bg-gray-50">
                            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                <Search className="w-5 h-5 text-orange-600" />{" "}
                                Lacak Pesanan
                            </h2>
                            <button
                                onClick={() => setIsTrackModalOpen(false)}
                                className="p-1 text-gray-400 transition-colors rounded-full hover:bg-gray-200"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <form
                                onSubmit={handleTrackOrder}
                                className="flex gap-2 mb-6"
                            >
                                <Input
                                    value={invoiceInput}
                                    onChange={(e) =>
                                        setInvoiceInput(e.target.value)
                                    }
                                    placeholder="Contoh: INV/20260303/ABCDE"
                                    className="flex-1 font-mono text-sm uppercase"
                                    autoFocus
                                />
                                <Button
                                    type="submit"
                                    disabled={!invoiceInput.trim()}
                                    className="bg-orange-600 hover:bg-orange-700"
                                >
                                    Lacak
                                </Button>
                            </form>

                            {/* Riwayat di Perangkat Ini */}
                            {recentOrders.length > 0 && (
                                <div>
                                    <h3 className="mb-3 text-xs font-bold tracking-wider text-gray-500 uppercase">
                                        Pesanan Terakhir Anda
                                    </h3>
                                    <div className="space-y-2">
                                        {recentOrders.map((inv, idx) => (
                                            <Link
                                                key={idx}
                                                href={`/order/${inv}`}
                                                onClick={() =>
                                                    setIsTrackModalOpen(false)
                                                }
                                                className="flex items-center justify-between p-3 transition-colors bg-white border border-gray-100 rounded-lg hover:border-orange-200 hover:bg-orange-50 group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                                                    <span className="font-mono text-sm font-semibold text-gray-700 group-hover:text-orange-700">
                                                        {inv}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-400 group-hover:text-orange-600">
                                                    Lihat &rarr;
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
