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
                        <PlusCircle className="mr-2 h-4 w-4" /> Tambah Produk
                    </Button>
                </Link>
            </div>

            {/* --- AREA FILTER PENCARIAN & KATEGORI --- */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 bg-white p-4 rounded-md border items-center justify-start z-10 relative">
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
                        className="w-full pl-10 pr-8 py-2 text-sm border border-input bg-background rounded-md outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors cursor-pointer appearance-none text-gray-900"
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
            <div className="rounded-md border bg-white mb-6">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[80px]">Gambar</TableHead>
                            <TableHead>Nama Produk</TableHead>
                            <TableHead>Kategori</TableHead>
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
                                                className="w-12 h-12 rounded-md object-cover border"
                                                alt={product.name}
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
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
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>

                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    confirmDelete(product.id)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
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
                <div className="px-4 py-3 border-t bg-gray-50/50 flex flex-col sm:flex-row sm:justify-between items-center gap-4 rounded-b-md">
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
                                    className="px-3 py-2 text-sm text-muted-foreground border border-transparent"
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
