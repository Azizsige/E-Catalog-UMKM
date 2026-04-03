import { useState, useEffect, useRef } from "react";
import SellerLayout from "@/Layouts/SellerLayout";
import { Head, Link, router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import {
    PlusCircle,
    Package,
    ImageIcon,
    Trash2,
    Edit,
    Search,
    Filter,
} from "lucide-react";

export default function ProductIndex({ products, categories, filters }) {
    // --- STATE FILTER & PENCARIAN ---
    const [search, setSearch] = useState(filters?.search || "");
    const [categoryId, setCategoryId] = useState(filters?.category_id || "all");
    const isFirstRender = useRef(true);

    // --- AUTO-SEARCH DEBOUNCE ---
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                route("admin.products.index"),
                { search, category_id: categoryId },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search, categoryId]);

    // --- STATE MODAL HAPUS ---
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const confirmDelete = (id) => {
        setDeleteId(id);
        setIsDeleteOpen(true);
    };

    const handleDelete = () => {
        router.delete(route("admin.products.destroy", deleteId), {
            onSuccess: () => setIsDeleteOpen(false),
        });
    };

    return (
        <SellerLayout>
            <Head title="Produk Saya" />

            {/* HEADER ASLI LU (Tombol di kanan atas) */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Produk Saya
                    </h2>
                    <p className="text-muted-foreground">
                        Kelola katalog produk toko Anda.
                    </p>
                </div>
                <Link href={route("admin.products.create")}>
                    <Button>
                        <PlusCircle className="w-4 h-4 mr-2" /> Tambah Produk
                    </Button>
                </Link>
            </div>

            {/* --- AREA FILTER PENCARIAN & KATEGORI --- */}
            <div className="relative z-10 flex flex-col items-center justify-start gap-3 p-4 mb-4 bg-white border rounded-md sm:flex-row">
                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="w-4 h-4 text-gray-400" />
                    </div>
                    <Input
                        type="text"
                        placeholder="Cari nama produk..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Filter Kategori */}
                <div className="relative w-full sm:w-48">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Filter className="w-4 h-4 text-gray-400" />
                    </div>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full py-2 pl-10 pr-8 text-sm text-gray-900 transition-colors border rounded-md outline-none appearance-none cursor-pointer border-input bg-background ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <option value="all">Semua Kategori</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* TABEL ASLI LU */}
            <div className="mb-6 bg-white border rounded-md">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[80px]">Gambar</TableHead>
                            <TableHead>Nama Produk</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Berat ( Gram )</TableHead>
                            <TableHead>Harga</TableHead>
                            <TableHead>Stok</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.data.length > 0 ? (
                            products.data.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        {product.image ? (
                                            <img
                                                src={`/storage/${product.image}`}
                                                className="object-cover w-12 h-12 border rounded-md"
                                                alt={product.name}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-12 h-12 text-gray-400 bg-gray-100 rounded-md">
                                                <ImageIcon className="w-6 h-6" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {product.name}
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                                            {product.category?.name ||
                                                "Tanpa Kategori"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                                            {`${product.weight} Gram` ||
                                                "Berat belum diatur"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        Rp{" "}
                                        {product.price.toLocaleString("id-ID")}
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={
                                                product.stock < 5
                                                    ? "text-red-500 font-bold"
                                                    : ""
                                            }
                                        >
                                            {product.stock}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={route(
                                                    "admin.products.edit",
                                                    product.id,
                                                )}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </Link>

                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    confirmDelete(product.id)
                                                }
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="h-48 text-center text-muted-foreground"
                                >
                                    {search || categoryId !== "all"
                                        ? "Produk tidak ditemukan. Coba kata kunci lain."
                                        : "Belum ada produk. Yuk tambah sekarang!"}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* --- PAGINATION --- */}
                <div className="flex flex-col items-center gap-4 px-4 py-3 border-t bg-gray-50/50 sm:flex-row sm:justify-between rounded-b-md">
                    <div className="text-xs text-muted-foreground">
                        Menampilkan {products.from || 0} - {products.to || 0}{" "}
                        dari {products.total} produk
                    </div>
                    <div className="flex flex-wrap justify-center gap-1">
                        {products.links.map((link, i) =>
                            link.url ? (
                                <Link key={i} href={link.url}>
                                    <Button
                                        variant={
                                            link.active ? "default" : "outline"
                                        }
                                        size="sm"
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                </Link>
                            ) : (
                                <span
                                    key={i}
                                    className="px-3 py-2 text-sm border border-transparent text-muted-foreground"
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                ></span>
                            ),
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL HAPUS ASLI LU */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Produk Ini?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Produk akan dihapus permanen dari katalog toko Anda.
                            Aksi ini tidak bisa dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Ya, Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </SellerLayout>
    );
}
