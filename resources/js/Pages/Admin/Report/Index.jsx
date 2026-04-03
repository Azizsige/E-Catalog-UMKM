import React, { useState } from "react";
import { Head, router, Link } from "@inertiajs/react";
import SellerLayout from "@/Layouts/SellerLayout";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
    Download,
    Filter,
    DollarSign,
    ShoppingCart,
    FileText,
    XCircle, // Tambahan icon buat card gagal
} from "lucide-react";

export default function ReportIndex({ transactions, summary, filters }) {
    // State untuk nyimpen inputan tanggal
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    // Fungsi Format Rupiah
    const formatRupiah = (number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(number);
    };

    // Fungsi Badge Status (Biar tabel laporannya cantik)
    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return (
                    <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider">
                        Menunggu
                    </span>
                );
            case "processing":
                return (
                    <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider">
                        Diproses
                    </span>
                );
            case "shipped":
                return (
                    <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider">
                        Dikirim
                    </span>
                );
            case "completed":
                return (
                    <span className="bg-green-100 text-green-800 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider">
                        Selesai
                    </span>
                );
            case "cancelled":
                return (
                    <span className="bg-red-100 text-red-800 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider">
                        Batal
                    </span>
                );
            default:
                return (
                    <span className="bg-gray-100 text-gray-800 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider">
                        {status}
                    </span>
                );
        }
    };

    // Fungsi buat nge-filter data
    const handleFilter = (e) => {
        e.preventDefault();
        router.get(
            route("admin.reports.index"),
            { start_date: startDate, end_date: endDate },
            { preserveState: true },
        );
    };

    // Fungsi buat Download Excel
    const handleExport = () => {
        window.location.href = route("admin.reports.export", {
            start_date: startDate,
            end_date: endDate,
        });
    };

    return (
        <SellerLayout>
            <Head title="Laporan Keuangan" />

            <div className="pb-10 mx-auto space-y-6 max-w-7xl">
                {/* HEADER & TOMBOL EXPORT */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Laporan Penjualan
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Ringkasan transaksi dari tanggal {startDate} s/d{" "}
                            {endDate}
                        </p>
                    </div>
                    <Button
                        onClick={handleExport}
                        className="font-bold text-white bg-green-600 hover:bg-green-700"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export to Excel
                    </Button>
                </div>

                {/* FILTER TANGGAL */}
                <form
                    onSubmit={handleFilter}
                    className="flex flex-col items-end gap-4 p-4 bg-white border shadow-sm rounded-xl sm:flex-row sm:items-center"
                >
                    <div className="flex-1 w-full sm:w-auto">
                        <label className="block mb-1 text-xs font-bold text-gray-500 uppercase">
                            Dari Tanggal
                        </label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex-1 w-full sm:w-auto">
                        <label className="block mb-1 text-xs font-bold text-gray-500 uppercase">
                            Sampai Tanggal
                        </label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-orange-600 sm:w-auto hover:bg-orange-700"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filter Data
                    </Button>
                </form>

                {/* KOTAK RINGKASAN (3 KOLOM) */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Card Total Pendapatan */}
                    <div className="flex items-center gap-4 p-6 bg-white border border-l-4 shadow-sm rounded-xl border-l-green-500">
                        <div className="p-4 text-green-600 bg-green-100 rounded-full">
                            <DollarSign className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase">
                                Total Pendapatan
                            </p>
                            <h3 className="text-2xl font-black text-gray-900">
                                {formatRupiah(summary.total_revenue)}
                            </h3>
                        </div>
                    </div>

                    {/* Card Total Pesanan Sukses */}
                    <div className="flex items-center gap-4 p-6 bg-white border border-l-4 shadow-sm rounded-xl border-l-blue-500">
                        <div className="p-4 text-blue-600 bg-blue-100 rounded-full">
                            <ShoppingCart className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase">
                                Pesanan Sukses
                            </p>
                            <h3 className="text-2xl font-black text-gray-900">
                                {summary.total_orders}{" "}
                                <span className="text-sm font-medium text-gray-500 normal-case">
                                    Transaksi
                                </span>
                            </h3>
                        </div>
                    </div>

                    {/* Card Total Pesanan Gagal */}
                    <div className="flex items-center gap-4 p-6 bg-white border border-l-4 shadow-sm rounded-xl border-l-red-500">
                        <div className="p-4 text-red-600 bg-red-100 rounded-full">
                            <XCircle className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase">
                                Pesanan Batal
                            </p>
                            <h3 className="text-2xl font-black text-gray-900">
                                {summary.failed_orders}{" "}
                                <span className="text-sm font-medium text-gray-500 normal-case">
                                    Transaksi
                                </span>
                            </h3>
                        </div>
                    </div>
                </div>

                {/* TABEL DATA TRANSAKSI */}
                <div className="overflow-hidden bg-white border shadow-sm rounded-xl">
                    <div className="p-4 border-b bg-gray-50">
                        <h3 className="flex items-center gap-2 font-bold text-gray-900">
                            <FileText className="w-5 h-5 text-orange-600" />{" "}
                            Rincian Transaksi
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="text-xs text-gray-700 uppercase border-b bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4">No</th>
                                    <th className="px-6 py-4">Invoice</th>
                                    <th className="px-6 py-4">Tanggal</th>
                                    <th className="px-6 py-4 text-center">
                                        Status
                                    </th>{" "}
                                    {/* KOLOM STATUS BARU */}
                                    <th className="px-6 py-4">Metode</th>
                                    <th className="px-6 py-4 text-right">
                                        Total Bersih
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.data &&
                                transactions.data.length > 0 ? (
                                    transactions.data.map((tx, index) => {
                                        // Hitung grand total (Barang + Ongkir)
                                        const grandTotal =
                                            parseFloat(tx.total_price) +
                                            parseFloat(tx.shipping_cost);

                                        return (
                                            <tr
                                                key={tx.id}
                                                className="border-b hover:bg-gray-50"
                                            >
                                                {/* Penomoran dengan logic Pagination */}
                                                <td className="px-6 py-4">
                                                    {transactions.from + index}
                                                </td>
                                                <td className="px-6 py-4 font-mono font-bold text-gray-900">
                                                    {tx.invoice_code}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {new Date(
                                                        tx.created_at,
                                                    ).toLocaleDateString(
                                                        "id-ID",
                                                        {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        },
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {/* PANGGIL FUNGSI STATUS DI SINI */}
                                                    {getStatusBadge(
                                                        tx.order_status,
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-xs font-bold uppercase">
                                                    <span className="px-2 py-1 bg-gray-100 rounded">
                                                        {tx.payment_method}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-right text-green-600 whitespace-nowrap">
                                                    {formatRupiah(grandTotal)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-6 py-10 text-center text-gray-500 bg-gray-50"
                                        >
                                            Tidak ada data transaksi di rentang
                                            tanggal ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    {transactions.links && transactions.links.length > 3 && (
                        <div className="p-4 bg-white border-t flex flex-wrap justify-center gap-1.5 items-center">
                            {transactions.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || "#"}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
                                        link.active
                                            ? "bg-orange-600 text-white border-orange-600 shadow-md"
                                            : "bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                                    } ${
                                        !link.url
                                            ? "opacity-40 cursor-not-allowed bg-gray-50"
                                            : ""
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </SellerLayout>
    );
}
