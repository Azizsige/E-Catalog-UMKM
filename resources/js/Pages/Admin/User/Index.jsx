import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import { Search, Power, CheckCircle, Filter } from "lucide-react"; // Ganti Ban jadi Power
import { useState } from "react";

export default function UserIndex({ users, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [roleFilter, setRoleFilter] = useState(filters.role || ""); // State baru buat Role

    // Handle Search & Filter gabungan
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route("admin.users.index"),
            {
                search: searchTerm,
                role: roleFilter, // Kirim role juga
            },
            { preserveState: true }
        );
    };

    // Fungsi trigger pas ganti dropdown langsung search
    const handleRoleChange = (e) => {
        const selectedRole = e.target.value;
        setRoleFilter(selectedRole);
        router.get(
            route("admin.users.index"),
            {
                search: searchTerm,
                role: selectedRole,
            },
            { preserveState: true }
        );
    };

    const toggleStatus = (id, isActive) => {
        // Wording diganti jadi Nonaktifkan
        const action = isActive ? "MENONAKTIFKAN" : "MENGAKTIFKAN";
        if (
            confirm(
                `Yakin ingin ${action} user ini? User tidak akan bisa login.`
            )
        ) {
            router.put(route("admin.users.toggle", id));
        }
    };

    return (
        <AdminLayout>
            <Head title="Manajemen User" />

            <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
                <div>
                    <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
                    <p className="text-sm text-gray-500">
                        Kelola akses dan status pengguna.
                    </p>
                </div>

                {/* FORM PENCARIAN & FILTER */}
                <form
                    onSubmit={handleSearch}
                    className="flex flex-col w-full gap-2 sm:flex-row md:w-auto"
                >
                    {/* Dropdown Filter Role */}
                    <div className="relative">
                        <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <select
                            value={roleFilter}
                            onChange={handleRoleChange}
                            className="h-10 w-full sm:w-[150px] rounded-md border border-input bg-background pl-9 pr-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="">Semua Role</option>
                            <option value="admin">Admin</option>
                            <option value="seller">Seller</option>
                            <option value="customer">Buyer (User)</option>
                        </select>
                    </div>

                    {/* Input Keyword */}
                    <div className="flex gap-2">
                        <Input
                            placeholder="Cari nama / email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-64"
                        />
                        <Button type="submit" size="icon">
                            <Search className="w-4 h-4" />
                        </Button>
                    </div>
                </form>
            </div>

            <div className="overflow-hidden bg-white border rounded-lg shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead>Nama Pengguna</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status Akun</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.data.length > 0 ? (
                            users.data.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-bold text-gray-700">
                                        {user.name}
                                    </TableCell>
                                    <TableCell className="text-gray-500">
                                        {user.email}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                user.role === "admin"
                                                    ? "default"
                                                    : user.role === "seller"
                                                    ? "secondary"
                                                    : "outline"
                                            }
                                        >
                                            {user.role.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {user.is_active ? (
                                            <span className="text-green-600 flex items-center gap-1.5 text-xs font-bold bg-green-50 w-fit px-2 py-1 rounded-full border border-green-100">
                                                <CheckCircle className="w-3.5 h-3.5" />{" "}
                                                Aktif
                                            </span>
                                        ) : (
                                            <span className="text-gray-500 flex items-center gap-1.5 text-xs font-bold bg-gray-100 w-fit px-2 py-1 rounded-full border border-gray-200">
                                                <Power className="w-3.5 h-3.5" />{" "}
                                                Nonaktif
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {user.role !== "admin" && (
                                            <Button
                                                size="sm"
                                                variant={
                                                    user.is_active
                                                        ? "outline"
                                                        : "default"
                                                } // Kalau aktif, tombolnya outline (soft). Kalau mati, tombolnya solid (call to action)
                                                className={
                                                    user.is_active
                                                        ? "text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                        : "bg-green-600 hover:bg-green-700"
                                                }
                                                onClick={() =>
                                                    toggleStatus(
                                                        user.id,
                                                        user.is_active
                                                    )
                                                }
                                            >
                                                {user.is_active
                                                    ? "Nonaktifkan"
                                                    : "Aktifkan"}
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-24 italic text-center text-gray-500"
                                >
                                    Tidak ada user ditemukan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                <p>
                    Menampilkan {users.data.length} dari {users.total} user
                </p>
                {/* Pagination bisa ditaruh sini nanti */}
            </div>
        </AdminLayout>
    );
}
