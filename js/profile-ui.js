(function () {
    const name = document.getElementById("dashboardUserName");
    const avatar = document.getElementById("userAvatar");
    const initials = document.getElementById("userInitials");
    let avatarUrl = null;

    if (name) {
        name.setAttribute("role", "link");
        name.tabIndex = 0;
        name.title = "Editar meu perfil";
        name.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            window.location.href = "perfil.html";
        });
        name.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                window.location.href = "perfil.html";
            }
        });
    }

    if (!avatar || typeof estaAutenticado !== "function" || !estaAutenticado()) return;
    if (window.location.pathname.endsWith("/perfil.html")) return;

    apiGetJson("/api/usuarios/me/perfil").then(perfil => {
        if (name && perfil.nome) name.textContent = perfil.nome;
        if (!perfil.possuiAvatar) return;

        return apiRequest("/api/usuarios/me/avatar").then(response => {
            if (!response.ok) return;
            return response.blob();
        }).then(blob => {
            if (!blob) return;
            avatarUrl = URL.createObjectURL(blob);
            const image = document.createElement("img");
            image.className = "user-avatar-image";
            image.alt = "";
            image.src = avatarUrl;
            avatar.appendChild(image);
            if (initials) initials.hidden = true;
        });
    }).catch(() => {});

    window.addEventListener("beforeunload", () => {
        if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    });
})();
