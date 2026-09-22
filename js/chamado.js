import { carregarKanban } from './services/chamadoService.js';
import { estaAutenticado, logout } from './auth.js';

// =========================================
// VERIFICAÇÃO DE AUTENTICAÇÃO
// =========================================

if (!estaAutenticado()) {
    window.location.href = "login.html";
}

// =========================================
// ELEMENTOS DO HTML
// =========================================

const btnNovoChamado = document.getElementById("btnNovoChamado");
const formNovoChamado = document.getElementById("formNovoChamado");
const btnCancelarChamado = document.getElementById("btnCancelarChamado");
const tituloChamado = document.getElementById("tituloChamado");
const clienteChamado = document.getElementById("clienteChamado");
const prioridadeChamado = document.getElementById("prioridadeChamado");
const responsavelChamado = document.getElementById("responsavelChamado");
const descricaoChamado = document.getElementById("descricaoChamado");
const tituloChamadoError = document.getElementById("tituloChamadoError");
const clienteChamadoError = document.getElementById("clienteChamadoError");
const prioridadeChamadoError = document.getElementById("prioridadeChamadoError");
const responsavelChamadoError = document.getElementById("responsavelChamadoError");
const descricaoChamadoError = document.getElementById("descricaoChamadoError");
const buscarChamado = document.getElementById("buscarChamado");
const filtroStatus = document.getElementById("filtroStatus");
const filtroPrioridade = document.getElementById("filtroPrioridade");
const chamadosTableBody = document.getElementById("chamadosTableBody");
const totalChamados = document.getElementById("totalChamados");
const chamadosMsg = document.getElementById("chamadosMsg");
const btnLogout = document.getElementById("btnLogout");
const modalChamado = document.getElementById("modalChamado");
const modalChamadoTitulo = document.getElementById("modalChamadoTitulo");
const modalChamadoNumero = document.getElementById("modalChamadoNumero");
const modalChamadoCliente = document.getElementById("modalChamadoCliente");
const modalChamadoPrioridade = document.getElementById("modalChamadoPrioridade");
const modalChamadoStatus = document.getElementById("modalChamadoStatus");
const modalChamadoSla = document.getElementById("modalChamadoSla");
const modalChamadoSlaLimite = document.getElementById("modalChamadoSlaLimite");
const modalChamadoResponsavel = document.getElementById("modalChamadoResponsavel");
const modalChamadoDescricao = document.getElementById("modalChamadoDescricao");
const btnFecharModalChamado = document.getElementById("btnFecharModalChamado");
const btnFecharModalChamadoFooter = document.getElementById("btnFecharModalChamadoFooter");
const timelineChamado = document.getElementById("timelineChamado");
const novoStatusChamado = document.getElementById("novoStatusChamado");
const formNovaInteracao = document.getElementById("formNovaInteracao");
const imagensChamado = document.getElementById("imagensChamado");
const previewImagens = document.getElementById("previewImagens");
const tipoInteracao = document.getElementById("tipoInteracao");
const descricaoInteracao = document.getElementById("descricaoInteracao");

let chamadoAtual = null;
let chamados = [];
const interacoesCache = {};

// =========================================
// HELPERS
// =========================================

function escapeHtmlChamado(valor) {
    return String(valor == null ? "" : valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function mostrarChamadosMsg(texto, tipo) {
    if (!chamadosMsg) {
        return;
    }
    chamadosMsg.hidden = false;
    chamadosMsg.textContent = texto;
    chamadosMsg.className = "sla-msg " + (tipo || "error");
}

function limparChamadosMsg() {
    if (!chamadosMsg) {
        return;
    }
    chamadosMsg.hidden = true;
    chamadosMsg.textContent = "";
    chamadosMsg.className = "sla-msg";
}

function nomeCliente(chamado) {
    if (chamado.cliente) {
        return chamado.cliente;
    }
    if (chamado.solicitanteId) {
        return "Solicitante #" + chamado.solicitanteId;
    }
    return "—";
}

function nomeResponsavel(chamado) {
    if (chamado.responsavel) {
        return chamado.responsavel;
    }
    if (chamado.tecnicoId) {
        return "Técnico #" + chamado.tecnicoId;
    }
    return "—";
}

function numeroChamado(chamado) {
    if (chamado.numero) {
        return chamado.numero;
    }
    return "#" + chamado.id;
}

// =========================================
// CARREGAR CHAMADOS DA API
// Kanban tem prioridade + dataLimiteResolucao (SLA).
// Lista paginada tem descricao + fechamento.
// =========================================

async function carregarChamados() {
    limparChamadosMsg();
    chamadosTableBody.innerHTML =
        '<tr><td colspan="8"><div class="empty-state"><p>Carregando chamados...</p></div></td></tr>';

    let porId = {};

    try {
        const kanban = await apiGetJson("/api/chamados/kanban");
        const lanes = []
            .concat(kanban.abertos || [])
            .concat(kanban.emAndamento || [])
            .concat(kanban.emAtraso || [])
            .concat(kanban.resolvidos || []);

        lanes.forEach(function (card) {
            porId[card.id] = {
                id: card.id,
                titulo: card.titulo,
                prioridade: card.prioridade,
                status: card.status,
                solicitanteId: card.solicitanteId,
                tecnicoId: card.tecnicoId,
                dataAbertura: card.dataAbertura,
                dataLimiteResolucao: card.dataLimiteResolucao
            };
        });
    } catch (erro) {
        if (erro && erro.status === 401) {
            return;
        }
    }

    try {
        const pagina = await apiGetJson("/api/chamados?page=0&size=100&sort=dataAbertura,DESC");
        const conteudo = pagina && pagina.content ? pagina.content : [];

        conteudo.forEach(function (item) {
            const existente = porId[item.id] || {};
            porId[item.id] = {
                ...existente,
                id: item.id,
                titulo: item.titulo || existente.titulo,
                descricao: item.descricao,
                status: item.status || existente.status,
                solicitanteId: item.solicitanteId ?? existente.solicitanteId,
                tecnicoId: item.tecnicoId ?? existente.tecnicoId,
                dataAbertura: item.dataAbertura || existente.dataAbertura,
                dataFechamento: item.dataFechamento,
                tipo: item.tipo,
                prioridade: existente.prioridade || item.prioridade || null,
                dataLimiteResolucao:
                    existente.dataLimiteResolucao || item.dataLimiteResolucao || null
            };
        });
    } catch (erro) {
        if (erro && erro.status === 401) {
            return;
        }
    }

    chamados = Object.values(porId).sort(function (a, b) {
        return (b.id || 0) - (a.id || 0);
    });

    if (chamados.length === 0) {
        mostrarChamadosMsg(
            "Nenhum chamado retornado pela API. Verifique se o backend está no ar e se há chamados cadastrados.",
            "error"
        );
    }

    renderizarChamados();
}

// =========================================
// FUNÇÕES DE FORMATAÇÃO (AJUSTE DTO -> HTML)
// =========================================

function validarFormulario() {
    let valido = true;

    tituloChamadoError.textContent = "";
    clienteChamadoError.textContent = "";
    prioridadeChamadoError.textContent = "";
    responsavelChamadoError.textContent = "";
    descricaoChamadoError.textContent = "";

    if (tituloChamado.value.trim() === "") {
        tituloChamadoError.textContent = "O título é obrigatório.";
        valido = false;
    }

    if (clienteChamado.value.trim() === "") {
        clienteChamadoError.textContent = "O cliente é obrigatório.";
        valido = false;
    }

    if (prioridadeChamado.value === "") {
        prioridadeChamadoError.textContent = "Selecione uma prioridade.";
        valido = false;
    }

    if (responsavelChamado.value.trim() === "") {
        responsavelChamadoError.textContent = "O responsável é obrigatório.";
        valido = false;
    }

    if (descricaoChamado.value.trim() === "") {
        descricaoChamadoError.textContent = "A descrição é obrigatória.";
        valido = false;
    }

    return valido;
}

// =========================================
// ENVIO DO FORMULÁRIO (POST /api/chamados)
// =========================================

const novoChamadoForm = document.getElementById("novoChamadoForm");

novoChamadoForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!validarFormulario()) {
        return;
    }

    const botao = novoChamadoForm.querySelector('button[type="submit"]');
    const textoOriginal = botao ? botao.textContent : "";
    if (botao) {
        botao.disabled = true;
        botao.textContent = "Cadastrando...";
    }

    try {
        const response = await apiRequest("/api/chamados", {
            method: "POST",
            body: JSON.stringify({
                titulo: tituloChamado.value.trim(),
                descricao: descricaoChamado.value.trim(),
                prioridade: prioridadeChamado.value.toUpperCase(),
                tipo: "SUPORTE_EXTERNO"
            })
        });

        if (!response) {
            return;
        }

        if (response.status === 403) {
            mostrarChamadosMsg("Você não tem permissão para criar chamados.", "error");
            return;
        }

        if (!response.ok) {
            mostrarChamadosMsg("Não foi possível cadastrar o chamado. Tente novamente.", "error");
            return;
        }

        novoChamadoForm.reset();
        formNovoChamado.hidden = true;
        mostrarChamadosMsg("Chamado cadastrado com sucesso!", "success");
        await carregarChamados();
    } catch (erro) {
        mostrarChamadosMsg(
            "Não foi possível conectar ao servidor para cadastrar o chamado.",
            "error"
        );
    } finally {
        if (botao) {
            botao.disabled = false;
            botao.textContent = textoOriginal;
        }
    }
});

// =========================================
// ABRIR / CANCELAR FORMULÁRIO
// =========================================

btnNovoChamado.addEventListener("click", function () {
    formNovoChamado.hidden = false;
});

btnCancelarChamado.addEventListener("click", function () {
    novoChamadoForm.reset();
    tituloChamadoError.textContent = "";
    clienteChamadoError.textContent = "";
    prioridadeChamadoError.textContent = "";
    responsavelChamadoError.textContent = "";
    descricaoChamadoError.textContent = "";
    formNovoChamado.hidden = true;
});

// =========================================
// LOGOUT
// =========================================

btnLogout.addEventListener("click", function () {
    logout();
});

// =========================================
// EXIBIR CHAMADOS
// =========================================

function correspondeStatus(chamado, filtro) {
    if (filtro === "todos") {
        return true;
    }
    const statusApi = String(chamado.status || "").toUpperCase();
    const mapa = {
        aberto: "ABERTO",
        andamento: "EM_ANDAMENTO",
        aguardando: "AGUARDANDO",
        resolvido: "RESOLVIDO",
        fechado: "FECHADO",
        em_atraso: "EM_ATRASO"
    };
    return statusApi === (mapa[filtro] || filtro.toUpperCase());
}

function correspondePrioridade(chamado, filtro) {
    if (filtro === "todas") {
        return true;
    }
    const pri = String(chamado.prioridade || "").toUpperCase();
    return pri === filtro.toUpperCase();
}

function renderizarChamados() {
    chamadosTableBody.innerHTML = "";

    const termo = buscarChamado.value.trim().toLowerCase();
    const statusFiltro = filtroStatus.value;
    const prioridadeFiltro = filtroPrioridade.value;

    const chamadosFiltrados = chamados.filter(function (chamado) {
        const correspondeBusca =
            String(chamado.id || "").includes(termo) ||
            (chamado.numero || "").toLowerCase().includes(termo) ||
            (chamado.titulo || "").toLowerCase().includes(termo) ||
            nomeCliente(chamado).toLowerCase().includes(termo);

        return (
            correspondeBusca &&
            correspondeStatus(chamado, statusFiltro) &&
            correspondePrioridade(chamado, prioridadeFiltro)
        );
    });

    if (chamadosFiltrados.length === 0) {
        chamadosTableBody.innerHTML =
            '<tr><td colspan="8"><div class="empty-state">' +
            "<h3>Nenhum chamado encontrado</h3>" +
            "<p>Ajuste os filtros ou cadastre um novo chamado.</p>" +
            "</div></td></tr>";
        atualizarContador(0);
        return;
    }

    chamadosFiltrados.forEach(function (chamado) {
        const linha = document.createElement("tr");
        const sla = getSlaStatus(chamado);

        linha.innerHTML =
            "<td><strong>" + escapeHtmlChamado(numeroChamado(chamado)) + "</strong></td>" +
            "<td>" + escapeHtmlChamado(chamado.titulo || "—") + "</td>" +
            "<td>" + escapeHtmlChamado(nomeCliente(chamado)) + "</td>" +
            '<td><span class="ticket-priority ' + escapeHtmlChamado(cssPrioridade(chamado.prioridade)) + '">' +
            escapeHtmlChamado(formatarPrioridade(chamado.prioridade)) +
            "</span></td>" +
            '<td><span class="ticket-status ' + escapeHtmlChamado(cssStatus(chamado.status)) + '">' +
            escapeHtmlChamado(formatarStatus(chamado.status)) +
            "</span></td>" +
            "<td>" + renderSlaBadge(sla, describeSlaTooltip(chamado, sla)) + "</td>" +
            "<td>" + escapeHtmlChamado(nomeResponsavel(chamado)) + "</td>" +
            '<td><button type="button" class="btn btn-secondary btn-visualizar-chamado" data-id="' +
            escapeHtmlChamado(chamado.id) +
            '">Visualizar</button></td>';

        chamadosTableBody.appendChild(linha);
    });

    atualizarContador(chamadosFiltrados.length);
}

// =========================================
// ATUALIZAR CONTADOR
// =========================================

function atualizarContador(quantidade) {
    totalChamados.textContent =
        quantidade === 1 ? "1 chamado" : `${quantidade} chamados`;
}

// =========================================
// BUSCA E FILTROS
// =========================================

buscarChamado.addEventListener("input", renderizarChamados);
filtroStatus.addEventListener("change", renderizarChamados);
filtroPrioridade.addEventListener("change", renderizarChamados);

// =========================================
// MODAL DE DETALHES DO CHAMADO
// =========================================

chamadosTableBody.addEventListener("click", async function (event) {
    if (!event.target.classList.contains("btn-visualizar-chamado")) {
        return;
    }

    const id = Number(event.target.dataset.id);
    const chamado = chamados.find(function (item) {
        return item.id === id;
    });

    if (!chamado) return;

    chamadoAtual = chamado;

    modalChamadoTitulo.textContent = chamado.titulo || "Detalhes do chamado";
    modalChamadoNumero.textContent = numeroChamado(chamado);
    modalChamadoCliente.textContent = nomeCliente(chamado);

    modalChamadoPrioridade.textContent = formatarPrioridade(chamado.prioridade);
    modalChamadoPrioridade.className =
        "ticket-priority " + cssPrioridade(chamado.prioridade);

    modalChamadoStatus.textContent = formatarStatus(chamado.status);
    modalChamadoStatus.className = "ticket-status " + cssStatus(chamado.status);

    novoStatusChamado.value = String(chamado.status || "ABERTO").toUpperCase();

    const sla = getSlaStatus(chamado);
    modalChamadoSla.innerHTML = renderSlaBadge(sla, describeSlaTooltip(chamado, sla));

    if (modalChamadoSlaLimite) {
        const limite = chamado.dataLimiteResolucao || null;
        modalChamadoSlaLimite.textContent = limite
            ? "Limite: " + new Date(limite).toLocaleString("pt-BR")
            : "Sem data limite retornada pela API.";
    }

    modalChamadoResponsavel.textContent = nomeResponsavel(chamado);
    modalChamadoDescricao.textContent = chamado.descricao || "Descrição não informada";

    await renderizarTimeline(chamado.id);

    modalChamado.hidden = false;
});

// =========================================
// FECHAR MODAL
// =========================================

function fecharModalChamado() {
    modalChamado.hidden = true;
}

btnFecharModalChamado.addEventListener("click", fecharModalChamado);
btnFecharModalChamadoFooter.addEventListener("click", fecharModalChamado);

// =========================================
// TIMELINE: GET /api/chamados/{id}/interacoes
// =========================================

async function renderizarTimeline(chamadoId) {
    timelineChamado.innerHTML =
        '<div class="timeline-empty"><p>Carregando interações...</p></div>';

    let interacoes = interacoesCache[chamadoId] || [];

    try {
        const pagina = await apiGetJson(
            "/api/chamados/" + chamadoId + "/interacoes?page=0&size=50"
        );
        if (pagina && pagina.content) {
            interacoes = pagina.content.map(function (item) {
                return {
                    autor: item.autorNome || ("Usuário #" + item.autorId),
                    tipo: "Interação",
                    data: item.dataCriacao
                        ? new Date(item.dataCriacao).toLocaleString("pt-BR")
                        : "—",
                    descricao: item.mensagem
                };
            });
            interacoesCache[chamadoId] = interacoes;
        }
    } catch (erro) {
        // Mantém cache local em caso de falha.
    }

    timelineChamado.innerHTML = "";

    if (interacoes.length === 0) {
        timelineChamado.innerHTML =
            '<div class="timeline-empty"><p>Nenhuma interação registrada.</p></div>';
        return;
    }

    interacoes.forEach(function (interacao) {
        const item = document.createElement("div");
        item.className = "timeline-item";
        item.innerHTML =
            '<div class="timeline-marker"></div>' +
            '<div class="timeline-content">' +
            '<div class="timeline-item-header"><strong>' +
            escapeHtmlChamado(interacao.tipo) +
            "</strong><span>" +
            escapeHtmlChamado(interacao.data) +
            "</span></div>" +
            '<p class="timeline-author">' +
            escapeHtmlChamado(interacao.autor) +
            "</p>" +
            '<p class="timeline-description">' +
            escapeHtmlChamado(interacao.descricao) +
            "</p></div>";
        timelineChamado.appendChild(item);
    });
}

// =========================================
// NOVA INTERAÇÃO: POST /api/chamados/{id}/interacoes
// =========================================

formNovaInteracao.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!chamadoAtual) return;

    const descricao = descricaoInteracao.value.trim();

    if (descricao === "") {
        return;
    }

    try {
        const response = await apiRequest(
            "/api/chamados/" + chamadoAtual.id + "/interacoes",
            {
                method: "POST",
                body: JSON.stringify({ mensagem: descricao })
            }
        );

        if (response && response.status === 403) {
            mostrarChamadosMsg("Você não tem permissão para interagir neste chamado.", "error");
            return;
        }

        if (response && !response.ok && response.status !== 201) {
            mostrarChamadosMsg("Não foi possível salvar a interação.", "error");
            return;
        }

        delete interacoesCache[chamadoAtual.id];
        formNovaInteracao.reset();
        await renderizarTimeline(chamadoAtual.id);
    } catch (erro) {
        const local = {
            autor: nomeResponsavel(chamadoAtual),
            tipo: tipoInteracao.value || "Comentário",
            data: new Date().toLocaleString("pt-BR"),
            descricao: descricao
        };
        if (!interacoesCache[chamadoAtual.id]) {
            interacoesCache[chamadoAtual.id] = [];
        }
        interacoesCache[chamadoAtual.id].push(local);
        formNovaInteracao.reset();
        await renderizarTimeline(chamadoAtual.id);
    }
});

// =========================================
// ALTERAR STATUS: PATCH /api/chamados/{id}/status
// =========================================

novoStatusChamado.addEventListener("change", async function () {
    if (!chamadoAtual) {
        return;
    }

    const anterior = chamadoAtual.status;
    const novo = novoStatusChamado.value;

    try {
        const response = await apiRequest(
            "/api/chamados/" + chamadoAtual.id + "/status",
            {
                method: "PATCH",
                body: JSON.stringify({ status: novo })
            }
        );

        if (!response) {
            return;
        }

        if (response.status === 403) {
            mostrarChamadosMsg(
                "Apenas técnico ou administrador pode marcar como RESOLVIDO.",
                "error"
            );
            novoStatusChamado.value = String(anterior || "ABERTO").toUpperCase();
            return;
        }

        if (!response.ok) {
            mostrarChamadosMsg("Status inválido ou não permitido.", "error");
            novoStatusChamado.value = String(anterior || "ABERTO").toUpperCase();
            return;
        }

        const atualizado = await response.json();
        chamadoAtual.status = atualizado.status || novo;
        if (atualizado.dataFechamento !== undefined) {
            chamadoAtual.dataFechamento = atualizado.dataFechamento;
        }

        modalChamadoStatus.textContent = formatarStatus(chamadoAtual.status);
        modalChamadoStatus.className = "ticket-status " + cssStatus(chamadoAtual.status);

        const sla = getSlaStatus(chamadoAtual);
        modalChamadoSla.innerHTML = renderSlaBadge(sla, describeSlaTooltip(chamadoAtual, sla));

        await carregarChamados();
    } catch (erro) {
        mostrarChamadosMsg("Não foi possível alterar o status. Tente novamente.", "error");
        novoStatusChamado.value = String(anterior || "ABERTO").toUpperCase();
    }
});

// =========================================
// PRÉ-VISUALIZAÇÃO DE IMAGENS (local)
// =========================================

if (imagensChamado) {
    imagensChamado.addEventListener("change", function () {
        previewImagens.innerHTML = "";
        const arquivos = Array.from(imagensChamado.files || []);

        if (arquivos.length === 0) {
            return;
        }

        arquivos.forEach(function (arquivo, indice) {
            if (!arquivo.type.startsWith("image/")) {
                return;
            }

            const container = document.createElement("div");
            container.className = "preview-imagem-item";

            const imagem = document.createElement("img");
            imagem.src = URL.createObjectURL(arquivo);
            imagem.alt = "Imagem anexada ao chamado";

            const botaoRemover = document.createElement("button");
            botaoRemover.type = "button";
            botaoRemover.className = "btn-remover-imagem";
            botaoRemover.textContent = "Remover";

            botaoRemover.addEventListener("click", function () {
                arquivos.splice(indice, 1);
                atualizarArquivos(arquivos);
                container.remove();
            });

            container.appendChild(imagem);
            container.appendChild(botaoRemover);
            previewImagens.appendChild(container);
        });
    });
}

function atualizarArquivos(arquivos) {
    const dataTransfer = new DataTransfer();
    arquivos.forEach(function (arquivo) {
        dataTransfer.items.add(arquivo);
    });
    imagensChamado.files = dataTransfer.files;
}

// =========================================
// INICIALIZAÇÃO
// =========================================

carregarChamados();