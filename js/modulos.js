(function () {
    const grid = document.getElementById("modulosGrid");
    const message = document.getElementById("modulosMsg");
    if (!grid || !message) return;

    function notify(text, error = false) {
        message.hidden = !text;
        message.textContent = text;
        message.className = "modulos-message" + (error ? " error" : "");
    }

    function render(modulos) {
        if (!modulos.length) {
            grid.innerHTML = '<div class="modulo-empty">Nenhum módulo está disponível no momento.</div>';
            return;
        }
        grid.innerHTML = modulos.map(modulo => `
            <article class="modulo-card" data-modulo="${modulo.codigo}">
                <div class="modulo-card-top">
                    <h2>${escapeHtml(modulo.nome)}</h2>
                    <span class="modulo-status ${modulo.contratado ? "active" : ""}">${modulo.contratado ? "Contratado" : "Disponível"}</span>
                </div>
                <p>${escapeHtml(modulo.descricao)}</p>
                <div class="modulo-card-footer">
                    <small>${modulo.contratado && modulo.contratadoEm ? `Ativo desde ${new Date(modulo.contratadoEm).toLocaleDateString("pt-BR")}` : "Ative este recurso para sua empresa."}</small>
                    ${modulo.contratado ? "" : `<button type="button" class="btn btn-primary" data-contratar="${modulo.codigo}">Contratar módulo</button>`}
                </div>
            </article>`).join("");
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
    }

    const userMenuButton = document.getElementById("btnUserMenu");
    const userMenu = document.getElementById("userMenu");
    const userLogoutButton = document.getElementById("btnUserLogout");
    userMenuButton?.addEventListener("click", () => {
        const expanded = userMenuButton.getAttribute("aria-expanded") === "true";
        userMenuButton.setAttribute("aria-expanded", String(!expanded));
        userMenu.hidden = expanded;
    });
    document.addEventListener("click", event => {
        if (userMenu && !event.target.closest(".user-area")) {
            userMenu.hidden = true;
            userMenuButton?.setAttribute("aria-expanded", "false");
        }
    });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && userMenu && !userMenu.hidden) {
            userMenu.hidden = true;
            userMenuButton?.setAttribute("aria-expanded", "false");
            userMenuButton?.focus();
        }
    });
    userLogoutButton?.addEventListener("click", logout);

    async function load() {
        try {
            if (!estaAutenticado()) { window.location.href = "login.html"; return; }
            const user = await apiGetJson("/api/usuarios/me");
            if (user.perfil !== "ADMIN") { window.location.replace("dashboard.html"); return; }
            const profileLabel = document.getElementById("dashboardUserProfile");
            if (profileLabel) profileLabel.textContent = user.perfil;
            const response = await apiGetJson("/api/modulos");
            render(response.modulos || []);
        } catch (error) {
            notify(getMensagemErroAmigavel(error.status || 0), true);
        }
    }

    grid.addEventListener("click", async event => {
        const button = event.target.closest("[data-contratar]");
        if (!button) return;
        button.disabled = true;
        button.textContent = "Ativando...";
        try {
            const response = await apiRequest(`/api/modulos/${encodeURIComponent(button.dataset.contratar)}/contratar`, { method: "POST" });
            if (!response.ok) throw { status: response.status };
            notify("Módulo contratado e ativado para sua empresa.");
            await load();
        } catch (error) {
            button.disabled = false;
            button.textContent = "Contratar módulo";
            notify(error.status ? getMensagemErroAmigavel(error.status) : "Não foi possível contratar o módulo.", true);
        }
    });

    load();
})();
