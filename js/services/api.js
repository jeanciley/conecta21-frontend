import { obterToken, logout } from '../auth.js';

const API_URL = "http://localhost:8080/api";

export async function apiRequest(endpoint, options = {}) {
    const token = obterToken();

    const headers = {
        "Content-Type": "application/json",
        ...options.headers
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (response.status === 401 || response.status === 403) {
            logout();
            return null;
        }

        return response;
    } catch (error) {
        console.error("Erro na comunicação com a API (fetch):", error);
        throw error;
    }
}