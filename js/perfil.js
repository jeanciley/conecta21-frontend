(function () {
    const detailsForm = document.getElementById("profileDataForm");
    if (!detailsForm) return;

    const nameInput = document.getElementById("profileName");
    const emailInput = document.getElementById("profileEmail");
    const passwordForm = document.getElementById("profilePasswordForm");
    const avatarInput = document.getElementById("profileAvatarFile");
    const avatarPreview = document.getElementById("profileAvatarPreview");
    const saveAvatarButton = document.getElementById("saveProfileAvatar");
    const removeAvatarButton = document.getElementById("removeProfileAvatar");
    let selectedAvatar = null;
    let previewUrl = null;
    let possuiAvatar = false;

    document.getElementById("btnUserLogout")?.addEventListener("click", () => logout());

    function mostrarMensagem(elementId, text, error = false) {
        const element = document.getElementById(elementId);
        if (!element) return;
        element.textContent = text;
        element.classList.toggle("error", error);
    }

    async function erroDaResposta(response, fallback) {
        const text = await response.text().catch(() => "");
        if (!text) return fallback;
        try {
            const body = JSON.parse(text);
            return body.message || body.mensagem || fallback;
        } catch (_) {
            return text;
        }
    }

    function iniciais(nome) {
        return (nome || "U").trim().split(/\s+/).slice(0, 2).map(parte => parte.charAt(0)).join("").toUpperCase() || "U";
    }

    function desenharAvatar(src = null) {
        avatarPreview.replaceChildren();
        if (src) {
            const image = document.createElement("img");
            image.src = src;
            image.alt = "Prévia da foto do perfil";
            avatarPreview.appendChild(image);
        } else {
            avatarPreview.textContent = iniciais(nameInput.value);
        }
    }

    async function carregarAvatar() {
        const response = await apiRequest("/api/usuarios/me/avatar");
        if (!response.ok) return;
        const blob = await response.blob();
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        previewUrl = URL.createObjectURL(blob);
        desenharAvatar(previewUrl);
    }

    async function carregarPerfil() {
        try {
            const perfil = await apiGetJson("/api/usuarios/me/perfil");
            nameInput.value = perfil.nome || "";
            emailInput.value = perfil.email || "";
            possuiAvatar = Boolean(perfil.possuiAvatar);
            document.getElementById("dashboardUserName").textContent = perfil.nome || perfil.email || "Usuário";
            document.getElementById("userInitials").textContent = iniciais(perfil.nome);
            removeAvatarButton.hidden = !possuiAvatar;
            desenharAvatar();
            if (possuiAvatar) await carregarAvatar();
        } catch (error) {
            mostrarMensagem("profileDataMessage", error.message || "Não foi possível carregar seu perfil.", true);
        }
    }

    detailsForm.addEventListener("submit", async event => {
        event.preventDefault();
        mostrarMensagem("profileDataMessage", "Salvando...");
        try {
            const response = await apiRequest("/api/usuarios/me/perfil", {
                method: "PUT",
                body: JSON.stringify({ nome: nameInput.value.trim(), email: emailInput.value.trim() })
            });
            if (!response.ok) throw new Error(await erroDaResposta(response, "Não foi possível salvar os dados."));
            const perfil = await response.json();
            nameInput.value = perfil.nome;
            emailInput.value = perfil.email;
            document.getElementById("dashboardUserName").textContent = perfil.nome || perfil.email;
            document.getElementById("userInitials").textContent = iniciais(perfil.nome);
            if (!selectedAvatar) desenharAvatar(previewUrl);
            mostrarMensagem("profileDataMessage", "Seus dados foram atualizados.");
        } catch (error) {
            mostrarMensagem("profileDataMessage", error.message || "Não foi possível salvar os dados.", true);
        }
    });

    passwordForm.addEventListener("submit", async event => {
        event.preventDefault();
        const currentPassword = document.getElementById("currentPassword");
        const newPassword = document.getElementById("newPassword");
        const confirmPassword = document.getElementById("confirmPassword");
        const senhaSegura = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$/;
        if (!senhaSegura.test(newPassword.value)) {
            mostrarMensagem("profilePasswordMessage", "A nova senha precisa ter 8 caracteres, maiúscula, minúscula, número e caractere especial.", true);
            return;
        }
        if (newPassword.value !== confirmPassword.value) {
            mostrarMensagem("profilePasswordMessage", "A confirmação da nova senha não corresponde.", true);
            return;
        }
        mostrarMensagem("profilePasswordMessage", "Atualizando...");
        try {
            const response = await apiRequest("/api/usuarios/me/senha", {
                method: "PUT",
                body: JSON.stringify({ senhaAtual: currentPassword.value, novaSenha: newPassword.value })
            });
            if (!response.ok) throw new Error(await erroDaResposta(response, "Não foi possível alterar a senha."));
            passwordForm.reset();
            mostrarMensagem("profilePasswordMessage", "Senha alterada com sucesso.");
        } catch (error) {
            mostrarMensagem("profilePasswordMessage", error.message || "Não foi possível alterar a senha.", true);
        }
    });

    avatarInput.addEventListener("change", () => {
        const file = avatarInput.files && avatarInput.files[0];
        if (!file) return;
        const formatos = ["image/png", "image/jpeg", "image/webp"];
        if (!formatos.includes(file.type) || file.size > 5 * 1024 * 1024) {
            avatarInput.value = "";
            mostrarMensagem("avatarMessage", "Escolha PNG, JPG ou WEBP de até 5 MB.", true);
            return;
        }
        selectedAvatar = file;
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        previewUrl = URL.createObjectURL(file);
        desenharAvatar(previewUrl);
        saveAvatarButton.disabled = false;
        mostrarMensagem("avatarMessage", "Prévia carregada. Salve para aplicar a foto.");
    });

    saveAvatarButton.addEventListener("click", async () => {
        if (!selectedAvatar) return;
        const formData = new FormData();
        formData.append("arquivo", selectedAvatar);
        mostrarMensagem("avatarMessage", "Enviando foto...");
        try {
            const response = await apiRequest("/api/usuarios/me/avatar", { method: "POST", body: formData });
            if (!response.ok) throw new Error(await erroDaResposta(response, "Não foi possível salvar a foto."));
            await response.json();
            possuiAvatar = true;
            selectedAvatar = null;
            avatarInput.value = "";
            saveAvatarButton.disabled = true;
            removeAvatarButton.hidden = false;
            mostrarMensagem("avatarMessage", "Foto do perfil atualizada.");
            document.querySelectorAll("#userAvatar img").forEach(image => image.remove());
            const headerAvatar = document.getElementById("userAvatar");
            const headerImage = document.createElement("img");
            headerImage.className = "user-avatar-image";
            headerImage.alt = "";
            headerImage.src = previewUrl;
            headerAvatar.appendChild(headerImage);
            document.getElementById("userInitials").hidden = true;
        } catch (error) {
            mostrarMensagem("avatarMessage", error.message || "Não foi possível salvar a foto.", true);
        }
    });

    removeAvatarButton.addEventListener("click", async () => {
        mostrarMensagem("avatarMessage", "Removendo foto...");
        try {
            const response = await apiRequest("/api/usuarios/me/avatar", { method: "DELETE" });
            if (!response.ok) throw new Error(await erroDaResposta(response, "Não foi possível remover a foto."));
            possuiAvatar = false;
            selectedAvatar = null;
            avatarInput.value = "";
            saveAvatarButton.disabled = true;
            removeAvatarButton.hidden = true;
            document.querySelectorAll("#userAvatar img").forEach(image => image.remove());
            document.getElementById("userInitials").hidden = false;
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            previewUrl = null;
            desenharAvatar();
            mostrarMensagem("avatarMessage", "Foto removida.");
        } catch (error) {
            mostrarMensagem("avatarMessage", error.message || "Não foi possível remover a foto.", true);
        }
    });

    window.addEventListener("beforeunload", () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
    });

    carregarPerfil();
})();
