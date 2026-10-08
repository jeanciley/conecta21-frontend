const TOKEN_KEY = "conecta21_token";

function salvarToken(token, lembrar = false) {
    removerToken();
    if (lembrar) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        sessionStorage.setItem(TOKEN_KEY, token);
    }
}

function obterToken() {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
}

function removerToken() {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
}

function estaAutenticado() {
    return obterToken() !== null;
}

function logout() {
    removerToken();
    window.location.href = "login.html";
}
