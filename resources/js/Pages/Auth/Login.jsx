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
            <div className="relative flex-1 hidden w-0 lg:block">
                <img
                    className="absolute inset-0 object-cover w-full h-full"
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
                    alt="UMKM Background"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-12 bg-gradient-to-t from-orange-900/90 via-orange-900/40 to-transparent">
                    <div className="max-w-md">
                        <div className="flex items-center gap-2 mb-6 text-white">
                            <Store className="w-10 h-10" />
                            <span className="text-3xl font-black tracking-tighter">
                                Juragan Lapak
                            </span>
                        </div>
                        <h2 className="mb-4 text-4xl font-bold leading-tight text-white">
                            Majukan UMKM Lokal <br />
                            Lewat Satu Genggaman.
                        </h2>
                        <p className="text-lg text-orange-100">
                            Kelola produk, pantau pesanan, dan kembangkan
                            bisnismu lebih cepat dengan platform digital kami.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- SISI KANAN: FORM LOGIN --- */}
            <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div className="w-full max-w-sm mx-auto lg:w-96">
                    {/* Header Mobile */}
                    <div className="flex items-center gap-2 mb-8 lg:hidden">
                        <Store className="w-8 h-8 text-orange-600" />
                        <span className="text-xl font-black tracking-tighter text-gray-900">
                            Juragan Lapak
                        </span>
                    </div>

                    <Link
                        href="/"
                        className="inline-flex items-center mb-8 text-sm text-gray-500 transition-colors hover:text-orange-600"
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
                            <div className="mb-4 text-sm font-medium text-green-600">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">
                                    Email
                                </label>
                                <div className="relative mt-1 rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="block w-full pl-10 border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
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
                                <div className="relative mt-1 rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Lock className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="block w-full pl-10 border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
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
                                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <label className="block ml-2 text-sm font-medium text-gray-600">
                                    Tetap masuk
                                </label>
                            </div>

                            <div>
                                <PrimaryButton
                                    className="flex justify-center w-full px-4 py-3 font-bold bg-orange-600 shadow-lg rounded-xl hover:bg-orange-700 focus:ring-orange-500 shadow-orange-200"
                                    disabled={processing}
                                >
                                    {processing
                                        ? "Memproses..."
                                        : "Masuk Sekarang"}
                                    {!processing && (
                                        <ArrowRight className="w-5 h-5 ml-2" />
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
