import { useState } from "react";
import SellerLayout from "@/Layouts/SellerLayout";
import { Head, Link, router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
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
import { PlusCircle, Package, ImageIcon, Trash2, Edit } from "lucide-react";

export default function ProductIndex({ products }) {
    // State buat Modal
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Buka Modal
    const confirmDelete = (id) => {
        setDeleteId(id);
        setIsDeleteOpen(true);
    };

    // Eksekusi Hapus
    const handleDelete = () => {
        router.delete(route("seller.products.destroy", deleteId), {
            onSuccess: () => setIsDeleteOpen(false),
        });
    };

    return (
        <SellerLayout>
            <Head title="Produk Saya" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Produk Saya
                    </h2>
                    <p className="text-muted-foreground">
                        Kelola katalog produk toko Anda.
                    </p>
                </div>
                <Link href={route("seller.products.create")}>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" /> Tambah Produk
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
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
                        {products.length > 0 ? (
                            products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        {product.image ? (
                                            <img
                                                src={`/storage/${product.image}`}
                                                className="w-12 h-12 rounded-md object-cover border"
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
                                                    "seller.products.edit",
                                                    product.id
                                                )}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>

                                            {/* Pemicu Modal */}
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
                                    Belum ada produk. Yuk tambah sekarang!
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* MODAL HAPUS */}
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
