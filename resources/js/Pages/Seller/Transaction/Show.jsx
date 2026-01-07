import SellerLayout from "@/Layouts/SellerLayout";
import { Head, Link, useForm, router } from "@inertiajs/react";
import { useState } from "react";
import {
    ArrowLeft,
    MapPin,
    User,
    CreditCard,
    Package,
    Truck,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Copy,
    Send,
    Printer,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";

export default function TransactionShow({ transaction }) {
    // State untuk Input Resi
    const [resiInput, setResiInput] = useState(transaction.resi_number || "");

    // Form Handler (Kita pakai satu form generic untuk hit endpoint update)
    const { data, setData, put, processing, errors } = useForm({
        action_type: "", // 'confirm_payment', 'input_resi', 'cancel', 'complete'
        resi_number: "",
        notes: "",
    });

    // --- 1. PARSING ALAMAT (Sama seperti sebelumnya) ---
    let shippingInfo = null;
    try {
        if (transaction.shipping_address_snapshot) {
            shippingInfo = JSON.parse(transaction.shipping_address_snapshot);
        }
    } catch (error) {
        console.error("Gagal parsing alamat:", error);
    }

    const buyerName = shippingInfo?.recipient_name || transaction.user?.name;
    const buyerPhone =
        shippingInfo?.phone_number || transaction.user?.phone || "-";
    const buyerEmail = transaction.user?.email || "-";

    // --- 2. LOGIC TOMBOL AKSI ---

    // A. Terima Pembayaran (Ubah Pending -> Processing)
    const handleConfirmPayment = () => {
        if (confirm("Pastikan uang sudah masuk ke rekening Anda. Lanjutkan?")) {
            // GANTI 'put' DENGAN 'router.put'
            router.put(
                route("seller.transactions.update", transaction.id),
                {
                    action_type: "confirm_payment",
                },
                {
                    preserveScroll: true,
                    onSuccess: () =>
                        alert("Pembayaran Dikonfirmasi! Silakan kemas barang."),
                }
            );
        }
    };

    // B. Input Resi & Kirim (Ubah Processing -> Shipped)
    const handleSendOrder = (e) => {
        // e.preventDefault(); // Tidak perlu preventDefault kalau bukan form submit standard
        if (!resiInput) return alert("Wajib isi Nomor Resi!");

        // GANTI 'put' DENGAN 'router.put'
        router.put(
            route("seller.transactions.update", transaction.id),
            {
                action_type: "input_resi",
                resi_number: resiInput, // Kirim state input resi langsung
            },
            {
                preserveScroll: true,
                onSuccess: () =>
                    alert("Pesanan dikirim! Status berubah menjadi Dikirim."),
            }
        );
    };

    // C. Batalkan Pesanan
    const handleCancelOrder = () => {
        if (
            confirm(
                "Yakin ingin membatalkan pesanan ini? Stok akan dikembalikan."
            )
        ) {
            router.put(
                route("seller.transactions.update", transaction.id),
                {
                    action_type: "cancel",
                },
                {
                    preserveScroll: true,
                }
            );
        }
    };

    const handleCompleteOrder = () => {
        if (
            confirm(
                "Pastikan Pembeli sudah menerima barang. Ubah status jadi Selesai?"
            )
        ) {
            router.put(
                route("seller.transactions.update", transaction.id),
                {
                    action_type: "complete",
                },
                {
                    preserveScroll: true,
                    onSuccess: () => alert("Pesanan ditandai Selesai!"),
                }
            );
        }
    };

    // --- 3. HELPER UI ---
    const formatRupiah = (val) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(Number(val) || 0);

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
            processing: "Perlu Dikirim",
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

    // --- 4. RENDER ACTION PANEL (DINAMIS SESUAI STATUS) ---
    const renderActionPanel = () => {
        const status = transaction.order_status;

        // KASUS 1: MENUNGGU PEMBAYARAN
        if (status === "pending") {
            return (
                <div className="p-5 border border-yellow-200 bg-yellow-50 rounded-xl">
                    <h3 className="flex items-center gap-2 mb-2 font-bold text-yellow-800">
                        <AlertTriangle className="w-5 h-5" />
                        Konfirmasi Pembayaran
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-yellow-700">
                        Cek mutasi rekening Anda. Jika uang sudah masuk sejumlah
                        <strong>
                            {" "}
                            {formatRupiah(transaction.total_price)}
                        </strong>
                        , silakan proses pesanan.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            onClick={handleCancelOrder}
                            disabled={processing}
                        >
                            Tolak / Batal
                        </Button>
                        <Button
                            className="text-white bg-green-600 hover:bg-green-700"
                            onClick={handleConfirmPayment}
                            disabled={processing}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Terima Pesanan
                        </Button>
                    </div>
                </div>
            );
        }

        // KASUS 2: PERLU DIKIRIM (INPUT RESI)
        if (status === "processing") {
            return (
                <div className="p-5 border border-blue-200 bg-blue-50 rounded-xl">
                    <h3 className="flex items-center gap-2 mb-2 font-bold text-blue-800">
                        <Package className="w-5 h-5" />
                        Siap Kirim?
                    </h3>
                    <p className="mb-4 text-sm text-blue-700">
                        Segera kemas barang dan drop ke kurir. Masukkan nomor
                        resi di bawah ini untuk update status.
                    </p>

                    <div className="space-y-3">
                        <div>
                            <Label className="text-blue-900">Nomor Resi</Label>
                            <Input
                                placeholder="Contoh: JP123456789"
                                value={resiInput}
                                onChange={(e) => setResiInput(e.target.value)}
                                className="bg-white border-blue-200 focus:border-blue-500"
                            />
                        </div>
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={handleSendOrder}
                            disabled={!resiInput}
                        >
                            <Truck className="w-4 h-4 mr-2" />
                            Kirim Pesanan
                        </Button>
                    </div>
                </div>
            );
        }

        // KASUS 3: SEDANG DIKIRIM
        if (status === "shipped") {
            return (
                <div className="p-5 border border-purple-200 bg-purple-50 rounded-xl">
                    <h3 className="flex items-center gap-2 mb-2 font-bold text-purple-800">
                        <Truck className="w-5 h-5" />
                        Dalam Pengiriman
                    </h3>

                    {/* Info Resi */}
                    <div className="flex items-center justify-between p-3 mb-4 bg-white border border-purple-100 rounded shadow-sm">
                        <div>
                            <p className="text-xs font-bold text-purple-500 uppercase">
                                No. Resi
                            </p>
                            <p className="font-mono font-medium tracking-wide text-gray-800">
                                {transaction.resi_number}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                navigator.clipboard.writeText(
                                    transaction.resi_number
                                );
                                alert("Resi disalin!");
                            }}
                        >
                            <Copy className="w-4 h-4 text-purple-400" />
                        </Button>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs leading-relaxed text-center text-purple-600">
                            Menunggu pembeli klik "Pesanan Diterima". <br />
                            Jika pembeli lupa konfirmasi tapi barang sudah
                            sampai, Anda bisa selesaikan manual.
                        </p>

                        {/* TOMBOL MANUAL SELESAI */}
                        <Button
                            variant="outline"
                            className="w-full text-purple-700 border-purple-200 hover:bg-purple-100"
                            onClick={handleCompleteOrder}
                            disabled={processing}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Tandai Selesai (Manual)
                        </Button>
                    </div>
                </div>
            );
        }

        // KASUS 4: SELESAI
        if (status === "completed") {
            return (
                <div className="p-5 text-center border border-green-200 bg-green-50 rounded-xl">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="mb-1 font-bold text-green-800">
                        Transaksi Selesai
                    </h3>
                    <p className="text-sm text-green-600">
                        Dana telah diteruskan ke saldo toko Anda.
                    </p>
                </div>
            );
        }

        // KASUS 5: BATAL
        return (
            <div className="p-5 text-center bg-gray-100 border border-gray-200 rounded-xl">
                <XCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <h3 className="font-bold text-gray-600">Pesanan Dibatalkan</h3>
            </div>
        );
    };

    return (
        <SellerLayout>
            <Head title={`Pesanan #${transaction.invoice_code}`} />

            <div className="max-w-5xl pb-20 mx-auto">
                {/* Header Page */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href={route("seller.transactions.index")}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div className="flex flex-col justify-between flex-1 gap-4 md:flex-row md:items-center">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold tracking-tight">
                                    Invoice: {transaction.invoice_code}
                                </h2>
                                {getStatusBadge(transaction.order_status)}
                            </div>
                            <a
                                href={route(
                                    "seller.transactions.print",
                                    transaction.id
                                )}
                                target="_blank" // Buka tab baru biar enak
                                rel="noopener noreferrer"
                            >
                                <Button
                                    variant="outline"
                                    className="border-gray-300 hover:bg-gray-50"
                                >
                                    <Printer className="w-4 h-4 mr-2" />
                                    Cetak Label
                                </Button>
                            </a>
                            <p className="mt-1 text-sm text-muted-foreground">
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
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* KOLOM KIRI: DETAIL PRODUK & INFO (Lebar 2/3) */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* 1. List Produk */}
                        <div className="overflow-hidden bg-white border shadow-sm rounded-xl">
                            <div className="flex items-center gap-2 p-4 font-medium text-gray-700 border-b bg-gray-50">
                                <Package className="w-4 h-4" /> Rincian Produk
                            </div>
                            <div className="divide-y">
                                {transaction.transaction_details.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-4 p-4"
                                    >
                                        <div className="w-16 h-16 overflow-hidden bg-gray-100 border rounded-md shrink-0">
                                            {item.product?.image ? (
                                                <img
                                                    src={`/storage/${item.product.image}`}
                                                    alt={item.product.name}
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full text-gray-400">
                                                    <Package className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 line-clamp-2">
                                                {item.product?.name ||
                                                    "Produk Dihapus"}
                                            </h4>
                                            <div className="mt-1 text-sm text-gray-500">
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

                            {/* Rincian Harga */}
                            <div className="p-4 space-y-2 text-sm border-t bg-gray-50">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal Produk</span>
                                    <span>
                                        {formatRupiah(transaction.total_price)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Ongkos Kirim</span>
                                    <span>
                                        {formatRupiah(
                                            transaction.shipping_cost
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-3 mt-2 text-lg font-bold text-gray-900 border-t border-gray-200">
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

                        {/* 2. Info Pengiriman & Pembeli */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Pembeli */}
                            <div className="p-5 bg-white border shadow-sm rounded-xl">
                                <h4 className="flex items-center gap-2 pb-2 mb-4 font-semibold text-gray-800 border-b">
                                    <User className="w-4 h-4" /> Data Pembeli
                                </h4>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Nama Akun
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {transaction.user?.name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Email / Kontak
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {buyerEmail}
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {transaction.user?.phone || "-"}
                                        </p>
                                    </div>
                                    {/* Tombol WA ke Pembeli */}
                                    {buyerPhone !== "-" && (
                                        <a
                                            href={`https://wa.me/62${buyerPhone.replace(
                                                /^0/,
                                                ""
                                            )}`}
                                            target="_blank"
                                            className="inline-flex items-center gap-1.5 text-green-600 hover:text-green-700 font-medium mt-1"
                                        >
                                            <Send className="w-3 h-3" /> Hubungi
                                            via WA
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Alamat */}
                            <div className="p-5 bg-white border shadow-sm rounded-xl">
                                <h4 className="flex items-center gap-2 pb-2 mb-4 font-semibold text-gray-800 border-b">
                                    <MapPin className="w-4 h-4" /> Tujuan
                                    Pengiriman
                                </h4>
                                {shippingInfo ? (
                                    <div className="space-y-2 text-sm text-gray-700">
                                        <p className="font-bold">
                                            {shippingInfo.recipient_name}
                                        </p>
                                        <p className="leading-relaxed">
                                            {shippingInfo.address_line}
                                        </p>
                                        <p>
                                            {shippingInfo.city},{" "}
                                            {shippingInfo.postal_code}
                                        </p>
                                        <p className="pt-1 mt-2 text-gray-500 border-t">
                                            Telp: {shippingInfo.phone_number}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm italic text-gray-500">
                                        {transaction.address || "Alamat manual"}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* KOLOM KANAN: ACTION PANEL (Sticky) */}
                    <div className="space-y-6 lg:col-span-1">
                        {/* 1. STATUS & ACTION CARD (DINAMIS) */}
                        {renderActionPanel()}

                        {/* 2. PAYMENT INFO */}
                        <div className="p-5 bg-white border shadow-sm rounded-xl">
                            <h3 className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-800">
                                <CreditCard className="w-4 h-4" />
                                Informasi Pembayaran
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">
                                        Metode
                                    </span>
                                    <span className="font-medium uppercase">
                                        {transaction.snap_token
                                            ? "Otomatis (Midtrans)"
                                            : "Manual Transfer (WA)"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">
                                        Status
                                    </span>
                                    <Badge
                                        variant={
                                            transaction.payment_status ===
                                            "paid"
                                                ? "default"
                                                : "secondary"
                                        }
                                        className={
                                            transaction.payment_status ===
                                            "paid"
                                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                                : ""
                                        }
                                    >
                                        {transaction.payment_status === "paid"
                                            ? "LUNAS"
                                            : "BELUM LUNAS"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
}
