import SellerLayout from "@/Layouts/SellerLayout"; // Kita balikkan ke layout asli
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Head, Link } from "@inertiajs/react";
import {
    Wallet,
    ShoppingBag,
    Clock,
    Package,
    ArrowRight,
    TrendingUp,
    Store,
} from "lucide-react";

export default function SellerDashboard({ auth, stats, recent_orders }) {
    const formatRupiah = (number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(number || 0);
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: "bg-yellow-100 text-yellow-700",
            paid: "bg-blue-100 text-blue-700",
            processing: "bg-purple-100 text-purple-700",
            completed: "bg-green-100 text-green-700",
            cancelled: "bg-red-100 text-red-700",
        };
        return styles[status] || "bg-gray-100 text-gray-700";
    };

    return (
        <SellerLayout>
            <Head title="Seller Dashboard" />

            <div className="space-y-6 mt-4">
                {/* --- WELCOME BANNER --- */}
                <div className="bg-orange-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-orange-100">
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-1">
                            Selamat Datang, {auth.user.name}! 👋
                        </h3>
                        <p className="opacity-90 text-sm italic">
                            Ayo pantau performa tokomu hari ini.
                        </p>
                    </div>
                    <Store className="absolute right-[-10px] bottom-[-10px] w-32 h-32 text-white/10 rotate-12" />
                </div>

                {/* --- STATS GRID --- */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-none shadow-sm ring-1 ring-gray-100">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Total Penjualan
                            </CardTitle>
                            <Wallet className="w-4 h-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-gray-900">
                                {formatRupiah(stats?.total_revenue)}
                            </div>
                            <p className="text-[10px] text-green-600 font-bold mt-1 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> +12% dari
                                bulan lalu
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm ring-1 ring-gray-100">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Total Pesanan
                            </CardTitle>
                            <ShoppingBag className="w-4 h-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-gray-900">
                                {stats?.total_orders || 0}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">
                                Total pesanan masuk
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm ring-1 ring-gray-100">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Perlu Diproses
                            </CardTitle>
                            <Clock className="w-4 h-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-gray-900">
                                {stats?.pending_orders || 0}
                            </div>
                            <p className="text-[10px] text-yellow-600 font-bold mt-1">
                                Segera kirim pesanan
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm ring-1 ring-gray-100">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Total Produk
                            </CardTitle>
                            <Package className="w-4 h-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-gray-900">
                                {stats?.total_products || 0}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">
                                Produk aktif di etalase
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* --- RECENT ORDERS TABLE --- */}
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-gray-900">
                            Pesanan Terbaru
                        </h3>
                        <Link
                            href="#"
                            className="text-orange-600 text-xs font-bold flex items-center gap-1"
                        >
                            Lihat Semua <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 text-gray-500 text-[10px] uppercase font-bold">
                                <tr>
                                    <th className="px-4 py-3">
                                        Invoice / Customer
                                    </th>
                                    <th className="px-4 py-3">Total</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-center">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {recent_orders &&
                                    recent_orders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-gray-900">
                                                    {order.invoice_code}
                                                </div>
                                                <div className="text-[10px] text-gray-500">
                                                    {order.user?.name}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-semibold">
                                                {formatRupiah(
                                                    order.total_price,
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusBadge(
                                                        order.order_status,
                                                    )}`}
                                                >
                                                    {order.order_status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Link
                                                    href={route(
                                                        "admin.transactions.show",
                                                        order.id,
                                                    )}
                                                    className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded hover:bg-orange-600 hover:text-white transition-all"
                                                >
                                                    DETAIL
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                {(!recent_orders ||
                                    recent_orders.length === 0) && (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="px-4 py-8 text-center text-gray-400 text-xs italic"
                                        >
                                            Belum ada pesanan masuk.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
}
