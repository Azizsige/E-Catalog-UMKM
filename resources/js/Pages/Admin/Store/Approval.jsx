import { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router } from "@inertiajs/react";
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
import { CheckCircle, XCircle, Store } from "lucide-react";

export default function StoreApproval({ sellers }) {
    // State untuk mengontrol Modal
    const [isOpen, setIsOpen] = useState(false);

    // State untuk menyimpan data sementara (Siapa yg mau dieksekusi & Aksi apa)
    const [targetData, setTargetData] = useState({
        id: null,
        type: null, // Bisa 'approve' atau 'reject'
    });

    // 1. Fungsi Buka Modal (Set data target dulu)
    const openConfirmModal = (id, type) => {
        setTargetData({ id, type });
        setIsOpen(true);
    };

    // 2. Fungsi Eksekusi (Jalanin sesuai tipe aksinya)
    const executeAction = () => {
        if (targetData.type === "approve") {
            router.put(
                route("admin.store-approval.approve", targetData.id),
                {},
                {
                    onSuccess: () => setIsOpen(false),
                }
            );
        } else if (targetData.type === "reject") {
            router.delete(route("admin.store-approval.reject", targetData.id), {
                onSuccess: () => setIsOpen(false),
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="Validasi Toko Baru" />

            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight">
                    Permintaan Toko Baru
                </h2>
                <p className="text-muted-foreground">
                    Daftar seller baru yang menunggu persetujuan Anda.
                </p>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">No</TableHead>
                            <TableHead>Nama Seller</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Tanggal Daftar</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sellers.length > 0 ? (
                            sellers.map((seller, index) => (
                                <TableRow key={seller.id}>
                                    <TableCell className="font-medium">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <Store className="h-4 w-4" />
                                            </div>
                                            <span className="font-medium">
                                                {seller.name}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{seller.email}</TableCell>
                                    <TableCell>
                                        {new Date(
                                            seller.created_at
                                        ).toLocaleDateString("id-ID")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {/* TOMBOL TOLAK -> Trigger Modal Reject */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() =>
                                                    openConfirmModal(
                                                        seller.id,
                                                        "reject"
                                                    )
                                                }
                                            >
                                                <XCircle className="mr-2 h-4 w-4" />
                                                Tolak
                                            </Button>

                                            {/* TOMBOL SETUJUI -> Trigger Modal Approve */}
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700"
                                                onClick={() =>
                                                    openConfirmModal(
                                                        seller.id,
                                                        "approve"
                                                    )
                                                }
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Setujui
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-48 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <CheckCircle className="h-8 w-8 mb-2 opacity-20" />
                                        <p>Tidak ada permintaan toko baru.</p>
                                        <p className="text-xs">
                                            Semua aman terkendali!
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* MODAL KONFIRMASI DINAMIS (Satu modal untuk 2 fungsi) */}
            <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {targetData.type === "approve"
                                ? "Setujui Toko Ini?"
                                : "Tolak Permintaan Toko?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {targetData.type === "approve"
                                ? "Seller akan diberikan akses penuh ke Dashboard Seller dan bisa mulai berjualan."
                                : "PERINGATAN: Akun seller akan dihapus permanen dari database. Tindakan ini tidak bisa dibatalkan."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={executeAction}
                            className={
                                targetData.type === "approve"
                                    ? "bg-green-600 hover:bg-green-700" // Warna Hijau kalau Approve
                                    : "bg-red-600 hover:bg-red-700" // Warna Merah kalau Reject
                            }
                        >
                            {targetData.type === "approve"
                                ? "Ya, Setujui"
                                : "Ya, Tolak"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
