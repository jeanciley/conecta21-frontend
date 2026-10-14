(function () {
    const sidebar = document.getElementById("appSidebar");
    if (!sidebar) return;

    const svgOpen = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
    const links = [
        { href: "dashboard.html", label: "Dashboard", icon: svgOpen + '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>' },
        { href: "chamado.html", label: "Chamados externos", icon: svgOpen + '<path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2.5 2.5 0 0 0 0 5v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2.5 2.5 0 0 0 0-5Z"/><path d="M13 5v2"/><path d="M13 11v2"/><path d="M13 17v2"/></svg>', external: true },
        { href: "internos.html", label: "Chamados internos", icon: svgOpen + '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 21v-4h6v4"/><path d="M8 7h2"/><path d="M8 11h2"/><path d="M14 7h2"/><path d="M14 11h2"/></svg>', permission: "CHAMADOS_INTERNOS" },
        { href: "equipe.html", label: "Equipe", icon: svgOpen + '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', permission: "GERENCIAR_USUARIOS" },
        { href: "sla.html", label: "SLA e categorias", icon: svgOpen + '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>', permissions: ["GERENCIAR_CATEGORIAS", "GERENCIAR_PRIORIDADES"] },
        { href: "faq.html", label: "Base de conhecimento", icon: svgOpen + '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13Z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>' },
        { href: "perfis.html", label: "Perfis", icon: svgOpen + '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M6.5 15a2.5 2.5 0 0 1 5 0"/><path d="M14 9h4"/><path d="M14 13h4"/></svg>', admin: true },
        { href: "modulos.html", label: "M\u00f3dulos", icon: svgOpen + '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M17.5 14v6"/><path d="M14.5 17h6"/></svg>', admin: true }
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
                return `<a href="${link.href}" class="menu-item" aria-label="${link.label}" title="${link.label}" ${guard}><span class="menu-item-icon" aria-hidden="true">${link.icon}</span><span class="menu-item-label">${link.label}</span></a>`;
            }).join("")}
        </nav>`;

    const toggle = document.createElement("button");
    toggle.className = "sidebar-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-controls", "appSidebar");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Recolher barra lateral");
    toggle.title = "Recolher barra lateral";
    toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg>';
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
