import SellerLayout from "@/Layouts/SellerLayout";
import { Head, useForm, Link } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { ArrowLeft, Save } from "lucide-react";

export default function ProductEdit({ product, categories }) {
    // Isi default value dari data product yg dikirim controller
    const { data, setData, post, processing, errors } = useForm({
        _method: "PUT", // PENTING: Trik agar bisa upload file di method PUT
        name: product.name,
        category_id: product.category_id,
        price: product.price,
        stock: product.stock,
        description: product.description || "",
        image: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Pakai post tapi method-nya spoofing jadi PUT (karena Inertia/Laravel limitation soal file upload di PUT)
        post(route("seller.products.update", product.id));
    };

    // Helper: Format Angka ke Rupiah (Visual)
    const formatRupiah = (value) => {
        if (!value) return "";
        return new Intl.NumberFormat("id-ID").format(value);
    };

    // Helper: Handle saat user ngetik
    const handlePriceChange = (e) => {
        // Ambil angka saja (buang titik/koma)
        const rawValue = e.target.value.replace(/\D/g, "");
        setData("price", rawValue);
    };

    return (
        <SellerLayout>
            <Head title="Edit Produk" />

            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Link href={route("seller.products.index")}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Edit Produk
                        </h2>
                        <p className="text-muted-foreground">
                            Perbarui informasi produk Anda.
                        </p>
                    </div>
                </div>

                <div className="bg-white border rounded-xl p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Nama Produk */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Produk</Label>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Kategori</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    value={data.category_id}
                                    onChange={(e) =>
                                        setData("category_id", e.target.value)
                                    }
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price">Harga (Rp)</Label>
                                <Input
                                    type="text" // Ubah jadi Text biar bisa nampung titik
                                    id="price"
                                    value={formatRupiah(data.price)} // Tampilkan versi cantik (ada titik)
                                    onChange={handlePriceChange} // Simpan versi murni (angka doang)
                                    placeholder="0"
                                />
                                {errors.price && (
                                    <p className="text-red-500 text-sm">
                                        {errors.price}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="stock">Stok</Label>
                                <Input
                                    type="number"
                                    value={data.stock}
                                    onChange={(e) =>
                                        setData("stock", e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Ganti Foto (Opsional)</Label>
                                <Input
                                    type="file"
                                    onChange={(e) =>
                                        setData("image", e.target.files[0])
                                    }
                                    accept="image/*"
                                />
                                {product.image && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        *Biarkan kosong jika tidak ingin
                                        mengganti foto saat ini.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Deskripsi</Label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                {processing ? "Menyimpan..." : "Update Produk"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </SellerLayout>
    );
}
