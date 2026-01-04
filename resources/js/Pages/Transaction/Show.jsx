import { Head, Link } from "@inertiajs/react";
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
} from "lucide-react";
import { useEffect } from "react";

export default function TransactionShow({ transaction, clientKey }) {
    // 1. Script Midtrans
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute("data-client-key", clientKey);
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, [clientKey]);

    // 2. Handle Payment
    const handlePayment = () => {
        if (window.snap) {
            window.snap.pay(transaction.snap_token, {
                onSuccess: function (result) {
                    alert("Pembayaran Berhasil!");
                    window.location.reload();
                },
                onPending: function (result) {
                    alert("Menunggu Pembayaran...");
                },
                onError: function (result) {
                    alert("Pembayaran Gagal!");
                },
                onClose: function () {
                    alert("Kamu menutup popup tanpa menyelesaikan pembayaran");
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

    const shippingAddress = JSON.parse(transaction.shipping_address_snapshot);
    const totalPrice = Number(transaction.total_price);
    const shippingCost = Number(transaction.shipping_cost);
    const grandTotal = totalPrice + shippingCost;

    // 4. Helper untuk Status Badge (Biar JSX bersih)
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
        <div className="min-h-screen bg-gray-50/50 font-sans pb-20">
            <Head title={`Invoice #${transaction.invoice_code}`} />
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Tombol Kembali */}
                <Link
                    href="/"
                    className="inline-flex mt-5 items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Beranda
                </Link>

                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    {/* --- HEADER INVOICE --- */}
                    <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-orange-50 rounded-xl">
                                <Receipt className="w-8 h-8 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Invoice
                                </h1>
                                <p className="text-gray-500 text-sm font-mono mt-1">
                                    #{transaction.invoice_code}
                                </p>
                            </div>
                        </div>
                        {/* Status Badge */}
                        <div>{getStatusBadge(transaction.payment_status)}</div>
                    </div>

                    <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                        {/* --- KOLOM KIRI (Info Pengiriman & Barang) --- */}
                        <div className="md:col-span-2 p-6 md:p-8 space-y-8">
                            {/* Section Alamat */}
                            <div>
                                <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    Informasi Pengiriman
                                </h3>
                                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                        <p className="font-bold text-gray-900 text-lg">
                                            {shippingAddress.recipient_name}
                                        </p>
                                        <p className="text-sm font-medium text-gray-500">
                                            {shippingAddress.phone_number}
                                        </p>
                                    </div>
                                    <div className="mt-3 text-gray-600 text-sm leading-relaxed">
                                        {shippingAddress.address_line}
                                        <br />
                                        {shippingAddress.city},{" "}
                                        {shippingAddress.postal_code}
                                    </div>
                                </div>
                            </div>

                            {/* Section Barang */}
                            <div>
                                <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4 text-gray-400" />
                                    Rincian Barang
                                </h3>
                                <div className="space-y-4">
                                    {transaction.details.map((item) => {
                                        const itemPrice = Number(
                                            item.price_at_transaction
                                        );
                                        return (
                                            <div
                                                key={item.id}
                                                className="flex gap-4 items-start py-3 border-b border-gray-50 last:border-0"
                                            >
                                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                                    <img
                                                        src={`/storage/${item.product.image}`}
                                                        alt={item.product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900 line-clamp-2">
                                                        {item.product.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                        <Store className="w-3 h-3" />
                                                        {transaction.store
                                                            ?.name || "Toko"}
                                                    </p>
                                                    <div className="mt-1 sm:hidden font-medium text-primary text-sm">
                                                        {formatRupiah(
                                                            itemPrice
                                                        )}{" "}
                                                        x {item.qty}
                                                    </div>
                                                </div>
                                                <div className="text-right hidden sm:block">
                                                    <p className="font-medium text-gray-900">
                                                        {formatRupiah(
                                                            item.qty * itemPrice
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {item.qty} x{" "}
                                                        {formatRupiah(
                                                            itemPrice
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* --- KOLOM KANAN (Ringkasan Pembayaran) --- */}
                        <div className="p-6 md:p-8 bg-gray-50/30">
                            <h3 className="text-gray-900 font-semibold mb-6 flex items-center gap-2">
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

                                <div className="border-t border-dashed border-gray-300 my-4"></div>

                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-900">
                                        Total Tagihan
                                    </span>
                                    <span className="font-bold text-2xl text-primary">
                                        {formatRupiah(grandTotal)}
                                    </span>
                                </div>
                            </div>

                            {/* Tombol Bayar */}
                            {transaction.payment_status === "pending" && (
                                <div className="mt-8">
                                    <Button
                                        onClick={handlePayment}
                                        // Ganti className ini (Perhatikan tanda seru '!' di depan bg)
                                        className="w-full h-12 text-lg font-bold !bg-orange-600 hover:!bg-orange-700 text-white shadow-lg shadow-orange-200 transition-all transform hover:-translate-y-0.5"
                                    >
                                        <CreditCard className="w-5 h-5 mr-2" />
                                        Bayar Sekarang
                                    </Button>
                                    <p className="text-xs text-center text-gray-400 mt-3">
                                        Transaksi aman dilindungi oleh Midtrans
                                    </p>
                                </div>
                            )}

                            {transaction.payment_status === "paid" && (
                                <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                                    <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                    <p className="font-bold text-green-800">
                                        Pembayaran Lunas
                                    </p>
                                    <p className="text-xs text-green-600 mt-1">
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
