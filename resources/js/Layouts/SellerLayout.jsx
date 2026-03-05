import { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
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
    ShoppingBag, // Icon tambahan untuk notif
    AlertTriangle, // Icon tambahan untuk notif
    CheckCircle2, // Icon tambahan untuk notif
} from "lucide-react";
import { Toaster } from "@/Components/ui/sonner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SellerLayout({ children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;

    // ✅ FIX 1: Ambil state awal dari localStorage biar nggak reset pas pindah halaman
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("sidebarCollapsed");
            return saved === "true";
        }
        return false;
    });

    // ✅ FIX 2: Simpan ke localStorage tiap kali tombol collapse diklik
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

    // --- DATA DUMMY NOTIFIKASI ---
    const dummyNotifications = [
        {
            id: 1,
            title: "Pesanan Baru #INV-001",
            desc: "Nasi Goreng Spesial (2x) menunggu konfirmasi.",
            time: "2 menit lalu",
            icon: ShoppingBag,
            color: "text-blue-500 bg-blue-50",
            unread: true,
        },
        {
            id: 2,
            title: "Stok Menipis!",
            desc: "Stok 'Ayam Bakar Madu' sisa 2 porsi.",
            time: "1 jam lalu",
            icon: AlertTriangle,
            color: "text-amber-500 bg-amber-50",
            unread: true,
        },
        {
            id: 3,
            title: "Pembayaran Berhasil",
            desc: "Pesanan #INV-000 atas nama Budi telah dibayar.",
            time: "3 jam lalu",
            icon: CheckCircle2,
            color: "text-emerald-500 bg-emerald-50",
            unread: false,
        },
    ];

    const unreadCount = dummyNotifications.filter((n) => n.unread).length;

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
    ];

    return (
        <div className="flex w-full min-h-screen bg-muted/40">
            {/* SIDEBAR DESKTOP */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-20 flex-col hidden gap-6 border-r bg-background md:flex shadow-sm transition-all duration-300 ease-in-out",
                    isCollapsed ? "w-[6rem]" : "w-64",
                )}
            >
                <div className="flex items-center justify-between px-4 border-b h-14 bg-white">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <Link href="/">
                            <Store className="w-6 h-6 text-orange-600 flex-shrink-0" />
                        </Link>
                        {!isCollapsed && (
                            <Link href="/">
                                <span className="text-lg font-extrabold text-orange-600 tracking-tight whitespace-nowrap">
                                    Juragan Lapak
                                </span>
                            </Link>
                        )}
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-orange-600 flex-shrink-0"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        <Menu className="w-5 h-5" />
                    </Button>
                </div>

                <nav className="flex flex-col gap-2 px-3 py-4 text-sm font-medium flex-1 overflow-x-hidden">
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
                                <span className="whitespace-nowrap transition-opacity duration-300">
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
                {/* HEADER / TOPBAR */}
                <header className="sticky top-0 z-30 flex items-center gap-4 px-4 border-b h-14 bg-background sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
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
                            className="sm:max-w-xs text-gray-900"
                        >
                            {/* ... (Konten Mobile Menu Tetap Sama) ... */}
                            <nav className="grid gap-6 text-lg font-medium mt-6">
                                <div className="flex items-center gap-2 text-orange-600 mb-4">
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

                    <div className="flex items-center gap-4 ml-auto">
                        {/* ✅ DROPDOWN NOTIFIKASI */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="relative text-gray-500 hover:text-orange-600 rounded-full"
                                >
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1.5 flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
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
                                <div className="max-h-80 overflow-y-auto">
                                    {dummyNotifications.map((notif) => (
                                        <DropdownMenuItem
                                            key={notif.id}
                                            className="cursor-pointer px-4 py-3 focus:bg-gray-50 flex items-start gap-3"
                                        >
                                            <div
                                                className={cn(
                                                    "p-2 rounded-full flex-shrink-0 mt-0.5",
                                                    notif.color,
                                                )}
                                            >
                                                <notif.icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <p
                                                    className={cn(
                                                        "text-sm font-medium",
                                                        notif.unread
                                                            ? "text-gray-900"
                                                            : "text-gray-600",
                                                    )}
                                                >
                                                    {notif.title}
                                                </p>
                                                <p className="text-xs text-gray-500 line-clamp-2">
                                                    {notif.desc}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-medium mt-1">
                                                    {notif.time}
                                                </p>
                                            </div>
                                            {notif.unread && (
                                                <div className="w-2 h-2 bg-orange-500 rounded-full ml-auto mt-1.5 flex-shrink-0"></div>
                                            )}
                                        </DropdownMenuItem>
                                    ))}
                                </div>
                                <DropdownMenuSeparator className="mb-0" />
                                <Link
                                    href="#"
                                    className="block w-full text-center py-2.5 text-xs font-semibold text-orange-600 hover:bg-orange-50 transition-colors rounded-b-md"
                                >
                                    Lihat Semua Notifikasi
                                </Link>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* USER PROFILE DROPDOWN (TETAP SAMA) */}
                        <div className="flex items-center gap-2">
                            {/* ... (Kodingan Profil User Sama Persis Kayak Sebelumnya) ... */}
                            <div className="hidden md:block text-right mr-2">
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
                                        className="rounded-full ring-2 ring-white shadow-sm"
                                    >
                                        <Avatar>
                                            <AvatarImage
                                                src={user.avatar_url}
                                            />
                                            <AvatarFallback className="bg-orange-100 text-orange-600 font-bold uppercase">
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
                                            className="flex w-full items-center cursor-pointer"
                                        >
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            <span>Kunjungi Website</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={route("profile.edit")}
                                            className="flex w-full items-center cursor-pointer"
                                        >
                                            <UserCircle className="mr-2 h-4 w-4" />
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

                <main className="p-4 sm:px-6 sm:py-0">{children}</main>
            </div>
            <Toaster position="top-right" richColors />
        </div>
    );
}
