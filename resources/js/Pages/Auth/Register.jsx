import { useEffect } from "react";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import {
    User,
    Mail,
    Lock,
    ArrowRight,
    Store,
    ChevronLeft,
    UserPlus,
    ShoppingBag,
    CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        // 👇 TAMBAHKAN FIELD INI 👇
        role: "customer",
    });

    useEffect(() => {
        return () => {
            reset("password", "password_confirmation");
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route("register"));
    };

    return (
        <div className="flex min-h-screen bg-white text-gray-900">
            <Head title="Daftar Akun Baru" />

            {/* --- SISI KIRI (TETAP SAMA) --- */}
            <div className="relative hidden w-0 flex-1 lg:block">
                <img
                    className="absolute inset-0 h-full w-full object-cover"
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
                    alt="Register UMKM"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-900/90 via-orange-800/40 to-transparent flex flex-col justify-end p-12 text-white">
                    <div className="max-w-md">
                        <div className="flex items-center gap-2 mb-6">
                            <Store className="w-10 h-10" />
                            <span className="text-3xl font-black tracking-tighter">
                                Juragan Lapak
                            </span>
                        </div>
                        <h2 className="text-4xl font-bold leading-tight mb-4">
                            Mulai Perjalanan Bisnis Digitalmu.
                        </h2>
                        <p className="text-orange-100 text-lg">
                            Bergabunglah dengan ribuan pengusaha lokal lainnya.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- SISI KANAN: FORM REGISTER --- */}
            <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 overflow-y-auto">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <Link
                        href="/"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-orange-600 mb-8 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Kembali
                    </Link>

                    <div className="mb-8 text-center sm:text-left">
                        <h2 className="text-3xl font-extrabold tracking-tight">
                            Buat Akun Baru
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Sudah punya akun?{" "}
                            <Link
                                href={route("login")}
                                className="font-bold text-orange-600 hover:text-orange-500"
                            >
                                Masuk
                            </Link>
                        </p>
                    </div>

                    {/* 👇 SELEKTOR ROLE 👇 */}
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        <button
                            type="button"
                            onClick={() => setData("role", "customer")}
                            className={cn(
                                "relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all",
                                data.role === "customer"
                                    ? "border-orange-600 bg-orange-50 text-orange-700 shadow-sm"
                                    : "border-gray-100 hover:border-gray-200 text-gray-500"
                            )}
                        >
                            <ShoppingBag className="w-6 h-6 mb-2" />
                            <span className="text-xs font-bold uppercase">
                                Pembeli
                            </span>
                            {data.role === "customer" && (
                                <CheckCircle2 className="w-4 h-4 absolute top-2 right-2 text-orange-600" />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setData("role", "seller")}
                            className={cn(
                                "relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all",
                                data.role === "seller"
                                    ? "border-orange-600 bg-orange-50 text-orange-700 shadow-sm"
                                    : "border-gray-100 hover:border-gray-200 text-gray-500"
                            )}
                        >
                            <Store className="w-6 h-6 mb-2" />
                            <span className="text-xs font-bold uppercase">
                                Penjual
                            </span>
                            {data.role === "seller" && (
                                <CheckCircle2 className="w-4 h-4 absolute top-2 right-2 text-orange-600" />
                            )}
                        </button>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        {/* Info pendaftaran berubah sesuai role */}
                        {data.role === "seller" && (
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mb-4">
                                <p className="text-[11px] text-blue-700 leading-tight">
                                    <strong>Info:</strong> Setelah daftar
                                    sebagai Penjual, kamu akan diminta mengisi
                                    detail tokomu di langkah berikutnya.
                                </p>
                            </div>
                        )}

                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">
                                Nama Lengkap
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    className="pl-10 block w-full border-gray-300 rounded-xl focus:ring-orange-500"
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    placeholder="Nama Anda"
                                    required
                                />
                            </div>
                            <InputError
                                message={errors.name}
                                className="mt-2"
                            />
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">
                                Alamat Email
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
                                    className="pl-10 block w-full border-gray-300 rounded-xl focus:ring-orange-500"
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    placeholder="nama@email.com"
                                    required
                                />
                            </div>
                            <InputError
                                message={errors.email}
                                className="mt-2"
                            />
                        </div>

                        {/* Password Fields... (Lanjutkan seperti aslinya) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="pl-10 block w-full border-gray-300 rounded-xl focus:ring-orange-500"
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    placeholder="Min. 8 karakter"
                                    required
                                />
                            </div>
                            <InputError
                                message={errors.password}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700">
                                Konfirmasi Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="pl-10 block w-full border-gray-300 rounded-xl focus:ring-orange-500"
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Ulangi password"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <PrimaryButton
                                className="w-full flex justify-center py-3 px-4 rounded-xl font-bold bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-200 transition-all active:scale-95"
                                disabled={processing}
                            >
                                {processing
                                    ? "Mendaftarkan..."
                                    : `Daftar sebagai ${
                                          data.role === "seller"
                                              ? "Penjual"
                                              : "Pembeli"
                                      }`}
                                {!processing && (
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                )}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
