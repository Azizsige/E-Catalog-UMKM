<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class RajaOngkirController extends Controller
{
    protected $apiKey;
    protected $baseUrl;

    public function __construct()
    {
        $this->apiKey = env('RAJAONGKIR_API_KEY');
        $this->baseUrl = 'https://rajaongkir.komerce.id/api/v1';
    }

    public function getProvinces()
    {
        $response = Http::withHeaders(['key' => $this->apiKey, 'Accept' => 'application/json'])
            ->get($this->baseUrl . '/destination/province');
        return response()->json($response->json()['data'] ?? []);
    }

    public function getCities($provinceId)
    {
        $response = Http::withHeaders(['key' => $this->apiKey, 'Accept' => 'application/json'])
            ->get($this->baseUrl . '/destination/city/' . $provinceId);
        return response()->json($response->json()['data'] ?? []);
    }

    // FUNGSI BARU: Ambil Kecamatan
    public function getDistricts($cityId)
    {
        $response = Http::withHeaders(['key' => $this->apiKey, 'Accept' => 'application/json'])
            ->get($this->baseUrl . '/destination/district/' . $cityId);
        return response()->json($response->json()['data'] ?? []);
    }

    public function checkCost(Request $request)
    {
        $response = Http::asForm()->withHeaders([
            'Accept' => 'application/json',
            'key'    => $this->apiKey,
        ])->post($this->baseUrl . '/calculate/domestic-cost', [
            // PENTING: Origin ini harus ID KECAMATAN tokomu (Misal 3855 di tutorial = Diwek)
            'origin'      => env('RAJAONGKIR_ORIGIN', 3855), 
            'destination' => $request->destination, // Ini nanti nerima ID Kecamatan dari React
            'weight'      => $request->weight,
            'courier'     => $request->courier
        ]);

        return response()->json($response->json()['data'] ?? []);
    }
}