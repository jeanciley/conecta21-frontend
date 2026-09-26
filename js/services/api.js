const API_URL = "http://localhost:8080";

async function apiRequest(endpoint, options = {}) {
    const { skipAuthRedirect = false, ...requestOptions } = options;
    const token = typeof obterToken === "function" ? obterToken() : null;

    const headers = { ...requestOptions.headers };

    const isFormData =
        typeof FormData !== "undefined" && requestOptions.body instanceof FormData;

    if (!isFormData && requestOptions.body && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...requestOptions,
        headers
    });

    if (response.status === 401 && !skipAuthRedirect) {
        logout();
        return response;
    }

    return response;
}

async function apiGetJson(endpoint) {
    const response = await apiRequest(endpoint, { method: "GET" });

    if (!response) {
        throw { status: 401, message: "Sessão expirada. Faça login novamente." };
    }

    if (!response.ok) {
        let detalhe = "";
        try {
            detalhe = await response.text();
        } catch (e) {
            detalhe = "";
        }
        throw { status: response.status, message: detalhe };
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

function getFilenameFromContentDisposition(contentDisposition, fallback) {
    if (!contentDisposition) {
        return fallback;
    }

    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match && utf8Match[1]) {
        try {
            return decodeURIComponent(utf8Match[1].trim().replace(/"/g, ""));
        } catch (e) {
            return utf8Match[1].trim().replace(/"/g, "");
        }
    }

    const match = contentDisposition.match(/filename="?([^";]+)"?/i);
    if (match && match[1]) {
        return match[1].trim();
    }

    return fallback;
}

async function apiDownload(endpoint, fallbackFilename) {
    const response = await apiRequest(endpoint, { method: "GET" });

    if (!response) {
        throw { status: 401, message: "Sessão expirada. Faça login novamente." };
    }

    if (!response.ok) {
        throw { status: response.status, message: "" };
    }

    const blob = await response.blob();

    if (!blob || blob.size === 0) {
        throw { status: 0, message: "empty", empty: true };
    }

    const disposition = response.headers.get("Content-Disposition");
    const filename = getFilenameFromContentDisposition(disposition, fallbackFilename);

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(function () {
        URL.revokeObjectURL(url);
    }, 5000);

    return filename;
}

function getMensagemErroAmigavel(status) {
    if (status === 401) {
        return "Sessão expirada. Faça login novamente.";
    }
    if (status === 403) {
        return "Você não tem permissão para realizar esta ação.";
    }
    if (status === 404) {
        return "Recurso não encontrado.";
    }
    if (status === 429) {
        return "Muitas tentativas. Aguarde um minuto e tente novamente.";
    }
    if (status >= 500) {
        return "Erro no servidor. Tente novamente mais tarde.";
    }
    return "Não foi possível concluir. Verifique sua conexão e tente novamente.";
}
