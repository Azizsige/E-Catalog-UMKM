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
    ShoppingBag,
    Users,
    LogOut,
    Tags,
} from "lucide-react";
import { Toaster } from "@/Components/ui/sonner";
import { toast } from "sonner";

export default function AdminLayout({ children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;

    useEffect(() => {
        if (flash?.message) {
            toast.success(flash.message);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // 👇 UPDATE 1: Ganti 'href' jadi 'routeName' biar bisa dicek active-nya
    const navItems = [
        {
            label: "Dashboard",
            routeName: "admin.dashboard",
            icon: LayoutDashboard,
        },
        {
            label: "Kategori",
            routeName: "admin.categories.index",
            icon: Tags,
        },
        {
            label: "Validasi Toko",
            routeName: "admin.store-approval.index",
            icon: ShoppingBag,
        },
        {
            label: "Manajemen User",
            routeName: "admin.users.index",
            icon: Users,
        },
    ];

    return (
        <div className="flex w-full min-h-screen bg-muted/40">
            {/* SIDEBAR DESKTOP */}
            <aside className="fixed inset-y-0 left-0 z-10 flex-col hidden w-64 gap-6 border-r bg-background md:flex">
                <div className="flex items-center px-6 border-b h-14">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-lg font-bold"
                    >
                        <Package2 className="w-6 h-6" />
                        <span>E-Catalog Admin</span>
                    </Link>
                </div>
                <nav className="flex flex-col gap-2 px-4 text-sm font-medium">
                    {navItems.map((item, index) => {
                        // 👇 UPDATE 2: Cek apakah route ini sedang aktif
                        const isActive = route().current(item.routeName);

                        return (
                            <Link
                                key={index}
                                href={route(item.routeName)} // Generate link dari nama route
                                className={`flex items-center gap-3 px-3 py-2 transition-all rounded-lg 
                                    ${
                                        isActive
                                            ? "bg-primary text-primary-foreground font-bold shadow-md" // Style kalau AKTIF (Warna Gelap)
                                            : "text-muted-foreground hover:text-primary hover:bg-muted" // Style kalau TIDAK AKTIF
                                    }
                                `}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex flex-col w-full sm:gap-4 sm:py-4 sm:pl-64">
                {/* HEADER / TOPBAR */}
                <header className="sticky top-0 z-30 flex items-center gap-4 px-4 border-b h-14 bg-background sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    {/* TRIGGER SIDEBAR MOBILE */}
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
                        <SheetContent side="left" className="sm:max-w-xs">
                            <nav className="grid gap-6 text-lg font-medium">
                                <Link
                                    href="#"
                                    className="flex items-center gap-2 text-lg font-bold"
                                >
                                    <Package2 className="w-6 h-6" />
                                    <span>E-Catalog</span>
                                </Link>
                                {/* 👇 UPDATE 3: Terapkan logic yang sama untuk Mobile Sidebar */}
                                {navItems.map((item, index) => {
                                    const isActive = route().current(
                                        item.routeName
                                    );
                                    return (
                                        <Link
                                            key={index}
                                            href={route(item.routeName)}
                                            className={`flex items-center gap-4 px-2.5 
                                                ${
                                                    isActive
                                                        ? "text-foreground font-bold" // Active Mobile
                                                        : "text-muted-foreground hover:text-foreground" // Inactive Mobile
                                                }
                                            `}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </SheetContent>
                    </Sheet>

                    {/* USER PROFILE DROPDOWN (KANAN ATAS) */}
                    <div className="flex items-center gap-2 ml-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="rounded-full"
                                >
                                    <Avatar>
                                        <AvatarImage src={user.avatar_url} />
                                        <AvatarFallback>AD</AvatarFallback>
                                    </Avatar>
                                    <span className="sr-only">
                                        Toggle user menu
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>
                                    My Account
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Settings</DropdownMenuItem>
                                <DropdownMenuItem>Support</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <Link
                                        href={route("logout")}
                                        method="post"
                                        as="button"
                                        className="flex items-center w-full"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />{" "}
                                        Logout
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* ISI KONTEN (PAGE) */}
                <main className="p-4 sm:px-6 sm:py-0">{children}</main>
            </div>
            <Toaster position="top-right" richColors />
        </div>
    );
}
