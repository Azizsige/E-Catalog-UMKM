import SellerLayout from "@/Layouts/SellerLayout";
import { Head, Link, useForm, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import {
    ArrowLeft,
    MapPin,
    User,
    CreditCard,
    Package,
    Truck,
    CheckCircle,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Copy,
    Send,
    Printer,
    Box,
    Info,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";

export default function TransactionShow({ transaction }) {
    const [resiInput, setResiInput] = useState(transaction.resi_number || "");
    const { data, setData, put, processing, errors } = useForm({
        action_type: "",
    });

    // --- STATE CUSTOM TOAST ---
    const [toastMessage, setToastMessage] = useState(null);

    // --- STATE CUSTOM MODAL CONFIRMATION ---
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        actionType: "", // 'confirm_payment' | 'send_order' | 'cancel' | 'complete'
        icon: null,
        confirmColor: "bg-primary",
    });

    // Efek Toast
    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => {
                setToastMessage(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    const showToast = (type, text) => {
        setToastMessage({ type, text });
    };

    // Buka Modal Konfirmasi
    const openConfirmModal = (
        title,
        message,
        actionType,
        icon,
        confirmColor,
    ) => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            actionType,
            icon,
            confirmColor,
        });
    };

    // Tutup Modal
    const closeConfirmModal = () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
    };

    // --- 1. PARSING ALAMAT ---
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

    // --- 2. EXECUTE ACTION DARI MODAL ---
    const executeAction = () => {
        const { actionType } = confirmModal;

        if (actionType === "confirm_payment") {
            router.put(
                route("admin.transactions.update", transaction.id),
                { action_type: "confirm_payment" },
                {
                    preserveScroll: true,
                    onSuccess: () =>
                        showToast(
                            "success",
                            "Pembayaran dikonfirmasi! Silakan kemas barang.",
                        ),
                    onError: () =>
                        showToast("error", "Gagal mengkonfirmasi pembayaran."),
                },
            );
        } else if (actionType === "send_order") {
            router.put(
                route("admin.transactions.update", transaction.id),
                { action_type: "input_resi", resi_number: resiInput },
                {
                    preserveScroll: true,
                    onSuccess: () =>
                        showToast(
                            "success",
                            "Pesanan berhasil diupdate menjadi Sedang Dikirim.",
                        ),
                    onError: () =>
                        showToast(
                            "error",
                            "Gagal memperbarui resi pengiriman.",
                        ),
                },
            );
        } else if (actionType === "cancel") {
            router.put(
                route("admin.transactions.update", transaction.id),
                { action_type: "cancel" },
                {
                    preserveScroll: true,
                    onSuccess: () =>
                        showToast("info", "Pesanan telah dibatalkan."),
                },
            );
        } else if (actionType === "complete") {
            router.put(
                route("admin.transactions.update", transaction.id),
                { action_type: "complete" },
                {
                    preserveScroll: true,
                    onSuccess: () =>
                        showToast("success", "Transaksi telah selesai!"),
                },
            );
        }

        closeConfirmModal();
    };

    // --- TRIGGER TOMBOL (Panggil Modal) ---
    const handleConfirmPayment = () => {
        openConfirmModal(
            "Terima Pesanan?",
            "Pastikan pembayaran sudah benar-benar masuk ke rekening Anda. Lanjut proses pesanan?",
            "confirm_payment",
            <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-4" />,
            "bg-green-600 hover:bg-green-700",
        );
    };

    const handleSendOrder = () => {
        if (!resiInput.trim()) {
            return showToast(
                "warning",
                "Wajib mengisi Nomor Resi atau Keterangan Pengiriman!",
            );
        }
        openConfirmModal(
            "Konfirmasi Pengiriman",
            "Apakah barang sudah diserahkan ke kurir atau diambil oleh pembeli?",
            "send_order",
            <Truck className="w-10 h-10 text-blue-600 mx-auto mb-4" />,
            "bg-blue-600 hover:bg-blue-700",
        );
    };

    const handleCancelOrder = () => {
        openConfirmModal(
            "Batalkan Pesanan?",
            "Yakin ingin membatalkan pesanan ini? Stok produk akan dikembalikan secara otomatis.",
            "cancel",
            <XCircle className="w-10 h-10 text-red-600 mx-auto mb-4" />,
            "bg-red-600 hover:bg-red-700",
        );
    };

    const handleCompleteOrder = () => {
        openConfirmModal(
            "Selesaikan Pesanan?",
            "Ubah status pesanan menjadi Selesai? Pastikan pembeli sudah menerima barang dengan baik.",
            "complete",
            <CheckCircle2 className="w-10 h-10 text-purple-600 mx-auto mb-4" />,
            "bg-purple-600 hover:bg-purple-700",
        );
    };

    // --- 3. HELPER UI ---
    const formatRupiah = (val) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(Number(val) || 0);

    const getStatusBadge = (orderStatus, paymentStatus) => {
        const styles = {
            unpaid: "bg-amber-100 text-amber-700 border-amber-200", // Belum bayar
            waiting_process: "bg-blue-100 text-blue-700 border-blue-200", // Lunas, nunggu di-klik Terima Pesanan
            processing: "bg-indigo-100 text-indigo-700 border-indigo-200", // Lagi dikemas
            shipped: "bg-purple-100 text-purple-700 border-purple-200",
            completed: "bg-green-100 text-green-700 border-green-200",
            cancelled: "bg-red-100 text-red-700 border-red-200",
        };

        const labels = {
            unpaid: "Belum Dibayar",
            waiting_process: "Menunggu Diproses",
            processing: "Sedang Dikemas",
            shipped: "Sedang Dikirim",
            completed: "Selesai",
            cancelled: "Dibatalkan",
        };

        // Tentukan state aslinya berdasarkan gabungan order & payment
        let currentState = orderStatus;
        if (orderStatus === "pending") {
            currentState =
                paymentStatus === "paid" ? "waiting_process" : "unpaid";
        }

        return (
            <Badge
                variant="outline"
                className={`px-3 py-1 font-bold ${styles[currentState] || ""}`}
            >
                {labels[currentState] || currentState}
            </Badge>
        );
    };

    // --- 4. RENDER ACTION PANEL ---
    const renderActionPanel = () => {
        const status = transaction.order_status;

        if (status === "pending") {
            return (
                <div className="p-5 border border-yellow-200 bg-yellow-50 rounded-xl">
                    <h3 className="flex items-center gap-2 mb-2 font-bold text-yellow-800">
                        <AlertTriangle className="w-5 h-5" /> Konfirmasi
                        Pembayaran
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-yellow-700">
                        Cek mutasi rekening Anda. Jika uang sejumlah{" "}
                        <strong>{formatRupiah(transaction.total_price)}</strong>{" "}
                        sudah masuk, silakan proses pesanan.
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
                            <CheckCircle className="w-4 h-4 mr-2" /> Terima
                            Pesanan
                        </Button>
                    </div>
                </div>
            );
        }

        if (status === "processing") {
            return (
                <div className="p-5 border border-blue-200 bg-blue-50 rounded-xl">
                    <h3 className="flex items-center gap-2 mb-2 font-bold text-blue-800">
                        <Box className="w-5 h-5" /> Kemas & Kirim Pesanan
                    </h3>
                    <p className="mb-4 text-sm text-blue-700">
                        Segera kemas barang dan serahkan ke kurir. Masukkan
                        nomor resi pengiriman di bawah ini.
                        <br />
                        <span className="text-xs italic opacity-80">
                            (Ketik "DIAMBIL SENDIRI" jika pembeli mengambil ke
                            toko)
                        </span>
                    </p>
                    <div className="space-y-3">
                        <div>
                            <Label className="block mb-1 font-bold text-blue-900">
                                Nomor Resi Pengiriman
                            </Label>
                            <Input
                                placeholder="Contoh: JX123456789"
                                value={resiInput}
                                onChange={(e) => setResiInput(e.target.value)}
                                className="font-medium bg-white border-blue-200 focus:border-blue-500"
                            />
                        </div>
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={handleSendOrder}
                            disabled={processing || !resiInput.trim()}
                        >
                            <Truck className="w-4 h-4 mr-2" /> Konfirmasi
                            Pengiriman
                        </Button>
                    </div>
                </div>
            );
        }

        if (status === "shipped") {
            return (
                <div className="p-5 border border-purple-200 bg-purple-50 rounded-xl">
                    <h3 className="flex items-center gap-2 mb-2 font-bold text-purple-800">
                        <Truck className="w-5 h-5" /> Sedang Dikirim
                    </h3>
                    <div className="flex items-center justify-between p-3 mb-4 bg-white border border-purple-100 shadow-sm rounded-lg">
                        <div>
                            <p className="text-xs font-bold text-purple-500 uppercase">
                                No. Resi / Keterangan
                            </p>
                            <p className="text-lg font-bold tracking-wide font-mono text-gray-800">
                                {transaction.resi_number}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                navigator.clipboard.writeText(
                                    transaction.resi_number,
                                );
                                showToast(
                                    "info",
                                    "Nomor Resi disalin ke clipboard!",
                                );
                            }}
                            className="hover:bg-purple-100"
                        >
                            <Copy className="w-5 h-5 text-purple-600" />
                        </Button>
                    </div>
                    <div className="space-y-3">
                        <p className="text-xs leading-relaxed text-center text-purple-600">
                            Menunggu barang sampai ke tangan pembeli.
                            <br />
                            Anda bisa menyelesaikan transaksi ini secara manual
                            jika dipastikan barang sudah diterima.
                        </p>
                        <Button
                            variant="outline"
                            className="w-full font-bold text-purple-700 border-purple-200 hover:bg-purple-100"
                            onClick={handleCompleteOrder}
                            disabled={processing}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" /> Tandai
                            Pesanan Selesai
                        </Button>
                    </div>
                </div>
            );
        }

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
                        Pesanan telah diterima oleh pembeli dengan baik.
                    </p>
                </div>
            );
        }

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

            {/* --- CUSTOM TOAST COMPONENT --- */}
            {toastMessage && (
                <div className="fixed z-[100] -translate-x-1/2 top-24 left-1/2 animate-in slide-in-from-top-5 fade-in duration-300">
                    <div
                        className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-xl border font-medium text-sm
                        ${toastMessage.type === "success" ? "bg-green-50 border-green-200 text-green-800" : ""}
                        ${toastMessage.type === "error" ? "bg-red-50 border-red-200 text-red-800" : ""}
                        ${toastMessage.type === "warning" ? "bg-amber-50 border-amber-200 text-amber-800" : ""}
                        ${toastMessage.type === "info" ? "bg-gray-800 border-gray-700 text-white" : ""}
                    `}
                    >
                        {toastMessage.type === "success" && (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                        {toastMessage.type === "error" && (
                            <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        {toastMessage.type === "warning" && (
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                        )}
                        <p>{toastMessage.text}</p>
                        <button
                            onClick={() => setToastMessage(null)}
                            className="ml-2 opacity-50 hover:opacity-100"
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* --- CUSTOM CONFIRM MODAL --- */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center transform transition-all">
                        {confirmModal.icon || (
                            <Info className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                        )}
                        <h3 className="text-lg font-bold mb-2 text-gray-900">
                            {confirmModal.title}
                        </h3>
                        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                            {confirmModal.message}
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={closeConfirmModal}
                                disabled={processing}
                            >
                                Batal
                            </Button>
                            <Button
                                className={`flex-1 text-white ${confirmModal.confirmColor}`}
                                onClick={executeAction}
                                disabled={processing}
                            >
                                {processing ? "Memproses..." : "Ya, Lanjutkan"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-5xl pb-20 mx-auto">
                {/* Header Page */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href={route("admin.transactions.index")}>
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
                                {getStatusBadge(
                                    transaction.order_status,
                                    transaction.payment_status,
                                )}
                            </div>
                            <a
                                href={route("admin.transactions.print", {
                                    id: transaction.id,
                                })}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button
                                    variant="outline"
                                    className="mt-2 text-blue-700 border-blue-200 hover:bg-blue-50"
                                >
                                    <Printer className="w-4 h-4 mr-2" /> Cetak
                                    Label
                                </Button>
                            </a>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Dipesan pada:{" "}
                                {new Date(
                                    transaction.created_at,
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
                    {/* KOLOM KIRI: DETAIL PRODUK */}
                    <div className="space-y-6 lg:col-span-2">
                        <div className="overflow-hidden bg-white border shadow-sm rounded-xl">
                            <div className="flex items-center gap-2 p-4 font-bold text-gray-800 border-b bg-gray-50">
                                <Package className="w-5 h-5 text-blue-600" />{" "}
                                Rincian Pesanan
                            </div>
                            <div className="divide-y">
                                {transaction.details?.map((item, index) => (
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
                                            <h4 className="font-bold text-gray-900 line-clamp-2">
                                                {item.product?.name ||
                                                    "Produk Dihapus"}
                                            </h4>
                                            <div className="mt-1 text-sm text-gray-500">
                                                {item.qty} x{" "}
                                                {formatRupiah(
                                                    item.price_at_transaction,
                                                )}
                                            </div>
                                        </div>
                                        <div className="font-bold text-blue-700">
                                            {formatRupiah(
                                                (Number(item.qty) || 0) *
                                                    (Number(
                                                        item.price_at_transaction,
                                                    ) || 0),
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 space-y-2 text-sm border-t bg-gray-50">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal Produk</span>
                                    <span>
                                        {formatRupiah(transaction.total_price)}
                                    </span>
                                </div>
                                <div className="flex justify-between pb-3 text-sm text-gray-600 border-b">
                                    <span>Ongkos Kirim</span>
                                    <span>
                                        {formatRupiah(
                                            transaction.shipping_cost,
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-3 mt-2 text-lg font-black text-gray-900 border-t border-gray-200">
                                    <span>Total Tagihan</span>
                                    <span className="text-blue-700">
                                        {formatRupiah(
                                            (Number(transaction.total_price) ||
                                                0) +
                                                (Number(
                                                    transaction.shipping_cost,
                                                ) || 0),
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Info Pengiriman */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="p-5 bg-white border shadow-sm rounded-xl">
                                <h4 className="flex items-center gap-2 pb-2 mb-4 font-bold text-gray-800 border-b">
                                    <User className="w-4 h-4 text-blue-500" />{" "}
                                    Kontak Pelanggan
                                </h4>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="mb-1 text-xs text-gray-500">
                                            Nama Pembeli
                                        </p>
                                        <p className="font-bold text-gray-900">
                                            {buyerName}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-xs text-gray-500">
                                            Nomor WhatsApp
                                        </p>
                                        <p className="font-bold text-gray-900">
                                            {buyerPhone}
                                        </p>
                                    </div>
                                    {buyerPhone !== "-" && (
                                        <a
                                            href={`https://wa.me/62${buyerPhone.replace(/^0/, "")}`}
                                            target="_blank"
                                            className="inline-flex items-center gap-1.5 text-green-600 hover:text-green-700 font-bold mt-2 bg-green-50 px-3 py-2 rounded-lg w-full justify-center border border-green-200 transition-colors"
                                        >
                                            <Send className="w-4 h-4" /> Hubungi
                                            Pembeli
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="p-5 bg-white border shadow-sm rounded-xl">
                                <h4 className="flex items-center gap-2 pb-2 mb-4 font-bold text-gray-800 border-b">
                                    <MapPin className="w-4 h-4 text-red-500" />{" "}
                                    Detail Pengiriman
                                </h4>
                                {shippingInfo ? (
                                    <div className="space-y-2 text-sm text-gray-700">
                                        <p className="font-bold text-gray-900">
                                            {shippingInfo.recipient_name}
                                        </p>
                                        <p className="leading-relaxed">
                                            {shippingInfo.address_line}
                                        </p>
                                        <p>
                                            {shippingInfo.city},{" "}
                                            {shippingInfo.postal_code}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm italic text-gray-500">
                                        {transaction.address ||
                                            "Belum ada alamat spesifik"}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* KOLOM KANAN: ACTION & PAYMENT */}
                    <div className="space-y-6 lg:col-span-1">
                        {renderActionPanel()}

                        <div className="p-5 bg-white border shadow-sm rounded-xl">
                            <h3 className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-800">
                                <CreditCard className="w-4 h-4 text-green-500" />{" "}
                                Info Pembayaran
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between pb-2 border-b">
                                    <span className="text-gray-500">
                                        Metode
                                    </span>
                                    <span className="font-bold text-right max-w-[120px] leading-tight">
                                        {transaction.snap_token
                                            ? "Payment Gateway"
                                            : "Transfer Manual / COD"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-1">
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
                                                ? "bg-green-100 text-green-700 hover:bg-green-100 font-bold"
                                                : "font-bold text-gray-600"
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
