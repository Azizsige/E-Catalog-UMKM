import { useState } from "react";
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
import { Menu, Store, Package, ShoppingCart, LogOut, Home } from "lucide-react";

export default function SellerLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth.user;

    // MENU KHUSUS SELLER (Beda dengan Admin)
    const navItems = [
        { label: "Dashboard", href: route("seller.dashboard"), icon: Home },
        { label: "Produk Saya", href: "#", icon: Package }, // Nanti dibuat
        { label: "Pesanan Masuk", href: "#", icon: ShoppingCart }, // Nanti dibuat
        { label: "Pengaturan Toko", href: "#", icon: Store }, // Nanti dibuat
    ];

    return (
        <div className="flex w-full min-h-screen bg-muted/40">
            {/* SIDEBAR DESKTOP */}
            <aside className="fixed inset-y-0 left-0 z-10 flex-col hidden w-64 gap-6 border-r bg-background md:flex">
                <div className="flex items-center px-6 border-b h-14">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-lg font-bold text-blue-600"
                    >
                        <Store className="w-6 h-6" />
                        <span>Seller Panel</span>
                    </Link>
                </div>
                <nav className="flex flex-col gap-2 px-4 text-sm font-medium">
                    {navItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2 transition-all rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-blue-50"
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex flex-col w-full sm:gap-4 sm:py-4 sm:pl-64">
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
                        <SheetContent side="left" className="sm:max-w-xs">
                            <nav className="grid gap-6 text-lg font-medium">
                                <Link
                                    href="#"
                                    className="flex items-center gap-2 text-lg font-bold text-blue-600"
                                >
                                    <Store className="w-6 h-6" />
                                    <span>Seller Panel</span>
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
                                        <AvatarFallback>SL</AvatarFallback>
                                    </Avatar>
                                    <span className="sr-only">
                                        Toggle user menu
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Akun Toko</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Profil</DropdownMenuItem>
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

                <main className="p-4 sm:px-6 sm:py-0">{children}</main>
            </div>
        </div>
    );
}
