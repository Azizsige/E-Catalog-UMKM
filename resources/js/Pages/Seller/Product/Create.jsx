import SellerLayout from "@/Layouts/SellerLayout";
import { Head, useForm, Link } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea"; // Pastikan file ini ada (kalau belum, pakai Input biasa)
import { ArrowLeft, Save } from "lucide-react";

export default function ProductCreate({ categories }) {
    // Setup Form Inertia
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        category_id: "",
        price: "",
        stock: "",
        description: "",
        image: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("seller.products.store"));
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
            <Head title="Tambah Produk" />

            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Link href={route("seller.products.index")}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Tambah Produk Baru
                        </h2>
                        <p className="text-muted-foreground">
                            Isi detail produk yang ingin Anda jual.
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
                                placeholder="Contoh: Nasi Goreng Spesial"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Kategori & Harga (Grid 2 Kolom) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Kategori</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data.category_id}
                                    onChange={(e) =>
                                        setData("category_id", e.target.value)
                                    }
                                >
                                    <option value="">
                                        -- Pilih Kategori --
                                    </option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && (
                                    <p className="text-red-500 text-sm">
                                        {errors.category_id}
                                    </p>
                                )}
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

                        {/* Stok & Gambar */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="stock">Stok Awal</Label>
                                <Input
                                    type="number"
                                    id="stock"
                                    value={data.stock}
                                    onChange={(e) =>
                                        setData("stock", e.target.value)
                                    }
                                    placeholder="0"
                                />
                                {errors.stock && (
                                    <p className="text-red-500 text-sm">
                                        {errors.stock}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image">Foto Produk</Label>
                                <Input
                                    type="file"
                                    id="image"
                                    onChange={(e) =>
                                        setData("image", e.target.files[0])
                                    }
                                    accept="image/*"
                                />
                                {errors.image && (
                                    <p className="text-red-500 text-sm">
                                        {errors.image}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Deskripsi */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            {/* Kalau component Textarea belum ada, ganti pakai <Textarea className="..." /> biasa */}
                            <Textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                                placeholder="Jelaskan detail produkmu..."
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                {processing ? "Menyimpan..." : "Simpan Produk"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </SellerLayout>
    );
}
