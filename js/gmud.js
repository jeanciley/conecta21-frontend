(function () {
    const footer = document.getElementById("modalChamado")?.querySelector(".modal-footer");
    const dialog = document.getElementById("gmudDialog");
    const form = document.getElementById("gmudForm");
    if (!footer || !dialog || !form) return;

    if (!document.querySelector('link[data-gmud-style]')) {
        const style = document.createElement("link");
        style.rel = "stylesheet";
        style.href = "assets/css/gmud.css";
        style.dataset.gmudStyle = "true";
        document.head.appendChild(style);
    }

    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.className = "btn btn-primary";
    openButton.textContent = "Criar GMUD";
    openButton.hidden = true;
    footer.prepend(openButton);

    const fileInput = document.getElementById("gmudEvidencias");
    const message = dialog.querySelector("[data-gmud-message]");
    const submit = dialog.querySelector("[data-gmud-submit]");
    let ticketId = null;

    function showMessage(text, error = false) {
        message.textContent = text;
        message.classList.toggle("error", error);
    }

    async function readError(response, fallback) {
        const text = await response.text().catch(() => "");
        if (!text) return fallback;
        try { return JSON.parse(text).message || fallback; }
        catch (_) { return text; }
    }

    async function loadForm() {
        if (!ticketId) return;
        const response = await apiRequest(`/api/gmuds/chamados/${ticketId}/formulario`);
        if (!response.ok) throw new Error(await readError(response, "Não foi possível carregar os dados da GMUD."));
        const data = await response.json();
        dialog.querySelector("[data-gmud-client]").textContent = data.cliente || "—";
        dialog.querySelector("[data-gmud-requester]").textContent = data.solicitante || "—";
        dialog.querySelector("[data-gmud-ticket]").textContent = data.numeroChamado || `#${ticketId}`;
        dialog.querySelector("[data-gmud-assignee]").textContent = data.tecnicoAtribuido || "Não atribuído";

        const responsavel = document.getElementById("gmudResponsavel");
        responsavel.replaceChildren(new Option("Selecione", ""));
        (data.responsaveis || []).forEach(user => responsavel.add(new Option(`${user.nome} (${user.perfil === "ADMIN" ? "Admin" : "Técnico"})`, user.id)));
        responsavel.value = data.responsavelSugeridoId || "";

        const modelo = document.getElementById("gmudModelo");
        modelo.replaceChildren(new Option("Selecione", ""));
        (data.modelos || []).forEach(name => modelo.add(new Option(name, name)));
        fileInput.value = "";
        dialog.querySelector("[data-gmud-files]").textContent = "Nenhuma evidência selecionada.";
    }

    function validateFiles() {
        const files = Array.from(fileInput.files || []);
        let total = 0;
        for (const file of files) {
            if (!/\.(png|jpe?g)$/i.test(file.name) || !["image/png", "image/jpeg"].includes(file.type)) {
                throw new Error("As evidências devem estar no formato PNG ou JPG.");
            }
            if (file.size > 15 * 1024 * 1024) throw new Error("Cada evidência pode ter no máximo 15 MB.");
            total += file.size;
        }
        if (total > 60 * 1024 * 1024) throw new Error("O total de evidências não pode exceder 60 MB.");
        return files;
    }

    fileInput.addEventListener("change", () => {
        try {
            const files = validateFiles();
            const total = files.reduce((sum, file) => sum + file.size, 0);
            dialog.querySelector("[data-gmud-files]").textContent = files.length
                ? `${files.length} arquivo(s), ${(total / 1024 / 1024).toFixed(1)} MB no total.`
                : "Nenhuma evidência selecionada.";
            showMessage("");
        } catch (error) {
            fileInput.value = "";
            dialog.querySelector("[data-gmud-files]").textContent = "Nenhuma evidência selecionada.";
            showMessage(error.message, true);
        }
    });

    openButton.addEventListener("click", async () => {
        if (!ticketId) return;
        form.reset();
        showMessage("Carregando os dados do chamado...");
        const now = new Date(Date.now() + 86400000);
        document.getElementById("gmudAgenda").value = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        dialog.showModal();
        try { await loadForm(); showMessage(""); }
        catch (error) { showMessage(error.message || "Não foi possível carregar o formulário.", true); }
    });

    dialog.querySelectorAll("[data-gmud-close]").forEach(button => button.addEventListener("click", () => dialog.close()));
    dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });

    form.addEventListener("submit", async event => {
        event.preventDefault();
        let files;
        try { files = validateFiles(); }
        catch (error) { showMessage(error.message, true); return; }
        const scheduled = document.getElementById("gmudAgenda").value;
        const payload = new FormData();
        const data = {
            responsavelId: Number(document.getElementById("gmudResponsavel").value),
            modeloUtilizado: document.getElementById("gmudModelo").value,
            ambiente: document.getElementById("gmudAmbiente").value,
            dataAgendada: scheduled.length === 16 ? `${scheduled}:00` : scheduled,
            riscosImpactos: document.getElementById("gmudRiscos").value.trim()
        };
        payload.append("dados", new Blob([JSON.stringify(data)], { type: "application/json" }));
        files.forEach(file => payload.append("evidencias", file, file.name));
        submit.disabled = true;
        showMessage("Gerando e anexando a GMUD ao chamado...");
        try {
            const response = await apiRequest(`/api/gmuds/chamados/${ticketId}`, { method: "POST", body: payload });
            if (!response.ok) throw new Error(await readError(response, "Não foi possível gerar a GMUD."));
            const result = await response.json();
            const download = await apiRequest(`/api/gmuds/${result.id}/arquivo`);
            if (!download.ok) throw new Error("GMUD registrada, mas não foi possível baixar a planilha.");
            const url = URL.createObjectURL(await download.blob());
            const link = document.createElement("a"); link.href = url; link.download = result.nomeArquivoGerado; link.click();
            setTimeout(() => URL.revokeObjectURL(url), 5000);
            showMessage(`GMUD registrada (${result.statusAprovacao}) e anexada ao chamado.`);
        } catch (error) {
            showMessage(error.message || "Não foi possível gerar a GMUD.", true);
        } finally { submit.disabled = false; }
    });

    window.addEventListener("conecta21:ticket-opened", event => {
        ticketId = event.detail?.id || null;
        openButton.hidden = !ticketId;
    });
})();
