import React, { useEffect, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import Navbar from "@/Components/Navbar";
import { Button } from "@/Components/ui/button";
import {
    CheckCircle2,
    Clock,
    Truck,
    Package,
    XCircle,
    CreditCard,
    ChevronLeft,
    AlertTriangle,
    Send,
    Copy,
    Store, // <--- TAMBAHAN: Icon Store buat Pickup
} from "lucide-react";

export default function TrackOrder({
    transaction,
    address,
    midtransClientKey,
}) {
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    // --- LOGIC: CEK APAKAH INI PICKUP ---
    const isPickup = address?.delivery_type === "pickup";

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

    useEffect(() => {
        if (
            transaction.payment_method === "midtrans" &&
            transaction.payment_status === "pending"
        ) {
            const script = document.createElement("script");
            script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
            script.setAttribute("data-client-key", midtransClientKey);
            document.body.appendChild(script);
        }
    }, [
        transaction.payment_method,
        transaction.payment_status,
        midtransClientKey,
    ]);

    const formatRupiah = (number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(number);
    };

    // --- BADGE STATUS PESANAN (DINAMIS PICKUP/DELIVERY) ---
    const getOrderStatusBadge = (orderStatus, paymentStatus) => {
        if (orderStatus === "processing") {
            return (
                <span className="flex items-center gap-1 px-3 py-1 text-sm font-bold text-blue-600 rounded-full bg-blue-50">
                    <Package size={16} /> Diproses
                </span>
            );
        }
        if (orderStatus === "shipped") {
            return (
                <span
                    className={`flex items-center gap-1 px-3 py-1 text-sm font-bold rounded-full ${isPickup ? "text-teal-600 bg-teal-50" : "text-purple-600 bg-purple-50"}`}
                >
                    {isPickup ? (
                        <>
                            <Store size={16} /> Siap Diambil
                        </>
                    ) : (
                        <>
                            <Truck size={16} /> Dikirim
                        </>
                    )}
                </span>
            );
        }
        if (orderStatus === "completed") {
            return (
                <span className="flex items-center gap-1 px-3 py-1 text-sm font-bold text-green-600 rounded-full bg-green-50">
                    <CheckCircle2 size={16} /> Selesai
                </span>
            );
        }
        if (orderStatus === "cancelled") {
            return (
                <span className="flex items-center gap-1 px-3 py-1 text-sm font-bold text-red-600 rounded-full bg-red-50">
                    <XCircle size={16} /> Dibatalkan
                </span>
            );
        }

        if (orderStatus === "pending") {
            if (paymentStatus === "paid") {
                return (
                    <span className="flex items-center gap-1 px-3 py-1 text-sm font-bold text-blue-600 rounded-full bg-blue-50">
                        <Clock size={16} /> Menunggu Diproses
                    </span>
                );
            } else {
                return (
                    <span className="flex items-center gap-1 px-3 py-1 text-sm font-bold rounded-full text-amber-600 bg-amber-50">
                        <Clock size={16} /> Menunggu Pembayaran
                    </span>
                );
            }
        }
        return null;
    };

    const handleContinuePayment = () => {
        if (transaction.snap_token && window.snap) {
            setIsPaymentLoading(true);
            window.snap.pay(transaction.snap_token, {
                onSuccess: function (result) {
                    window.onbeforeunload = null;
                    showToast("success", "Pembayaran Berhasil diproses!");
                    setTimeout(() => window.location.reload(), 1000);
                },
                onPending: function (result) {
                    window.onbeforeunload = null;
                    showToast("warning", "Menyimpan status pembayaran...");
                    setTimeout(() => window.location.reload(), 1000);
                },
                onError: function (result) {
                    window.onbeforeunload = null;
                    showToast("error", "Pembayaran Gagal. Silakan coba lagi.");
                    setIsPaymentLoading(false);
                },
                onClose: function () {
                    window.onbeforeunload = null;
                    showToast(
                        "info",
                        "Popup ditutup. Anda bisa melanjutkan pembayaran nanti.",
                    );
                    setIsPaymentLoading(false);
                },
            });
        } else {
            showToast(
                "error",
                "Sistem pembayaran belum siap. Muat ulang halaman.",
            );
        }
    };

    return (
        <div className="relative min-h-screen font-sans bg-gray-50">
            <Head title={`Invoice ${transaction.invoice_code}`} />
            <Navbar />

            {/* --- CUSTOM TOAST COMPONENT --- */}
            {toastMessage && (
                <div className="fixed z-50 duration-300 -translate-x-1/2 top-24 left-1/2 animate-in slide-in-from-top-5 fade-in">
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

            <div className="max-w-4xl px-4 py-8 mx-auto">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 mb-6 font-medium text-gray-500 transition-colors hover:text-orange-600"
                >
                    <ChevronLeft size={20} /> Kembali ke Beranda
                </Link>

                <div className="overflow-hidden bg-white border shadow-sm rounded-2xl">
                    {/* HEADER INVOICE */}
                    <div className="flex flex-col justify-between gap-4 p-6 text-white bg-gray-900 md:p-8 md:flex-row md:items-center">
                        <div>
                            <p className="mb-1 text-sm font-medium text-gray-400">
                                Status Pesanan
                            </p>
                            {getOrderStatusBadge(
                                transaction.order_status,
                                transaction.payment_status,
                            )}
                        </div>
                        <div className="md:text-right">
                            <p className="mb-1 text-sm font-medium text-gray-400">
                                No. Invoice
                            </p>
                            <h2 className="text-xl font-bold tracking-wider md:text-2xl">
                                {transaction.invoice_code}
                            </h2>
                        </div>
                    </div>

                    <div className="p-6 md:p-8">
                        {/* ALERT MENUNGGU PEMBAYARAN MIDTRANS */}
                        {transaction.order_status !== "cancelled" &&
                            transaction.payment_method === "midtrans" &&
                            transaction.payment_status === "pending" && (
                                <div className="flex flex-col items-center justify-between gap-4 p-5 mb-8 border border-orange-200 md:flex-row bg-orange-50 rounded-xl">
                                    <div>
                                        <h3 className="mb-1 text-lg font-bold text-orange-800">
                                            Menunggu Pembayaran
                                        </h3>
                                        <p className="text-sm text-orange-700">
                                            Selesaikan pembayaran Anda agar
                                            pesanan segera diproses oleh
                                            penjual.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleContinuePayment}
                                        disabled={isPaymentLoading}
                                        className="w-full font-bold transition-all bg-orange-600 shadow-md md:w-auto hover:bg-orange-700"
                                    >
                                        {isPaymentLoading ? (
                                            <span className="animate-pulse">
                                                Memuat...
                                            </span>
                                        ) : (
                                            <>
                                                <CreditCard
                                                    size={18}
                                                    className="mr-2"
                                                />{" "}
                                                Lanjutkan Pembayaran
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}

                        {/* ALERT MENUNGGU PEMBAYARAN WHATSAPP (MANUAL) */}
                        {transaction.order_status !== "cancelled" &&
                            transaction.payment_method === "whatsapp" &&
                            transaction.payment_status === "pending" && (
                                <div className="flex flex-col items-center justify-between gap-6 p-6 mb-8 border border-blue-200 md:flex-row bg-blue-50 rounded-xl">
                                    <div className="flex-1 w-full">
                                        <h3 className="mb-2 text-lg font-bold text-blue-900">
                                            Menunggu Pembayaran (Manual)
                                        </h3>
                                        <p className="mb-4 text-sm text-blue-800">
                                            Silakan transfer tepat sesuai total
                                            tagihan ke rekening berikut:
                                        </p>
                                        <div className="inline-block p-4 mb-2 bg-white border border-blue-100 rounded-lg shadow-sm">
                                            <p className="text-xs font-bold text-gray-500 uppercase">
                                                {transaction.store?.bank_name ||
                                                    "Bank Toko"}
                                            </p>
                                            <p className="font-mono text-xl font-bold tracking-wider text-gray-900">
                                                {transaction.store
                                                    ?.bank_account ||
                                                    "Nomor Rekening"}
                                            </p>
                                        </div>
                                        <p className="flex items-center gap-1 mt-2 text-xs text-blue-700">
                                            <AlertTriangle size={14} />
                                            Setelah transfer, wajib konfirmasi
                                            dengan mengirimkan bukti via
                                            WhatsApp.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            const totalBill =
                                                parseFloat(
                                                    transaction.total_price,
                                                ) +
                                                parseFloat(
                                                    transaction.shipping_cost,
                                                );
                                            const waPesan = `Halo kak, saya mau konfirmasi pesanan:\n*${transaction.invoice_code}*\n\n👤 Nama: ${address?.recipient_name}\n💰 Total Tagihan: *${formatRupiah(totalBill)}*\n\nSaya akan segera melakukan pembayaran ke rekening:\n🏦 ${transaction.store?.bank_name} - ${transaction.store?.bank_account}\n\nMohon tunggu bukti transfernya ya. Terima kasih! 🙏`;
                                            const waUrl = `https://wa.me/${transaction.store?.phone_number}?text=${encodeURIComponent(waPesan)}`;
                                            window.open(waUrl, "_blank");
                                        }}
                                        className="w-full px-6 font-bold text-white transition-all bg-green-600 shadow-md h-14 md:w-auto hover:bg-green-700 rounded-xl"
                                    >
                                        <Send size={18} className="mr-2" />{" "}
                                        Konfirmasi ke WhatsApp
                                    </Button>
                                </div>
                            )}

                        <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-2">
                            {/* INFO PENERIMA */}
                            <div>
                                <h3 className="pb-2 mb-3 font-bold text-gray-900 border-b">
                                    {isPickup
                                        ? "Informasi Pengambilan"
                                        : "Informasi Pengiriman"}
                                </h3>
                                <p className="font-semibold text-gray-800">
                                    {address?.recipient_name}
                                </p>
                                <p className="mt-1 text-sm text-gray-600">
                                    {address?.phone_number}
                                </p>

                                {/* Kalau dikirim, tampilkan alamat */}
                                {!isPickup && (
                                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                                        {address?.address_line}
                                        <br />
                                        {address?.city}, {address?.postal_code}
                                    </p>
                                )}

                                {/* --- BLOK RESI PENGIRIMAN ATAU INSTRUKSI PICKUP --- */}
                                <div className="p-4 mt-5 border border-orange-100 rounded-xl bg-orange-50/50">
                                    {isPickup ? (
                                        <>
                                            <p className="mb-1 text-xs font-bold text-gray-500 uppercase">
                                                Metode Pengiriman
                                            </p>
                                            <p className="mb-4 text-sm font-bold text-gray-900 uppercase">
                                                Ambil Sendiri di Toko
                                            </p>
                                            {transaction.order_status ===
                                                "shipped" ||
                                            transaction.order_status ===
                                                "completed" ? (
                                                <div className="p-3 bg-white border border-green-200 rounded-lg shadow-sm">
                                                    <p className="flex items-center gap-2 text-sm font-bold text-green-600">
                                                        <CheckCircle2 className="w-5 h-5" />{" "}
                                                        Pesanan Siap Diambil!
                                                    </p>
                                                    <p className="mt-2 text-xs leading-relaxed text-gray-500">
                                                        Silakan tunjukkan
                                                        halaman invoice ini
                                                        kepada kasir/admin toko
                                                        saat mengambil pesanan
                                                        Anda.
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="flex items-center gap-2 text-sm italic text-gray-500">
                                                    {transaction.order_status ===
                                                        "pending" ||
                                                    transaction.order_status ===
                                                        "processing" ? (
                                                        <>
                                                            <Clock className="w-4 h-4" />{" "}
                                                            Menunggu pesanan
                                                            disiapkan...
                                                        </>
                                                    ) : (
                                                        ""
                                                    )}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <p className="mb-1 text-xs font-bold text-gray-500 uppercase">
                                                Kurir Pengiriman
                                            </p>
                                            <p className="mb-3 text-sm font-bold text-gray-900 uppercase">
                                                {address?.courier ||
                                                    "Kurir Reguler"}
                                            </p>

                                            <p className="mb-1 text-xs font-bold text-gray-500 uppercase">
                                                Nomor Resi
                                            </p>
                                            {(transaction.order_status ===
                                                "shipped" ||
                                                transaction.order_status ===
                                                    "completed") &&
                                            transaction.resi_number ? (
                                                <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                                    <span className="font-mono text-base font-black tracking-wider text-orange-600">
                                                        {
                                                            transaction.resi_number
                                                        }
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(
                                                                transaction.resi_number,
                                                            );
                                                            showToast(
                                                                "success",
                                                                "Nomor resi berhasil disalin!",
                                                            );
                                                        }}
                                                        className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-blue-600 transition-colors rounded bg-blue-50 hover:text-blue-800 hover:bg-blue-100"
                                                    >
                                                        <Copy className="w-3 h-3" />{" "}
                                                        Salin
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className="flex items-center gap-2 text-sm italic text-gray-500">
                                                    {transaction.order_status ===
                                                        "pending" ||
                                                    transaction.order_status ===
                                                        "processing" ? (
                                                        <>
                                                            <Clock className="w-4 h-4" />{" "}
                                                            Menunggu barang
                                                            dikirim...
                                                        </>
                                                    ) : (
                                                        "Belum ada resi."
                                                    )}
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* INFO PEMBAYARAN */}
                            <div>
                                <h3 className="pb-2 mb-3 font-bold text-gray-900 border-b">
                                    Metode Pembayaran
                                </h3>
                                <p className="text-sm text-gray-600 capitalize">
                                    {transaction.payment_method === "midtrans"
                                        ? "Transfer / E-Wallet (Otomatis)"
                                        : "Manual via WhatsApp"}
                                </p>
                                <div className="flex items-center justify-between mt-4 text-sm">
                                    <span className="text-gray-500">
                                        Status Pembayaran:
                                    </span>
                                    {transaction.order_status ===
                                    "cancelled" ? (
                                        <span className="px-2 py-1 font-bold text-red-600 rounded bg-red-50">
                                            GAGAL / DIBATALKAN
                                        </span>
                                    ) : transaction.payment_status ===
                                      "paid" ? (
                                        <span className="px-2 py-1 font-bold text-green-600 rounded bg-green-50">
                                            LUNAS
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 font-bold rounded text-amber-600 bg-amber-50">
                                            BELUM BAYAR
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* DAFTAR BARANG */}
                        <h3 className="pb-2 mb-4 font-bold text-gray-900 border-b">
                            Rincian Barang
                        </h3>
                        <div className="mb-8 space-y-4">
                            {transaction.details.map((detail) => (
                                <div
                                    key={detail.id}
                                    className="flex items-center gap-4"
                                >
                                    <div className="w-16 h-16 overflow-hidden bg-gray-100 border rounded-lg">
                                        <img
                                            src={`/storage/${detail.product.image}`}
                                            alt={detail.product.name}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">
                                            {detail.product.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {detail.qty} x{" "}
                                            {formatRupiah(
                                                detail.price_at_transaction,
                                            )}
                                        </p>
                                    </div>
                                    <div className="font-bold text-gray-900">
                                        {formatRupiah(
                                            detail.qty *
                                                detail.price_at_transaction,
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* TOTAL TAGIHAN */}
                        <div className="p-6 space-y-3 border bg-gray-50 rounded-xl">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal Produk</span>
                                <span>
                                    {formatRupiah(transaction.total_price)}
                                </span>
                            </div>
                            <div className="flex justify-between pb-3 text-sm text-gray-600 border-b">
                                <span>
                                    {isPickup
                                        ? "Biaya Penanganan"
                                        : "Ongkos Kirim"}
                                </span>
                                <span>
                                    {formatRupiah(transaction.shipping_cost)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-lg font-bold text-gray-900">
                                    Total Pembayaran
                                </span>
                                <span className="text-2xl font-black text-orange-600">
                                    {formatRupiah(
                                        parseFloat(transaction.total_price) +
                                            parseFloat(
                                                transaction.shipping_cost,
                                            ),
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TIPS SIMPAN URL */}
                <div className="mt-8 text-sm text-center text-gray-500">
                    <p>
                        Simpan URL halaman ini (
                        <span className="px-1 py-0.5 mx-1 font-mono text-gray-400 bg-gray-100 rounded">
                            {transaction.invoice_code}
                        </span>
                        ) untuk melacak pesanan Anda di kemudian hari.
                    </p>
                </div>
            </div>
        </div>
    );
}
