import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import { Mail, Store, ChevronLeft, ArrowRight, KeyRound } from "lucide-react";

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("password.email"));
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
            <Head title="Lupa Password" />

            {/* --- CARD CONTAINER --- */}
            <div className="w-full max-w-md overflow-hidden bg-white border border-gray-100 shadow-xl rounded-2xl">
                {/* Header Dekoratif */}
                <div className="relative p-6 overflow-hidden text-center bg-orange-600">
                    {/* Pattern Background Tipis */}
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
                            <KeyRound className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-white">
                            Lupa Password?
                        </h2>
                        <p className="mt-1 text-sm text-orange-100">
                            Juragan Lapak Security
                        </p>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-8">
                    {/* Instruksi */}
                    <p className="mb-8 text-sm leading-relaxed text-center text-gray-600">
                        Masukkan email yang terdaftar di akun Juragan Lapak
                        kamu. Kami akan mengirimkan link reset password ke sana.
                    </p>

                    {/* Status Message (Sukses) */}
                    {status && (
                        <div className="flex items-start gap-2 p-4 mb-6 text-sm font-medium text-green-700 border border-green-200 bg-green-50 rounded-xl animate-in fade-in slide-in-from-top-2">
                            <div className="mt-0.5">✅</div>
                            <div>{status}</div>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase"
                            >
                                Email Terdaftar
                            </label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                </div>
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="block w-full py-3 pl-10 border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                    isFocused={true}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    placeholder="contoh@email.com"
                                />
                            </div>
                            <InputError
                                message={errors.email}
                                className="mt-2"
                            />
                        </div>

                        {/* Submit Button */}
                        <PrimaryButton
                            className="w-full flex justify-center py-3.5 rounded-xl font-bold text-base bg-gray-900 hover:bg-black focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all transform active:scale-95"
                            disabled={processing}
                        >
                            {processing ? "Mengirim..." : "Kirim Link Reset"}
                            {!processing && (
                                <ArrowRight className="w-4 h-4 ml-2" />
                            )}
                        </PrimaryButton>
                    </form>

                    {/* Footer / Back Link */}
                    <div className="pt-6 mt-8 text-center border-t border-gray-100">
                        <Link
                            href={route("login")}
                            className="inline-flex items-center text-sm font-medium text-gray-500 transition-colors hover:text-orange-600"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Kembali ke halaman Login
                        </Link>
                    </div>
                </div>
            </div>

            {/* Branding Kecil di Bawah */}
            <div className="flex items-center gap-2 mt-8 text-gray-400 opacity-60">
                <Store className="w-5 h-5" />
                <span className="text-sm font-bold tracking-tighter">
                    Juragan Lapak
                </span>
            </div>
        </div>
    );
}
