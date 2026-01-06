import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { ShoppingBag, Eye, Search } from "lucide-react";
import Pagination from "@/Components/Pagination";

export default function Index({ auth, transactions }) {
    // Helper Format Rupiah
    const formatRupiah = (number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(Number(number) || 0);
    };

    // Helper Status Badge
    const getStatusBadge = (status) => {
        const badges = {
            paid: "bg-green-100 text-green-700 border-green-200",
            pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
            failed: "bg-red-100 text-red-700 border-red-200",
            cancelled: "bg-gray-100 text-gray-700 border-gray-200",
        };
        return (
            <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    badges[status] || badges.pending
                }`}
            >
                {status.toUpperCase()}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Manajemen Pesanan
                </h2>
            }
        >
            <Head title="Admin - Kelola Pesanan" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5 text-orange-600" />
                                    Daftar Transaksi Masuk
                                </h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b">
                                            <th className="p-4 font-semibold text-gray-600">
                                                Invoice
                                            </th>
                                            <th className="p-4 font-semibold text-gray-600">
                                                Pelanggan
                                            </th>
                                            <th className="p-4 font-semibold text-gray-600">
                                                Total Transaksi
                                            </th>
                                            <th className="p-4 font-semibold text-gray-600 text-center">
                                                Status
                                            </th>
                                            <th className="p-4 font-semibold text-gray-600">
                                                Tanggal
                                            </th>
                                            <th className="p-4 font-semibold text-gray-600 text-center">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {transactions.data.length > 0 ? (
                                            transactions.data.map((trx) => (
                                                <tr
                                                    key={trx.id}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="p-4 font-mono font-bold text-gray-800">
                                                        #{trx.invoice_code}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-medium">
                                                            {trx.user.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {trx.user.email}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 font-bold text-orange-600">
                                                        {formatRupiah(
                                                            Number(
                                                                trx.total_price
                                                            ) +
                                                                Number(
                                                                    trx.shipping_cost
                                                                )
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {getStatusBadge(
                                                            trx.payment_status
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-gray-600 text-xs">
                                                        {new Date(
                                                            trx.created_at
                                                        ).toLocaleString(
                                                            "id-ID"
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <Link
                                                            href={route(
                                                                "transactions.show",
                                                                trx.id
                                                            )}
                                                            className="inline-flex items-center gap-1 bg-gray-100 hover:bg-orange-100 hover:text-orange-700 px-3 py-1.5 rounded-md transition-all text-gray-700"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            Detail
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="6"
                                                    className="p-10 text-center text-gray-500 italic"
                                                >
                                                    Belum ada transaksi masuk.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-6 px-4 pb-4">
                                <Pagination links={transactions.links} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
