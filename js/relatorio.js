// =========================================
// RELATÓRIOS - CONECTA21 (Sprint 3)
// Endpoint real: GET /api/relatorios/chamados/csv
// Sem parâmetros, sem PDF/Excel. Resposta binária CSV.
// =========================================

(function () {
    const btn = document.getElementById("btnBaixarCsv");
    const msg = document.getElementById("relatorioMsg");
    const loading = document.getElementById("relatorioLoading");

    if (!btn) {
        return;
    }

    function mostrar(texto, tipo) {
        if (!msg) {
            return;
        }
        msg.hidden = false;
        msg.textContent = texto;
        msg.className = "relatorio-msg " + (tipo || "error");
    }

    function limpar() {
        if (!msg) {
            return;
        }
        msg.hidden = true;
        msg.textContent = "";
        msg.className = "relatorio-msg";
    }

    function setLoading(ativo) {
        btn.disabled = ativo;
        btn.textContent = ativo ? "Gerando..." : "Baixar relatório CSV";
        if (loading) {
            loading.hidden = !ativo;
        }
    }

    btn.addEventListener("click", async function () {
        limpar();
        setLoading(true);

        try {
            const filename = await apiDownload(
                "/api/relatorios/chamados/csv",
                "relatorio_chamados.csv"
            );
            mostrar("Relatório baixado: " + filename, "success");
        } catch (erro) {
            if (erro && erro.empty) {
                mostrar("O relatório não possui dados para exportar.", "error");
            } else if (erro && erro.status === 401) {
                mostrar("Sessão expirada. Faça login novamente.", "error");
            } else if (erro && erro.status === 403) {
                mostrar("Você não tem permissão para gerar relatórios.", "error");
            } else if (erro && erro.status === 404) {
                mostrar("Endpoint de relatório não encontrado na API.", "error");
            } else if (erro && erro.status >= 500) {
                mostrar("Erro no servidor ao gerar o relatório. Tente mais tarde.", "error");
            } else if (erro instanceof TypeError) {
                mostrar(
                    "Não foi possível conectar ao servidor. Verifique se a API está no ar.",
                    "error"
                );
            } else {
                mostrar(getMensagemErroAmigavel(erro && erro.status ? erro.status : 0), "error");
            }
        } finally {
            setLoading(false);
        }
    });
})();
