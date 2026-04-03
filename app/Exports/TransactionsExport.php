<?php

namespace App\Exports;

use App\Models\Transaction;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class TransactionsExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithColumnFormatting
{
    protected $startDate;
    protected $endDate;
    protected $rowNumber = 0;

    public function __construct($startDate, $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function collection()
    {
        // TAMPILIN SEMUA STATUS (Hapus where paid)
        return Transaction::whereDate('created_at', '>=', $this->startDate)
            ->whereDate('created_at', '<=', $this->endDate)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'No', 'Nomor Invoice', 'Tanggal Pesanan', 
            'Status Pesanan', // <-- Kolom Baru (Kolom D)
            'Metode Pembayaran', 
            'Total Harga Barang', // <-- Geser ke Kolom F
            'Ongkos Kirim',       // <-- Geser ke Kolom G
            'Pendapatan Bersih'   // <-- Geser ke Kolom H
        ];
    }

    public function map($tx): array
    {
        $this->rowNumber++;
        $grandTotal = $tx->total_price + $tx->shipping_cost;

        // Translate bahasa Inggris ke Indonesia buat di Excel
        $statusStr = match($tx->order_status) {
            'pending' => 'Menunggu',
            'processing' => 'Diproses',
            'shipped' => 'Dikirim',
            'completed' => 'Selesai',
            'cancelled' => 'Batal',
            default => $tx->order_status,
        };

        return [
            $this->rowNumber,
            $tx->invoice_code,
            $tx->created_at->format('Y-m-d H:i'),
            strtoupper($statusStr), // Masukin status ke sini
            strtoupper($tx->payment_method),
            $tx->total_price,
            $tx->shipping_cost,
            $grandTotal,
        ];
    }

    public function columnFormats(): array
    {
        return [
            'F' => '"Rp "#,##0', // Bergeser 1 abjad gara-gara ada kolom status
            'G' => '"Rp "#,##0',
            'H' => '"Rp "#,##0',
        ];
    }
}