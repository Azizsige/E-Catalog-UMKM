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
} from "lucide-react";
import { useState, useRef } from "react";
import axios from "axios";

export default function ProductCreate({ categories }) {
    // --- 1. SETUP FORM INERTIA ---
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        category_id: "",
        price: "",
        stock: "",
        description: "",
        image: null, // Main Image (Single)
        video_url: "",
        extra_images: [], // Gallery Images (Array)
    });

    // State untuk Loading AI
    const [isGenerating, setIsGenerating] = useState(false);

    // Refs untuk Trigger Input File
    const mainImageInputRef = useRef(null);
    const galleryInputRef = useRef(null);

    // --- 2. LOGIC AI GENERATOR ---
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
            alert("Gagal menghubungi AI. Coba lagi nanti.");
        } finally {
            setIsGenerating(false);
        }
    };

    // --- 3. LOGIC FOTO UTAMA (MAIN IMAGE) ---
    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        if (file) setData("image", file);
    };

    const handleMainDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            setData("image", file);
        }
    };

    const removeMainImage = (e) => {
        e.stopPropagation(); // Mencegah trigger klik pada container
        setData("image", null);
        if (mainImageInputRef.current) mainImageInputRef.current.value = "";
    };

    // --- 4. LOGIC GALERI (EXTRA IMAGES) ---
    const handleGallerySelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setData("extra_images", [...data.extra_images, ...files]);
        }
    };

    const handleGalleryDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files);
            const imageFiles = files.filter((file) =>
                file.type.startsWith("image/"),
            );
            if (imageFiles.length > 0) {
                setData("extra_images", [...data.extra_images, ...imageFiles]);
            }
        }
    };

    const removeGalleryImage = (indexToRemove) => {
        const updatedImages = data.extra_images.filter(
            (_, index) => index !== indexToRemove,
        );
        setData("extra_images", updatedImages);
    };

    // Prevent default behavior saat drag over
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    // --- 5. FORMATTING HELPERS ---
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
        post(route("admin.products.store"));
    };

    return (
        <SellerLayout>
            <Head title="Tambah Produk" />

            <div className="max-w-3xl mx-auto pb-10">
                {/* Header Page */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href={route("admin.products.index")}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Tambah Produk Baru
                        </h2>
                        <p className="text-muted-foreground">
                            Lengkapi foto dan detail produkmu agar menarik
                            pembeli.
                        </p>
                    </div>
                </div>

                <div className="bg-white border rounded-xl p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* === SECTION 1: INFORMASI DASAR === */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <span className="bg-orange-100 text-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">
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
                                    placeholder="Contoh: Kebab Turki Daging Premium"
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
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
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
                                        <p className="text-red-500 text-sm">
                                            {errors.category_id}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">Harga (Rp)</Label>
                                    <Input
                                        id="price"
                                        value={formatRupiah(data.price)}
                                        onChange={handlePriceChange}
                                        placeholder="0"
                                    />
                                    {errors.price && (
                                        <p className="text-red-500 text-sm">
                                            {errors.price}
                                        </p>
                                    )}
                                </div>
                            </div>

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
                                    className="w-full md:w-1/2"
                                />
                                {errors.stock && (
                                    <p className="text-red-500 text-sm">
                                        {errors.stock}
                                    </p>
                                )}
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* === SECTION 2: MEDIA (FOTO & VIDEO) === */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <span className="bg-orange-100 text-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                    2
                                </span>
                                Foto & Video
                            </h3>

                            {/* --- FOTO UTAMA (DRAG & DROP STYLE) --- */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    Foto Utama (Thumbnail)
                                    <span className="text-xs font-normal text-gray-500">
                                        *Wajib diisi
                                    </span>
                                </Label>

                                <div
                                    className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all h-64 flex flex-col items-center justify-center group overflow-hidden
                                        ${
                                            data.image
                                                ? "border-orange-500 bg-orange-50/10"
                                                : "border-gray-300 hover:bg-gray-50 hover:border-orange-400"
                                        }
                                    `}
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
                                        accept="image/*"
                                    />

                                    {data.image ? (
                                        <>
                                            <img
                                                src={URL.createObjectURL(
                                                    data.image,
                                                )}
                                                alt="Main Preview"
                                                className="absolute inset-0 w-full h-full object-contain p-2"
                                            />
                                            {/* Overlay Hover */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <p className="text-white text-sm font-medium">
                                                    Klik untuk ganti
                                                </p>
                                            </div>
                                            {/* Tombol Hapus */}
                                            <button
                                                type="button"
                                                onClick={removeMainImage}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors z-10"
                                                title="Hapus foto utama"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="space-y-3 text-gray-500 group-hover:text-orange-600 transition-colors">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-orange-100 transition-colors">
                                                <ImagePlus className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">
                                                    Upload Thumbnail
                                                </p>
                                                <p className="text-xs mt-1">
                                                    Drag & Drop atau Klik disini
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-1">
                                                    JPG, PNG, GIF (Max 2MB)
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {errors.image && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.image}
                                    </p>
                                )}
                            </div>

                            {/* --- GALERI FOTO (DRAG & DROP MULTIPLE) --- */}
                            <div className="space-y-2">
                                <Label>Galeri Foto Tambahan</Label>

                                <div
                                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 hover:border-orange-400 transition-colors cursor-pointer group"
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
                                        accept="image/*"
                                    />

                                    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 group-hover:text-orange-600">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                                            <UploadCloud className="w-6 h-6" />
                                        </div>
                                        <p className="font-medium text-sm">
                                            <span className="text-orange-600 font-bold">
                                                Klik untuk upload
                                            </span>{" "}
                                            atau drag & drop gambar kesini
                                        </p>
                                        <p className="text-xs">
                                            Bisa pilih banyak sekaligus
                                        </p>
                                    </div>
                                </div>

                                {/* Preview Grid Galeri */}
                                {data.extra_images.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4 animate-in fade-in slide-in-from-top-4">
                                        {data.extra_images.map(
                                            (file, index) => (
                                                <div
                                                    key={index}
                                                    className="relative aspect-square group border rounded-lg overflow-hidden bg-gray-100"
                                                >
                                                    <img
                                                        src={URL.createObjectURL(
                                                            file,
                                                        )}
                                                        alt={`Preview ${index}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeGalleryImage(
                                                                index,
                                                            )
                                                        }
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                                {errors.extra_images && (
                                    <p className="text-red-500 text-sm">
                                        {errors.extra_images}
                                    </p>
                                )}
                            </div>

                            {/* Video URL */}
                            <div className="space-y-2">
                                <Label htmlFor="video_url">
                                    Video Review (YouTube)
                                </Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-3 text-gray-400">
                                        <Youtube className="w-5 h-5" />
                                    </div>
                                    <Input
                                        id="video_url"
                                        placeholder="Contoh: https://www.youtube.com/watch?v=..."
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
                            <div className="flex justify-between items-end">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <span className="bg-orange-100 text-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                        3
                                    </span>
                                    Deskripsi
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
                                            Sedang Berpikir...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-3 h-3" />{" "}
                                            Buat Deskripsi dengan AI
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="space-y-2">
                                <textarea
                                    id="description"
                                    rows="6"
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="Jelaskan keunggulan produkmu..."
                                    value={data.description}
                                    onChange={(e) =>
                                        setData("description", e.target.value)
                                    }
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm">
                                        {errors.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* TOMBOL SAVE */}
                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full md:w-auto text-base px-8 h-12 bg-orange-600 hover:bg-orange-700"
                            >
                                <Save className="mr-2 h-5 w-5" />
                                {processing
                                    ? "Menyimpan Produk..."
                                    : "Simpan Produk"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </SellerLayout>
    );
}
