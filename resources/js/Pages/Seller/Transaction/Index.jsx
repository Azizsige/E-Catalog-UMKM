import SellerLayout from "@/Layouts/SellerLayout";
import { Head, Link, router } from "@inertiajs/react";
import {
    Eye,
    CheckCircle,
    Clock,
    Truck,
    XCircle,
    Package,
    Search,
    CreditCard,
    Calendar,
    Filter, // Tambahan icon buat dropdown status
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import { useState, useEffect, useRef } from "react";

export default function TransactionIndex({ transactions, filters }) {
    // Helper untuk dapet tanggal hari ini (YYYY-MM-DD)
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // --- STATE UNTUK FILTER ---
    const [search, setSearch] = useState(filters?.search || "");
    const [status, setStatus] = useState(filters?.status || "all");
    const [paymentMethod, setPaymentMethod] = useState(
        filters?.payment_method || "all",
    );

    // STATE TANGGAL: Set Default ke Hari Ini jika tidak ada filter tanggal dari URL
    const [startDate, setStartDate] = useState(
        filters?.start_date || getTodayDate(),
    );
    const [endDate, setEndDate] = useState(filters?.end_date || getTodayDate());

    const isFirstRender = useRef(true);

    // --- AUTO-SEARCH DENGAN DEBOUNCE ---
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                route("admin.transactions.index"),
                {
                    search,
                    status,
                    payment_method: paymentMethod,
                    start_date: startDate,
                    end_date: endDate,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 400);

        return () => clearTimeout(timer);
    }, [search, status, paymentMethod, startDate, endDate]);

    // Opsi Dropdown Status beserta styling warnanya
    const statusOptions = [
        {
            value: "all",
            label: "Semua Status",
            color: "bg-gray-100 text-gray-700",
        },
        {
            value: "pending",
            label: "Menunggu",
            color: "bg-yellow-100 text-yellow-800",
        },
        {
            value: "processing",
            label: "Diproses",
            color: "bg-blue-100 text-blue-800",
        },
        {
            value: "shipped",
            label: "Dikirim",
            color: "bg-purple-100 text-purple-800",
        },
        {
            value: "completed",
            label: "Selesai",
            color: "bg-green-100 text-green-800",
        },
        {
            value: "cancelled",
            label: "Batal",
            color: "bg-red-100 text-red-800",
        },
    ];

    // Ambil warna background untuk elemen 'select' berdasarkan state aktif
    const getStatusSelectBg = () => {
        const activeOption = statusOptions.find((opt) => opt.value === status);
        return activeOption ? activeOption.color : "bg-gray-50 text-gray-700";
    };

    const getStatusBadge = (statusCode) => {
        switch (statusCode) {
            case "pending":
                return (
                    <Badge
                        variant="outline"
                        className="bg-yellow-100 text-yellow-700 border-yellow-200"
                    >
                        <Clock className="w-3 h-3 mr-1" /> Menunggu
                    </Badge>
                );
            case "processing":
                return (
                    <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-700 border-blue-200"
                    >
                        <Package className="w-3 h-3 mr-1" /> Diproses
                    </Badge>
                );
            case "shipped":
                return (
                    <Badge
                        variant="outline"
                        className="bg-purple-100 text-purple-700 border-purple-200"
                    >
                        <Truck className="w-3 h-3 mr-1" /> Dikirim
                    </Badge>
                );
            case "completed":
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-100 text-green-700 border-green-200"
                    >
                        <CheckCircle className="w-3 h-3 mr-1" /> Selesai
                    </Badge>
                );
            case "cancelled":
                return (
                    <Badge
                        variant="outline"
                        className="bg-red-100 text-red-700 border-red-200"
                    >
                        <XCircle className="w-3 h-3 mr-1" /> Batal
                    </Badge>
                );
            default:
                return <Badge variant="outline">{statusCode}</Badge>;
        }
    };

    const formatRupiah = (value) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);

    // Cek apakah ada filter "selain default" yang aktif
    const isFilterActive =
        search ||
        status !== "all" ||
        paymentMethod !== "all" ||
        startDate !== getTodayDate() ||
        endDate !== getTodayDate();

    const handleResetFilter = () => {
        setSearch("");
        setStatus("all");
        setPaymentMethod("all");
        setStartDate(getTodayDate());
        setEndDate(getTodayDate());
    };

    return (
        <SellerLayout>
            <Head title="Pesanan Masuk" />

            <div className="max-w-6xl pb-10 mx-auto">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">
                        Pesanan Masuk
                    </h2>
                    <p className="text-muted-foreground">
                        Pantau dan kelola semua pesanan yang masuk ke tokomu.
                    </p>
                </div>

                {/* --- AREA FILTER --- */}
                <div className="p-5 mb-6 bg-white border shadow-sm rounded-xl overflow-visible">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        {/* A. Dropdown Status (Pengganti Tabs) */}
                        <div className="flex flex-col z-20">
                            <span className="text-[10px] font-bold text-gray-500 uppercase ml-2 mb-1">
                                Status Pesanan
                            </span>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Filter className="w-4 h-4 opacity-60" />
                                </div>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    // BG dan Warna Text berubah sesuai status yang dipilih
                                    className={`w-full pl-9 pr-8 py-2 text-sm border-gray-200 rounded-md focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none appearance-none font-medium transition-colors cursor-pointer ${getStatusSelectBg()}`}
                                >
                                    {statusOptions.map((opt) => (
                                        <option
                                            key={opt.value}
                                            value={opt.value}
                                            // Warna BG di dalam dropdown list
                                            className={`font-medium ${opt.color}`}
                                        >
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* B. Date Range (Custom Styling Native Input) */}
                        <div className="flex flex-col lg:col-span-2">
                            <span className="text-[10px] font-bold text-gray-500 uppercase ml-2 mb-1">
                                Rentang Waktu (Default Hari Ini)
                            </span>
                            <div className="flex items-center w-full transition-colors border border-gray-200 overflow-hidden rounded-md bg-gray-50 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
                                <div className="pl-3 pr-2 text-gray-400 border-r border-gray-200">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                    className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-transparent border-none cursor-pointer focus:ring-0"
                                />
                                <span className="flex items-center h-full px-2 text-sm text-gray-400 border-l border-r border-gray-200 bg-gray-100">
                                    s/d
                                </span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-transparent border-none cursor-pointer focus:ring-0"
                                />
                            </div>
                        </div>

                        {/* C. Filter Metode Pembayaran */}
                        <div className="flex flex-col z-10">
                            <span className="text-[10px] font-bold text-gray-500 uppercase ml-2 mb-1">
                                Metode Bayar
                            </span>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <CreditCard className="w-4 h-4 text-gray-400" />
                                </div>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) =>
                                        setPaymentMethod(e.target.value)
                                    }
                                    className="w-full pl-10 pr-8 py-2 text-sm font-medium text-gray-700 transition-colors border border-gray-200 rounded-md outline-none appearance-none cursor-pointer bg-gray-50 focus:bg-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value="all">Semua Metode</option>
                                    <option value="midtrans">
                                        Otomatis (Midtrans)
                                    </option>
                                    <option value="whatsapp">
                                        Manual (WhatsApp)
                                    </option>
                                </select>
                            </div>
                        </div>

                        {/* D. Search Bar (Turun ke bawah di layar kecil) */}
                        <div className="flex flex-col z-10 lg:col-span-4 mt-2">
                            <span className="text-[10px] font-bold text-gray-500 uppercase ml-2 mb-1">
                                Pencarian Cepat
                            </span>
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search className="w-4 h-4 text-gray-400" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder="Ketik Invoice atau Nama Pembeli lalu tunggu sebentar..."
                                    className="pl-10 transition-colors bg-gray-50 focus:bg-white border-gray-200 shadow-inner"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabel Transaksi */}
                <div className="overflow-hidden bg-white border shadow-sm z-0 rounded-xl">
                    <div className="overflow-x-auto min-h-[300px]">
                        <table className="w-full text-sm text-left">
                            <thead className="font-medium text-gray-600 border-b bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4">Invoice</th>
                                    <th className="px-6 py-4">
                                        Pembeli & Info
                                    </th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Tanggal</th>
                                    <th className="px-6 py-4 text-center">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {transactions.data.length > 0 ? (
                                    transactions.data.map((trx) => (
                                        <tr
                                            key={trx.id}
                                            className="transition-colors hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {trx.invoice_code}
                                                <div className="mt-1 text-xs text-gray-400">
                                                    {trx.details?.length} Barang
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">
                                                    {trx.user?.name ||
                                                        (trx.shipping_address_snapshot
                                                            ? JSON.parse(
                                                                  trx.shipping_address_snapshot,
                                                              ).recipient_name
                                                            : "Guest")}
                                                </div>
                                                <div className="mt-1">
                                                    {trx.payment_method ===
                                                    "midtrans" ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-blue-50 text-blue-600 border-blue-200 text-[10px] px-1.5 uppercase tracking-wider"
                                                        >
                                                            Midtrans
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-green-50 text-green-600 border-green-200 text-[10px] px-1.5 uppercase tracking-wider"
                                                        >
                                                            WhatsApp
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-700">
                                                {formatRupiah(
                                                    (Number(trx.total_price) ||
                                                        0) +
                                                        (Number(
                                                            trx.shipping_cost,
                                                        ) || 0),
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(
                                                    trx.order_status,
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                {new Date(
                                                    trx.created_at,
                                                ).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Link
                                                    href={route(
                                                        "admin.transactions.show",
                                                        trx.id,
                                                    )}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                                                    >
                                                        <Eye className="w-4 h-4" />{" "}
                                                        Detail
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-6 py-16 text-center text-gray-500 bg-gray-50/50"
                                        >
                                            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                            <p className="mb-1 text-lg font-bold text-gray-700">
                                                {isFilterActive
                                                    ? "Pesanan tidak ditemukan"
                                                    : "Belum ada pesanan hari ini"}
                                            </p>
                                            <p className="text-sm">
                                                {isFilterActive
                                                    ? "Coba ganti filter atau ubah tanggal pencarian Anda."
                                                    : "Sabar ya, rezeki gak akan kemana! 😉"}
                                            </p>
                                            {isFilterActive && (
                                                <Button
                                                    variant="outline"
                                                    className="mt-4 text-gray-700 border-gray-300 rounded-full hover:bg-gray-100"
                                                    onClick={handleResetFilter}
                                                >
                                                    <XCircle className="w-4 h-4 mr-2 text-gray-400" />{" "}
                                                    Reset Semua Filter
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col items-center justify-between gap-4 px-6 py-4 border-t bg-gray-50 md:flex-row">
                        <div className="text-xs font-medium text-gray-500">
                            Menampilkan {transactions.from || 0} sampai{" "}
                            {transactions.to || 0} dari {transactions.total}{" "}
                            pesanan
                        </div>
                        <div className="flex flex-wrap justify-center gap-1">
                            {transactions.links.map((link, i) =>
                                link.url ? (
                                    <Link key={i} href={link.url}>
                                        <Button
                                            variant={
                                                link.active
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            className={
                                                link.active
                                                    ? "bg-orange-600 text-white hover:bg-orange-700"
                                                    : "bg-white"
                                            }
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    </Link>
                                ) : (
                                    <span
                                        key={i}
                                        className="px-3 py-2 text-sm text-gray-400 border border-transparent"
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    ></span>
                                ),
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
}
