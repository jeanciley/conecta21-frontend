(async function () {
    if (!estaAutenticado()) return;
    try {
        const usuario = await apiGetJson("/api/usuarios/me");
        const permissoes = usuario.permissoes || [];
        document.querySelectorAll("[data-admin-only]").forEach(link => link.hidden = usuario.perfil !== "ADMIN");
        document.querySelectorAll("[data-permission]").forEach(link => link.hidden = !permissoes.includes(link.dataset.permission));
    } catch (_) { /* A tela existente apresenta o erro de sessão/API. */ }
})();
