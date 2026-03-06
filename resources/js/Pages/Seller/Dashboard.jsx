import SellerLayout from "@/Layouts/SellerLayout";
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
    PlusCircle,
    ClipboardList,
    TicketPercent,
} from "lucide-react";
// Import Recharts
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function SellerDashboard({
    auth,
    stats,
    recent_orders,
    chart_data,
    top_products,
}) {
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

    // --- DATA DUMMY UNTUK GRAFIK (Biar UI muncul dulu) ---
    const salesData = [
        { name: "Senin", total: 1200000 },
        { name: "Selasa", total: 2100000 },
        { name: "Rabu", total: 800000 },
        { name: "Kamis", total: 1500000 },
        { name: "Jumat", total: 2400000 },
        { name: "Sabtu", total: 3100000 },
        { name: "Minggu", total: 2800000 },
    ];

    // --- DATA DUMMY UNTUK TOP PRODUK ---
    const topProducts = [
        { id: 1, name: "Ayam Bakar Madu", sold: 124, price: 25000 },
        { id: 2, name: "Nasi Goreng Spesial", sold: 98, price: 20000 },
        { id: 3, name: "Es Jeruk Manis", sold: 85, price: 8000 },
        { id: 4, name: "Mie Goreng Seafood", sold: 60, price: 22000 },
    ];

    return (
        <SellerLayout>
            <Head title="Seller Dashboard" />

            <div className="space-y-6 mt-4 pb-10">
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

                {/* --- QUICK ACTIONS (Baru) --- */}
                <div className="flex flex-wrap gap-3">
                    <Link
                        href={route("admin.products.index")}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-bold text-gray-700 hover:border-orange-500 hover:text-orange-600 transition-all"
                    >
                        <PlusCircle className="w-4 h-4 text-orange-500" />
                        Kelola Produk
                    </Link>
                    <Link
                        href={route("admin.transactions.index")}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-bold text-gray-700 hover:border-orange-500 hover:text-orange-600 transition-all"
                    >
                        <ClipboardList className="w-4 h-4 text-blue-500" />
                        Cek Pesanan Masuk
                    </Link>
                    <Link
                        href="#"
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-bold text-gray-700 hover:border-orange-500 hover:text-orange-600 transition-all"
                    >
                        <TicketPercent className="w-4 h-4 text-green-500" />
                        Buat Promo (Segera)
                    </Link>
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

                {/* --- MIDDLE SECTION: CHART & TOP PRODUCTS --- */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* CHART PENJUALAN (Lebar 2/3) */}
                    <Card className="border-none shadow-sm ring-1 ring-gray-100 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold text-gray-900">
                                Tren Penjualan 7 Hari Terakhir
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full mt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={chart_data}
                                        margin={{
                                            top: 5,
                                            right: 10,
                                            left: -20,
                                            bottom: 0,
                                        }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke="#e5e7eb"
                                        />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fontSize: 12,
                                                fill: "#6b7280",
                                            }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fontSize: 12,
                                                fill: "#6b7280",
                                            }}
                                            tickFormatter={(value) =>
                                                `Rp${value / 1000}k`
                                            }
                                        />
                                        <Tooltip
                                            formatter={(value) =>
                                                formatRupiah(value)
                                            }
                                            contentStyle={{
                                                borderRadius: "8px",
                                                border: "none",
                                                boxShadow:
                                                    "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="total"
                                            stroke="#ea580c"
                                            strokeWidth={3}
                                            dot={{ r: 4, strokeWidth: 2 }}
                                            activeDot={{
                                                r: 6,
                                                stroke: "#ea580c",
                                                strokeWidth: 2,
                                                fill: "white",
                                            }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* TOP PRODUCTS (Lebar 1/3) */}
                    <Card className="border-none shadow-sm ring-1 ring-gray-100">
                        <CardHeader className="pb-3 border-b border-gray-50">
                            <CardTitle className="text-sm font-bold text-gray-900">
                                Produk Terlaris Bulan Ini
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 p-0">
                            <div className="divide-y divide-gray-100">
                                {top_products?.map((product, index) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-orange-100 text-orange-600 font-black flex items-center justify-center text-xs">
                                                #{index + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 line-clamp-1">
                                                    {product.name}
                                                </p>
                                                <p className="text-[10px] text-gray-500 font-medium">
                                                    {formatRupiah(
                                                        product.price,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-900">
                                                {product.sold}
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                                Terjual
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* --- RECENT ORDERS TABLE (Telah Diperbarui) --- */}
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-gray-900">
                            Pesanan Terbaru
                        </h3>
                        <Link
                            href={route("admin.transactions.index")}
                            className="text-orange-600 text-xs font-bold flex items-center gap-1 hover:text-orange-700 transition-colors"
                        >
                            Lihat Semua <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 text-gray-500 text-[10px] uppercase font-bold">
                                <tr>
                                    <th className="px-4 py-3">
                                        Invoice & Waktu
                                    </th>
                                    <th className="px-4 py-3">Customer</th>
                                    <th className="px-4 py-3">Total</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-center">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {recent_orders && recent_orders.length > 0 ? (
                                    recent_orders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-gray-900">
                                                    {order.invoice_code}
                                                </div>
                                                <div className="text-[10px] text-gray-400 mt-0.5">
                                                    {new Date(
                                                        order.created_at,
                                                    ).toLocaleDateString(
                                                        "id-ID",
                                                        {
                                                            day: "numeric",
                                                            month: "short",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        },
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-800">
                                                    {order.user?.name ||
                                                        "Guest"}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-bold text-gray-700">
                                                {formatRupiah(
                                                    order.total_price,
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${getStatusBadge(order.order_status)}`}
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
                                                    className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-[10px] font-bold rounded shadow-sm hover:border-orange-500 hover:text-orange-600 transition-all"
                                                >
                                                    DETAIL
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="5"
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
