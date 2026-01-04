import { Head, useForm, router } from "@inertiajs/react";
import Navbar from "@/Components/Navbar";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
    MapPin,
    Truck,
    Plus,
    CheckCircle,
    Store,
    Trash2,
    AlertTriangle,
    Loader2,
} from "lucide-react"; // Tambah Icon
import { useState } from "react";

export default function CheckoutIndex({ carts, addresses, user }) {
    // --- STATE UTAMA ---
    const [isAddingAddress, setIsAddingAddress] = useState(false);

    // Default pilih alamat primary atau yg pertama
    const defaultAddress =
        addresses.find((addr) => addr.is_primary) || addresses[0] || null;
    const [selectedAddress, setSelectedAddress] = useState(defaultAddress);

    // --- STATE MODAL HAPUS ---
    const [addressToDelete, setAddressToDelete] = useState(null); // Data alamat yg mau dihapus
    const [isDeleting, setIsDeleting] = useState(false); // Loading state saat hapus

    // Form Tambah Alamat
    const { data, setData, post, processing, errors, reset } = useForm({
        recipient_name: user.name,
        phone_number: "",
        address_line: "",
        city: "",
        postal_code: "",
    });

    // --- LOGIC TAMBAH ALAMAT ---
    const handleSaveAddress = (e) => {
        e.preventDefault();
        post(route("checkout.address.store"), {
            onSuccess: () => {
                setIsAddingAddress(false);
                reset();
                // Opsional: window.location.reload();
            },
        });
    };

    // --- LOGIC HAPUS ALAMAT (MODAL STYLE) ---

    // 1. Buka Modal
    const openDeleteModal = (addr) => {
        setAddressToDelete(addr);
    };

    // 2. Eksekusi Hapus
    const confirmDeleteAddress = () => {
        if (!addressToDelete) return;

        setIsDeleting(true); // Mulai Loading

        router.delete(route("checkout.address.destroy", addressToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                // Kalau alamat yg dihapus itu yg lagi dipilih, reset selection
                if (selectedAddress?.id === addressToDelete.id) {
                    setSelectedAddress(null);
                }
            },
            onFinish: () => {
                setIsDeleting(false); // Stop Loading
                setAddressToDelete(null); // Tutup Modal
            },
        });
    };

    // Hitung-hitungan Duit
    const totalBarang = carts.reduce(
        (acc, item) => acc + item.product.price * item.qty,
        0
    );
    const ongkir = 15000;
    const grandTotal = totalBarang + ongkir;

    const formatRupiah = (n) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(n);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head title="Checkout Pengiriman" />
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Truck className="w-6 h-6 text-orange-600" />
                    Pengiriman & Pembayaran
                </h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* --- KOLOM KIRI --- */}
                    <div className="flex-1 space-y-6">
                        {/* 1. BAGIAN ALAMAT */}
                        <div className="bg-white p-6 rounded-xl border shadow-sm">
                            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-gray-500" />{" "}
                                Alamat Pengiriman
                            </h2>

                            {/* LIST ALAMAT (DENGAN JARAK/GAP YANG BENAR) */}
                            {addresses.length > 0 && !isAddingAddress && (
                                // FIX: Pakai 'flex flex-col gap-4' biar ada jarak antar kartu
                                <div className="flex flex-col gap-4 mb-4">
                                    {addresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            onClick={() =>
                                                setSelectedAddress(addr)
                                            }
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all relative group ${
                                                selectedAddress?.id === addr.id
                                                    ? "border-orange-500 bg-orange-50"
                                                    : "border-gray-200 hover:border-orange-200"
                                            }`}
                                        >
                                            <div className="flex justify-between items-start pr-8">
                                                <div>
                                                    <p className="font-bold text-gray-800">
                                                        {addr.recipient_name}{" "}
                                                        <span className="font-normal text-gray-500">
                                                            ({addr.phone_number}
                                                            )
                                                        </span>
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {addr.address_line},{" "}
                                                        {addr.city},{" "}
                                                        {addr.postal_code}
                                                    </p>
                                                    {addr.is_primary && (
                                                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-600 mt-2 inline-block">
                                                            Utama
                                                        </span>
                                                    )}
                                                </div>
                                                {selectedAddress?.id ===
                                                    addr.id && (
                                                    <CheckCircle className="text-orange-600 w-5 h-5 absolute right-4 top-4" />
                                                )}
                                            </div>

                                            {/* TOMBOL TRASH (MEMICU MODAL) */}
                                            {selectedAddress?.id !==
                                                addr.id && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openDeleteModal(addr);
                                                    }}
                                                    className="absolute right-4 bottom-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Hapus Alamat"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Tombol Tambah Alamat */}
                            {!isAddingAddress && (
                                <Button
                                    variant="outline"
                                    onClick={() => setIsAddingAddress(true)}
                                    className="w-full border-dashed border-2 h-12"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Tambah
                                    Alamat Baru
                                </Button>
                            )}

                            {/* Form Tambah Alamat */}
                            {isAddingAddress && (
                                <form
                                    onSubmit={handleSaveAddress}
                                    className="space-y-4 bg-gray-50 p-4 rounded-lg border animate-in fade-in"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium">
                                                Nama Penerima
                                            </label>
                                            <Input
                                                value={data.recipient_name}
                                                onChange={(e) =>
                                                    setData(
                                                        "recipient_name",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Contoh: Mas Joni"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium">
                                                No. WhatsApp
                                            </label>
                                            <Input
                                                value={data.phone_number}
                                                onChange={(e) =>
                                                    setData(
                                                        "phone_number",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="0812..."
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium">
                                            Alamat Lengkap
                                        </label>
                                        <Input
                                            value={data.address_line}
                                            onChange={(e) =>
                                                setData(
                                                    "address_line",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Jl. Mawar No 12..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium">
                                                Kota
                                            </label>
                                            <Input
                                                value={data.city}
                                                onChange={(e) =>
                                                    setData(
                                                        "city",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Jakarta Selatan"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium">
                                                Kode Pos
                                            </label>
                                            <Input
                                                value={data.postal_code}
                                                onChange={(e) =>
                                                    setData(
                                                        "postal_code",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="12345"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end mt-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => {
                                                setIsAddingAddress(false);
                                                reset();
                                            }}
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? "Menyimpan..."
                                                : "Simpan Alamat"}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* 2. DAFTAR BARANG */}
                        <div className="bg-white p-6 rounded-xl border shadow-sm">
                            <h2 className="font-semibold text-lg mb-4">
                                Rincian Pesanan
                            </h2>
                            <div className="divide-y">
                                {carts.map((item) => (
                                    <div
                                        key={item.id}
                                        className="py-4 flex gap-4"
                                    >
                                        <div className="w-16 h-16 bg-gray-100 rounded border overflow-hidden">
                                            <img
                                                src={`/storage/${item.product.image}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">
                                                {item.product.name}
                                            </p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Store className="w-3 h-3" />{" "}
                                                {item.product.user?.store
                                                    ?.name || "Toko"}
                                            </p>
                                            <p className="text-sm mt-1">
                                                {item.qty} x{" "}
                                                {formatRupiah(
                                                    item.product.price
                                                )}
                                            </p>
                                        </div>
                                        <div className="font-semibold text-gray-900">
                                            {formatRupiah(
                                                item.qty * item.product.price
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- KOLOM KANAN: RINGKASAN --- */}
                    <div className="lg:w-1/3">
                        <div className="bg-white p-6 rounded-xl border shadow-sm sticky top-24">
                            <h3 className="font-bold text-lg mb-4">
                                Ringkasan Pembayaran
                            </h3>
                            <div className="space-y-3 mb-6 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>Total Harga Barang</span>
                                    <span>{formatRupiah(totalBarang)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Biaya Pengiriman</span>
                                    <span>{formatRupiah(ongkir)}</span>
                                </div>
                                <hr />
                                <div className="flex justify-between text-gray-900 font-bold text-lg">
                                    <span>Total Tagihan</span>
                                    <span className="text-orange-600">
                                        {formatRupiah(grandTotal)}
                                    </span>
                                </div>
                            </div>
                            <Button
                                className="w-full h-12 text-lg font-bold bg-primary hover:bg-orange-600"
                                disabled={!selectedAddress || processing}
                                onClick={() => {
                                    if (!selectedAddress) return;

                                    const cartIds = carts.map(
                                        (item) => item.id
                                    );

                                    router.post(
                                        route("checkout.store"),
                                        {
                                            address_id: selectedAddress.id,
                                            cart_ids: cartIds,
                                        },
                                        {
                                            // --- TAMBAHAN DEBUGGING ---
                                            onError: (errors) => {
                                                console.error(
                                                    "Gagal Checkout:",
                                                    errors
                                                );
                                                alert(
                                                    "Gagal: " +
                                                        JSON.stringify(errors)
                                                ); // Munculkan error kasar dulu biar tau
                                            },
                                        }
                                    );
                                }}
                            >
                                Buat Pesanan
                            </Button>
                            {!selectedAddress && (
                                <p className="text-xs text-red-500 text-center mt-2">
                                    Pilih alamat dulu ya.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MODAL KONFIRMASI HAPUS ALAMAT (BACKDROP BLUR) --- */}
            {addressToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                Hapus Alamat?
                            </h3>
                            <p className="text-gray-500 text-sm">
                                Yakin mau hapus alamat penerima <br />
                                <span className="font-bold text-gray-800">
                                    "{addressToDelete.recipient_name}"
                                </span>
                                ?
                            </p>
                        </div>

                        <div className="flex border-t bg-gray-50">
                            <button
                                onClick={() =>
                                    !isDeleting && setAddressToDelete(null)
                                }
                                disabled={isDeleting}
                                className="flex-1 py-4 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors border-r disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDeleteAddress}
                                disabled={isDeleting}
                                className="flex-1 py-4 text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Menghapus...
                                    </>
                                ) : (
                                    "Ya, Hapus"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
