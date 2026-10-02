(function () {
    const sidebar = document.getElementById("appSidebar");
    if (!sidebar) return;

    const links = [
        { href: "dashboard.html", label: "Dashboard", short: "D" },
        { href: "chamado.html", label: "Chamados externos", short: "CE", external: true },
        { href: "internos.html", label: "Chamados internos", short: "CI", permission: "CHAMADOS_INTERNOS" },
        { href: "equipe.html", label: "Equipe", short: "EQ", permission: "GERENCIAR_USUARIOS" },
        { href: "sla.html", label: "SLA e categorias", short: "SLA", permissions: ["GERENCIAR_CATEGORIAS", "GERENCIAR_PRIORIDADES"] },
        { href: "faq.html", label: "Base de conhecimento", short: "FAQ" },
        { href: "perfis.html", label: "Perfis", short: "P", admin: true }
    ];

    sidebar.innerHTML = `
        <div class="sidebar-brand-row">
            <a href="dashboard.html" class="sidebar-logo" aria-label="Conecta21, ir para Dashboard">
                <img src="assets/images/logo-conecta21-claro.svg" width="640" height="170" alt="Conecta21">
            </a>
            <a href="dashboard.html" class="sidebar-compact-logo" aria-label="Conecta21, ir para Dashboard">
                <img src="assets/images/favicon-conecta21.svg" width="256" height="256" alt="">
            </a>
        </div>
        <nav class="sidebar-menu" aria-label="Navegação principal">
            ${links.map(link => {
                const guard = link.admin ? 'data-nav-admin' :
                    link.permission ? `data-nav-permission="${link.permission}"` :
                    link.permissions ? `data-nav-permissions="${link.permissions.join(",")}"` :
                    link.external ? 'data-nav-external' : '';
                return `<a href="${link.href}" class="menu-item" aria-label="${link.label}" title="${link.label}" data-short="${link.short}" ${guard}><span class="menu-item-short" aria-hidden="true">${link.short}</span><span class="menu-item-label">${link.label}</span></a>`;
            }).join("")}
        </nav>
        <div class="sidebar-footer">
            <button id="btnLogout" class="logout-button" type="button">Sair</button>
        </div>`;

    const toggle = document.createElement("button");
    toggle.className = "sidebar-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-controls", "appSidebar");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Recolher barra lateral");
    toggle.title = "Recolher barra lateral";
    toggle.innerHTML = '<span aria-hidden="true">&#8249;</span>';
    sidebar.insertAdjacentElement("afterend", toggle);

    const currentPage = window.location.pathname.split("/").pop() || "dashboard.html";
    sidebar.querySelectorAll(".menu-item").forEach(link => {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });

    sidebar.querySelectorAll("[data-nav-admin], [data-nav-permission], [data-nav-permissions], [data-nav-external]")
        .forEach(link => { link.hidden = true; });
    sidebar.querySelector("#btnLogout").addEventListener("click", logout);

    const collapsedKey = "conecta21_sidebar_collapsed";
    const setCollapsed = collapsed => {
        document.body.classList.toggle("sidebar-collapsed", collapsed);
        toggle.setAttribute("aria-expanded", String(!collapsed));
        toggle.setAttribute("aria-label", collapsed ? "Expandir barra lateral" : "Recolher barra lateral");
        toggle.title = collapsed ? "Expandir barra lateral" : "Recolher barra lateral";
    };
    setCollapsed(localStorage.getItem(collapsedKey) === "true");
    toggle.addEventListener("click", () => {
        const collapsed = !document.body.classList.contains("sidebar-collapsed");
        localStorage.setItem(collapsedKey, String(collapsed));
        setCollapsed(collapsed);
    });

    if (!estaAutenticado()) return;
    apiGetJson("/api/usuarios/me").then(usuario => {
        const permissoes = usuario.permissoes || [];
        const internoOnly = usuario.perfil === "USUARIO"
            && permissoes.includes("CHAMADOS_INTERNOS")
            && !permissoes.includes("GERENCIAR_CHAMADOS");

        sidebar.querySelectorAll("[data-nav-admin]").forEach(link => {
            link.hidden = usuario.perfil !== "ADMIN";
        });
        sidebar.querySelectorAll("[data-nav-permission]").forEach(link => {
            link.hidden = !permissoes.includes(link.dataset.navPermission);
        });
        sidebar.querySelectorAll("[data-nav-permissions]").forEach(link => {
            link.hidden = !link.dataset.navPermissions.split(",").some(permission => permissoes.includes(permission));
        });
        sidebar.querySelectorAll("[data-nav-external]").forEach(link => {
            link.hidden = internoOnly;
        });
    }).catch(() => {});
})();
