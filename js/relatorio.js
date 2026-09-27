(function () {
    const botoes = [
        { id: "btnBaixarCsv", url: "/api/relatorios/chamados/csv", nome: "relatorio_chamados.csv", label: "Baixar relatório CSV" },
        { id: "btnBaixarPdf", url: "/api/relatorios/chamados/pdf", nome: "relatorio_chamados.pdf", label: "Baixar em PDF" }
    ];
    const msg = document.getElementById("relatorioMsg");
    const loading = document.getElementById("relatorioLoading");

    function mostrar(texto, tipo) {
        if (!msg) return;
        msg.hidden = false; msg.textContent = texto; msg.className = "relatorio-msg " + (tipo || "error");
    }

    botoes.forEach(function (item) {
        const btn = document.getElementById(item.id);
        if (!btn) return;
        btn.addEventListener("click", async function () {
            msg.hidden = true; btn.disabled = true;
            const textoOriginal = btn.textContent; btn.textContent = "Gerando...";
            if (loading) loading.hidden = false;
            try {
                const filename = await apiDownload(item.url, item.nome);
                mostrar("Relatório baixado: " + filename, "success");
            } catch (erro) {
                if (erro && erro.empty) mostrar("O relatório não possui dados para exportar.", "error");
                else if (erro && erro.status === 401) mostrar("Sessão expirada. Faça login novamente.", "error");
                else if (erro && erro.status === 403) mostrar("Você não tem permissão para gerar relatórios.", "error");
                else if (erro instanceof TypeError) mostrar("Não foi possível conectar ao servidor. Verifique se a API está no ar.", "error");
                else mostrar(getMensagemErroAmigavel(erro && erro.status ? erro.status : 0), "error");
            } finally {
                btn.disabled = false; btn.textContent = textoOriginal;
                if (loading) loading.hidden = true;
            }
        });
    });
})();
