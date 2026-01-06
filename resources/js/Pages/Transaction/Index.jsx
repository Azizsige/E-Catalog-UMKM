import { Head, Link } from "@inertiajs/react";
import Navbar from "@/Components/Navbar";
import {
    ShoppingBag,
    ChevronRight,
    Clock,
    CheckCircle,
    XCircle,
} from "lucide-react";
import Pagination from "@/Components/Pagination";

export default function TransactionIndex({ transactions }) {
    // Helper Format Rupiah
    const formatRupiah = (number) => {
        // Pastikan inputnya angka, kalau error/kosong anggap 0
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

    // Helper Status Badge
    const getStatusBadge = (status) => {
        switch (status) {
            case "paid":
                return (
                    <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                        <CheckCircle className="w-3 h-3" /> LUNAS
                    </span>
                );
            case "pending":
                return (
                    <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">
                        <Clock className="w-3 h-3" /> MENUNGGU PEMBAYARAN
                    </span>
                );
            case "failed":
            case "cancelled":
                return (
                    <span className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                        <XCircle className="w-3 h-3" /> GAGAL
                    </span>
                );
            default:
                return <span className="text-gray-500 text-xs">{status}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Head title="Riwayat Pesanan" />
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ShoppingBag className="w-8 h-8 text-primary" />
                        Riwayat Pesanan
                    </h1>
                </div>

                {transactions.data.length > 0 ? (
                    <div className="space-y-4">
                        {transactions.data.map((transaction) => (
                            <Link
                                href={route(
                                    "transactions.show",
                                    transaction.id
                                )}
                                key={transaction.id}
                                className="block bg-white rounded-xl border border-gray-200 hover:border-orange-500 hover:shadow-md transition-all duration-200 overflow-hidden group"
                            >
                                <div className="p-6">
                                    {/* Header Invoice */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 mb-1">
                                                NO. INVOICE
                                            </p>
                                            <p className="text-sm font-mono font-bold text-gray-800">
                                                #{transaction.invoice_code}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 mb-1 sm:text-right">
                                                TANGGAL
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {formatDate(
                                                    transaction.created_at
                                                )}
                                            </p>
                                        </div>
                                        <div className="sm:text-right">
                                            <p className="text-xs font-bold text-gray-400 mb-1">
                                                STATUS
                                            </p>
                                            {getStatusBadge(
                                                transaction.payment_status
                                            )}
                                        </div>
                                    </div>

                                    <hr className="border-dashed border-gray-200 my-4" />

                                    {/* Summary Produk */}
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800 group-hover:text-primary transition-colors">
                                                {transaction.details[0]?.product
                                                    ?.name || "Produk dihapus"}
                                            </h3>
                                            {transaction.details.length > 1 && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    +{" "}
                                                    {transaction.details
                                                        .length - 1}{" "}
                                                    produk lainnya
                                                </p>
                                            )}
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 mb-1">
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

                                        <div className="ml-4 pl-4 border-l hidden sm:block">
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
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="w-10 h-10 text-orange-400 opacity-50" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                            Belum ada pesanan
                        </h3>
                        <p className="text-gray-500 mt-2 mb-6 max-w-sm mx-auto">
                            Kamu belum pernah belanja nih. Yuk cari barang
                            impianmu sekarang!
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-primary hover:bg-orange-600 transition-colors"
                        >
                            Mulai Belanja
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
