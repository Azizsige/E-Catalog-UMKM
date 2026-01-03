import SellerLayout from "@/Layouts/SellerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Head } from "@inertiajs/react";

export default function SellerDashboard() {
    return (
        <SellerLayout>
            <Head title="Seller Dashboard" />

            <div className="grid gap-4 mt-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">
                            Total Penjualan
                        </CardTitle>
                        <span className="text-2xl font-bold">Rp 0</span>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Bulan ini
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">
                            Pesanan Baru
                        </CardTitle>
                        <span className="text-2xl font-bold">0</span>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Perlu diproses
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">
                            Total Produk
                        </CardTitle>
                        <span className="text-2xl font-bold">0</span>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Aktif di etalase
                        </p>
                    </CardContent>
                </Card>
            </div>
        </SellerLayout>
    );
}
