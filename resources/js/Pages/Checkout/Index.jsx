import { Head, router } from "@inertiajs/react";
import Navbar from "@/Components/Navbar";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
    MapPin,
    Truck,
    Loader2,
    CreditCard,
    Send,
    AlertCircle,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";

export default function CheckoutIndex({ store, midtransClientKey }) {
    const [cartItems, setCartItems] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [formData, setFormData] = useState({
        recipient_name: "",
        phone_number: "",
        address_line: "",
        city: "",
        postal_code: "",
    });
    const [errors, setErrors] = useState({});

    // 1. Validasi apakah form sudah terisi semua (untuk disable button)
    const isFormComplete = useMemo(() => {
        return Object.values(formData).every((value) => value.trim() !== "");
    }, [formData]);

    useEffect(() => {
        if (store?.checkout_mode === "midtrans") {
            const script = document.createElement("script");
            script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
            script.setAttribute("data-client-key", midtransClientKey);
            document.body.appendChild(script);
        }
    }, [store, midtransClientKey]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const selectedIds = params.getAll("ids[]");
        const storedCart = localStorage.getItem("guest_cart");
        if (storedCart) {
            const parsedCart = JSON.parse(storedCart);
            if (selectedIds.length > 0) {
                const itemsToCheckout = parsedCart.items.filter((item) =>
                    selectedIds.includes(item.id),
                );
                setCartItems(itemsToCheckout);
            } else {
                setCartItems(parsedCart.items);
            }
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        setErrors({ ...errors, [e.target.id]: null });
    };

    const clearPurchasedItems = () => {
        const storedCart = JSON.parse(localStorage.getItem("guest_cart"));
        const remainingItems = storedCart.items.filter(
            (storedItem) => !cartItems.find((c) => c.id === storedItem.id),
        );
        localStorage.setItem(
            "guest_cart",
            JSON.stringify({
                items: remainingItems,
                count: remainingItems.reduce((acc, item) => acc + item.qty, 0),
            }),
        );
        window.dispatchEvent(new Event("guest-cart-updated"));
    };

    const handleCheckout = async () => {
        if (!isFormComplete) return;

        setProcessing(true);
        setErrors({});

        const itemsPayload = cartItems.map((item) => ({
            id: item.product.id,
            qty: item.qty,
        }));

        try {
            const response = await axios.post(route("checkout.store"), {
                ...formData,
                items: itemsPayload,
            });

            if (response.data.success) {
                // Simpan invoice code ke dalam variabel konstanta biar nggak hilang
                const finalInvoiceCode = response.data.invoice_code;

                // --- SIMPAN KE RIWAYAT LOKAL ---
                const savedOrders = JSON.parse(
                    localStorage.getItem("guest_orders") || "[]",
                );
                // Masukin invoice baru ke urutan paling atas, maksimal simpan 5 pesanan terakhir
                const newOrders = [
                    finalInvoiceCode,
                    ...savedOrders.filter((inv) => inv !== finalInvoiceCode),
                ].slice(0, 5);
                localStorage.setItem("guest_orders", JSON.stringify(newOrders));

                if (response.data.is_midtrans && response.data.snap_token) {
                    window.snap.pay(response.data.snap_token, {
                        onSuccess: function (result) {
                            window.onbeforeunload = null;
                            clearPurchasedItems(); // Hapus keranjang karena udah dibeli
                            // Pake window.location.href biar redirect-nya hard-reload (lebih aman)
                            window.location.href = `/order/${finalInvoiceCode}`;
                        },
                        onPending: function (result) {
                            window.onbeforeunload = null;
                            clearPurchasedItems(); // Hapus keranjang
                            window.location.href = `/order/${finalInvoiceCode}`;
                        },
                        onError: function (result) {
                            window.onbeforeunload = null;
                            // Walaupun error bayar, pesanannya KAN UDAH MASUK DATABASE.
                            // Jadi keranjangnya tetep harus dihapus biar gak dibeli 2x.
                            clearPurchasedItems();
                            window.location.href = `/order/${finalInvoiceCode}`;
                        },
                        onClose: function () {
                            window.onbeforeunload = null;
                            // Sama, tutup popup = pesanan udah dibikin. Kosongkan keranjang.
                            clearPurchasedItems();
                            window.location.href = `/order/${finalInvoiceCode}`;
                        },
                    });
                } else {
                    // --- LOGIC MANUAL / WHATSAPP ---
                    clearPurchasedItems();
                    // Pake window.location.href juga biar konsisten
                    window.location.href = `/order/${finalInvoiceCode}`;
                }
            }
        } catch (error) {
            setProcessing(false);
            if (error.response?.status === 422) {
                setErrors(
                    error.response.data.errors || {
                        general: error.response.data.message,
                    },
                );
            } else {
                alert("Terjadi kesalahan sistem. Silakan coba lagi.");
            }
        }
    };

    const formatRupiah = (n) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(n);

    const totalBarang = cartItems.reduce(
        (acc, item) => acc + item.product.price * item.qty,
        0,
    );
    const ongkir = 15000;
    const grandTotal = totalBarang + ongkir;

    if (cartItems.length === 0)
        return <div className="p-10 text-center">Memuat...</div>;

    const isMidtrans = store?.checkout_mode === "midtrans";

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head title="Checkout" />
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Truck className="text-orange-600" /> Pengiriman &
                    Pembayaran
                </h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-6">
                        <div className="bg-white p-6 rounded-xl border shadow-sm">
                            <h2 className="font-semibold mb-4 flex items-center gap-2">
                                <MapPin size={18} /> Alamat Pengiriman
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold uppercase text-gray-500">
                                        Nama Lengkap
                                    </label>
                                    <Input
                                        id="recipient_name"
                                        onChange={handleChange}
                                        placeholder="Contoh: Budi Santoso"
                                        className={
                                            errors.recipient_name &&
                                            "border-red-500"
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-500">
                                        No. WhatsApp
                                    </label>
                                    <Input
                                        id="phone_number"
                                        onChange={handleChange}
                                        placeholder="0812xxxx"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-500">
                                        Kota
                                    </label>
                                    <Input
                                        id="city"
                                        onChange={handleChange}
                                        placeholder="Nama Kota"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold uppercase text-gray-500">
                                        Alamat Lengkap
                                    </label>
                                    <Input
                                        id="address_line"
                                        onChange={handleChange}
                                        placeholder="Nama Jalan, Blok, No Rumah"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-500">
                                        Kode Pos
                                    </label>
                                    <Input
                                        id="postal_code"
                                        onChange={handleChange}
                                        placeholder="12345"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Ringkasan Item */}
                        <div className="bg-white p-6 rounded-xl border">
                            <h2 className="font-semibold mb-4 text-gray-400">
                                Barang yang dibeli
                            </h2>
                            {cartItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex justify-between py-2 border-b last:border-0"
                                >
                                    <span className="text-sm">
                                        {item.product.name} (x{item.qty})
                                    </span>
                                    <span className="font-medium">
                                        {formatRupiah(
                                            item.product.price * item.qty,
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:w-1/3">
                        <div className="bg-white p-6 rounded-xl border shadow-md sticky top-24">
                            <h3 className="font-bold text-lg mb-4">
                                Total Pembayaran
                            </h3>
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>{formatRupiah(totalBarang)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Ongkos Kirim</span>
                                    <span>{formatRupiah(ongkir)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-xl pt-2 border-t text-orange-600">
                                    <span>Total</span>
                                    <span>{formatRupiah(grandTotal)}</span>
                                </div>
                            </div>

                            {/* ALERT JIKA FORM BELUM LENGKAP */}
                            {!isFormComplete && (
                                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg mb-4 text-xs font-medium border border-amber-200">
                                    <AlertCircle size={14} /> Lengkapi data
                                    pengiriman untuk melanjutkan
                                </div>
                            )}

                            <Button
                                className={`w-full h-14 text-lg font-bold ${isMidtrans ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}
                                disabled={processing || !isFormComplete}
                                onClick={handleCheckout}
                            >
                                {processing ? (
                                    <Loader2 className="animate-spin" />
                                ) : isMidtrans ? (
                                    <>
                                        <CreditCard className="mr-2" /> Bayar
                                        Sekarang
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2" /> Pesan via WA
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
