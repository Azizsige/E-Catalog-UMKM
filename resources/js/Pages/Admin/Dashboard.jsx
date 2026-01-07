import AdminLayout from "@/Layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Head, Link } from "@inertiajs/react";
import {
    Banknote,
    Store,
    Users,
    AlertCircle,
    ArrowRight,
    ShoppingBag,
} from "lucide-react";

export default function AdminDashboard({ stats, latestTransactions }) {
    // Helper Rupiah
    const formatRupiah = (number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(number);
    };

    // Helper Status Badge
    const getStatusBadge = (status) => {
        switch (status) {
            case "paid":
                return (
                    <span className="px-2 py-1 text-xs font-bold text-green-600 bg-green-100 rounded-full">
                        Lunas
                    </span>
                );
            case "pending":
                return (
                    <span className="px-2 py-1 text-xs font-bold text-yellow-600 bg-yellow-100 rounded-full">
                        Menunggu
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-1 text-xs font-bold text-gray-600 bg-gray-100 rounded-full">
                        {status}
                    </span>
                );
        }
    };

    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-4">
                {/* 1. TOTAL PENDAPATAN (GMV) */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Total Omzet (GMV)
                        </CardTitle>
                        <Banknote className="w-4 h-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            {formatRupiah(stats.total_revenue)}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Akumulasi transaksi sukses
                        </p>
                    </CardContent>
                </Card>

                {/* 2. TOTAL TOKO */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Total Toko
                        </CardTitle>
                        <Store className="w-4 h-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            {stats.total_stores}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            UMKM Bergabung
                        </p>
                    </CardContent>
                </Card>

                {/* 3. PENDING APPROVAL (PENTING!) */}
                <Card
                    className={
                        stats.pending_stores > 0
                            ? "border-orange-500 bg-orange-50"
                            : ""
                    }
                >
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Menunggu Approval
                        </CardTitle>
                        <AlertCircle
                            className={`w-4 h-4 ${
                                stats.pending_stores > 0
                                    ? "text-orange-600"
                                    : "text-gray-400"
                            }`}
                        />
                    </CardHeader>
                    <CardContent>
                        <div
                            className={`text-2xl font-bold ${
                                stats.pending_stores > 0
                                    ? "text-orange-700"
                                    : "text-gray-900"
                            }`}
                        >
                            {stats.pending_stores}
                        </div>
                        {stats.pending_stores > 0 ? (
                            <Link
                                href={route("admin.stores.index")}
                                className="flex items-center gap-1 mt-1 text-xs font-bold text-orange-600 hover:underline"
                            >
                                Proses Sekarang{" "}
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        ) : (
                            <p className="mt-1 text-xs text-muted-foreground">
                                Semua aman terkendali
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* 4. TOTAL USER */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Total Pengguna
                        </CardTitle>
                        <Users className="w-4 h-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            {stats.total_users}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Akun terdaftar
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* --- TABLE TRANSAKSI TERBARU --- */}
            <div className="mt-8 overflow-hidden bg-white border shadow-sm rounded-xl">
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                        <ShoppingBag className="w-5 h-5 text-gray-500" />
                        Transaksi Terbaru
                    </h3>
                </div>

                {latestTransactions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs font-bold text-gray-500 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">Invoice</th>
                                    <th className="px-6 py-3">Toko</th>
                                    <th className="px-6 py-3">Pembeli</th>
                                    <th className="px-6 py-3">Total</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {latestTransactions.map((trx) => (
                                    <tr
                                        key={trx.id}
                                        className="transition-colors hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 font-mono font-medium text-orange-600">
                                            #{trx.invoice_code}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {trx.store?.name || "Toko Dihapus"}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {trx.user?.name}
                                        </td>
                                        <td className="px-6 py-4 font-bold">
                                            {formatRupiah(trx.total_price)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(trx.payment_status)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-10 italic text-center text-gray-500">
                        Belum ada transaksi yang masuk hari ini.
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
