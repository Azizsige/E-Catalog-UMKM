import PrimaryButton from "@/Components/PrimaryButton";
import { Head, Link, useForm } from "@inertiajs/react";
import { Mail, Store, LogOut, Send, CheckCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    // State untuk hitung mundur (default 0 detik)
    const [cooldown, setCooldown] = useState(0);

    // Effect untuk menjalankan timer
    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [cooldown]);

    const submit = (e) => {
        e.preventDefault();

        post(route("verification.send"), {
            onSuccess: () => {
                // Pas berhasil kirim, langsung set timer 60 detik
                setCooldown(60);
            },
        });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
            <Head title="Verifikasi Email" />

            {/* --- CARD CONTAINER --- */}
            <div className="w-full max-w-md overflow-hidden bg-white border border-gray-100 shadow-xl rounded-2xl">
                {/* Header Dekoratif */}
                <div className="relative p-6 overflow-hidden text-center bg-orange-600">
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
                            <Mail className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-white">
                            Verifikasi Email
                        </h2>
                        <p className="mt-1 text-sm text-orange-100">
                            Langkah terakhir sebelum mulai!
                        </p>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-8">
                    <p className="mb-6 text-sm leading-relaxed text-center text-gray-600">
                        Terima kasih telah mendaftar! <br />
                        Sebelum memulai, mohon verifikasi alamat email Anda
                        dengan mengklik link yang baru saja kami kirimkan.
                    </p>

                    <p className="mb-8 text-xs italic text-center text-gray-500">
                        Jika Anda tidak menerima email tersebut, silakan minta
                        kirim ulang di bawah ini.
                    </p>

                    {/* Status Message */}
                    {status === "verification-link-sent" && (
                        <div className="flex items-start gap-2 p-4 mb-6 text-sm font-medium text-green-700 border border-green-200 bg-green-50 rounded-xl animate-in fade-in slide-in-from-top-2">
                            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                                Link verifikasi baru telah dikirim! Silakan cek
                                kotak masuk atau folder spam Anda.
                            </div>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        {/* Tombol Resend dengan Logic Cooldown */}
                        <PrimaryButton
                            className={`w-full flex justify-center py-3.5 rounded-xl font-bold text-base transition-all transform active:scale-95
                                ${
                                    cooldown > 0 || processing
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300" // Style saat disabled
                                        : "bg-gray-900 hover:bg-black focus:ring-2 focus:ring-offset-2 focus:ring-gray-900" // Style saat aktif
                                }
                            `}
                            disabled={processing || cooldown > 0}
                        >
                            {/* Logic Text Tombol */}
                            {processing ? (
                                "Mengirim..."
                            ) : cooldown > 0 ? (
                                <span className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2 animate-pulse" />
                                    Tunggu {cooldown} detik...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    Kirim Ulang Link
                                    <Send className="w-4 h-4 ml-2" />
                                </span>
                            )}
                        </PrimaryButton>

                        {/* Tombol Logout */}
                        <div className="mt-4 text-center">
                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className="inline-flex items-center text-sm font-medium text-gray-500 transition-colors hover:text-orange-600"
                            >
                                <LogOut className="w-4 h-4 mr-1" />
                                Keluar (Logout)
                            </Link>
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
