import SellerLayout from "@/Layouts/SellerLayout";
import { Head, Link, router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import Pagination from "@/Components/Pagination"; // Pastikan path ini bener
import {
    CheckCheck,
    ShoppingBag,
    AlertTriangle,
    CheckCircle2,
    Info,
    BellOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotificationIndex({ notifications }) {
    // Fungsi untuk Mark All as Read
    const handleMarkAllRead = () => {
        router.post(
            route("admin.notifications.readAll"),
            {},
            { preserveScroll: true },
        );
    };

    // Helper Icon & Style (Sama kaya di Layout)
    const getNotifStyle = (type) => {
        switch (type) {
            case "order":
                return {
                    icon: ShoppingBag,
                    color: "text-blue-500 bg-blue-50 border-blue-100",
                };
            case "stock":
                return {
                    icon: AlertTriangle,
                    color: "text-amber-500 bg-amber-50 border-amber-100",
                };
            case "payment":
                return {
                    icon: CheckCircle2,
                    color: "text-emerald-500 bg-emerald-50 border-emerald-100",
                };
            default:
                return {
                    icon: Info,
                    color: "text-gray-500 bg-gray-50 border-gray-200",
                };
        }
    };

    // Cek apakah ada notif yang belum dibaca buat enable/disable tombol
    const hasUnread = notifications.data.some((n) => n.read_at === null);

    return (
        <SellerLayout>
            <Head title="Semua Notifikasi" />

            <div className="max-w-4xl mx-auto py-8">
                {/* HEADER HALAMAN */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                            Semua Notifikasi
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            Pusat pemberitahuan aktivitas toko Anda.
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleMarkAllRead}
                        disabled={!hasUnread}
                        className="text-gray-600"
                    >
                        <CheckCheck className="w-4 h-4 mr-2 text-green-600" />
                        Tandai Semua Dibaca
                    </Button>
                </div>

                {/* LIST NOTIFIKASI */}
                <div className="bg-white border rounded-xl shadow-sm overflow-hidden mb-6">
                    {notifications.data.length > 0 ? (
                        <div className="divide-y">
                            {notifications.data.map((notif) => {
                                const isUnread = notif.read_at === null;
                                const type = notif.data?.icon_type || "info";
                                const { icon: NotifIcon, color } =
                                    getNotifStyle(type);

                                return (
                                    <Link
                                        key={notif.id}
                                        href={route(
                                            "admin.notifications.read",
                                            notif.id,
                                        )}
                                        className={cn(
                                            "flex items-start gap-4 p-5 transition-colors hover:bg-gray-50",
                                            isUnread
                                                ? "bg-orange-50/30"
                                                : "bg-white",
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "p-3 rounded-full border shrink-0",
                                                color,
                                            )}
                                        >
                                            <NotifIcon className="w-5 h-5" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <h4
                                                    className={cn(
                                                        "text-base",
                                                        isUnread
                                                            ? "font-bold text-gray-900"
                                                            : "font-medium text-gray-700",
                                                    )}
                                                >
                                                    {notif.data?.title ||
                                                        "Notifikasi Baru"}
                                                </h4>
                                                <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                                                    {new Date(
                                                        notif.created_at,
                                                    ).toLocaleDateString(
                                                        "id-ID",
                                                        {
                                                            day: "numeric",
                                                            month: "short",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        },
                                                    )}
                                                </span>
                                            </div>
                                            <p
                                                className={cn(
                                                    "text-sm leading-relaxed",
                                                    isUnread
                                                        ? "text-gray-700"
                                                        : "text-gray-500",
                                                )}
                                            >
                                                {notif.data?.message ||
                                                    "Tidak ada deskripsi."}
                                            </p>
                                        </div>

                                        {isUnread && (
                                            <div className="w-2.5 h-2.5 bg-orange-500 rounded-full mt-2 shrink-0 shadow-sm" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BellOff className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">
                                Tidak ada notifikasi
                            </h3>
                            <p className="text-sm text-gray-500">
                                Toko Anda belum memiliki aktivitas terbaru.
                            </p>
                        </div>
                    )}
                </div>

                {/* PAGINATION */}
                {notifications.data.length > 0 && (
                    <Pagination links={notifications.links} />
                )}
            </div>
        </SellerLayout>
    );
}
