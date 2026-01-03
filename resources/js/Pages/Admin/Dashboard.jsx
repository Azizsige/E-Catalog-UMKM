import AdminLayout from "@/Layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Head } from "@inertiajs/react";

export default function AdminDashboard() {
    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-4">
                {/* KARTU STATISTIK 1 */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">
                            Total Pendapatan
                        </CardTitle>
                        <span className="text-2xl font-bold">Rp 0</span>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            +0% dari bulan lalu
                        </p>
                    </CardContent>
                </Card>

                {/* KARTU STATISTIK 2 */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">
                            Toko Terdaftar
                        </CardTitle>
                        <span className="text-2xl font-bold">2</span>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            +1 baru minggu ini
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                <h3 className="mb-4 text-xl font-bold">Aktivitas Terbaru</h3>
                <div className="p-8 text-center border border-dashed rounded-lg text-muted-foreground">
                    Belum ada transaksi baru hari ini.
                </div>
            </div>
        </AdminLayout>
    );
}
