const TOKEN_KEY = "conecta21_token";

export function salvarToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function obterToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function removerToken() {
    localStorage.removeItem(TOKEN_KEY);
}

export function estaAutenticado() {
    return obterToken() !== null;
}

export function logout() {
    removerToken();
    window.location.href = "login.html";
}
