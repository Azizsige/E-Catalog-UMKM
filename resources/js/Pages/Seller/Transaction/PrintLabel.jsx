import { Head } from "@inertiajs/react";
import { useEffect } from "react";
import { Printer, ShoppingBag, MapPin, Store, Box } from "lucide-react";

export default function PrintLabel({ transaction, store }) {
    let shippingInfo = {};
    try {
        shippingInfo = JSON.parse(
            transaction.shipping_address_snapshot || "{}"
        );
    } catch (e) {
        console.error("Error parsing address", e);
    }

    // Helper Tanggal Indonesia
    const tanggalIndo = new Date(transaction.created_at).toLocaleDateString(
        "id-ID",
        {
            day: "numeric",
            month: "long",
            year: "numeric",
        }
    );

    return (
        <div className="flex flex-col items-center justify-start min-h-screen p-8 font-sans bg-gray-100">
            <Head title={`Label - ${transaction.invoice_code}`} />

            {/* --- TOMBOL PRINT --- */}
            <div className="flex flex-col items-center gap-2 mb-6 print:hidden">
                <p className="text-sm text-gray-600">
                    Tips: Aktifkan <b>"Background graphics"</b> di setting print
                    agar blok hitam muncul.
                </p>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-3 font-bold text-white transition-all bg-gray-900 rounded-full shadow-lg hover:bg-black hover:scale-105"
                >
                    <Printer className="w-5 h-5" />
                    Cetak Label
                </button>
            </div>

            {/* --- KERTAS LABEL (A6) --- */}
            <div
                id="printable-area"
                className="bg-white w-[105mm] min-h-[148mm] shadow-2xl print:shadow-none border border-gray-300 print:border-2 print:border-black overflow-hidden relative text-black"
            >
                {/* 1. HEADER HITAM */}
                <div className="flex items-start justify-between p-4 text-white bg-black print:bg-black print:text-white">
                    <div>
                        {/* GANTI WORDING DISINI BIAR KEREN */}
                        <h1 className="mb-1 text-xl font-black leading-none tracking-widest uppercase">
                            STANDARD DELIVERY
                        </h1>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase opacity-80">
                            <Box className="w-3 h-3" />
                            <span>
                                {transaction.courier_name || "Regular Service"}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold opacity-60">
                            No. Invoice
                        </p>
                        <p className="font-mono text-sm font-bold tracking-wider">
                            #{transaction.invoice_code}
                        </p>
                    </div>
                </div>

                {/* 2. TUJUAN (PENERIMA) */}
                <div className="p-5 border-b-2 border-gray-400 border-dashed">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-wider">
                        <MapPin className="w-3 h-3" /> Penerima
                    </div>

                    {/* Nama Besar */}
                    <h2 className="mb-1 text-xl font-black leading-tight uppercase">
                        {shippingInfo.recipient_name || transaction.user.name}
                    </h2>

                    {/* No HP */}
                    <p className="mb-3 font-mono font-bold text-md">
                        {shippingInfo.phone_number || transaction.user.phone}
                    </p>

                    {/* Alamat */}
                    <div className="pl-3 text-sm leading-snug border-l-4 border-gray-300">
                        <p>{shippingInfo.address_line}</p>
                        <p className="mt-1 font-bold">
                            {shippingInfo.city}, {shippingInfo.postal_code}
                        </p>
                    </div>
                </div>

                {/* 3. PENGIRIM */}
                <div className="p-3 px-5 border-b-2 border-gray-300 bg-gray-50 print:bg-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase mb-1">
                                <Store className="w-3 h-3" /> Pengirim
                            </div>
                            <p className="text-sm font-bold uppercase">
                                {store.name}
                            </p>
                            <p className="font-mono text-xs">
                                {store.phone_number}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400">
                                Tanggal Order
                            </p>
                            <p className="text-xs font-bold">{tanggalIndo}</p>
                        </div>
                    </div>
                </div>

                {/* 4. TABEL PRODUK (Dibuat Rapi) */}
                <div className="p-5">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase mb-3 tracking-wider">
                        <ShoppingBag className="w-3 h-3" /> Rincian Isi Paket
                    </div>

                    <table className="w-full text-xs text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-800">
                                <th className="py-2 font-bold uppercase tracking-wide w-[70%]">
                                    Produk
                                </th>
                                <th className="py-2 font-bold uppercase tracking-wide text-right w-[30%]">
                                    Qty
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {transaction.details.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-2 pr-2 leading-relaxed align-top">
                                        {item.product?.name || "Produk dihapus"}
                                    </td>
                                    <td className="py-2 text-lg font-bold text-right align-top">
                                        {item.qty}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Footer Pesan */}
                    <div className="mt-6 border-2 border-black border-dashed p-3 rounded-lg text-[10px] font-bold text-center uppercase tracking-wide">
                        "Wajib Video Unboxing Saat Buka Paket"
                    </div>
                </div>

                {/* WATERMARK BAWAH */}
                <div className="absolute bottom-0 w-full py-1 text-center bg-white border-t border-gray-300">
                    <p className="text-[8px] text-gray-400 font-mono">
                        Printed by Juragan Lapak System
                    </p>
                </div>
            </div>

            {/* CSS STYLE PRINT */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #printable-area, #printable-area * { visibility: visible; }
                    #printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                    }
                    @page { size: A6; margin: 0; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}</style>
        </div>
    );
}
