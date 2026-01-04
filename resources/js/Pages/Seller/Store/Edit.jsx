import SellerLayout from "@/Layouts/SellerLayout";
import { Head, useForm } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Store, Save, Image as ImageIcon } from "lucide-react";

export default function StoreEdit({ store }) {
    const safeStore = store || {};

    const { data, setData, post, processing, errors } = useForm({
        name: safeStore.name || "",
        description: safeStore.description || "",
        phone_number: safeStore.phone_number || "",
        address: safeStore.address || "",
        logo: null,
        banner: null,
        _method: "POST",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("seller.store.update"));
    };

    return (
        <SellerLayout>
            <Head title="Pengaturan Toko" />

            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-primary/10 rounded-lg">
                        <Store className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Pengaturan Toko
                        </h2>
                        <p className="text-muted-foreground">
                            Sesuaikan identitas dan branding toko Anda.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* BAGIAN 1: BRANDING (Banner & Logo) */}
                    <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
                        <h3 className="font-semibold text-lg border-b pb-2">
                            Branding Toko
                        </h3>

                        {/* Banner */}
                        <div className="space-y-2">
                            <Label>Banner Toko (Disarankan 1200x300px)</Label>

                            {/* Preview Banner Lama */}
                            {store.banner && (
                                <div className="w-full h-32 rounded-lg overflow-hidden border mb-2">
                                    <img
                                        src={`/storage/${store.banner}`}
                                        className="w-full h-full object-cover"
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
                                <p className="text-red-500 text-sm">
                                    {errors.banner}
                                </p>
                            )}
                        </div>

                        {/* Logo */}
                        <div className="space-y-2">
                            <Label>Logo Toko</Label>
                            <div className="flex items-center gap-4">
                                {/* Preview Logo Lama */}
                                <div className="w-20 h-20 rounded-full border bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                                    {store.logo ? (
                                        <img
                                            src={`/storage/${store.logo}`}
                                            className="w-full h-full object-cover"
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
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.logo}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BAGIAN 2: INFORMASI DASAR */}
                    <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
                        <h3 className="font-semibold text-lg border-b pb-2">
                            Informasi Toko
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    <p className="text-red-500 text-sm">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Nomor WhatsApp</Label>
                                <Input
                                    id="phone"
                                    placeholder="Contoh: 08123456789"
                                    value={data.phone_number}
                                    onChange={(e) =>
                                        setData("phone_number", e.target.value)
                                    }
                                />
                                {errors.phone_number && (
                                    <p className="text-red-500 text-sm">
                                        {errors.phone_number}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Alamat Lengkap</Label>
                            <textarea
                                id="address"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
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
