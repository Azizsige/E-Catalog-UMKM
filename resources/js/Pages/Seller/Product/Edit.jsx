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
    // --- 1. SETUP FORM INERTIA ---
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
    const mainImagePreview = data.image
        ? URL.createObjectURL(data.image)
        : product.image
          ? `/storage/${product.image}`
          : null;

    // --- 3. LOGIC AI GENERATOR ---
    const handleGenerateAI = async () => {
        if (!data.name || data.name.length < 3) {
            alert(
                "Tolong isi Nama Produk dulu ya, biar AI-nya tau mau nulis apa! 😉",
            );
            return;
        }
        setIsGenerating(true);
        try {
            const response = await axios.post(
                route("admin.products.generate-ai"),
                { name: data.name, keywords: "Enak, Murah, Terlaris" },
            );
            if (response.data.success) {
                setData("description", response.data.description);
            }
        } catch (error) {
            console.error("AI Error:", error);
            alert("Gagal menghubungi AI. Coba lagi nanti.");
        } finally {
            setIsGenerating(false);
        }
    };

    // --- 4. LOGIC FOTO UTAMA (COVER) ---
    const processMainImage = (file) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            alert("Hanya boleh upload file gambar (JPG/PNG)!");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            alert("Ukuran gambar maksimal 2MB!");
            return;
        }
        setData("image", file);
    };

    const handleMainImageChange = (e) => processMainImage(e.target.files[0]);
    const handleMainDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        processMainImage(e.dataTransfer.files[0]);
    };
    const removeMainImage = (e) => {
        e.stopPropagation();
        setData("image", null);
        if (mainImageInputRef.current) mainImageInputRef.current.value = "";
    };

    // --- 5. LOGIC GALERI (SLIDER) ---
    const processGalleryImages = (filesArray) => {
        const validImages = filesArray.filter((file) => {
            if (!file.type.startsWith("image/")) return false;
            if (file.size > 2 * 1024 * 1024) {
                alert(`File ${file.name} terlalu besar (Max 2MB). Dilewati.`);
                return false;
            }
            return true;
        });

        if (validImages.length > 0) {
            setData("extra_images", [...data.extra_images, ...validImages]);
        }
    };

    const handleGallerySelect = (e) =>
        processGalleryImages(Array.from(e.target.files));
    const handleGalleryDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files)
            processGalleryImages(Array.from(e.dataTransfer.files));
    };

    // Hapus File BARU (Yang barusan diupload tapi batal)
    const removeNewGalleryImage = (index) => {
        const updated = data.extra_images.filter((_, i) => i !== index);
        setData("extra_images", updated);
    };

    // Hapus File LAMA (Yang sudah ada di DB)
    const removeExistingGalleryImage = (id) => {
        setData("deleted_images", [...data.deleted_images, id]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    // --- 6. FORMATTING HELPERS ---
    const formatRupiah = (value) => {
        if (!value) return "";
        return new Intl.NumberFormat("id-ID").format(value);
    };

    const handlePriceChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, "");
        setData("price", rawValue);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("admin.products.update", product.id));
    };

    return (
        <SellerLayout>
            <Head title={`Edit Produk - ${product.name}`} />

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
                            Update foto, harga, atau detail produkmu.
                        </p>
                    </div>
                </div>

                <div className="p-6 bg-white border shadow-sm rounded-xl">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* === SECTION 1: INFORMASI DASAR === */}
                        <div className="space-y-4">
                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                <span className="flex items-center justify-center w-6 h-6 text-xs text-orange-600 bg-orange-100 rounded-full">
                                    1
                                </span>
                                Informasi Produk
                            </h3>

                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Nama Produk{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    placeholder="Contoh: Nasi Bebek Madura"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="category">
                                        Kategori{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <select
                                        className="flex w-full h-10 px-3 py-2 text-sm border rounded-md border-input bg-background focus-visible:ring-2 focus-visible:ring-orange-500"
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
                                    {errors.category_id && (
                                        <p className="text-sm text-red-500">
                                            {errors.category_id}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">
                                        Harga (Rp){" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="price"
                                        value={formatRupiah(data.price)}
                                        onChange={handlePriceChange}
                                        placeholder="0"
                                    />
                                    {errors.price && (
                                        <p className="text-sm text-red-500">
                                            {errors.price}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="stock">
                                        Stok{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
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
                                        <p className="text-sm text-red-500">
                                            {errors.stock}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="weight">
                                        Berat Barang (Gram){" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        id="weight"
                                        value={data.weight}
                                        onChange={(e) =>
                                            setData("weight", e.target.value)
                                        }
                                        placeholder="Contoh: 400"
                                    />
                                    {errors.weight && (
                                        <p className="text-sm text-red-500">
                                            {errors.weight}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* === SECTION 2: MEDIA === */}
                        <div className="space-y-6">
                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                <span className="flex items-center justify-center w-6 h-6 text-xs text-orange-600 bg-orange-100 rounded-full">
                                    2
                                </span>
                                Media Produk
                            </h3>

                            {/* DROPZONE 1: GAMBAR UTAMA */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    Foto Utama (Thumbnail & Cover Video){" "}
                                    <span className="text-xs font-normal text-red-500">
                                        *Wajib
                                    </span>
                                </Label>
                                <div
                                    className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all h-64 flex flex-col items-center justify-center group overflow-hidden ${
                                        mainImagePreview
                                            ? "border-orange-500 bg-orange-50/10"
                                            : "border-gray-300 hover:bg-gray-50 hover:border-orange-400"
                                    }`}
                                    onClick={() =>
                                        mainImageInputRef.current.click()
                                    }
                                    onDrop={handleMainDrop}
                                    onDragOver={handleDragOver}
                                >
                                    <input
                                        type="file"
                                        className="hidden"
                                        ref={mainImageInputRef}
                                        onChange={handleMainImageChange}
                                        accept="image/jpeg,image/png,image/webp"
                                    />
                                    {mainImagePreview ? (
                                        <>
                                            <img
                                                src={mainImagePreview}
                                                alt="Cover"
                                                className="absolute inset-0 object-contain w-full h-full p-2"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/40 group-hover:opacity-100">
                                                <p className="text-sm font-medium text-white">
                                                    Klik untuk ganti cover
                                                </p>
                                            </div>
                                            {/* Hanya tampilkan tombol hapus jika ada file BARU yang dipilih, agar gambar lama tidak terhapus total tanpa diganti */}
                                            {data.image && (
                                                <button
                                                    type="button"
                                                    onClick={removeMainImage}
                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors z-10"
                                                    title="Batal ubah foto"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <div className="space-y-3 text-gray-500 group-hover:text-orange-600">
                                            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gray-100 rounded-full group-hover:bg-orange-100">
                                                <ImagePlus className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">
                                                    Upload Cover Utama
                                                </p>
                                                <p className="mt-1 text-xs">
                                                    Maksimal 2MB (JPG/PNG)
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {errors.image && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.image}
                                    </p>
                                )}
                            </div>

                            {/* DROPZONE 2: GALERI */}
                            <div className="space-y-2">
                                <Label>Galeri Foto Tambahan (Slider)</Label>
                                <div
                                    className="p-8 text-center transition-colors border-2 border-gray-300 border-dashed cursor-pointer rounded-xl hover:bg-gray-50 hover:border-orange-400 group"
                                    onDrop={handleGalleryDrop}
                                    onDragOver={handleDragOver}
                                    onClick={() =>
                                        galleryInputRef.current.click()
                                    }
                                >
                                    <input
                                        type="file"
                                        multiple
                                        className="hidden"
                                        ref={galleryInputRef}
                                        onChange={handleGallerySelect}
                                        accept="image/jpeg,image/png,image/webp"
                                    />
                                    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 group-hover:text-orange-600">
                                        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full group-hover:bg-orange-100">
                                            <UploadCloud className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-medium">
                                            <span className="font-bold text-orange-600">
                                                Klik untuk upload
                                            </span>{" "}
                                            atau drag & drop
                                        </p>
                                        <p className="text-xs">
                                            Bisa pilih banyak sekaligus (Max
                                            2MB/foto)
                                        </p>
                                    </div>
                                </div>

                                {/* Preview Grid Galeri (Lama + Baru) */}
                                {(product.images?.length > 0 ||
                                    data.extra_images.length > 0) && (
                                    <div className="grid grid-cols-3 gap-4 mt-4 sm:grid-cols-4 md:grid-cols-5">
                                        {/* A. Foto LAMA (Dari DB) */}
                                        {product.images &&
                                            product.images.map(
                                                (img) =>
                                                    !data.deleted_images.includes(
                                                        img.id,
                                                    ) && (
                                                        <div
                                                            key={`old-${img.id}`}
                                                            className="relative overflow-hidden border rounded-lg aspect-square group"
                                                        >
                                                            <img
                                                                src={`/storage/${img.image_path}`}
                                                                className="object-cover w-full h-full"
                                                                alt="Galeri Lama"
                                                            />
                                                            <div className="absolute top-1 right-1">
                                                                <span className="bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded mr-1">
                                                                    Lama
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        removeExistingGalleryImage(
                                                                            img.id,
                                                                        );
                                                                    }}
                                                                    className="p-1 text-white transition bg-red-500 rounded-full shadow-sm hover:bg-red-600"
                                                                    title="Hapus foto ini"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ),
                                            )}

                                        {/* B. Foto BARU (Upload Baru) */}
                                        {data.extra_images.map(
                                            (file, index) => (
                                                <div
                                                    key={`new-${index}`}
                                                    className="relative overflow-hidden border border-green-200 rounded-lg aspect-square group"
                                                >
                                                    <img
                                                        src={URL.createObjectURL(
                                                            file,
                                                        )}
                                                        className="object-cover w-full h-full"
                                                        alt="Galeri Baru"
                                                    />
                                                    <div className="absolute top-1 right-1">
                                                        <span className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded mr-1 shadow-sm">
                                                            Baru
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeNewGalleryImage(
                                                                    index,
                                                                );
                                                            }}
                                                            className="p-1 text-white transition bg-red-500 rounded-full shadow-sm hover:bg-red-600"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* INPUT LINK YOUTUBE */}
                            <div className="space-y-2">
                                <Label htmlFor="video_url">
                                    Video Review (Link YouTube - Opsional)
                                </Label>
                                <div className="relative">
                                    <div className="absolute text-gray-400 left-3 top-3">
                                        <Youtube className="w-5 h-5 text-red-500" />
                                    </div>
                                    <Input
                                        id="video_url"
                                        placeholder="Contoh: https://www.youtube.com/watch?v=xxx"
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

                        {/* === SECTION 3: DESKRIPSI AI === */}
                        <div className="space-y-4">
                            <div className="flex items-end justify-between">
                                <h3 className="flex items-center gap-2 text-lg font-semibold">
                                    <span className="flex items-center justify-center w-6 h-6 text-xs text-orange-600 bg-orange-100 rounded-full">
                                        3
                                    </span>
                                    Deskripsi{" "}
                                    <span className="text-red-500">*</span>
                                </h3>
                                <button
                                    type="button"
                                    onClick={handleGenerateAI}
                                    disabled={isGenerating}
                                    className="text-xs flex items-center gap-1 text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200 transition-colors bg-white font-medium shadow-sm"
                                >
                                    {isGenerating ? (
                                        <>
                                            <span className="animate-spin">
                                                ✨
                                            </span>{" "}
                                            Berpikir...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-3 h-3" />{" "}
                                            Buat Deskripsi AI
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="space-y-2">
                                <textarea
                                    id="description"
                                    rows="6"
                                    className="flex w-full px-3 py-2 text-sm border rounded-md bg-background focus-visible:ring-2 focus-visible:ring-orange-500"
                                    placeholder="Jelaskan keunggulan produkmu..."
                                    value={data.description}
                                    onChange={(e) =>
                                        setData("description", e.target.value)
                                    }
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">
                                        {errors.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full h-12 px-8 text-base text-white bg-orange-600 md:w-auto hover:bg-orange-700"
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
