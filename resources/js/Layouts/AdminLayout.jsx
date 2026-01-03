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
import { Toaster } from "@/Components/ui/sonner"; // <--- Import Toaster
import { toast } from "sonner"; // <--- Import function toast

export default function AdminLayout({ children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;

    useEffect(() => {
        if (flash?.message) {
            toast.success(flash.message); // Munculkan pesan sukses
        }
        if (flash?.error) {
            toast.error(flash.error); // Munculkan pesan error (opsional)
        }
    }, [flash]);

    // List Menu Sidebar
    const navItems = [
        {
            label: "Dashboard",
            href: route("admin.dashboard"),
            icon: LayoutDashboard,
        },
        {
            label: "Kategori",
            href: route("admin.categories.index"),
            icon: Tags,
        }, // <--- TAMBAHAN
        { label: "Validasi Toko", href: "#", icon: ShoppingBag }, // Nanti kita buat
        { label: "Manajemen User", href: "#", icon: Users }, // Nanti kita buat
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
                    {navItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2 transition-all rounded-lg text-muted-foreground hover:text-primary hover:bg-muted"
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </Link>
                    ))}
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
                                {navItems.map((item, index) => (
                                    <Link
                                        key={index}
                                        href={item.href}
                                        className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.label}
                                    </Link>
                                ))}
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
