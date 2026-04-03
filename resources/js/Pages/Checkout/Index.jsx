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
import {
    fetchProvinces,
    fetchCities,
    fetchDistricts,
    calculateShippingCost,
} from "@/services/rajaongkir";

export default function CheckoutIndex({ store, midtransClientKey }) {
    const [cartItems, setCartItems] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [shippingCosts, setShippingCosts] = useState([]);

    // State Loading
    const [isLoadingProvinces, setIsLoadingProvinces] = useState(false); // <-- TAMBAHAN: Buat loading provinsi
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
    const [isLoadingCost, setIsLoadingCost] = useState(false);

    const [formData, setFormData] = useState({
        recipient_name: "",
        phone_number: "",
        address_line: "",
        postal_code: "",
        province_id: "",
        city_id: "",
        district_id: "",
        courier: "",
    });

    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);

    const [ongkir, setOngkir] = useState(0);

    const totalWeight = useMemo(() => {
        // qty (jumlah barang) dikali weight (berat per barang dari database)
        // Kalau berat kosong di DB (misal barang lama), kasih default 1000 gram.
        return cartItems.reduce((acc, item) => {
            const itemWeight = item.product.weight || 1000;
            return acc + item.qty * itemWeight;
        }, 0);
    }, [cartItems]);

    const isFormComplete = useMemo(() => {
        return (
            Object.values(formData).every(
                (value) => String(value).trim() !== "",
            ) && ongkir > 0
        );
    }, [formData, ongkir]);

    // --- 1. LAZY LOAD PROVINSI (Hanya hit API jika dropdown diklik & data masih kosong) ---
    const handleProvinceFocus = async () => {
        if (provinces.length === 0 && !isLoadingProvinces) {
            setIsLoadingProvinces(true);
            try {
                const data = await fetchProvinces();
                setProvinces(data);
            } catch (error) {
                console.error("Gagal load provinsi.");
            } finally {
                setIsLoadingProvinces(false);
            }
        }
    };

    // --- 2. EFFECT: AMBIL DATA KOTA JIKA PROVINSI BERUBAH ---
    useEffect(() => {
        if (formData.province_id) {
            setIsLoadingCities(true);
            setFormData((prev) => ({
                ...prev,
                city_id: "",
                district_id: "",
                courier: "",
            }));
            setShippingCosts([]);
            setOngkir(0);

            fetchCities(formData.province_id)
                .then((data) => {
                    setCities(data);
                    setIsLoadingCities(false);
                })
                .catch(() => setIsLoadingCities(false));
        } else {
            setCities([]);
        }
    }, [formData.province_id]);

    // --- 3. EFFECT: AMBIL KECAMATAN JIKA KOTA BERUBAH ---
    useEffect(() => {
        if (formData.city_id) {
            setIsLoadingDistricts(true);
            setFormData((prev) => ({ ...prev, district_id: "", courier: "" }));
            setShippingCosts([]);
            setOngkir(0);

            fetchDistricts(formData.city_id)
                .then((data) => {
                    setDistricts(data);
                    setIsLoadingDistricts(false);
                })
                .catch(() => setIsLoadingDistricts(false));
        } else {
            setDistricts([]);
        }
    }, [formData.city_id]);

    // --- 4. EFFECT: CEK ONGKIR ---
    useEffect(() => {
        if (formData.district_id && formData.courier) {
            setIsLoadingCost(true);
            setShippingCosts([]);
            setOngkir(0);

            calculateShippingCost({
                destination: formData.district_id,
                weight: totalWeight,
                courier: formData.courier,
            }).then((data) => {
                setShippingCosts(data);
                setIsLoadingCost(false);
                if (data && data.length > 0) setOngkir(data[0].cost);
            });
        }
    }, [formData.district_id, formData.courier, totalWeight]);

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
                shipping_cost: ongkir,
                items: itemsPayload,
            });

            if (response.data.success) {
                const finalInvoiceCode = response.data.invoice_code;

                const savedOrders = JSON.parse(
                    localStorage.getItem("guest_orders") || "[]",
                );
                const newOrders = [
                    finalInvoiceCode,
                    ...savedOrders.filter((inv) => inv !== finalInvoiceCode),
                ].slice(0, 5);
                localStorage.setItem("guest_orders", JSON.stringify(newOrders));

                if (response.data.is_midtrans && response.data.snap_token) {
                    window.snap.pay(response.data.snap_token, {
                        onSuccess: function (result) {
                            window.onbeforeunload = null;
                            clearPurchasedItems();
                            window.location.href = `/order/${finalInvoiceCode}`;
                        },
                        onPending: function (result) {
                            window.onbeforeunload = null;
                            clearPurchasedItems();
                            window.location.href = `/order/${finalInvoiceCode}`;
                        },
                        onError: function (result) {
                            window.onbeforeunload = null;
                            clearPurchasedItems();
                            window.location.href = `/order/${finalInvoiceCode}`;
                        },
                        onClose: function () {
                            window.onbeforeunload = null;
                            clearPurchasedItems();
                            window.location.href = `/order/${finalInvoiceCode}`;
                        },
                    });
                } else {
                    clearPurchasedItems();
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

    const grandTotal = totalBarang + ongkir;

    if (cartItems.length === 0)
        return <div className="p-10 text-center">Memuat...</div>;

    const isMidtrans = store?.checkout_mode === "midtrans";

    return (
        <div className="min-h-screen font-sans bg-gray-50">
            <Head title="Checkout" />
            <Navbar />

            <div className="px-4 py-8 mx-auto max-w-7xl">
                <h1 className="flex items-center gap-2 mb-6 text-2xl font-bold">
                    <Truck className="text-orange-600" /> Pengiriman &
                    Pembayaran
                </h1>

                <div className="flex flex-col gap-8 lg:flex-row">
                    <div className="flex-1 space-y-6">
                        <div className="p-6 bg-white border shadow-sm rounded-xl">
                            <h2 className="flex items-center gap-2 mb-4 font-semibold">
                                <MapPin size={18} /> Alamat Pengiriman
                            </h2>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">
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
                                    <label className="text-xs font-bold text-gray-500 uppercase">
                                        No. WhatsApp
                                    </label>
                                    <Input
                                        id="phone_number"
                                        onChange={handleChange}
                                        placeholder="0812xxxx"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">
                                        Kode Pos
                                    </label>
                                    <Input
                                        id="postal_code"
                                        onChange={handleChange}
                                        placeholder="12345"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">
                                        Alamat Lengkap (Jalan, RT/RW, Patokan)
                                    </label>
                                    <Input
                                        id="address_line"
                                        onChange={handleChange}
                                        placeholder="Nama Jalan, Blok, No Rumah"
                                    />
                                </div>

                                {/* --- DROPDOWN PROVINSI (LAZY LOAD) --- */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">
                                        Provinsi Tujuan
                                    </label>
                                    <select
                                        id="province_id"
                                        value={formData.province_id}
                                        onChange={handleChange}
                                        onFocus={handleProvinceFocus} // Trigger fetch API saat dropdown diklik
                                        className="w-full px-3 py-2 mt-1 text-sm bg-white border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        <option value="">
                                            {isLoadingProvinces
                                                ? "Memuat Provinsi..."
                                                : "-- Pilih Provinsi --"}
                                        </option>
                                        {provinces.map((prov) => (
                                            <option
                                                key={prov.id}
                                                value={prov.id}
                                            >
                                                {prov.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* --- DROPDOWN KOTA --- */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">
                                        Kota/Kabupaten
                                    </label>
                                    <select
                                        id="city_id"
                                        value={formData.city_id}
                                        onChange={handleChange}
                                        disabled={
                                            !formData.province_id ||
                                            isLoadingCities
                                        }
                                        className={`w-full px-3 py-2 mt-1 text-sm border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 ${
                                            !formData.province_id
                                                ? "bg-gray-100 cursor-not-allowed text-gray-400"
                                                : "bg-white"
                                        }`}
                                    >
                                        <option value="">
                                            {isLoadingCities
                                                ? "Memuat Kota..."
                                                : "-- Pilih Kota --"}
                                        </option>
                                        {cities.map((city) => (
                                            <option
                                                key={city.id}
                                                value={city.id}
                                            >
                                                {city.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* --- DROPDOWN KECAMATAN --- */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">
                                        Kecamatan
                                    </label>
                                    <select
                                        id="district_id"
                                        value={formData.district_id}
                                        onChange={handleChange}
                                        disabled={
                                            !formData.city_id ||
                                            isLoadingDistricts
                                        }
                                        className={`w-full px-3 py-2 mt-1 text-sm border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 ${
                                            !formData.city_id
                                                ? "bg-gray-100 cursor-not-allowed text-gray-400"
                                                : "bg-white"
                                        }`}
                                    >
                                        <option value="">
                                            {isLoadingDistricts
                                                ? "Memuat Kecamatan..."
                                                : "-- Pilih Kecamatan --"}
                                        </option>
                                        {districts.map((district) => (
                                            <option
                                                key={district.id}
                                                value={district.id}
                                            >
                                                {district.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* --- PILIHAN KURIR (Warna diperbaiki) --- */}
                                <div className="mt-2 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">
                                        Pilih Kurir Pengiriman
                                    </label>
                                    <select
                                        id="courier"
                                        value={formData.courier}
                                        onChange={handleChange}
                                        disabled={!formData.district_id}
                                        className={`w-full px-3 py-2 mt-1 text-sm border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                                            !formData.district_id
                                                ? "bg-gray-100 cursor-not-allowed text-gray-400"
                                                : "bg-white text-gray-900 shadow-sm border-orange-200"
                                        }`}
                                    >
                                        <option value="">
                                            -- Pilih Ekspedisi --
                                        </option>
                                        <option value="jne">
                                            JNE (Jalur Nugraha Ekakurir)
                                        </option>
                                        <option value="jnt">J&T Express</option>
                                        <option value="sicepat">
                                            SiCepat Ekspres
                                        </option>
                                        <option value="anteraja">
                                            AnterAja
                                        </option>
                                        <option value="pos">
                                            POS Indonesia
                                        </option>
                                        <option value="tiki">
                                            TIKI (Titipan Kilat)
                                        </option>
                                        <option value="ninja">
                                            Ninja Xpress
                                        </option>
                                        <option value="wahana">
                                            Wahana Prestasi Logistik
                                        </option>
                                    </select>
                                </div>

                                {/* --- TAMPILAN LOADING ONGKIR --- */}
                                {isLoadingCost && (
                                    <div className="flex items-center justify-center gap-2 py-4 text-sm font-medium text-center text-orange-600 border border-orange-100 rounded-lg md:col-span-2 bg-orange-50">
                                        <Loader2 className="w-4 h-4 animate-spin" />{" "}
                                        Menghitung ongkos kirim...
                                    </div>
                                )}

                                {/* --- LIST PILIHAN LAYANAN ONGKIR --- */}
                                {!isLoadingCost &&
                                    shippingCosts.length > 0 &&
                                    formData.courier && (
                                        <div className="mt-2 space-y-2 md:col-span-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">
                                                Pilih Layanan / Paket
                                            </label>
                                            {shippingCosts.map(
                                                (service, index) => (
                                                    <div
                                                        key={index}
                                                        onClick={() =>
                                                            setOngkir(
                                                                service.cost,
                                                            )
                                                        }
                                                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                                            ongkir ===
                                                            service.cost
                                                                ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500"
                                                                : "border-gray-200 hover:border-orange-300 bg-white"
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h4 className="font-bold text-gray-900 uppercase">
                                                                    {
                                                                        service.name
                                                                    }{" "}
                                                                    -{" "}
                                                                    {
                                                                        service.service
                                                                    }
                                                                </h4>
                                                                <p className="mt-1 text-xs text-gray-500">
                                                                    Estimasi
                                                                    sampai:{" "}
                                                                    {
                                                                        service.etd
                                                                    }{" "}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="font-bold text-orange-600">
                                                                    {formatRupiah(
                                                                        service.cost,
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    )}
                            </div>
                        </div>

                        {/* Ringkasan Item */}
                        <div className="p-6 bg-white border rounded-xl">
                            <h2 className="mb-4 font-semibold text-gray-400">
                                Barang yang dibeli
                            </h2>
                            {cartItems.map((item) => (
                                <div className="w-full">
                                    <div
                                        key={item.id}
                                        className="flex justify-between py-2"
                                    >
                                        <span className="text-sm">Berat</span>
                                        <span className="font-medium">
                                            {`${item.product.weight || 1000} gram`}
                                        </span>
                                    </div>
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
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:w-1/3">
                        <div className="sticky p-6 bg-white border shadow-md rounded-xl top-24">
                            <h3 className="mb-4 text-lg font-bold">
                                Total Pembayaran
                            </h3>
                            <div className="mb-4 space-y-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>{formatRupiah(totalBarang)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Ongkos Kirim</span>
                                    <span>
                                        {ongkir > 0
                                            ? formatRupiah(ongkir)
                                            : "-"}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-2 text-xl font-bold text-orange-600 border-t">
                                    <span>Total</span>
                                    <span>{formatRupiah(grandTotal)}</span>
                                </div>
                            </div>

                            {/* ALERT JIKA FORM BELUM LENGKAP */}
                            {!isFormComplete && (
                                <div className="flex items-center gap-2 p-3 mb-4 text-xs font-medium border rounded-lg text-amber-600 bg-amber-50 border-amber-200">
                                    <AlertCircle
                                        size={14}
                                        className="shrink-0"
                                    />{" "}
                                    Lengkapi data pengiriman dan pilih kurir
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
