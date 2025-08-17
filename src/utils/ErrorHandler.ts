// utils/axiosErrorHandler.ts
import axios from "axios";

export function handleAxiosError(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || "Došlo je do greške.";

        switch (status) {
            case 400:
                return "Neispravni podaci: " + message;
            case 401:
                return "Neautoriziran: " + message;
            case 403:
                return "Zabranjen pristup: " + message;
            case 404:
                return "Podatak nije pronađen.";
            case 500:
                return "Greška na serveru. Pokušajte kasnije.";
            default:
                return "Nepoznata greška: " + message;
        }
    } else {
        return "Greška u mreži. Provjerite internet vezu.";
    }
}