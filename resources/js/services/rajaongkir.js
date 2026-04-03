import axios from "axios";

// Fungsi ambil daftar Provinsi
export const fetchProvinces = async () => {
    try {
        const response = await axios.get("/api/provinces");
        return response.data;
    } catch (error) {
        console.error("Error fetching provinces:", error);
        throw error;
    }
};

// Fungsi ambil daftar Kota berdasarkan ID Provinsi
export const fetchCities = async (provinceId) => {
    try {
        const response = await axios.get(`/api/cities/${provinceId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching cities:", error);
        throw error;
    }
};

export const fetchDistricts = async (cityId) => {
    try {
        const response = await axios.get(`/api/districts/${cityId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching districts:", error);
        throw error;
    }
};

// Fungsi hitung Ongkos Kirim
export const calculateShippingCost = async (data) => {
    try {
        const response = await axios.post("/api/cost", {
            origin: import.meta.env.RAJAONGKIR_ORIGIN || 71074, // Ambil dari .env
            destination: 17601,
            weight: data.weight,
            courier: data.courier,
        });
        return response.data;
    } catch (error) {
        console.error("Error calculating shipping cost:", error);
        throw error;
    }
};
