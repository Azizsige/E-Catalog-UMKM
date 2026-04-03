import { Head, Link } from "@inertiajs/react";
import { Store, Clock, ArrowLeft } from "lucide-react";

export default function ResetLinkExpired() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <Head title="Tautan Kedaluwarsa" />

            <div className="w-full max-w-md p-8 bg-white border border-gray-100 shadow-xl rounded-3xl text-center animate-in fade-in zoom-in duration-500">
                {/* Icon Waktu Habis */}
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full">
                    <Clock className="w-10 h-10 text-red-600" />
                </div>

                <h2 className="mb-2 text-2xl font-extrabold tracking-tight text-gray-900">
                    Yah, Tautannya Kedaluwarsa!
                </h2>

                <p className="mb-8 text-sm leading-relaxed text-gray-500">
                    Tautan reset kata sandi ini sudah tidak berlaku lagi karena
                    sudah melewati batas waktu 5 menit atau sudah pernah
                    digunakan.
                </p>

                <div className="flex flex-col w-full gap-3">
                    <Link
                        href={route("password.request")}
                        className="flex items-center justify-center w-full px-4 py-3 font-bold text-white transition-colors bg-orange-600 shadow-lg rounded-xl hover:bg-orange-700 shadow-orange-200"
                    >
                        Minta Tautan Baru
                    </Link>
                    <Link
                        href={route("login")}
                        className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-gray-600 transition-colors bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
