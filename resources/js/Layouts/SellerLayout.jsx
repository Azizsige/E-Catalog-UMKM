import { useState, useEffect } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/Components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import {
    Menu,
    LayoutDashboard,
    LogOut,
    Store,
    Package,
    ShoppingCart,
    Settings,
    Tags,
    UserCircle,
    ExternalLink,
    Bell,
    ShoppingBag,
    AlertTriangle,
    CheckCircle2,
    Info,
    FileText,
} from "lucide-react";
import { Toaster } from "@/Components/ui/sonner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SellerLayout({ children }) {
    const { auth, flash, notifications } = usePage().props;
    const user = auth.user;

    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("sidebarCollapsed");
            return saved === "true";
        }
        return false;
    });

    useEffect(() => {
        localStorage.setItem("sidebarCollapsed", isCollapsed);
    }, [isCollapsed]);

    useEffect(() => {
        if (flash?.message) {
            toast.success(flash.message);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // --- LOGIC BACA NOTIFIKASI DARI DATABASE ---
    // --- LOGIC BACA NOTIFIKASI DARI DATABASE & REAL-TIME ---
    const [notifData, setNotifData] = useState(notifications?.data || []);
    const [unreadCount, setUnreadCount] = useState(
        notifications?.unread_count || 0,
    );

    // Sinkronisasi kalau pindah halaman via Inertia
    // Sinkronisasi kalau pindah halaman via Inertia
    const notifString = JSON.stringify(notifications); // Trik anti-overwrite

    useEffect(() => {
        setNotifData(notifications?.data || []);
        setUnreadCount(notifications?.unread_count || 0);
    }, [notifString]); // <--- Ganti dependency-nya pakai notifString

    // SIHIR PENANGKAP SINYAL (LARAVEL ECHO)
    useEffect(() => {
        // Pastikan Echo udah jalan dan user udah login
        if (user && window.Echo) {
            // Dengerin saluran pribadi milik Admin ini (User ID)
            const channel = window.Echo.private(`App.Models.User.${user.id}`);

            // Tangkap notifikasi yang masuk
            channel.notification((notification) => {
                console.log("NOTIF REAL-TIME MASUK:", notification);

                // Ambil style berdasarkan tipe notif
                const style = getNotifStyle(notification.icon_type);
                const iconType =
                    notification.icon_type || notification.data?.icon_type;
                const NotifIcon = getNotifStyle(iconType).icon;

                // 1. Munculin Toast Premium Custom!
                // 1. Munculin Toast Solid Color yang BISA DIKLIK!
                const toastId = toast(
                    // Kita bungkus isinya pakai elemen DIV yang interaktif
                    <div
                        className="flex flex-col w-full py-1"
                        onClick={() => {
                            if (notification.id) {
                                // Arahin pakai router Inertia
                                router.get(
                                    route(
                                        "admin.notifications.read",
                                        notification.id,
                                    ),
                                );
                                // Lenyapkan HANYA toast yang diklik ini
                                toast.dismiss(toastId);
                            }
                        }}
                    >
                        <span className="text-sm font-bold text-white">
                            {notification.title || notification.data?.title}
                        </span>
                        <span className="mt-1 text-xs font-medium leading-relaxed text-white/90">
                            {notification.message || notification.data?.message}
                        </span>
                    </div>,
                    {
                        duration: Infinity,
                        // Styling kotak luarnya
                        className: cn(
                            "cursor-pointer transition-all hover:scale-[1.02] shadow-xl border !p-4",
                            style.toastBg,
                        ),
                    },
                );

                // 2. Otomatis nambahin Lonceng Merah (+1)
                setUnreadCount((prev) => prev + 1);

                // 3. Masukin data notif baru ke daftar teratas (dropdown)
                // Kita format strukturnya biar mirip dari database
                const newNotif = {
                    id: notification.id,
                    data: {
                        title: notification.title,
                        message: notification.message,
                        icon_type: notification.icon_type,
                        transaction_id: notification.transaction_id,
                    },
                    created_at: new Date().toISOString(),
                    unread: true, // Kasih tanda titik merah
                };
                setNotifData((prev) => [newNotif, ...prev].slice(0, 10)); // Simpan 10 terbaru aja
            });

            // Bersihin saluran pas komponen ditutup
            return () => {
                window.Echo.leave(`App.Models.User.${user.id}`);
            };
        }
    }, [user]);

    const getNotifStyle = (type) => {
        switch (type) {
            case "order":
                return {
                    icon: ShoppingBag,
                    color: "text-blue-600 bg-blue-100", // Buat Dropdown Lonceng
                    toastBg: "!bg-blue-600 !text-white !border-blue-700", // Buat Toast (Background Biru Penuh)
                };
            case "stock":
                return {
                    icon: AlertTriangle,
                    color: "text-amber-600 bg-amber-100",
                    toastBg: "!bg-amber-500 !text-white !border-amber-600",
                };
            case "payment":
                return {
                    icon: CheckCircle2,
                    color: "text-emerald-600 bg-emerald-100",
                    toastBg: "!bg-emerald-500 !text-white !border-emerald-600",
                };
            case "error":
            case "cancel":
                return {
                    icon: AlertTriangle,
                    color: "text-red-600 bg-red-100",
                    toastBg: "!bg-red-600 !text-white !border-red-700",
                };
            default:
                return {
                    icon: Info,
                    color: "text-gray-600 bg-gray-100",
                    toastBg: "!bg-gray-800 !text-white !border-gray-900",
                };
        }
    };

    const navItems = [
        {
            label: "Dashboard",
            href: route("admin.dashboard"),
            active: route().current("admin.dashboard"),
            icon: LayoutDashboard,
        },
        {
            label: "Daftar Pesanan",
            href: route("admin.transactions.index"),
            active: route().current("admin.transactions.*"),
            icon: ShoppingCart,
        },
        {
            label: "Katalog Menu",
            href: route("admin.products.index"),
            active: route().current("admin.products.*"),
            icon: Package,
        },
        {
            label: "Kategori Menu",
            href: route("admin.categories.index"),
            active: route().current("admin.categories.*"),
            icon: Tags,
        },
        {
            label: "Info Bisnis",
            href: route("admin.store.edit"),
            active: route().current("admin.store.edit"),
            icon: Settings,
        },
        {
            label: "Laporan Penjualan",
            href: route("admin.reports.index"),
            active: route().current("admin.reports.*"),
            icon: FileText, // atau bisa pakai icon bar-chart dll dari lucide-react
        },
    ];

    return (
        <div className="flex w-full min-h-screen bg-muted/40">
            <Head>
                <link
                    rel="icon"
                    type="image/png"
                    href={
                        auth?.user?.store?.logo
                            ? `/storage/${auth.user.store.logo}`
                            : "/favicon.ico"
                    }
                />
            </Head>
            {/* SIDEBAR DESKTOP */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-20 flex-col hidden gap-6 border-r bg-background md:flex shadow-sm transition-all duration-300 ease-in-out",
                    isCollapsed ? "w-[6rem]" : "w-64",
                )}
            >
                <div className="flex items-center justify-between px-4 mt-4 bg-white border-b h-14">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <Link href="/">
                            <Store className="flex-shrink-0 w-6 h-6 text-orange-600" />
                        </Link>
                        {!isCollapsed && (
                            <Link href="/">
                                <span className="text-lg font-extrabold tracking-tight text-orange-600 whitespace-nowrap">
                                    Juragan Lapak
                                </span>
                            </Link>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 text-gray-500 hover:text-orange-600"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        <Menu className="w-5 h-5" />
                    </Button>
                </div>

                <nav className="flex flex-col flex-1 gap-2 px-3 py-4 overflow-x-hidden text-sm font-medium">
                    {navItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            title={isCollapsed ? item.label : ""}
                            className={cn(
                                "flex items-center gap-3 py-2.5 transition-all duration-200 rounded-xl group",
                                isCollapsed ? "justify-center px-0" : "px-4",
                                item.active
                                    ? "bg-orange-600 text-white shadow-md shadow-orange-100"
                                    : "text-muted-foreground hover:text-orange-600 hover:bg-orange-50",
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "w-5 h-5 flex-shrink-0 transition-colors",
                                    item.active
                                        ? "text-white"
                                        : "text-gray-400 group-hover:text-orange-600",
                                )}
                            />
                            {!isCollapsed && (
                                <span className="transition-opacity duration-300 whitespace-nowrap">
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div
                className={cn(
                    "flex flex-col w-full sm:gap-4 sm:py-4 transition-all duration-300 ease-in-out",
                    isCollapsed ? "md:pl-20" : "md:pl-64",
                )}
            >
                {/* --- HEADER / TOPBAR (UPDATED) --- */}
                {/* Perubahan: Tambahin bg-white, shadow-sm, rounded-xl di layar gede */}
                <header className="sticky top-0 z-30 flex items-center gap-4 px-4 bg-white border-b h-14 sm:static sm:h-16 sm:border sm:rounded-xl sm:shadow-sm sm:px-6 sm:mx-6 sm:mb-2">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                size="icon"
                                variant="outline"
                                className="md:hidden"
                            >
                                <Menu className="w-5 h-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="left"
                            className="text-gray-900 sm:max-w-xs"
                        >
                            <nav className="grid gap-6 mt-6 text-lg font-medium">
                                <div className="flex items-center gap-2 mb-4 text-orange-600">
                                    <Store className="w-6 h-6" />
                                    <span className="font-bold">
                                        Juragan Lapak
                                    </span>
                                </div>
                                {navItems.map((item, index) => (
                                    <Link
                                        key={index}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-4 px-3 py-2 rounded-lg transition-colors",
                                            item.active
                                                ? "bg-orange-600 text-white"
                                                : "text-muted-foreground hover:text-orange-600",
                                        )}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>

                    {/* Judul Halaman (Opsional, cakep buat di header) */}
                    <div className="items-center hidden sm:flex">
                        <span className="text-sm font-semibold text-gray-500">
                            Dashboard Panel
                        </span>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        {/* --- DROPDOWN NOTIFIKASI REAL DATA (UPDATED) --- */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="relative text-gray-500 rounded-full hover:text-orange-600 hover:bg-orange-50"
                                >
                                    <Bell className="w-5 h-5" />

                                    {/* Perubahan: Ganti Titik Kedip jadi Angka Merah */}
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white border-2 border-white">
                                            {unreadCount > 99
                                                ? "99+"
                                                : unreadCount}
                                        </span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80">
                                <div className="flex items-center justify-between px-4 py-2 border-b">
                                    <span className="font-bold text-gray-900">
                                        Notifikasi
                                    </span>
                                    {unreadCount > 0 && (
                                        <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full font-semibold">
                                            {unreadCount} Baru
                                        </span>
                                    )}
                                </div>

                                <div className="overflow-y-auto max-h-80">
                                    {notifData.length > 0 ? (
                                        notifData.map((notif) => {
                                            const NotifIcon = getNotifStyle(
                                                notif.icon_type,
                                            ).icon;
                                            return (
                                                <DropdownMenuItem
                                                    key={notif.id}
                                                    className="flex items-start gap-3 p-0 px-4 py-3 cursor-pointer focus:bg-gray-50"
                                                    asChild
                                                >
                                                    <Link
                                                        href={route(
                                                            "admin.notifications.read",
                                                            notif.id,
                                                        )}
                                                        className="flex items-start w-full gap-3 px-4 py-3"
                                                    >
                                                        <div
                                                            className={cn(
                                                                "p-2 rounded-full flex-shrink-0 mt-0.5",
                                                                getNotifStyle(
                                                                    notif.icon_type,
                                                                ).color,
                                                            )}
                                                        >
                                                            <NotifIcon className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex flex-col flex-1 gap-1">
                                                            <p
                                                                className={cn(
                                                                    "text-sm font-medium",
                                                                    notif.unread
                                                                        ? "text-gray-900"
                                                                        : "text-gray-600",
                                                                )}
                                                            >
                                                                {/* FIX: Pakai OR (||) biar support dari DB maupun Realtime */}
                                                                {notif.title ||
                                                                    notif.data
                                                                        ?.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500 line-clamp-2">
                                                                {/* FIX: Pakai OR (||) juga di sini */}
                                                                {notif.desc ||
                                                                    notif.message ||
                                                                    notif.data
                                                                        ?.message}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 font-medium mt-1">
                                                                {/* FIX: Kalau dari realtime belum ada jam, kasih default 'Baru saja' */}
                                                                {notif.time ||
                                                                    "Baru saja"}
                                                            </p>
                                                        </div>
                                                        {notif.unread && (
                                                            <div className="w-2 h-2 bg-orange-500 rounded-full ml-auto mt-1.5 flex-shrink-0"></div>
                                                        )}
                                                    </Link>
                                                </DropdownMenuItem>
                                            );
                                        })
                                    ) : (
                                        <div className="py-6 text-sm text-center text-gray-500">
                                            Belum ada notifikasi.
                                        </div>
                                    )}
                                </div>

                                <DropdownMenuSeparator className="mb-0" />
                                <Link
                                    href={route("admin.notifications.index")}
                                    className="block w-full text-center py-2.5 text-xs font-semibold text-orange-600 hover:bg-orange-50 transition-colors rounded-b-md"
                                >
                                    Lihat Semua Notifikasi
                                </Link>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* --- USER PROFILE DROPDOWN --- */}
                        <div className="flex items-center gap-2">
                            <div className="hidden mr-2 text-right md:block">
                                <p className="text-xs font-bold text-gray-900">
                                    {user.name}
                                </p>
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-1 font-bold">
                                    Administrator
                                </p>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="transition-all rounded-full shadow-sm ring-2 ring-gray-100 hover:ring-orange-200"
                                    >
                                        <Avatar>
                                            <AvatarImage
                                                src={user.avatar_url}
                                            />
                                            <AvatarFallback className="font-bold text-orange-600 uppercase bg-orange-100">
                                                {user.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56 text-gray-900"
                                >
                                    <DropdownMenuLabel>
                                        Akun Admin
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/"
                                            className="flex items-center w-full cursor-pointer"
                                        >
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            <span>Kunjungi Website</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={route("profile.edit")}
                                            className="flex items-center w-full cursor-pointer"
                                        >
                                            <UserCircle className="w-4 h-4 mr-2" />
                                            <span>Pengaturan Akun</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        asChild
                                        className="text-red-600 focus:bg-red-50 focus:text-red-700"
                                    >
                                        <Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                            className="flex items-center w-full font-bold cursor-pointer"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Keluar
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* --- RENDER KONTEN HALAMAN --- */}
                <main className="p-4 sm:px-6 sm:py-2">{children}</main>
            </div>
            <Toaster
                position="top-right"
                closeButton={true}
                visibleToasts={3}
                expand={true}
                toastOptions={{
                    classNames: {
                        title: "text-sm font-bold",
                        description: "text-xs mt-1 leading-relaxed",
                        // Tombol X pakai background hitam transparan biar masuk ke semua warna
                        closeButton:
                            "!left-auto !right-3 !top-3 !bg-black/20 hover:!bg-black/40 !text-white !border-none transition-colors",
                    },
                }}
            />
        </div>
    );
}
