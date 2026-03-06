import { Head } from "@inertiajs/react";
import { useEffect } from "react";
import { Package, Scissors } from "lucide-react";

export default function Print({ transaction, store }) {
    // Jalankan perintah print browser secara otomatis saat halaman ini terbuka
    useEffect(() => {
        // Kasih jeda dikit 0.5 detik biar icon/font selesai render dulu baru nge-print
        const timer = setTimeout(() => {
            window.print();
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // Helper format JSON Address
    const address = transaction.shipping_address_snapshot
        ? JSON.parse(transaction.shipping_address_snapshot)
        : null;

    return (
        <div className="min-h-screen bg-gray-200 py-8 print:bg-white print:py-0 flex justify-center">
            <Head title={`Cetak Label - ${transaction.invoice_code}`} />

            {/* Kertas Print - Ukuran diset mirip kertas A6 / Printer Thermal */}
            <div className="w-full max-w-md bg-white p-6 shadow-lg print:shadow-none print:max-w-none border-t-[12px] border-black">
                {/* Header Invoice */}
                <div className="flex justify-between items-start border-b-2 border-dashed border-gray-300 pb-4 mb-4">
                    <div>
                        <h1 className="font-extrabold text-2xl tracking-tighter uppercase">
                            LABEL PENGIRIMAN
                        </h1>
                        <p className="text-sm font-bold mt-1">
                            {transaction.invoice_code}
                        </p>
                    </div>
                    <div className="text-right">
                        <Package className="w-10 h-10 ml-auto" />
                        <p className="text-xs font-semibold mt-1">
                            {new Date(
                                transaction.created_at,
                            ).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            })}
                        </p>
                    </div>
                </div>

                {/* Info Pengirim & Penerima */}
                <div className="grid grid-cols-2 gap-6 border-b-2 border-black pb-4 mb-4">
                    {/* PENGIRIM */}
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                            Dari (Pengirim):
                        </p>
                        <p className="font-bold text-sm uppercase">
                            {store?.name || "Juragan Lapak"}
                        </p>
                        <p className="text-xs mt-1">{store?.phone || "-"}</p>
                        <p className="text-xs line-clamp-3 leading-relaxed mt-1">
                            {store?.address || "Alamat toko belum diset."}
                        </p>
                    </div>

                    {/* PENERIMA */}
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                            Kepada (Penerima):
                        </p>
                        <p className="font-bold text-sm uppercase">
                            {address?.recipient_name || transaction.user?.name}
                        </p>
                        <p className="text-xs font-bold mt-1">
                            {address?.phone || "-"}
                        </p>
                        <p className="text-xs line-clamp-4 leading-relaxed mt-1">
                            {address?.full_address || "Alamat tidak ditemukan."}
                        </p>
                    </div>
                </div>

                {/* Daftar Barang (Biar tukang packing tahu isi paketnya) */}
                <div className="mb-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                        Isi Paket:
                    </p>
                    <table className="w-full text-xs">
                        <thead className="border-b border-gray-300 text-left">
                            <tr>
                                <th className="pb-2 font-bold uppercase w-12">
                                    Qty
                                </th>
                                <th className="pb-2 font-bold uppercase">
                                    Nama Barang
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transaction.details?.map((item) => (
                                <tr key={item.id}>
                                    <td className="py-2 font-extrabold text-sm">
                                        {item.quantity}x
                                    </td>
                                    <td className="py-2 font-medium">
                                        {item.product?.name || "Produk Dihapus"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Keterangan */}
                <div className="border-t-2 border-dashed border-gray-300 pt-4 flex items-center justify-between text-[10px] text-gray-500">
                    <div className="flex items-center">
                        <Scissors className="w-3 h-3 mr-2 transform -rotate-90" />
                        Potong di sini
                    </div>
                    <p className="font-bold uppercase tracking-wider">
                        {transaction.payment_method === "midtrans"
                            ? "SUDAH DIBAYAR"
                            : "MANUAL TRANSFER"}
                    </p>
                </div>
            </div>

            {/* Kustomisasi CSS khusus untuk nge-print */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @media print {
                    @page { margin: 0; size: A6 portrait; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `,
                }}
            />
        </div>
    );
}
