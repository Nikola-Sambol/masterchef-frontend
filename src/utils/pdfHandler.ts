import type { NavigateFunction } from "react-router-dom";
import api from "../axios/api";

export const handleRecipeDownloadPdf = async (recipeId: string | undefined, navigate: NavigateFunction) => {
    try {
        const res = await api.get(`/pdf/public/${recipeId}`, {
            responseType: "blob", // binarni odgovor
        });

        // Provjera tipa odgovora
        if (res.headers["content-type"] !== "application/pdf") {
            throw new Error("Nije pronađen PDF");
        }

        const blob = new Blob([res.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);

        // Otvori u novom tabu
        window.open(url, "_blank");
    } catch (error: unknown) {
        console.error("Greška pri preuzimanju PDF-a", error);

        // Ako je status 404 ili nema PDF-a, idi na NotFound
        if (typeof error === 'object' && error !== null && 'response' in error &&
            error.response && typeof error.response === 'object' && 'status' in error.response &&
            error.response.status === 404) {
            navigate("/notfound");
        } else {
            // Za druge greške možeš pokazati toast
            alert("Došlo je do greške pri preuzimanju PDF-a.");
        }
    }
};

export const handleUserDownloadPdf = async (userId: string | undefined, navigate: NavigateFunction) => {
    try {
        const res = await api.get(`/pdf/user/${userId}`, {
            responseType: "blob", // binarni odgovor
        });

        // Provjera tipa odgovora
        if (res.headers["content-type"] !== "application/pdf") {
            throw new Error("Nije pronađen PDF");
        }

        const blob = new Blob([res.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);

        // Otvori u novom tabu
        window.open(url, "_blank");
    } catch (error: unknown) {
        console.error("Greška pri preuzimanju PDF-a", error);

        // Ako je status 404 ili nema PDF-a, idi na NotFound
        if (typeof error === 'object' && error !== null && 'response' in error &&
            error.response && typeof error.response === 'object' && 'status' in error.response &&
            error.response.status === 404) {
            navigate("/notfound");
        }else {
            // Za druge greške možeš pokazati toast
            alert("Došlo je do greške pri preuzimanju PDF-a.");
        }
    }
};


export const handleUsersDownloadPdf = async (navigate: NavigateFunction) => {
    try {
        const res = await api.get(`/pdf/users`, {
            responseType: "blob", // binarni odgovor
        });

        // Provjera tipa odgovora
        if (res.headers["content-type"] !== "application/pdf") {
            throw new Error("Nije pronađen PDF");
        }

        const blob = new Blob([res.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);

        // Otvori u novom tabu
        window.open(url, "_blank");
    } catch (error: unknown) {

        // Ako je status 404 ili nema PDF-a, idi na NotFound
        if (typeof error === 'object' && error !== null && 'response' in error &&
            error.response && typeof error.response === 'object' && 'status' in error.response &&
            error.response.status === 404) {
            navigate("/notfound");
        } else {
            // Za druge greške možeš pokazati toast
            alert("Došlo je do greške pri preuzimanju PDF-a.");
        }
    }
};