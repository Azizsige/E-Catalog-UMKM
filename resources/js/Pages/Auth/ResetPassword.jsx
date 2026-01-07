import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, useForm } from "@inertiajs/react";
import { Store, Lock, ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { useEffect } from "react";

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: "",
        password_confirmation: "",
    });

    useEffect(() => {
        return () => {
            reset("password", "password_confirmation");
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route("password.store"));
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
            <Head title="Reset Password" />

            {/* --- CARD CONTAINER --- */}
            <div className="w-full max-w-md overflow-hidden bg-white border border-gray-100 shadow-xl rounded-2xl">
                {/* Header Dekoratif */}
                <div className="relative p-6 overflow-hidden text-center bg-orange-600">
                    {/* Pattern Background */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <svg
                            className="w-full h-full"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                        >
                            <path
                                d="M0 100 C 20 0 50 0 100 100 Z"
                                fill="white"
                            />
                        </svg>
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="p-3 mb-3 rounded-full bg-white/20 backdrop-blur-sm">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-white">
                            Password Baru
                        </h2>
                        <p className="mt-1 text-sm text-orange-100">
                            Amankan akun Juragan Lapak-mu
                        </p>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-8">
                    <form onSubmit={submit} className="space-y-5">
                        {/* Email (Read Only) */}
                        <div>
                            <label className="block mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                                Email Akun
                            </label>
                            <div className="relative rounded-md shadow-sm opacity-70">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                </div>
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="block w-full py-3 pl-10 text-gray-500 bg-gray-100 border-gray-200 cursor-not-allowed rounded-xl focus:ring-0"
                                    readOnly
                                />
                                {/* Icon Gembok Kecil di kanan menandakan terkunci */}
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <Lock className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                            <InputError
                                message={errors.email}
                                className="mt-2"
                            />
                        </div>

                        <div className="my-4 border-t border-gray-100"></div>

                        {/* Password Baru */}
                        <div>
                            <label className="block mb-2 text-xs font-bold tracking-wider text-gray-700 uppercase">
                                Password Baru
                            </label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Lock className="w-5 h-5 text-gray-400" />
                                </div>
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="block w-full py-3 pl-10 transition-all border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
                                    autoComplete="new-password"
                                    isFocused={true}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    placeholder="Minimal 8 karakter"
                                />
                            </div>
                            <InputError
                                message={errors.password}
                                className="mt-2"
                            />
                        </div>

                        {/* Konfirmasi Password */}
                        <div>
                            <label className="block mb-2 text-xs font-bold tracking-wider text-gray-700 uppercase">
                                Ulangi Password
                            </label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <ShieldCheck className="w-5 h-5 text-gray-400" />
                                </div>
                                <TextInput
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="block w-full py-3 pl-10 transition-all border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
                                    autoComplete="new-password"
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Ketik ulang password baru"
                                />
                            </div>
                            <InputError
                                message={errors.password_confirmation}
                                className="mt-2"
                            />
                        </div>

                        {/* Tombol Submit */}
                        <div className="pt-4">
                            <PrimaryButton
                                className="w-full flex justify-center py-3.5 rounded-xl font-bold text-base bg-gray-900 hover:bg-black focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all transform active:scale-95"
                                disabled={processing}
                            >
                                {processing
                                    ? "Menyimpan..."
                                    : "Simpan Password Baru"}
                                {!processing && (
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                )}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>

            {/* Footer Branding */}
            <div className="flex items-center gap-2 mt-8 text-gray-400 opacity-60">
                <Store className="w-5 h-5" />
                <span className="text-sm font-bold tracking-tighter">
                    Juragan Lapak
                </span>
            </div>
        </div>
    );
}
