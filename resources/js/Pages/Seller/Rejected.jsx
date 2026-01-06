import { Head, Link } from "@inertiajs/react";
import { XCircle, ArrowLeft } from "lucide-react";

export default function Rejected() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <Head title="Pengajuan Ditolak" />

            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border border-gray-100">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-10 h-10 text-red-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Mohon Maaf, Pengajuan Ditolak
                </h1>

                <p className="text-gray-600 mb-8 leading-relaxed">
                    Data toko Anda telah ditinjau oleh Admin dan saat ini{" "}
                    <span className="font-bold text-red-600">
                        belum disetujui
                    </span>
                    . Silakan hubungi Admin untuk informasi lebih lanjut atau
                    perbaiki data profil Anda.
                </p>

                <div className="space-y-3">
                    <Link
                        href={route("seller.store.edit")}
                        className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition"
                    >
                        Perbaiki Data Toko
                    </Link>

                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="block w-full py-3 px-4 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold rounded-xl transition"
                    >
                        Keluar (Logout)
                    </Link>
                </div>
            </div>
        </div>
    );
}
