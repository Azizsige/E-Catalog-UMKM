import { Head, Link, router } from "@inertiajs/react";
import Navbar from "@/Components/Navbar";
import {
    ShoppingBag,
    ChevronRight,
    Clock,
    CheckCircle,
    XCircle,
    Truck,
    Package,
} from "lucide-react";
import Pagination from "@/Components/Pagination";

export default function TransactionIndex({ transactions }) {
    // --- 1. HANDLE KONFIRMASI PESANAN DITERIMA ---
    const handleCompleteOrder = (e, id) => {
        e.preventDefault(); // Mencegah masuk ke link detail
        e.stopPropagation(); // Stop bubbling event

        if (
            confirm(
                "Pastikan barang sudah Anda terima dengan baik. Selesaikan pesanan?"
            )
        ) {
            router.put(
                route("my.orders.update", id),
                {
                    action: "complete",
                },
                {
                    onSuccess: () => alert("Terima kasih! Transaksi selesai."),
                }
            );
        }
    };

    // Helper Format Rupiah
    const formatRupiah = (number) => {
        const value = Number(number) || 0;
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);
    };

    // Helper Format Tanggal
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Helper Status Badge (Updated untuk Order Status)
    const getStatusBadge = (orderStatus, paymentStatus) => {
        // Prioritas 1: Kalau Order Selesai/Dikirim/Batal
        if (orderStatus === "completed") {
            return (
                <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-green-700 bg-green-100 border border-green-200 rounded-full">
                    <CheckCircle className="w-3 h-3" /> SELESAI
                </span>
            );
        }
        if (orderStatus === "shipped") {
            return (
                <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-purple-700 bg-purple-100 border border-purple-200 rounded-full">
                    <Truck className="w-3 h-3" /> DIKIRIM
                </span>
            );
        }
        if (orderStatus === "processing") {
            return (
                <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-blue-700 bg-blue-100 border border-blue-200 rounded-full">
                    <Package className="w-3 h-3" /> DIPROSES
                </span>
            );
        }
        if (orderStatus === "cancelled") {
            return (
                <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-red-700 bg-red-100 border border-red-200 rounded-full">
                    <XCircle className="w-3 h-3" /> DIBATALKAN
                </span>
            );
        }

        // Prioritas 2: Cek Status Bayar (Kalau order masih Pending)
        if (paymentStatus === "paid") {
            return (
                <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-green-700 bg-green-100 border border-green-200 rounded-full">
                    <CheckCircle className="w-3 h-3" /> LUNAS
                </span>
            );
        }

        // Default: Menunggu Pembayaran
        return (
            <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-yellow-700 bg-yellow-100 border border-yellow-200 rounded-full">
                <Clock className="w-3 h-3" /> MENUNGGU PEMBAYARAN
            </span>
        );
    };

    return (
        <div className="min-h-screen pb-20 bg-gray-50">
            <Head title="Riwayat Pesanan" />
            <Navbar />

            <div className="max-w-4xl px-4 py-10 mx-auto sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                        <ShoppingBag className="w-8 h-8 text-primary" />
                        Riwayat Pesanan
                    </h1>
                </div>

                {transactions.data.length > 0 ? (
                    <div className="space-y-4">
                        {transactions.data.map((transaction) => (
                            <Link
                                href={route(
                                    "transactions.show", // Pastikan nama route ini benar di web.php (singular)
                                    transaction.id
                                )}
                                key={transaction.id}
                                className="relative block overflow-hidden transition-all duration-200 bg-white border border-gray-200 rounded-xl hover:border-orange-500 hover:shadow-md group"
                            >
                                <div className="p-6">
                                    {/* Header Invoice */}
                                    <div className="flex flex-col items-start justify-between gap-4 mb-4 sm:flex-row sm:items-center">
                                        <div>
                                            <p className="mb-1 text-xs font-bold text-gray-400">
                                                NO. INVOICE
                                            </p>
                                            <p className="font-mono text-sm font-bold text-gray-800">
                                                #{transaction.invoice_code}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="mb-1 text-xs font-bold text-gray-400 sm:text-right">
                                                TANGGAL
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {formatDate(
                                                    transaction.created_at
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 sm:text-right">
                                            <p className="mb-1 text-xs font-bold text-gray-400">
                                                STATUS
                                            </p>
                                            {/* Panggil Helper Badge Baru */}
                                            {getStatusBadge(
                                                transaction.order_status,
                                                transaction.payment_status
                                            )}

                                            {/* --- TOMBOL AKSI CEPAT (PESANAN DITERIMA) --- */}
                                            {transaction.order_status ===
                                                "shipped" && (
                                                <button
                                                    onClick={(e) =>
                                                        handleCompleteOrder(
                                                            e,
                                                            transaction.id
                                                        )
                                                    }
                                                    className="mt-1 flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors z-10 relative"
                                                >
                                                    <CheckCircle className="w-3 h-3" />{" "}
                                                    PESANAN DITERIMA
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <hr className="my-4 border-gray-200 border-dashed" />

                                    {/* Summary Produk */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800 transition-colors group-hover:text-primary">
                                                {transaction.details &&
                                                transaction.details[0]?.product
                                                    ? transaction.details[0]
                                                          .product.name
                                                    : "Produk dihapus"}
                                            </h3>
                                            {transaction.details &&
                                                transaction.details.length >
                                                    1 && (
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        +{" "}
                                                        {transaction.details
                                                            .length - 1}{" "}
                                                        produk lainnya
                                                    </p>
                                                )}
                                        </div>

                                        <div className="text-right">
                                            <p className="mb-1 text-xs text-gray-500">
                                                Total Belanja
                                            </p>
                                            <p className="text-lg font-bold text-primary">
                                                {formatRupiah(
                                                    Number(
                                                        transaction.total_price
                                                    ) +
                                                        Number(
                                                            transaction.shipping_cost
                                                        )
                                                )}
                                            </p>
                                        </div>

                                        <div className="hidden pl-4 ml-4 border-l sm:block">
                                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        <div className="mt-6">
                            <Pagination links={transactions.links} />
                        </div>
                    </div>
                ) : (
                    // Tampilan Jika Belum Ada Pesanan
                    <div className="py-20 text-center bg-white border border-gray-300 border-dashed rounded-xl">
                        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-orange-50">
                            <ShoppingBag className="w-10 h-10 text-orange-400 opacity-50" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                            Belum ada pesanan
                        </h3>
                        <p className="max-w-sm mx-auto mt-2 mb-6 text-gray-500">
                            Kamu belum pernah belanja nih. Yuk cari barang
                            impianmu sekarang!
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white transition-colors border border-transparent rounded-full shadow-sm bg-primary hover:bg-orange-600"
                        >
                            Mulai Belanja
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
