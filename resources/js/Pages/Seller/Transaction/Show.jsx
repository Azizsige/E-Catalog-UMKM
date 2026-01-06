import SellerLayout from "@/Layouts/SellerLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import {
    ArrowLeft,
    MapPin,
    User,
    CreditCard,
    Package,
    Truck,
    Save,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Label } from "@/Components/ui/label";

export default function TransactionShow({ transaction }) {
    // Setup Form untuk Update Status
    const { data, setData, put, processing, errors } = useForm({
        order_status: transaction.order_status,
    });

    // --- LOGIC BARU: PARSING SNAPSHOT ALAMAT ---
    // Kita coba ubah string JSON menjadi Object
    let shippingInfo = null;
    try {
        if (transaction.shipping_address_snapshot) {
            shippingInfo = JSON.parse(transaction.shipping_address_snapshot);
        }
    } catch (error) {
        console.error("Gagal parsing alamat:", error);
    }

    // Fallback: Kalau snapshot kosong, pakai data user (tapi snapshot prioritas utama)
    const buyerName = shippingInfo?.recipient_name || transaction.user?.name;
    const buyerPhone =
        shippingInfo?.phone_number || transaction.user?.phone || "-";
    const buyerEmail = transaction.user?.email || "-";

    // --- END LOGIC BARU ---

    const handleUpdateStatus = (e) => {
        e.preventDefault();
        put(route("seller.transactions.update", transaction.id), {
            preserveScroll: true,
            onSuccess: () => alert("Status pesanan berhasil diperbarui!"),
        });
    };

    // Helper: Badge Status
    const getStatusBadge = (status) => {
        const styles = {
            pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
            processing: "bg-blue-100 text-blue-700 border-blue-200",
            shipped: "bg-purple-100 text-purple-700 border-purple-200",
            completed: "bg-green-100 text-green-700 border-green-200",
            cancelled: "bg-red-100 text-red-700 border-red-200",
        };
        const labels = {
            pending: "Menunggu Pembayaran",
            processing: "Sedang Diproses",
            shipped: "Sedang Dikirim",
            completed: "Selesai",
            cancelled: "Dibatalkan",
        };
        return (
            <Badge
                variant="outline"
                className={`px-3 py-1 ${styles[status] || ""}`}
            >
                {labels[status] || status}
            </Badge>
        );
    };

    // Helper: Format Rupiah (Anti NaN)
    const formatRupiah = (val) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(Number(val) || 0);

    return (
        <SellerLayout>
            <Head title={`Pesanan #${transaction.invoice_code}`} />

            <div className="max-w-4xl mx-auto pb-10">
                {/* Header Page */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href={route("seller.transactions.index")}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold tracking-tight">
                                Invoice: {transaction.invoice_code}
                            </h2>
                            {getStatusBadge(transaction.order_status)}
                        </div>
                        <p className="text-muted-foreground text-sm mt-1">
                            Dipesan pada:{" "}
                            {new Date(
                                transaction.created_at
                            ).toLocaleDateString("id-ID", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* KOLOM KIRI: Detail Produk (2/3 Lebar) */}
                    <div className="md:col-span-2 space-y-6">
                        {/* List Produk */}
                        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                            <div className="p-4 bg-gray-50 border-b flex items-center gap-2 font-medium">
                                <Package className="w-4 h-4 text-gray-500" />
                                Rincian Pesanan
                            </div>
                            <div className="divide-y">
                                {transaction.transaction_details.map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-4 flex gap-4"
                                    >
                                        <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden shrink-0 border">
                                            {item.product?.image ? (
                                                <img
                                                    src={`/storage/${item.product.image}`}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <Package className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 line-clamp-2">
                                                {item.product?.name ||
                                                    "Produk Dihapus"}
                                            </h4>
                                            <div className="text-sm text-gray-500 mt-1">
                                                {item.qty} x{" "}
                                                {formatRupiah(
                                                    item.price_at_transaction
                                                )}
                                            </div>
                                        </div>

                                        <div className="font-semibold text-gray-700">
                                            {formatRupiah(
                                                (Number(item.qty) || 0) *
                                                    (Number(
                                                        item.price_at_transaction
                                                    ) || 0)
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary Total */}
                            <div className="bg-gray-50 p-4 space-y-2 border-t">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal Produk</span>
                                    <span>
                                        {formatRupiah(transaction.total_price)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Ongkos Kirim</span>
                                    <span>
                                        {formatRupiah(
                                            transaction.shipping_cost
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 mt-2">
                                    <span>Total Pembayaran</span>
                                    <span className="text-orange-600">
                                        {formatRupiah(
                                            (Number(transaction.total_price) ||
                                                0) +
                                                (Number(
                                                    transaction.shipping_cost
                                                ) || 0)
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Info Pembeli & Pengiriman */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Kotak Info Kontak */}
                            <div className="bg-white border rounded-xl p-4 shadow-sm">
                                <h4 className="flex items-center gap-2 font-medium mb-3 text-gray-700 border-b pb-2">
                                    <User className="w-4 h-4" /> Kontak Pembeli
                                </h4>
                                <div className="text-sm space-y-2">
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Nama Penerima
                                        </p>
                                        <p className="font-medium">
                                            {buyerName}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Email Akun
                                        </p>
                                        <p className="font-medium text-gray-700">
                                            {buyerEmail}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            No WhatsApp/HP
                                        </p>
                                        <p className="font-medium text-gray-700">
                                            {buyerPhone}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Kotak Alamat Lengkap */}
                            <div className="bg-white border rounded-xl p-4 shadow-sm">
                                <h4 className="flex items-center gap-2 font-medium mb-3 text-gray-700 border-b pb-2">
                                    <MapPin className="w-4 h-4" /> Alamat
                                    Pengiriman
                                </h4>

                                {shippingInfo ? (
                                    <div className="text-sm text-gray-700 space-y-1">
                                        <p className="leading-relaxed font-medium">
                                            {shippingInfo.address_line}
                                        </p>
                                        <p>
                                            {shippingInfo.city},{" "}
                                            {shippingInfo.postal_code}
                                        </p>
                                        <div className="mt-2 text-xs bg-blue-50 text-blue-700 p-2 rounded">
                                            Penerima:{" "}
                                            {shippingInfo.recipient_name} <br />
                                            HP: {shippingInfo.phone_number}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">
                                        {transaction.address ||
                                            "Alamat tidak disertakan (Manual)"}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* KOLOM KANAN: Panel Aksi */}
                    <div className="space-y-6">
                        {/* UPDATE STATUS */}
                        <div className="bg-white border rounded-xl p-5 shadow-sm sticky top-6 border-l-4 border-l-blue-500">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Truck className="w-5 h-5 text-blue-600" />
                                Update Status
                            </h3>

                            <form
                                onSubmit={handleUpdateStatus}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label>Status Pesanan Saat Ini</Label>
                                    <select
                                        className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                                        value={data.order_status}
                                        onChange={(e) =>
                                            setData(
                                                "order_status",
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="pending">
                                            Menunggu Pembayaran
                                        </option>
                                        <option value="processing">
                                            Sedang Diproses (Packing)
                                        </option>
                                        <option value="shipped">
                                            Sedang Dikirim (Kurir)
                                        </option>
                                        <option value="completed">
                                            Selesai (Diterima)
                                        </option>
                                        <option value="cancelled">
                                            Dibatalkan
                                        </option>
                                    </select>
                                    {errors.order_status && (
                                        <p className="text-red-500 text-xs">
                                            {errors.order_status}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {processing
                                            ? "Menyimpan..."
                                            : "Simpan Perubahan"}
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {/* INFO PEMBAYARAN */}
                        <div className="bg-white border rounded-xl p-5 shadow-sm">
                            <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-gray-700">
                                <CreditCard className="w-4 h-4" />
                                Metode Pembayaran
                            </h3>
                            <div className="text-sm">
                                <div className="flex justify-between py-2 border-b border-dashed">
                                    <span className="text-gray-500">Tipe</span>
                                    <span className="font-medium uppercase">
                                        {transaction.payment_method
                                            ? transaction.payment_method
                                            : transaction.snap_token
                                            ? "MIDTRANS (OTOMATIS)"
                                            : "MANUAL / WA"}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-gray-500">
                                        Status Bayar
                                    </span>
                                    <span
                                        className={`font-bold ${
                                            transaction.payment_status ===
                                            "paid"
                                                ? "text-green-600"
                                                : "text-orange-500"
                                        }`}
                                    >
                                        {transaction.payment_status === "paid"
                                            ? "LUNAS"
                                            : "BELUM LUNAS"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
}
