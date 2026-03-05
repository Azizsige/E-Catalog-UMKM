import { useState } from "react";
import SellerLayout from "@/Layouts/SellerLayout";
import { Head, useForm, router } from "@inertiajs/react";
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog"; // <--- Import Alert Dialog
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";

export default function CategoryIndex({ categories }) {
    // --- STATE CRUD MODAL ---
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    // --- STATE DELETE ALERT ---
    const [isDeleteOpen, setIsDeleteOpen] = useState(false); // Untuk buka/tutup alert delete
    const [deleteId, setDeleteId] = useState(null); // Simpan ID yang mau dihapus

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            name: "",
            icon: null,
            _method: "POST",
        });

    // --- LOGIKA REVISI 1: RESET FORM SAAT DIALOG DITUTUP ---
    const handleDialogChange = (open) => {
        setIsOpen(open);
        if (!open) {
            // Kalau dialog menutup (false), kita bersihkan semuanya
            reset();
            clearErrors();
            setIsEditing(false);
            setCurrentId(null);
        }
    };

    const openAddModal = () => {
        // Tidak perlu reset disini lagi, karena sudah di handleDialogChange
        // Cukup set mode nya saja
        setData({ name: "", icon: null, _method: "POST" });
        setIsEditing(false);
        setIsOpen(true);
    };

    const openEditModal = (category) => {
        setIsEditing(true);
        setCurrentId(category.id);
        setData({
            name: category.name,
            icon: null,
            _method: "PUT",
        });
        setIsOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            post(route("admin.categories.update", currentId), {
                onSuccess: () => setIsOpen(false), // handleDialogChange akan otomatis reset
            });
        } else {
            post(route("admin.categories.store"), {
                onSuccess: () => setIsOpen(false), // handleDialogChange akan otomatis reset
            });
        }
    };

    // --- LOGIKA REVISI 2: CUSTOM DELETE CONFIRMATION ---

    // 1. Klik tombol sampah -> Buka Alert
    const confirmDelete = (id) => {
        setDeleteId(id);
        setIsDeleteOpen(true);
    };

    // 2. Klik "Lanjutkan" di Alert -> Hapus data
    const executeDelete = () => {
        router.delete(route("admin.categories.destroy", deleteId), {
            onSuccess: () => {
                setIsDeleteOpen(false);
                setDeleteId(null);
            },
        });
    };

    return (
        <SellerLayout>
            <Head title="Manajemen Kategori" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Kategori
                    </h2>
                    <p className="text-muted-foreground">
                        Kelola kategori produk.
                    </p>
                </div>

                <Button onClick={openAddModal}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Tambah Kategori
                </Button>
            </div>

            {/* MODAL FORM (ADD / EDIT) */}
            <Dialog open={isOpen} onOpenChange={handleDialogChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing
                                ? "Edit Kategori"
                                : "Tambah Kategori Baru"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Kategori</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                            />
                            {errors.name && (
                                <span className="text-sm text-red-500">
                                    {errors.name}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="icon">
                                Icon Kategori{" "}
                                {isEditing &&
                                    "(Biarkan kosong jika tidak diganti)"}
                            </Label>
                            <Input
                                id="icon"
                                type="file"
                                onChange={(e) =>
                                    setData("icon", e.target.files[0])
                                }
                            />
                            {errors.icon && (
                                <span className="text-sm text-red-500">
                                    {errors.icon}
                                </span>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? "Menyimpan..." : "Simpan"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ALERT DIALOG KONFIRMASI DELETE (Revisi 2) */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Kategori ini
                            akan dihapus permanen dari database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={executeDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* TABEL */}
            <div className="bg-white border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">No</TableHead>
                            <TableHead>Icon</TableHead>
                            <TableHead>Nama Kategori</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category, index) => (
                            <TableRow key={category.id}>
                                <TableCell className="font-medium">
                                    {index + 1}
                                </TableCell>
                                <TableCell>
                                    {category.icon ? (
                                        <img
                                            src={`/storage/${category.icon}`}
                                            alt=""
                                            className="object-cover w-10 h-10 rounded-md"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center w-10 h-10 text-xs bg-gray-100 rounded-lg">
                                            IMG
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>{category.name}</TableCell>
                                <TableCell>{category.slug}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() =>
                                                openEditModal(category)
                                            }
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>

                                        {/* BUTTON DELETE MENGARAH KE FUNGSI BARU */}
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() =>
                                                confirmDelete(category.id)
                                            }
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </SellerLayout>
    );
}
