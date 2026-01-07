import { Head, Link, router } from "@inertiajs/react";
import Navbar from "@/Components/Navbar";
import { Button } from "@/Components/ui/button";
import {
    MapPin,
    ShoppingBag,
    Calendar,
    CreditCard,
    ArrowLeft,
    Store,
    Receipt,
    CheckCircle2,
    Clock,
    XCircle,
    Copy, // Tambah icon Copy
} from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function TransactionShow({ transaction, clientKey }) {
    const [isPayLoading, setIsPayLoading] = useState(false);

    // 1. Script Midtrans (Hanya load jika ada token)
    useEffect(() => {
        if (transaction.snap_token) {
            const script = document.createElement("script");
            script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
            script.setAttribute("data-client-key", clientKey);
            script.async = true;
            document.body.appendChild(script);
            return () => {
                document.body.removeChild(script);
            };
        }
    }, [clientKey, transaction.snap_token]);

    // 2. Handle Payment (Khusus Midtrans)
    const handlePayment = () => {
        if (isPayLoading) return;

        if (window.snap) {
            setIsPayLoading(true);
            window.snap.pay(transaction.snap_token, {
                onSuccess: function (result) {
                    setIsPayLoading(false);
                    Swal.fire({
                        title: "Pembayaran Berhasil!",
                        text: "Terima kasih, pesanan Anda akan segera diproses.",
                        icon: "success",
                        confirmButtonColor: "#ea580c",
                    }).then(() => {
                        window.location.reload();
                    });
                },
                onPending: function (result) {
                    setIsPayLoading(false);
                    Swal.fire({
                        title: "Menunggu Pembayaran",
                        text: "Silahkan selesaikan pembayaran sesuai instruksi.",
                        icon: "info",
                        confirmButtonColor: "#ea580c",
                    });
                },
                onError: function (result) {
                    setIsPayLoading(false);
                    Swal.fire({
                        title: "Pembayaran Gagal",
                        text: "Terjadi kesalahan saat memproses pembayaran.",
                        icon: "error",
                        confirmButtonColor: "#ea580c",
                    });
                },
                onClose: function () {
                    setIsPayLoading(false);
                },
            });
        }
    };

    // 3. Helpers & Data Parsing
    const formatRupiah = (n) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(n);

    // Parsing aman (antisipasi error JSON)
    let shippingAddress = {};
    try {
        shippingAddress = JSON.parse(
            transaction.shipping_address_snapshot || "{}"
        );
    } catch (e) {
        console.error("Error parsing address", e);
    }

    const totalPrice = Number(transaction.total_price);
    const shippingCost = Number(transaction.shipping_cost);
    const grandTotal = totalPrice + shippingCost;

    // 4. Helper Status Badge
    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold border border-yellow-200">
                        <Clock className="w-3.5 h-3.5" />
                        MENUNGGU PEMBAYARAN
                    </div>
                );
            case "paid":
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        LUNAS
                    </div>
                );
            default:
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold border border-gray-200">
                        <XCircle className="w-3.5 h-3.5" />
                        {status.toUpperCase()}
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen pb-20 font-sans bg-gray-50/50">
            <Head title={`Invoice #${transaction.invoice_code}`} />
            <Navbar />

            <div className="max-w-5xl px-4 py-10 mx-auto sm:px-6 lg:px-8">
                <Link
                    href={route("transactions.index")} // Pastikan route ini benar (transactions.index / my.orders)
                    className="inline-flex items-center mt-5 mb-6 text-sm font-medium text-gray-500 transition-colors hover:text-primary"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Riwayat
                </Link>

                <div className="overflow-hidden bg-white border border-gray-100 shadow-xl rounded-2xl shadow-gray-200/50">
                    {/* --- HEADER INVOICE --- */}
                    <div className="flex flex-col justify-between gap-4 p-6 border-b border-gray-100 md:p-8 md:flex-row md:items-center">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-orange-50 rounded-xl">
                                <Receipt className="w-8 h-8 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Invoice
                                </h1>
                                <p className="mt-1 font-mono text-sm text-gray-500">
                                    #{transaction.invoice_code}
                                </p>
                            </div>
                        </div>
                        <div>{getStatusBadge(transaction.payment_status)}</div>
                    </div>

                    <div className="grid divide-y divide-gray-100 md:grid-cols-3 md:divide-y-0 md:divide-x">
                        {/* --- KOLOM KIRI (Info Pengiriman & Barang) --- */}
                        <div className="p-6 space-y-8 md:col-span-2 md:p-8">
                            {/* Section Alamat */}
                            <div>
                                <h3 className="flex items-center gap-2 mb-4 font-semibold text-gray-900">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    Informasi Pengiriman
                                </h3>
                                <div className="p-5 border border-gray-100 bg-gray-50 rounded-xl">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
                                        <p className="text-lg font-bold text-gray-900">
                                            {shippingAddress.recipient_name ||
                                                transaction.user?.name}
                                        </p>
                                        <p className="text-sm font-medium text-gray-500">
                                            {shippingAddress.phone_number ||
                                                transaction.user?.phone}
                                        </p>
                                    </div>
                                    <div className="mt-3 text-sm leading-relaxed text-gray-600">
                                        {shippingAddress.address_line ||
                                            "Alamat tidak ditemukan"}
                                        <br />
                                        {shippingAddress.city},{" "}
                                        {shippingAddress.postal_code}
                                    </div>
                                </div>
                            </div>

                            {/* Section Barang */}
                            <div>
                                <h3 className="flex items-center gap-2 mb-4 font-semibold text-gray-900">
                                    <ShoppingBag className="w-4 h-4 text-gray-400" />
                                    Rincian Barang
                                </h3>
                                <div className="space-y-4">
                                    {transaction.details.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-start gap-4 py-3 border-b border-gray-50 last:border-0"
                                        >
                                            <div className="flex-shrink-0 w-16 h-16 overflow-hidden bg-gray-100 border border-gray-200 rounded-lg">
                                                {item.product?.image ? (
                                                    <img
                                                        src={`/storage/${item.product.image}`}
                                                        alt={item.product.name}
                                                        className="object-cover w-full h-full"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center w-full h-full text-gray-400">
                                                        <ShoppingBag className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 line-clamp-2">
                                                    {item.product?.name ||
                                                        "Produk Dihapus"}
                                                </p>
                                                <p className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                                    <Store className="w-3 h-3" />
                                                    {transaction.store?.name ||
                                                        "Toko"}
                                                </p>
                                                <div className="mt-1 text-sm font-medium sm:hidden text-primary">
                                                    {formatRupiah(
                                                        item.price_at_transaction
                                                    )}{" "}
                                                    x {item.qty}
                                                </div>
                                            </div>
                                            <div className="hidden text-right sm:block">
                                                <p className="font-medium text-gray-900">
                                                    {formatRupiah(
                                                        item.qty *
                                                            item.price_at_transaction
                                                    )}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {item.qty} x{" "}
                                                    {formatRupiah(
                                                        item.price_at_transaction
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* --- KOLOM KANAN (Ringkasan Pembayaran) --- */}
                        <div className="p-6 md:p-8 bg-gray-50/30">
                            <h3 className="flex items-center gap-2 mb-6 font-semibold text-gray-900">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                Ringkasan Biaya
                            </h3>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                        Total Harga (
                                        {transaction.details.length} barang)
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {formatRupiah(totalPrice)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                        Ongkos Kirim
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {formatRupiah(shippingCost)}
                                    </span>
                                </div>

                                <div className="my-4 border-t border-gray-300 border-dashed"></div>

                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-gray-900">
                                        Total Tagihan
                                    </span>
                                    <span className="text-2xl font-bold text-primary">
                                        {formatRupiah(grandTotal)}
                                    </span>
                                </div>
                            </div>

                            {/* --- LOGIC PEMBAYARAN (MIDTRANS vs MANUAL) --- */}
                            {transaction.payment_status === "pending" && (
                                <div className="mt-8">
                                    {/* KASUS 1: MIDTRANS (Ada Token) */}
                                    {transaction.snap_token ? (
                                        <>
                                            <Button
                                                onClick={handlePayment}
                                                disabled={isPayLoading}
                                                className={`w-full h-12 text-lg font-bold !bg-orange-600 hover:!bg-orange-700 text-white shadow-lg shadow-orange-200 transition-all transform hover:-translate-y-0.5 ${
                                                    isPayLoading
                                                        ? "opacity-70 cursor-not-allowed"
                                                        : ""
                                                }`}
                                            >
                                                <CreditCard className="w-5 h-5 mr-2" />
                                                {isPayLoading
                                                    ? "Menghubungkan..."
                                                    : "Bayar Sekarang"}
                                            </Button>
                                            <p className="mt-3 text-xs text-center text-gray-400">
                                                Transaksi aman dilindungi oleh
                                                Midtrans
                                            </p>
                                        </>
                                    ) : (
                                        /* KASUS 2: MANUAL TRANSFER (Tidak Ada Token) */
                                        <div className="duration-500 animate-in fade-in slide-in-from-bottom-2">
                                            <div className="p-5 mb-4 border border-blue-200 bg-blue-50 rounded-xl">
                                                <h4 className="flex items-center gap-2 mb-2 text-sm font-bold text-blue-800">
                                                    <Store className="w-4 h-4" />
                                                    Instruksi Pembayaran Manual
                                                </h4>

                                                {/* DATA REKENING DARI DATABASE SELLER */}
                                                <div className="p-3 mb-4 bg-white border border-blue-100 rounded">
                                                    <p className="mb-1 text-xs text-gray-500">
                                                        Silakan transfer ke:
                                                    </p>
                                                    {transaction.store
                                                        ?.bank_account ? (
                                                        <div>
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="font-bold text-gray-800 uppercase">
                                                                    {transaction
                                                                        .store
                                                                        .bank_name ||
                                                                        "Bank"}
                                                                </span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 px-2 text-xs text-blue-600"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(
                                                                            transaction
                                                                                .store
                                                                                .bank_account
                                                                        );
                                                                        Swal.fire(
                                                                            {
                                                                                toast: true,
                                                                                position:
                                                                                    "top-end",
                                                                                icon: "success",
                                                                                title: "No. Rekening disalin",
                                                                                showConfirmButton: false,
                                                                                timer: 1500,
                                                                            }
                                                                        );
                                                                    }}
                                                                >
                                                                    <Copy className="w-3 h-3 mr-1" />{" "}
                                                                    Salin
                                                                </Button>
                                                            </div>
                                                            <p className="font-mono text-lg font-bold tracking-wider text-gray-900">
                                                                {
                                                                    transaction
                                                                        .store
                                                                        .bank_account
                                                                }
                                                            </p>
                                                            <p className="mt-1 text-xs text-gray-500">
                                                                a.n{" "}
                                                                {
                                                                    transaction
                                                                        .store
                                                                        .name
                                                                }
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs italic text-red-500">
                                                            Penjual belum
                                                            mencantumkan info
                                                            rekening. Harap
                                                            hubungi via
                                                            WhatsApp.
                                                        </p>
                                                    )}
                                                </div>

                                                <p className="mb-4 text-xs leading-relaxed text-blue-700">
                                                    Setelah transfer, kirim
                                                    bukti pembayaran ke WhatsApp
                                                    penjual agar pesanan
                                                    diproses.
                                                </p>

                                                {/* TOMBOL KONFIRMASI WA */}
                                                <a
                                                    href={`https://wa.me/62${(
                                                        transaction.store
                                                            ?.phone_number || ""
                                                    ).replace(
                                                        /^0/,
                                                        ""
                                                    )}?text=Halo kak, saya mau konfirmasi pesanan *#${
                                                        transaction.invoice_code
                                                    }* sebesar *${formatRupiah(
                                                        grandTotal
                                                    )}*. %0A%0ATujuan Transfer: ${
                                                        transaction.store
                                                            ?.bank_name ||
                                                        "Bank"
                                                    } - ${
                                                        transaction.store
                                                            ?.bank_account || ""
                                                    }. %0A%0AMohon dicek ya!`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <Button className="w-full h-10 font-bold text-white bg-green-600 shadow-sm hover:bg-green-700">
                                                        <Receipt className="w-4 h-4 mr-2" />
                                                        Konfirmasi via WhatsApp
                                                    </Button>
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {transaction.payment_status === "paid" && (
                                <div className="p-4 mt-8 text-center border border-green-100 bg-green-50 rounded-xl">
                                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
                                    <p className="font-bold text-green-800">
                                        Pembayaran Lunas
                                    </p>
                                    <p className="mt-1 text-xs text-green-600">
                                        Terima kasih sudah berbelanja!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
