import { useEffect } from "react";
import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import { Mail, Lock, ArrowRight, Store, ChevronLeft } from "lucide-react";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset("password");
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <div className="flex min-h-screen bg-white">
            <Head title="Masuk ke Akun" />

            {/* --- SISI KIRI: VISUAL & BRANDING (Hidden on Mobile) --- */}
            <div className="relative hidden w-0 flex-1 lg:block">
                <img
                    className="absolute inset-0 h-full w-full object-cover"
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
                    alt="UMKM Background"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-900/90 via-orange-900/40 to-transparent flex flex-col justify-end p-12">
                    <div className="max-w-md">
                        <div className="flex items-center gap-2 text-white mb-6">
                            <Store className="w-10 h-10" />
                            <span className="text-3xl font-black tracking-tighter">
                                Juragan Lapak
                            </span>
                        </div>
                        <h2 className="text-4xl font-bold text-white leading-tight mb-4">
                            Majukan UMKM Lokal <br />
                            Lewat Satu Genggaman.
                        </h2>
                        <p className="text-orange-100 text-lg">
                            Kelola produk, pantau pesanan, dan kembangkan
                            bisnismu lebih cepat dengan platform digital kami.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- SISI KANAN: FORM LOGIN --- */}
            <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    {/* Header Mobile */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <Store className="w-8 h-8 text-orange-600" />
                        <span className="text-xl font-black tracking-tighter text-gray-900">
                            Juragan Lapak
                        </span>
                    </div>

                    <Link
                        href="/"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-orange-600 mb-8 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Kembali ke
                        Beranda
                    </Link>

                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
                            Selamat Datang!
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Belum punya akun?{" "}
                            <Link
                                href={route("register")}
                                className="font-bold text-orange-600 hover:text-orange-500"
                            >
                                Daftar sekarang gratis
                            </Link>
                        </p>
                    </div>

                    <div className="mt-10">
                        {status && (
                            <div className="mb-4 font-medium text-sm text-green-600">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">
                                    Email
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="pl-10 block w-full border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
                                        autoComplete="username"
                                        isFocused={true}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        placeholder="nama@email.com"
                                    />
                                </div>
                                <InputError
                                    message={errors.email}
                                    className="mt-2"
                                />
                            </div>

                            {/* Password Field */}
                            <div>
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Password
                                    </label>
                                    {canResetPassword && (
                                        <Link
                                            href={route("password.request")}
                                            className="text-xs font-semibold text-orange-600 hover:text-orange-500"
                                        >
                                            Lupa password?
                                        </Link>
                                    )}
                                </div>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="pl-10 block w-full border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
                                        autoComplete="current-password"
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        placeholder="••••••••"
                                    />
                                </div>
                                <InputError
                                    message={errors.password}
                                    className="mt-2"
                                />
                            </div>

                            <div className="flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData("remember", e.target.checked)
                                    }
                                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-600 font-medium">
                                    Tetap masuk
                                </label>
                            </div>

                            <div>
                                <PrimaryButton
                                    className="w-full flex justify-center py-3 px-4 rounded-xl font-bold bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 shadow-lg shadow-orange-200"
                                    disabled={processing}
                                >
                                    {processing
                                        ? "Memproses..."
                                        : "Masuk Sekarang"}
                                    {!processing && (
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    )}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
