import SellerLayout from "@/Layouts/SellerLayout";
import { Head, useForm } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Store,
    Save,
    Image as ImageIcon,
    CreditCard,
    Phone,
} from "lucide-react";

export default function StoreEdit({ store }) {
    const safeStore = store || {};

    const { data, setData, post, processing, errors } = useForm({
        name: safeStore.name || "",
        bank_name: safeStore.bank_name || "",
        bank_account: safeStore.bank_account || "",
        description: safeStore.description || "",
        phone_number: safeStore.phone_number || "",
        address: safeStore.address || "",
        checkout_mode: safeStore.checkout_mode || "midtrans", // <--- 1. STATE BARU
        logo: null,
        banner: null,
        _method: "POST", // Untuk handle file upload via PUT/PATCH di Laravel
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("admin.store.update"));
    };

    return (
        <SellerLayout>
            <Head title="Pengaturan Toko" />

            <div className="max-w-4xl pb-10 mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-lg bg-primary/10">
                        <Store className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Pengaturan Toko
                        </h2>
                        <p className="text-muted-foreground">
                            Sesuaikan identitas, branding, dan metode penjualan
                            toko Anda.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* BAGIAN 1: METODE CHECKOUT (FITUR BARU) */}
                    <div className="p-6 space-y-4 bg-white border shadow-sm rounded-xl">
                        <h3 className="flex items-center gap-2 pb-2 text-lg font-semibold border-b">
                            <CreditCard className="w-5 h-5 text-gray-500" />
                            Metode Penjualan (Checkout)
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Opsi Midtrans */}
                            <div
                                onClick={() =>
                                    setData("checkout_mode", "midtrans")
                                }
                                className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center transition-all hover:shadow-md ${
                                    data.checkout_mode === "midtrans"
                                        ? "border-orange-500 bg-orange-50/50"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                <CreditCard
                                    className={`w-8 h-8 mb-2 ${
                                        data.checkout_mode === "midtrans"
                                            ? "text-orange-600"
                                            : "text-gray-400"
                                    }`}
                                />
                                <span className="text-sm font-bold text-gray-800">
                                    Otomatis (Midtrans)
                                </span>
                                <p className="mt-1 text-xs text-center text-muted-foreground">
                                    Pembayaran online & verifikasi otomatis.
                                </p>
                            </div>

                            {/* Opsi WhatsApp */}
                            <div
                                onClick={() =>
                                    setData("checkout_mode", "whatsapp")
                                }
                                className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center transition-all hover:shadow-md ${
                                    data.checkout_mode === "whatsapp"
                                        ? "border-green-500 bg-green-50/50"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                <Phone
                                    className={`w-8 h-8 mb-2 ${
                                        data.checkout_mode === "whatsapp"
                                            ? "text-green-600"
                                            : "text-gray-400"
                                    }`}
                                />
                                <span className="text-sm font-bold text-gray-800">
                                    Manual (WhatsApp)
                                </span>
                                <p className="mt-1 text-xs text-center text-muted-foreground">
                                    Chat langsung & nego ongkir manual.
                                </p>
                            </div>
                        </div>
                        {errors.checkout_mode && (
                            <p className="text-sm text-red-500">
                                {errors.checkout_mode}
                            </p>
                        )}
                    </div>

                    {data.checkout_mode === "whatsapp" && (
                        <div className="p-6 space-y-4 duration-300 border border-blue-200 shadow-sm bg-blue-50 rounded-xl animate-in fade-in slide-in-from-top-2">
                            <h3 className="flex items-center gap-2 pb-2 text-lg font-semibold text-blue-900 border-b border-blue-200">
                                <CreditCard className="w-5 h-5 text-blue-700" />
                                Rekening Tujuan Transfer
                            </h3>
                            <p className="text-sm text-blue-700">
                                Data ini akan ditampilkan di Invoice pembeli
                                agar mereka tahu kemana harus transfer.
                            </p>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="bank_name"
                                        className="text-blue-900"
                                    >
                                        Nama Bank / E-Wallet
                                    </Label>
                                    <Input
                                        id="bank_name"
                                        placeholder="Contoh: BCA, Mandiri, GoPay"
                                        value={data.bank_name}
                                        onChange={(e) =>
                                            setData("bank_name", e.target.value)
                                        }
                                        className="bg-white border-blue-200 focus:border-blue-500"
                                    />
                                    {errors.bank_name && (
                                        <p className="text-sm text-red-500">
                                            {errors.bank_name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="bank_account"
                                        className="text-blue-900"
                                    >
                                        Nomor Rekening
                                    </Label>
                                    <Input
                                        id="bank_account"
                                        placeholder="Contoh: 1234567890 (a.n Budi)"
                                        value={data.bank_account}
                                        onChange={(e) =>
                                            setData(
                                                "bank_account",
                                                e.target.value,
                                            )
                                        }
                                        className="bg-white border-blue-200 focus:border-blue-500"
                                    />
                                    {errors.bank_account && (
                                        <p className="text-sm text-red-500">
                                            {errors.bank_account}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BAGIAN 2: BRANDING (Banner & Logo) - KODE LAMA */}
                    <div className="p-6 space-y-6 bg-white border shadow-sm rounded-xl">
                        <h3 className="flex items-center gap-2 pb-2 text-lg font-semibold border-b">
                            <ImageIcon className="w-5 h-5 text-gray-500" />
                            Branding Toko
                        </h3>

                        {/* Banner */}
                        <div className="space-y-2">
                            <Label>Banner Toko (Disarankan 1200x300px)</Label>
                            {safeStore.banner && (
                                <div className="relative w-full h-32 mb-2 overflow-hidden border rounded-lg group">
                                    <img
                                        src={`/storage/${safeStore.banner}`}
                                        className="object-cover w-full h-full"
                                        alt="Banner"
                                    />
                                </div>
                            )}
                            <Input
                                type="file"
                                onChange={(e) =>
                                    setData("banner", e.target.files[0])
                                }
                                accept="image/*"
                            />
                            {errors.banner && (
                                <p className="text-sm text-red-500">
                                    {errors.banner}
                                </p>
                            )}
                        </div>

                        {/* Logo */}
                        <div className="space-y-2">
                            <Label>Logo Toko</Label>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-20 h-20 overflow-hidden border rounded-full bg-gray-50 shrink-0">
                                    {safeStore.logo ? (
                                        <img
                                            src={`/storage/${safeStore.logo}`}
                                            className="object-cover w-full h-full"
                                            alt="Logo"
                                        />
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-gray-300" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <Input
                                        type="file"
                                        onChange={(e) =>
                                            setData("logo", e.target.files[0])
                                        }
                                        accept="image/*"
                                    />
                                    {errors.logo && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.logo}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BAGIAN 3: INFORMASI DASAR - KODE LAMA + SEDIKIT LOGIC WA */}
                    <div className="p-6 space-y-6 bg-white border shadow-sm rounded-xl">
                        <h3 className="pb-2 text-lg font-semibold border-b">
                            Informasi Toko
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Toko</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="phone"
                                    className={
                                        data.checkout_mode === "whatsapp"
                                            ? "text-green-700 font-bold"
                                            : ""
                                    }
                                >
                                    Nomor WhatsApp{" "}
                                    {data.checkout_mode === "whatsapp" &&
                                        "(Wajib Diisi)"}
                                </Label>
                                <Input
                                    id="phone"
                                    placeholder="Contoh: 08123456789"
                                    value={data.phone_number}
                                    onChange={(e) =>
                                        setData("phone_number", e.target.value)
                                    }
                                    className={
                                        data.checkout_mode === "whatsapp" &&
                                        !data.phone_number
                                            ? "border-red-500"
                                            : ""
                                    }
                                />
                                {errors.phone_number && (
                                    <p className="text-sm text-red-500">
                                        {errors.phone_number}
                                    </p>
                                )}
                                {data.checkout_mode === "whatsapp" && (
                                    <p className="text-[10px] text-green-600">
                                        *Nomor ini akan digunakan sebagai tujuan
                                        chat pemesanan.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Alamat Lengkap</Label>
                            <textarea
                                id="address"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={data.address}
                                onChange={(e) =>
                                    setData("address", e.target.value)
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="desc">Deskripsi / Slogan</Label>
                            <textarea
                                id="desc"
                                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-primary hover:bg-orange-700"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {processing
                                    ? "Menyimpan..."
                                    : "Simpan Perubahan"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </SellerLayout>
    );
}
