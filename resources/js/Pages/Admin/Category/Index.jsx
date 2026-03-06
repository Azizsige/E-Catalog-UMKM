import { useState, useEffect, useRef } from "react";
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
} from "@/Components/ui/alert-dialog";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { PlusCircle, Pencil, Trash2, Search, Tags } from "lucide-react"; // Import Icon Search & Tags

export default function CategoryIndex({ categories, filters }) {
    // --- STATE PENCARIAN ---
    const [search, setSearch] = useState(filters?.search || "");
    const isFirstRender = useRef(true);

    // --- AUTO-SEARCH DEBOUNCE ---
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                route("admin.categories.index"),
                { search },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    // --- STATE CRUD MODAL ---
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    // --- STATE DELETE ALERT ---
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            name: "",
            icon: null,
            _method: "POST",
        });

    const handleDialogChange = (open) => {
        setIsOpen(open);
        if (!open) {
            reset();
            clearErrors();
            setIsEditing(false);
            setCurrentId(null);
        }
    };

    const openAddModal = () => {
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
                onSuccess: () => setIsOpen(false),
            });
        } else {
            post(route("admin.categories.store"), {
                onSuccess: () => setIsOpen(false),
            });
        }
    };

    const confirmDelete = (id) => {
        setDeleteId(id);
        setIsDeleteOpen(true);
    };

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

            {/* HEADER ASLI LU */}
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

            {/* --- AREA FILTER PENCARIAN --- */}
            <div className="flex flex-col sm:flex-row mb-4 bg-white p-4 rounded-md border items-center justify-start z-10 relative">
                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="w-4 h-4 text-gray-400" />
                    </div>
                    <Input
                        type="text"
                        placeholder="Cari nama kategori..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
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

            {/* ALERT DIALOG KONFIRMASI DELETE */}
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

            {/* TABEL KATEGORI */}
            <div className="bg-white border rounded-md mb-10 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[100px]">No</TableHead>
                            <TableHead>Icon</TableHead>
                            <TableHead>Nama Kategori</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.length > 0 ? (
                            categories.map((category, index) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell>
                                        {category.icon ? (
                                            <img
                                                src={`/storage/${category.icon}`}
                                                alt={category.name}
                                                className="object-cover w-10 h-10 rounded-md border"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-10 h-10 text-gray-400 bg-gray-100 rounded-md">
                                                <Tags className="w-5 h-5" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-semibold text-gray-900">
                                        {category.name}
                                    </TableCell>
                                    <TableCell className="text-gray-500">
                                        {category.slug}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    openEditModal(category)
                                                }
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>

                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    confirmDelete(category.id)
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
                                    colSpan={5}
                                    className="h-48 text-center text-muted-foreground"
                                >
                                    {search
                                        ? "Kategori tidak ditemukan. Coba kata kunci lain."
                                        : "Belum ada kategori. Klik Tambah Kategori untuk memulai."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </SellerLayout>
    );
}
