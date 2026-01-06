import { Link, usePage, router } from "@inertiajs/react";
import {
    ShoppingCart,
    User,
    Store,
    X,
    Minus,
    Plus,
    Loader2,
    Trash2,
    AlertTriangle,
    ShoppingBag,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/Components/ui/button";

export default function Navbar() {
    const { auth } = usePage().props;

    // State Navbar
    const [isCartOpen, setIsCartOpen] = useState(false);
    const cartRef = useRef(null);
    const [updatingItemId, setUpdatingItemId] = useState(null);

    // State Modal Hapus
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const formatRupiah = (number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(number);
    };

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

    const updateQty = (cartId, newQty, maxStock) => {
        if (newQty < 1 || newQty > maxStock) return;
        setUpdatingItemId(cartId);
        router.patch(
            route("cart.update", cartId),
            { qty: newQty },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setUpdatingItemId(null),
            }
        );
    };

    const openDeleteModal = (item) => {
        setItemToDelete(item);
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        router.delete(route("cart.destroy", itemToDelete.id), {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => {
                setIsDeleting(false);
                setItemToDelete(null);
            },
        });
    };

    return (
        <>
            <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* LOGO */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link
                                href="/"
                                className="text-2xl font-bold text-primary flex items-center gap-2"
                            >
                                <Store className="w-8 h-8 text-orange-600" />
                                <span className="text-gray-900">
                                    Juragan
                                    <span className="text-orange-600">
                                        {" "}
                                        Lapak
                                    </span>
                                </span>
                            </Link>
                        </div>

                        {/* MENU KANAN */}
                        <div className="flex items-center gap-4 sm:gap-6">
                            {/* 1. KONDISI SUDAH LOGIN */}
                            {auth.user ? (
                                <>
                                    {/* ICON CART (Cuma Muncul jika role = customer) */}
                                    {auth.user.role === "customer" && (
                                        <div className="relative" ref={cartRef}>
                                            <button
                                                onClick={() =>
                                                    setIsCartOpen(!isCartOpen)
                                                }
                                                className="relative p-2 rounded-full flex items-center gap-2 hover:bg-gray-100 transition-colors text-gray-600 hover:text-orange-600 focus:outline-none"
                                            >
                                                <ShoppingCart className="w-6 h-6" />
                                                {auth.cart &&
                                                    auth.cart.count > 0 && (
                                                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full border-2 border-white">
                                                            {auth.cart.count}
                                                        </span>
                                                    )}
                                                Keranjang
                                            </button>

                                            {/* DROPDOWN ISI KERANJANG */}
                                            {isCartOpen && (
                                                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-xl border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                                                        <h3 className="font-semibold text-gray-900">
                                                            Keranjang (
                                                            {auth.cart?.count ||
                                                                0}
                                                            )
                                                        </h3>
                                                        <button
                                                            onClick={() =>
                                                                setIsCartOpen(
                                                                    false
                                                                )
                                                            }
                                                            className="text-gray-400 hover:text-gray-600"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <div className="max-h-[60vh] overflow-y-auto">
                                                        {auth.cart &&
                                                        auth.cart.items.length >
                                                            0 ? (
                                                            <div className="divide-y">
                                                                {auth.cart.items.map(
                                                                    (item) => (
                                                                        <div
                                                                            key={
                                                                                item.id
                                                                            }
                                                                            className="p-4 flex gap-3 hover:bg-gray-50 transition-colors relative group"
                                                                        >
                                                                            <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border">
                                                                                <img
                                                                                    src={`/storage/${item.product.image}`}
                                                                                    alt={
                                                                                        item
                                                                                            .product
                                                                                            .name
                                                                                    }
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex justify-between items-start">
                                                                                    <p className="text-sm font-medium text-gray-900 truncate pr-6">
                                                                                        {
                                                                                            item
                                                                                                .product
                                                                                                .name
                                                                                        }
                                                                                    </p>
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            openDeleteModal(
                                                                                                item
                                                                                            )
                                                                                        }
                                                                                        className="text-gray-400 hover:text-red-500"
                                                                                    >
                                                                                        <Trash2 className="w-4 h-4" />
                                                                                    </button>
                                                                                </div>
                                                                                <div className="flex items-center justify-between mt-1">
                                                                                    <span className="text-xs text-primary font-bold">
                                                                                        {formatRupiah(
                                                                                            item
                                                                                                .product
                                                                                                .price
                                                                                        )}
                                                                                    </span>
                                                                                    <div className="flex items-center border rounded-md h-6">
                                                                                        <button
                                                                                            onClick={() =>
                                                                                                updateQty(
                                                                                                    item.id,
                                                                                                    item.qty -
                                                                                                        1,
                                                                                                    item
                                                                                                        .product
                                                                                                        .stock
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
                                                                                            {updatingItemId ===
                                                                                            item.id ? (
                                                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                                                            ) : (
                                                                                                item.qty
                                                                                            )}
                                                                                        </span>
                                                                                        <button
                                                                                            onClick={() =>
                                                                                                updateQty(
                                                                                                    item.id,
                                                                                                    item.qty +
                                                                                                        1,
                                                                                                    item
                                                                                                        .product
                                                                                                        .stock
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
                                                                    )
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="p-8 text-center text-gray-500">
                                                                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                                                <p className="text-sm">
                                                                    Keranjang
                                                                    masih kosong
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-4 border-t bg-gray-50">
                                                        <Link
                                                            href={route(
                                                                "cart.index"
                                                            )}
                                                            onClick={() =>
                                                                setIsCartOpen(
                                                                    false
                                                                )
                                                            }
                                                            className="w-full block"
                                                        >
                                                            <Button className="w-full bg-primary hover:bg-orange-600">
                                                                Lihat Semua
                                                                Keranjang
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* PROFILE DROPDOWN (Semua Role) */}
                                    <div className="relative group">
                                        <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200 focus:outline-none">
                                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold border border-orange-200 uppercase">
                                                {auth.user.name.charAt(0)}
                                            </div>
                                            <div className="hidden sm:block text-left">
                                                <p className="text-xs font-bold text-gray-900 leading-none truncate max-w-[100px]">
                                                    {auth.user.name}
                                                </p>
                                                <p className="text-[10px] text-gray-500 capitalize leading-none mt-1">
                                                    Role: {auth.user.role}
                                                </p>
                                            </div>
                                        </button>

                                        {/* ISI DROPDOWN PROFILE */}
                                        <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[60] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 origin-top-right">
                                            <div className="px-4 py-3 bg-gray-50 border-b">
                                                <p className="text-sm font-bold text-gray-900 truncate">
                                                    {auth.user.name}
                                                </p>
                                                <p className="text-[10px] text-gray-500 truncate">
                                                    {auth.user.email}
                                                </p>
                                            </div>
                                            <div className="p-2 space-y-1">
                                                {auth.user.role ===
                                                "customer" ? (
                                                    <Link
                                                        href={route(
                                                            "transactions.index"
                                                        )}
                                                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors font-medium"
                                                    >
                                                        <ShoppingBag className="w-4 h-4 text-orange-600" />
                                                        Pesanan Saya
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        href={
                                                            auth.user.role ===
                                                            "admin"
                                                                ? route(
                                                                      "admin.dashboard"
                                                                  )
                                                                : route(
                                                                      "seller.dashboard"
                                                                  )
                                                        }
                                                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors font-medium"
                                                    >
                                                        <User className="w-4 h-4 text-orange-600" />
                                                        Dashboard{" "}
                                                        {auth.user.role ===
                                                        "admin"
                                                            ? "Admin"
                                                            : "Seller"}
                                                    </Link>
                                                )}
                                                <hr className="my-1 border-gray-100" />
                                                <Link
                                                    href={route("logout")}
                                                    method="post"
                                                    as="button"
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-bold"
                                                >
                                                    <X className="w-4 h-4" />{" "}
                                                    Keluar
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* 2. KONDISI BELUM LOGIN */
                                <div className="flex items-center gap-4">
                                    <Link
                                        href={route("login")}
                                        className="text-sm font-medium text-gray-500 hover:text-gray-900"
                                    >
                                        Masuk
                                    </Link>
                                    <Link href={route("register")}>
                                        <Button className="bg-primary hover:bg-orange-600 h-9">
                                            Daftar
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* MODAL KONFIRMASI HAPUS KERANJANG */}
            {itemToDelete && (
                <div
                    id="delete-modal"
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                Hapus Barang?
                            </h3>
                            <p className="text-gray-500 text-sm">
                                Hapus produk{" "}
                                <span className="font-bold text-gray-800">
                                    "{itemToDelete.product.name}"
                                </span>{" "}
                                dari keranjang?
                            </p>
                        </div>
                        <div className="flex border-t bg-gray-50">
                            <button
                                onClick={() =>
                                    !isDeleting && setItemToDelete(null)
                                }
                                disabled={isDeleting}
                                className="flex-1 py-4 text-sm font-medium text-gray-700 hover:bg-gray-100 border-r disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="flex-1 py-4 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 disabled:opacity-50"
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
        </>
    );
}
