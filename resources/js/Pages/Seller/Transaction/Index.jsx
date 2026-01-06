import SellerLayout from "@/Layouts/SellerLayout";
import { Head, Link } from "@inertiajs/react";
import { Eye, CheckCircle, Clock, Truck, XCircle, Package } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";

export default function TransactionIndex({ transactions }) {
    // Helper: Badge Warna Warni sesuai Status
    const getStatusBadge = (status) => {
        switch (status) {
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
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Helper: Format Rupiah
    const formatRupiah = (value) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);

    return (
        <SellerLayout>
            <Head title="Pesanan Masuk" />

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Pesanan Masuk
                        </h2>
                        <p className="text-muted-foreground">
                            Pantau semua pesanan yang masuk ke tokomu.
                        </p>
                    </div>
                </div>

                {/* Tabel Transaksi */}
                <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                                <tr>
                                    <th className="px-6 py-4">Invoice</th>
                                    <th className="px-6 py-4">Pembeli</th>
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
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {trx.invoice_code}
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {
                                                        trx.transaction_details
                                                            ?.length
                                                    }{" "}
                                                    Barang
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium">
                                                    {trx.user.name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {trx.user.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-700">
                                                {formatRupiah(
                                                    (Number(trx.total_price) ||
                                                        0) +
                                                        (Number(
                                                            trx.shipping_cost
                                                        ) || 0)
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(
                                                    trx.order_status
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {new Date(
                                                    trx.created_at
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
                                                        "seller.transactions.show",
                                                        trx.id
                                                    )}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-2"
                                                    >
                                                        <Eye className="w-4 h-4" />
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
                                            className="px-6 py-12 text-center text-gray-500"
                                        >
                                            <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                            <p className="font-medium">
                                                Belum ada pesanan masuk.
                                            </p>
                                            <p className="text-xs">
                                                Sabar ya, rezeki gak akan
                                                kemana! 😉
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Sederhana */}
                    <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                            Menampilkan {transactions.from || 0} sampai{" "}
                            {transactions.to || 0} dari {transactions.total}{" "}
                            pesanan
                        </div>
                        <div className="flex gap-1">
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
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    </Link>
                                ) : (
                                    <span
                                        key={i}
                                        className="px-2 text-gray-400"
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    ></span>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
}
