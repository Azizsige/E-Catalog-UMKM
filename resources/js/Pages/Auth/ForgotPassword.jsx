import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import { Store, Mail, ArrowLeft, Send, CheckCircle2, Home } from "lucide-react";

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("password.email"));
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <Head title="Lupa Password" />

            <div className="w-full max-w-md p-8 bg-white border border-gray-100 shadow-xl rounded-3xl">
                {/* LOGIC UX: Jika ada 'status' sukses, tampilkan Tampilan Sukses */}
                {status ? (
                    <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
                        <div className="flex items-center justify-center w-20 h-20 mb-6 bg-green-100 rounded-full">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="mb-2 text-2xl font-extrabold tracking-tight text-gray-900">
                            Tautan Berhasil Dikirim!
                        </h2>
                        <p className="mb-8 text-sm leading-relaxed text-gray-500">
                            Hore! Kami telah mengirimkan tautan reset kata sandi
                            ke email{" "}
                            <span className="font-bold text-gray-800">
                                {data.email}
                            </span>
                            . Silakan periksa kotak masuk (atau folder spam)
                            Anda.
                        </p>

                        <div className="flex flex-col w-full gap-3">
                            <Link
                                href={route("login")}
                                className="flex items-center justify-center w-full px-4 py-3 font-bold text-white transition-colors bg-orange-600 shadow-lg rounded-xl hover:bg-orange-700 shadow-orange-200"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Kembali ke Login
                            </Link>
                            <Link
                                href="/"
                                className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-gray-600 transition-colors bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Ke Halaman Utama
                            </Link>
                        </div>
                    </div>
                ) : (
                    /* TAMPILAN DEFAULT: Form Input Email */
                    <>
                        {/* Header / Logo */}
                        <div className="flex flex-col items-center mb-6 text-center">
                            <div className="flex items-center justify-center w-16 h-16 mb-4 bg-orange-100 rounded-full">
                                <Store className="w-8 h-8 text-orange-600" />
                            </div>
                            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
                                Lupa Password?
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-gray-500">
                                Tenang, jangan panik. Masukkan alamat email akun
                                Anda di bawah ini, dan kami akan mengirimkan
                                tautan untuk mengatur ulang kata sandi.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Alamat Email Admin
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
                                        disabled={processing}
                                        className={`block w-full pl-10 border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500 ${processing ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}`}
                                        isFocused={true}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        placeholder="admin@toko.com"
                                    />
                                </div>
                                <InputError
                                    message={errors.email}
                                    className="mt-2"
                                />
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                                <PrimaryButton
                                    className="flex justify-center w-full px-4 py-3 font-bold bg-orange-600 shadow-lg rounded-xl hover:bg-orange-700 focus:ring-orange-500 shadow-orange-200"
                                    disabled={processing}
                                >
                                    {processing
                                        ? "Mengirim Tautan..."
                                        : "Kirim Tautan Reset"}
                                    {!processing && (
                                        <Send className="w-4 h-4 ml-2" />
                                    )}
                                </PrimaryButton>

                                <Link
                                    href={route("login")}
                                    className={`flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-gray-600 transition-colors bg-white border border-gray-300 rounded-xl hover:bg-gray-50 ${processing ? "opacity-50 pointer-events-none" : ""}`}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Kembali ke Login
                                </Link>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
