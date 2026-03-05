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
            const newCount = newItems.reduce((acc, curr) => acc + curr.qty, 0);
            updateLocalCart({ items: newItems, count: newCount });
        }
    };

    // --- TAMBAHAN BARU: Logic Hapus Langsung Tanpa Confirm ---
    const removeItem = (productId) => {
        const newItems = guestCart.items.filter(
            (item) => item.product.id !== productId,
        );
        const newCount = newItems.reduce((acc, curr) => acc + curr.qty, 0);
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
            <nav className="bg-white border-b sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* LOGO */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link
                                href="/"
                                className="text-2xl font-bold text-primary flex items-center gap-2"
                            >
                                <Store className="w-8 h-8 text-orange-600" />
                                <span className="text-gray-900 tracking-tighter">
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
                                className="p-2 rounded-full flex items-center gap-2 hover:bg-gray-100 transition-colors text-gray-600 hover:text-orange-600"
                                title="Lacak Pesanan"
                            >
                                <Search className="w-5 h-5" />
                                <span className="hidden md:inline text-sm font-medium">
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
                                        className="relative p-2 rounded-full flex items-center gap-2 hover:bg-gray-100 transition-colors text-gray-600 hover:text-orange-600 focus:outline-none"
                                    >
                                        <ShoppingCart className="w-6 h-6" />
                                        {guestCart.count > 0 && (
                                            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full border-2 border-white">
                                                {guestCart.count}
                                            </span>
                                        )}
                                        <span className="hidden sm:inline font-medium text-sm">
                                            Keranjang
                                        </span>
                                    </button>

                                    {/* DROPDOWN ISI KERANJANG LOKAL */}
                                    {isCartOpen && (
                                        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-xl border overflow-hidden z-50">
                                            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
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
                                                    <div className="divide-y text-sm">
                                                        {guestCart.items.map(
                                                            (item) => (
                                                                <div
                                                                    key={
                                                                        item
                                                                            .product
                                                                            .id
                                                                    }
                                                                    className="p-4 flex gap-3 hover:bg-gray-50 relative group"
                                                                >
                                                                    <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border">
                                                                        <img
                                                                            src={`/storage/${item.product.image}`}
                                                                            className="w-full h-full object-cover"
                                                                            alt={
                                                                                item
                                                                                    .product
                                                                                    .name
                                                                            }
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0 text-left">
                                                                        <div className="flex justify-between items-start relative">
                                                                            <p className="text-sm font-medium text-gray-900 truncate pr-6">
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
                                                                            <span className="text-xs text-orange-600 font-bold">
                                                                                {formatRupiah(
                                                                                    item
                                                                                        .product
                                                                                        .price,
                                                                                )}
                                                                            </span>
                                                                            <div className="flex items-center border rounded-md h-6">
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
                                                    className="w-full block"
                                                >
                                                    <Button className="w-full bg-orange-600 hover:bg-orange-700 shadow-md">
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
                                <div className="relative group ml-2 border-l pl-4 border-gray-200">
                                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all border border-transparent focus:outline-none">
                                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold border border-orange-200 uppercase">
                                            {auth.user.name.charAt(0)}
                                        </div>
                                        <div className="hidden sm:block text-left">
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
                                        <div className="px-4 py-3 bg-gray-50 border-b">
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
                                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                                            >
                                                <User className="w-4 h-4 text-orange-600" />{" "}
                                                Dashboard Admin
                                            </Link>
                                            <hr className="my-1 border-gray-100" />
                                            <Link
                                                href={route("logout")}
                                                method="post"
                                                as="button"
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-bold"
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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                <Search className="w-5 h-5 text-orange-600" />{" "}
                                Lacak Pesanan
                            </h2>
                            <button
                                onClick={() => setIsTrackModalOpen(false)}
                                className="text-gray-400 hover:bg-gray-200 p-1 rounded-full transition-colors"
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
                                    className="flex-1 uppercase font-mono text-sm"
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
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
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
                                                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50 transition-colors group"
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
