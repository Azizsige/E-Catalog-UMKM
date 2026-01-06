import { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router } from "@inertiajs/react";
import {
    CheckCircle,
    XCircle,
    Store,
    Eye,
    MapPin,
    Phone,
    AlertCircle,
} from "lucide-react";
import Swal from "sweetalert2"; // Pastikan sudah npm install sweetalert2

export default function StoreApproval({ sellers }) {
    // State untuk menyimpan data seller yang sedang di-review
    const [selectedSeller, setSelectedSeller] = useState(null);

    // Format Tanggal Indonesia
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    // 1. Handle Approve dengan SweetAlert
    const handleApprove = (id) => {
        Swal.fire({
            title: "Setujui Toko ini?",
            text: "Seller akan langsung aktif dan bisa berjualan.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#d33",
            confirmButtonText: "Ya, Setujui!",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                router.put(
                    route("admin.store-approval.approve", id),
                    {},
                    {
                        onSuccess: () => {
                            setSelectedSeller(null); // Tutup modal
                            Swal.fire(
                                "Berhasil!",
                                "Toko telah disetujui.",
                                "success"
                            );
                        },
                    }
                );
            }
        });
    };

    // 2. Handle Reject dengan SweetAlert
    const handleReject = (id) => {
        Swal.fire({
            title: "Tolak Pengajuan?",
            text: "Data user dan toko akan dihapus permanen.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, Tolak & Hapus",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route("admin.store-approval.reject", id), {
                    onSuccess: () => {
                        setSelectedSeller(null); // Tutup modal
                        Swal.fire(
                            "Ditolak!",
                            "Data pengajuan telah dihapus.",
                            "success"
                        );
                    },
                });
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Validasi Toko Baru" />

            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                        Permintaan Toko Baru
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Review kelengkapan data toko sebelum memberikan akses
                        jualan.
                    </p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    Antrean: {sellers.length}
                </div>
            </div>

            {/* TABEL LIST PENGAJUAN */}
            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4">Tgl Daftar</th>
                            <th className="px-6 py-4">Seller</th>
                            <th className="px-6 py-4">Nama Toko</th>
                            <th className="px-6 py-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sellers.length > 0 ? (
                            sellers.map((seller) => (
                                <tr
                                    key={seller.id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4 text-gray-500 font-medium">
                                        {formatDate(seller.created_at)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                                {seller.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">
                                                    {seller.name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {seller.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {seller.store ? (
                                            <span className="font-medium text-blue-600">
                                                {seller.store.name}
                                            </span>
                                        ) : (
                                            <span className="text-red-500 text-xs italic">
                                                Data Error
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {/* TOMBOL REVIEW (MATA) */}
                                        <button
                                            onClick={() =>
                                                setSelectedSeller(seller)
                                            }
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all bg-indigo-600 rounded-lg hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-200"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Review Detail
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                        <CheckCircle className="w-12 h-12 mb-3 text-green-100 fill-green-500" />
                                        <p className="text-lg font-medium text-gray-900">
                                            Semua Bersih!
                                        </p>
                                        <p className="text-sm">
                                            Tidak ada pengajuan toko baru saat
                                            ini.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL REVIEW DETAIL (Pop-up Besar) */}
            {selectedSeller && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header Modal */}
                        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center shrink-0">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Store className="w-5 h-5 text-indigo-600" />
                                Review Kelayakan Toko
                            </h3>
                            <button
                                onClick={() => setSelectedSeller(null)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Body Modal (Scrollable) */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {/* Profile Seller */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-indigo-200">
                                    {selectedSeller.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Pemohon
                                    </p>
                                    <h4 className="text-2xl font-bold text-gray-900 leading-none mb-1">
                                        {selectedSeller.name}
                                    </h4>
                                    <p className="text-gray-500 font-medium">
                                        {selectedSeller.email}
                                    </p>
                                </div>
                            </div>

                            {/* Detail Toko Box */}
                            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-gray-50 px-4 py-2 border-b text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Data Toko
                                </div>

                                <div className="p-5 space-y-6">
                                    {selectedSeller.store ? (
                                        <>
                                            {/* Nama & Logo */}
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <label className="text-xs text-gray-400 block mb-1">
                                                        Nama Toko
                                                    </label>
                                                    <h2 className="text-xl font-extrabold text-blue-600">
                                                        {
                                                            selectedSeller.store
                                                                .name
                                                        }
                                                    </h2>
                                                </div>
                                                {selectedSeller.store.logo ? (
                                                    <img
                                                        src={`/storage/${selectedSeller.store.logo}`}
                                                        alt="Logo"
                                                        className="w-16 h-16 object-cover rounded-lg border shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400 border border-dashed text-[10px] text-center p-1">
                                                        No Logo
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                    <div className="flex items-center gap-2 text-indigo-600 mb-2">
                                                        <Phone className="w-4 h-4" />
                                                        <span className="text-xs font-bold uppercase">
                                                            Kontak
                                                        </span>
                                                    </div>
                                                    <p className="font-semibold text-gray-800">
                                                        {selectedSeller.store
                                                            .phone_number ||
                                                            "-"}
                                                    </p>
                                                </div>
                                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                    <div className="flex items-center gap-2 text-indigo-600 mb-2">
                                                        <MapPin className="w-4 h-4" />
                                                        <span className="text-xs font-bold uppercase">
                                                            Lokasi
                                                        </span>
                                                    </div>
                                                    <p className="font-medium text-sm text-gray-700 leading-relaxed">
                                                        {selectedSeller.store
                                                            .address || (
                                                            <span className="text-red-500 italic flex items-center gap-1">
                                                                <AlertCircle className="w-3 h-3" />{" "}
                                                                Belum diisi
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Deskripsi */}
                                            <div>
                                                <label className="text-xs text-gray-400 block mb-1">
                                                    Deskripsi Toko
                                                </label>
                                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-600 italic">
                                                    "
                                                    {selectedSeller.store
                                                        .description ||
                                                        "Tidak ada deskripsi."}
                                                    "
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-4 text-red-500">
                                            Data Store tidak ditemukan di
                                            database.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3 shrink-0">
                            <button
                                onClick={() => handleReject(selectedSeller.id)}
                                className="px-5 py-2.5 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-300 transition-all flex items-center gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                Tolak
                            </button>
                            <button
                                onClick={() => handleApprove(selectedSeller.id)}
                                className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-200 transition-all flex items-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Setujui Toko
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
