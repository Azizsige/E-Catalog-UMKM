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
    Package2,
    LayoutDashboard,
    LogOut,
    Store,
    Package,
    ShoppingCart,
    Settings,
    ShieldAlert,
} from "lucide-react";
import { Toaster } from "@/Components/ui/sonner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SellerLayout({ children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;

    // Check apakah seller sudah di-approve admin
    const isApproved = user.status === "active";

    useEffect(() => {
        if (flash?.message) {
            toast.success(flash.message);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // List Menu Sidebar dengan logika filter status
    const allNavItems = [
        {
            label: "Dashboard",
            href: route("seller.dashboard"),
            active: route().current("seller.dashboard"),
            icon: LayoutDashboard,
            requireApproval: true,
        },
        {
            label: "Produk Saya",
            href: route("seller.products.index"),
            active: route().current("seller.products.*"),
            icon: Package,
            requireApproval: true,
        },
        {
            label: "Pesanan Masuk",
            href: route("seller.transactions.index"),
            active: route().current("seller.transactions.*"),
            icon: ShoppingCart,
            requireApproval: true,
        },
        {
            label: "Pengaturan Toko",
            href: route("seller.store.edit"),
            active:
                route().current("seller.store.edit") ||
                route().current("seller.register"),
            icon: Settings,
            requireApproval: false, // Boleh diakses kapan saja
        },
    ];

    // Filter menu berdasarkan status approval
    const navItems = allNavItems.filter(
        (item) => !item.requireApproval || isApproved
    );

    return (
        <div className="flex w-full min-h-screen bg-muted/40">
            {/* SIDEBAR DESKTOP */}
            <aside className="fixed inset-y-0 left-0 z-10 flex-col hidden w-64 gap-6 border-r bg-background md:flex shadow-sm">
                <div className="flex items-center px-6 border-b h-14 bg-white">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-lg font-extrabold text-blue-600 tracking-tight"
                    >
                        <Store className="w-6 h-6" />
                        <span>Seller Panel</span>
                    </Link>
                </div>

                <nav className="flex flex-col gap-2 px-4 py-4 text-sm font-medium flex-1">
                    {/* INFO STATUS (Jika Pending) */}
                    {!isApproved && (
                        <div className="mb-4 p-3 bg-orange-50 border border-orange-100 rounded-xl text-[11px] text-orange-700 font-medium flex gap-2 items-start">
                            <ShieldAlert className="w-4 h-4 shrink-0" />
                            <span>
                                Akun sedang menunggu verifikasi Admin. Lengkapi
                                profil toko Anda.
                            </span>
                        </div>
                    )}

                    {navItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-2.5 transition-all duration-200 rounded-xl group",
                                item.active
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                                    : "text-muted-foreground hover:text-blue-600 hover:bg-blue-50"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "w-4 h-4 transition-colors",
                                    item.active
                                        ? "text-white"
                                        : "text-gray-400 group-hover:text-blue-600"
                                )}
                            />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex flex-col w-full sm:gap-4 sm:py-4 sm:pl-64">
                {/* HEADER / TOPBAR */}
                <header className="sticky top-0 z-30 flex items-center gap-4 px-4 border-b h-14 bg-background sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                size="icon"
                                variant="outline"
                                className="sm:hidden"
                            >
                                <Menu className="w-5 h-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="left"
                            className="sm:max-w-xs text-gray-900"
                        >
                            <nav className="grid gap-6 text-lg font-medium mt-6">
                                <div className="flex items-center gap-2 text-blue-600 mb-4">
                                    <Store className="w-6 h-6" />
                                    <span className="font-bold">
                                        Seller Panel
                                    </span>
                                </div>
                                {navItems.map((item, index) => (
                                    <Link
                                        key={index}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-4 px-3 py-2 rounded-lg transition-colors",
                                            item.active
                                                ? "bg-blue-600 text-white"
                                                : "text-muted-foreground hover:text-blue-600"
                                        )}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>

                    {/* USER PROFILE DROPDOWN */}
                    <div className="flex items-center gap-2 ml-auto">
                        <div className="hidden md:block text-right mr-2">
                            <p className="text-xs font-bold text-gray-900">
                                {user.name}
                            </p>
                            <p
                                className={cn(
                                    "text-[10px] capitalize leading-none mt-1 font-bold",
                                    auth.user.status === "active"
                                        ? "text-green-600"
                                        : "text-orange-600"
                                )}
                            >
                                {/* Ubah pengecekan sesuai string di migrasi kamu ('active' bukan 'approved') */}
                                {auth.user.status === "active"
                                    ? "Active"
                                    : "Pending Approval"}
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
                                        <AvatarImage src={user.avatar_url} />
                                        <AvatarFallback className="bg-blue-100 text-blue-600 font-bold uppercase">
                                            {user.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-48 text-gray-900"
                            >
                                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <Link href="/" className="w-full">
                                        Lihat Toko
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    Pengaturan Profil
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                    <Link
                                        href={route("logout")}
                                        method="post"
                                        as="button"
                                        className="flex items-center w-full font-bold"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />{" "}
                                        Keluar
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="p-4 sm:px-6 sm:py-0">{children}</main>
            </div>
            <Toaster position="top-right" richColors />
        </div>
    );
}
