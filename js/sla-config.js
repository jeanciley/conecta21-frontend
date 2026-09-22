// =========================================
// SLA CONFIG - CONECTA21 (Sprint 3)
// Somente visualização: backend não possui
// endpoint de leitura/edição de SLA.
// Valores fixos: ALTA 4h, MEDIA 24h, BAIXA 48h.
// =========================================

if (!estaAutenticado()) {
    window.location.href = "login.html";
}

const btnLogoutSla = document.getElementById("btnLogout");

if (btnLogoutSla) {
    btnLogoutSla.addEventListener("click", function () {
        logout();
    });
}
