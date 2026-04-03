import SellerLayout from "@/Layouts/SellerLayout";
import { Head, useForm, Link } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    ArrowLeft,
    Save,
    Sparkles,
    Youtube,
    UploadCloud,
    X,
    ImagePlus,
    Trash2,
} from "lucide-react";
import { useState, useRef } from "react";
import axios from "axios";

export default function ProductEdit({ product, categories }) {
    // --- 1. SETUP FORM ---
    const { data, setData, post, processing, errors } = useForm({
        _method: "PUT", // Wajib untuk upload file di method PUT
        name: product.name,
        category_id: product.category_id,
        price: product.price,
        weight: product.weight || "",
        stock: product.stock,
        description: product.description || "",
        video_url: product.video_url || "",

        image: null, // Untuk FILE BARU (Main Image)
        extra_images: [], // Untuk FILE BARU (Gallery)

        deleted_images: [], // Array ID foto galeri lama yang mau DIHAPUS
    });

    const [isGenerating, setIsGenerating] = useState(false);

    // Refs
    const mainImageInputRef = useRef(null);
    const galleryInputRef = useRef(null);

    // --- 2. LOGIC PREVIEW GAMBAR UTAMA ---
    // Logic: Kalau ada file baru -> Tampilkan file baru.
    // Kalau gak ada file baru -> Tampilkan gambar lama dari database.
    const mainImagePreview = data.image
        ? URL.createObjectURL(data.image)
        : product.image
          ? `/storage/${product.image}`
          : null;

    // --- 3. LOGIC AI ---
    const handleGenerateAI = async () => {
        if (!data.name || data.name.length < 3) {
            alert("Nama produk harus diisi dulu ya!");
            return;
        }
        setIsGenerating(true);
        try {
            const response = await axios.post(
                route("seller.products.generate-ai"),
                {
                    name: data.name,
                    keywords: "Enak, Murah, Terlaris",
                },
            );
            if (response.data.success) {
                setData("description", response.data.description);
            }
        } catch (error) {
            console.error("AI Error:", error);
            alert("Gagal menghubungi AI.");
        } finally {
            setIsGenerating(false);
        }
    };

    // --- 4. HANDLER GAMBAR UTAMA ---
    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        if (file) setData("image", file);
    };

    const handleMainDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) setData("image", file);
    };

    // --- 5. HANDLER GALERI (COMPLEX LOGIC) ---

    // A. Handle File Baru (Upload)
    const handleGallerySelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0)
            setData("extra_images", [...data.extra_images, ...files]);
    };

    const handleGalleryDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files);
            const imageFiles = files.filter((file) =>
                file.type.startsWith("image/"),
            );
            if (imageFiles.length > 0)
                setData("extra_images", [...data.extra_images, ...imageFiles]);
        }
    };

    // B. Hapus File BARU (Yang barusan diupload tapi batal)
    const removeNewGalleryImage = (index) => {
        const updated = data.extra_images.filter((_, i) => i !== index);
        setData("extra_images", updated);
    };

    // C. Hapus File LAMA (Yang sudah ada di DB)
    const removeExistingGalleryImage = (id) => {
        // Masukkan ID ke array deleted_images biar nanti dihapus Controller
        setData("deleted_images", [...data.deleted_images, id]);
    };

    // --- 6. FORMATTING ---
    const formatRupiah = (value) => {
        if (!value) return "";
        return new Intl.NumberFormat("id-ID").format(value);
    };
    const handlePriceChange = (e) => {
        setData("price", e.target.value.replace(/\D/g, ""));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Post ke route update (method spoofing PUT sudah ada di useForm)
        post(route("admin.products.update", product.id));
    };

    return (
        <SellerLayout>
            <Head title="Edit Produk" />

            <div className="max-w-3xl pb-10 mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href={route("admin.products.index")}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Edit Produk
                        </h2>
                        <p className="text-muted-foreground">
                            Update foto, harga, atau deskripsi produk ini.
                        </p>
                    </div>
                </div>

                <div className="p-6 bg-white border shadow-sm rounded-xl">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* SECTION 1: INFO */}
                        <div className="space-y-4">
                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                <span className="flex items-center justify-center w-6 h-6 text-xs text-blue-600 bg-blue-100 rounded-full">
                                    1
                                </span>
                                Informasi Produk
                            </h3>

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
                                    <p className="text-sm text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Kategori</Label>
                                    <select
                                        className="flex w-full h-10 px-3 py-2 text-sm border rounded-md border-input bg-background focus-visible:ring-2 focus-visible:ring-ring"
                                        value={data.category_id}
                                        onChange={(e) =>
                                            setData(
                                                "category_id",
                                                e.target.value,
                                            )
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
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">Harga (Rp)</Label>
                                    <Input
                                        id="price"
                                        value={formatRupiah(data.price)}
                                        onChange={handlePriceChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="stock">Stok</Label>
                                <Input
                                    type="number"
                                    id="stock"
                                    value={data.stock}
                                    onChange={(e) =>
                                        setData("stock", e.target.value)
                                    }
                                    className="w-full md:w-1/2"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="weight">
                                    Berat Barang (Gram)
                                </Label>
                                <Input
                                    type="number"
                                    id="weight"
                                    value={data.weight}
                                    onChange={(e) =>
                                        setData("weight", e.target.value)
                                    }
                                    placeholder="Contoh: 1000 (untuk 1 Kg)"
                                    className="w-full md:w-1/2"
                                />
                                {errors.weight && (
                                    <p className="text-sm text-red-500">
                                        {errors.weight}
                                    </p>
                                )}
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* SECTION 2: MEDIA */}
                        <div className="space-y-6">
                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                <span className="flex items-center justify-center w-6 h-6 text-xs text-blue-600 bg-blue-100 rounded-full">
                                    2
                                </span>
                                Foto & Video
                            </h3>

                            {/* --- FOTO UTAMA --- */}
                            <div className="space-y-2">
                                <Label>Foto Utama (Thumbnail)</Label>
                                <div
                                    className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all h-64 flex flex-col items-center justify-center group overflow-hidden
                                        ${
                                            mainImagePreview
                                                ? "border-blue-500 bg-blue-50/10"
                                                : "border-gray-300 hover:border-blue-400"
                                        }
                                    `}
                                    onClick={() =>
                                        mainImageInputRef.current.click()
                                    }
                                    onDrop={handleMainDrop}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                >
                                    <input
                                        type="file"
                                        className="hidden"
                                        ref={mainImageInputRef}
                                        onChange={handleMainImageChange}
                                        accept="image/*"
                                    />

                                    {mainImagePreview ? (
                                        <>
                                            <img
                                                src={mainImagePreview}
                                                alt="Main Preview"
                                                className="absolute inset-0 object-contain w-full h-full p-2"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center gap-2 transition-opacity opacity-0 bg-black/40 group-hover:opacity-100">
                                                <p className="text-sm font-medium text-white">
                                                    Klik untuk ganti foto
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-3 text-gray-500">
                                            <ImagePlus className="w-8 h-8 mx-auto" />
                                            <p className="text-sm">
                                                Upload Thumbnail Baru
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* --- GALERI FOTO --- */}
                            <div className="space-y-2">
                                <Label>Galeri Foto</Label>

                                {/* 1. Dropzone */}
                                <div
                                    className="p-6 text-center transition-colors border-2 border-gray-300 border-dashed cursor-pointer rounded-xl hover:bg-gray-50 hover:border-blue-400"
                                    onClick={() =>
                                        galleryInputRef.current.click()
                                    }
                                    onDrop={handleGalleryDrop}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                >
                                    <input
                                        type="file"
                                        multiple
                                        className="hidden"
                                        ref={galleryInputRef}
                                        onChange={handleGallerySelect}
                                        accept="image/*"
                                    />
                                    <div className="flex flex-col items-center gap-2 text-gray-500">
                                        <UploadCloud className="w-6 h-6" />
                                        <p className="text-sm">
                                            Klik atau Drag foto tambahan kesini
                                        </p>
                                    </div>
                                </div>

                                {/* 2. Preview Grid (Gabungan Lama + Baru) */}
                                <div className="grid grid-cols-2 gap-4 mt-4 sm:grid-cols-4">
                                    {/* A. Foto LAMA (Existing) */}
                                    {product.images &&
                                        product.images.map(
                                            (img) =>
                                                // Jangan tampilkan kalau sudah ditandai hapus
                                                !data.deleted_images.includes(
                                                    img.id,
                                                ) && (
                                                    <div
                                                        key={img.id}
                                                        className="relative overflow-hidden border rounded-lg aspect-square group"
                                                    >
                                                        <img
                                                            src={`/storage/${img.image_path}`}
                                                            className="object-cover w-full h-full"
                                                        />
                                                        <div className="absolute top-1 right-1">
                                                            <span className="bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded mr-1">
                                                                Lama
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeExistingGalleryImage(
                                                                        img.id,
                                                                    )
                                                                }
                                                                className="p-1 text-white transition bg-red-500 rounded-full hover:bg-red-600"
                                                                title="Hapus foto ini"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ),
                                        )}

                                    {/* B. Foto BARU (New Upload) */}
                                    {data.extra_images.map((file, index) => (
                                        <div
                                            key={index}
                                            className="relative overflow-hidden border rounded-lg aspect-square group"
                                        >
                                            <img
                                                src={URL.createObjectURL(file)}
                                                className="object-cover w-full h-full"
                                            />
                                            <div className="absolute top-1 right-1">
                                                <span className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded mr-1">
                                                    Baru
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeNewGalleryImage(
                                                            index,
                                                        )
                                                    }
                                                    className="p-1 text-white transition bg-red-500 rounded-full hover:bg-red-600"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="video_url">Video Review</Label>
                                <div className="relative">
                                    <Youtube className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                                    <Input
                                        id="video_url"
                                        className="pl-10"
                                        value={data.video_url}
                                        onChange={(e) =>
                                            setData("video_url", e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* SECTION 3: DESKRIPSI */}
                        <div className="space-y-4">
                            <div className="flex items-end justify-between">
                                <h3 className="flex items-center gap-2 text-lg font-semibold">
                                    <span className="flex items-center justify-center w-6 h-6 text-xs text-blue-600 bg-blue-100 rounded-full">
                                        3
                                    </span>
                                    Deskripsi
                                </h3>
                                <button
                                    type="button"
                                    onClick={handleGenerateAI}
                                    disabled={isGenerating}
                                    className="text-xs flex items-center gap-1 text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200 transition-colors"
                                >
                                    {isGenerating ? (
                                        "Sedang Berpikir..."
                                    ) : (
                                        <>
                                            <Sparkles className="w-3 h-3" />{" "}
                                            Buat Deskripsi AI
                                        </>
                                    )}
                                </button>
                            </div>
                            <textarea
                                rows="6"
                                className="flex w-full px-3 py-2 text-sm border rounded-md border-input bg-background"
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
                                className="w-full h-12 px-8 bg-blue-600 md:w-auto hover:bg-blue-700"
                            >
                                <Save className="w-5 h-5 mr-2" />
                                {processing ? "Menyimpan..." : "Update Produk"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </SellerLayout>
    );
}
