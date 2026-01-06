import { Head, Link, usePage } from "@inertiajs/react";
import { Button, buttonVariants } from "@/Components/ui/button";
import { LogOut, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Approval() {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <Head title="Menunggu Persetujuan" />

            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-8 h-8 text-yellow-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Akun Sedang Ditinjau
                </h1>
                <p className="text-gray-500 mb-6">
                    Halo <strong>{auth.user.name}</strong>, terima kasih sudah
                    mendaftar. Saat ini akun toko Anda sedang dalam antrian
                    verifikasi Admin. Proses ini biasanya memakan waktu 1x24
                    jam.
                </p>

                <div className="flex flex-col gap-3">
                    {/* REVISI: Arahkan langsung ke Dashboard Seller */}
                    <Link href={route("seller.dashboard")} className="w-full">
                        <Button variant="outline" className="w-full">
                            Coba Refresh Halaman
                        </Button>
                    </Link>

                    {/* Tombol Logout (Biarkan yang sudah fix tadi) */}
                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "w-full text-red-500 hover:text-red-600 hover:bg-red-50 justify-center"
                        )}
                    >
                        <LogOut className="mr-2 h-4 w-4" /> Keluar
                    </Link>
                </div>
            </div>
        </div>
    );
}
