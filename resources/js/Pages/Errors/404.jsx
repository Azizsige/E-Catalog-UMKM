import { Head, Link } from "@inertiajs/react";
import { Home, ArrowLeft, Store } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <Head title="404 - Halaman Tidak Ditemukan" />

            <div className="w-full max-w-md p-8 text-center bg-white border border-gray-100 shadow-xl rounded-3xl">
                {/* Icon / Branding */}
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-orange-100 rounded-full animate-bounce">
                    <Store className="w-10 h-10 text-orange-600" />
                </div>

                {/* Error Message */}
                <h1 className="mb-2 font-black text-transparent text-7xl bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400">
                    404
                </h1>
                <h2 className="mb-4 text-2xl font-bold tracking-tight text-gray-800">
                    Waduh, Kesasar Ya?
                </h2>
                <p className="mb-8 text-sm leading-relaxed text-gray-500">
                    Halaman yang Anda cari tidak ditemukan, mungkin URL-nya
                    salah atau halamannya sudah dihapus. Mari kembali ke jalan
                    yang benar.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-gray-700 transition-colors bg-white border border-gray-300 rounded-xl hover:bg-gray-100 sm:w-auto"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali
                    </button>
                    <Link
                        href="/"
                        className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-white transition-colors bg-orange-600 shadow-lg rounded-xl hover:bg-orange-700 shadow-orange-200 sm:w-auto"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        Ke Beranda
                    </Link>
                </div>
            </div>
        </div>
    );
}
