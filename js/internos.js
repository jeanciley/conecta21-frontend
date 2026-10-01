// =========================================
// CHAMADOS INTERNOS - CONECTA21
// Mesmo padrão visual/UX de chamado.js (Chamados já existentes).
// Regra preservada: GET /api/chamados?interno=true e
// POST /api/chamados { titulo, descricao, categoriaId, interno:true }.
// Prioridade vem da categoria (sem campo manual).
// =========================================

if (!estaAutenticado()) {
    window.location.href = "login.html";
}

// =========================================
// ELEMENTOS DO HTML (IDs originais preservados)
// =========================================

const internosMsg = document.getElementById("internosMsg");
const internoEditor = document.getElementById("internoEditor");
const internoForm = document.getElementById("internoForm");
const internoTitulo = document.getElementById("internoTitulo");
const internoCategoria = document.getElementById("internoCategoria");
const internoDescricao = document.getElementById("internoDescricao");
const internosTabela = document.getElementById("internosTabela");

const novoInternoBtn = document.getElementById("novoInternoBtn");
const cancelarInternoBtn = document.getElementById("cancelarInterno");

const buscarInterno = document.getElementById("buscarInterno");
const filtroStatusInterno = document.getElementById("filtroStatusInterno");
const filtroPrioridadeInterno = document.getElementById("filtroPrioridadeInterno");
const totalInternos = document.getElementById("totalInternos");

const btnLogout = document.getElementById("btnLogout");

// Modal (mesmo padrão de chamado.html, com sufixo Interno)
const modalInterno = document.getElementById("modalInterno");
const modalInternoTitulo = document.getElementById("modalInternoTitulo");
const modalInternoNumero = document.getElementById("modalInternoNumero");
const modalInternoSolicitante = document.getElementById("modalInternoSolicitante");
const modalInternoCategoria = document.getElementById("modalInternoCategoria");
const modalInternoPrioridade = document.getElementById("modalInternoPrioridade");
const modalInternoStatus = document.getElementById("modalInternoStatus");
const modalInternoSla = document.getElementById("modalInternoSla");
const modalInternoSlaLimite = document.getElementById("modalInternoSlaLimite");
const modalInternoResponsavel = document.getElementById("modalInternoResponsavel");
const modalInternoDescricao = document.getElementById("modalInternoDescricao");
const btnFecharModalInterno = document.getElementById("btnFecharModalInterno");
const btnFecharModalInternoFooter = document.getElementById("btnFecharModalInternoFooter");
const timelineInterno = document.getElementById("timelineInterno");
const novoStatusInterno = document.getElementById("novoStatusInterno");
const formNovaInteracaoInterno = document.getElementById("formNovaInteracaoInterno");
const tipoInteracaoInterno = document.getElementById("tipoInteracaoInterno");
const descricaoInteracaoInterno = document.getElementById("descricaoInteracaoInterno");
const imagensInterno = document.getElementById("imagensInterno");
const previewImagensInterno = document.getElementById("previewImagensInterno");

let internoAtual = null;
let internos = [];
const interacoesCacheInterno = {};

// =========================================
// HELPERS (mesmo padrão de chamado.js)
// =========================================

function safeInterno(valor) {
    return String(valor == null ? "" : valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function mostrarInternosMsg(texto, tipo) {
    if (!internosMsg) {
        return;
    }
    internosMsg.hidden = false;
    internosMsg.textContent = texto;
    internosMsg.className = "sla-msg " + (tipo || "error");
}

function limparInternosMsg() {
    if (!internosMsg) {
        return;
    }
    internosMsg.hidden = true;
    internosMsg.textContent = "";
    internosMsg.className = "sla-msg";
}

// Compatibilidade com versão anterior
function avisarInterno(texto, erro) {
    if (!texto) {
        limparInternosMsg();
        return;
    }
    mostrarInternosMsg(texto, erro ? "error" : "success");
}

function nomeSolicitanteInterno(chamado) {
    if (chamado.solicitanteNome) {
        return chamado.solicitanteNome;
    }
    if (chamado.cliente) {
        return chamado.cliente;
    }
    if (chamado.solicitanteId) {
        return "Solicitante #" + chamado.solicitanteId;
    }
    return "—";
}

function nomeResponsavelInterno(chamado) {
    if (chamado.tecnicoNome) {
        return chamado.tecnicoNome;
    }
    if (chamado.responsavel) {
        return chamado.responsavel;
    }
    if (chamado.tecnicoId) {
        return "Técnico #" + chamado.tecnicoId;
    }
    return "—";
}

function numeroInterno(chamado) {
    if (chamado.numero) {
        return chamado.numero;
    }
    return "#" + chamado.id;
}

function categoriaInterno(chamado) {
    return chamado.categoriaNome || chamado.categoria || "—";
}

function dataAberturaInterno(chamado) {
    const raw = chamado.dataAbertura || chamado.dataCriacao || chamado.criadoEm;
    if (!raw) {
        return "—";
    }
    try {
        return new Date(raw).toLocaleDateString("pt-BR");
    } catch (e) {
        return "—";
    }
}

// =========================================
// CARREGAR CHAMADOS INTERNOS DA API
// Endpoint preservado: GET /api/chamados?interno=true
// =========================================

async function carregarInternos() {
    limparInternosMsg();
    internosTabela.innerHTML =
        '<tr><td colspan="8"><div class="empty-state"><p>Carregando chamados...</p></div></td></tr>';

    try {
        const pagina = await apiGetJson("/api/chamados?interno=true&page=0&size=100&sort=dataAbertura,DESC");
        const lista = (pagina && pagina.content ? pagina.content : []).map(function (item) {
            return {
                ...item,
                cliente: item.solicitanteNome || item.cliente,
                responsavel: item.tecnicoNome || item.responsavel
            };
        });
        internos = lista;
    } catch (erro) {
        if (erro && erro.status === 401) {
            return;
        }
        mostrarInternosMsg(getMensagemErroAmigavel(erro && erro.status ? erro.status : 0), "error");
        internos = [];
    }

    internos.sort(function (a, b) {
        return (b.id || 0) - (a.id || 0);
    });

    const prioridadesDisponiveis = [...new Set(internos.map(function (c) { return c.prioridade; }).filter(Boolean))];
    if (filtroPrioridadeInterno && prioridadesDisponiveis.length > 0) {
        const selecionada = filtroPrioridadeInterno.value;
        filtroPrioridadeInterno.innerHTML = '<option value="todas">Todas</option>' + prioridadesDisponiveis
            .map(function (p) { return '<option value="' + safeInterno(p) + '">' + safeInterno(formatarPrioridade(p)) + '</option>'; }).join("");
        if (prioridadesDisponiveis.includes(selecionada)) {
            filtroPrioridadeInterno.value = selecionada;
        }
    }

    if (internos.length === 0 && !internosMsg.hidden === false) {
        // mantém mensagem de erro da API, se houver
    }

    renderizarInternos();
}

// =========================================
// FILTROS (mesmo comportamento de chamado.js)
// =========================================

function correspondeStatusInterno(chamado, filtro) {
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

function correspondePrioridadeInterno(chamado, filtro) {
    if (filtro === "todas") {
        return true;
    }
    const pri = String(chamado.prioridade || "").toUpperCase();
    return pri === filtro.toUpperCase();
}

function renderizarInternos() {
    internosTabela.innerHTML = "";

    const termo = (buscarInterno ? buscarInterno.value : "").trim().toLowerCase();
    const statusFiltro = filtroStatusInterno ? filtroStatusInterno.value : "todos";
    const prioridadeFiltro = filtroPrioridadeInterno ? filtroPrioridadeInterno.value : "todas";

    const filtrados = internos.filter(function (chamado) {
        const correspondeBusca =
            String(chamado.id || "").includes(termo) ||
            (chamado.numero || "").toLowerCase().includes(termo) ||
            (chamado.titulo || "").toLowerCase().includes(termo) ||
            categoriaInterno(chamado).toLowerCase().includes(termo) ||
            nomeSolicitanteInterno(chamado).toLowerCase().includes(termo);

        return (
            correspondeBusca &&
            correspondeStatusInterno(chamado, statusFiltro) &&
            correspondePrioridadeInterno(chamado, prioridadeFiltro)
        );
    });

    if (filtrados.length === 0) {
        internosTabela.innerHTML =
            '<tr><td colspan="8"><div class="empty-state">' +
            "<h3>Nenhum chamado encontrado</h3>" +
            "<p>Ajuste os filtros ou abra um novo chamado interno.</p>" +
            "</div></td></tr>";
        atualizarContadorInternos(0);
        return;
    }

    filtrados.forEach(function (chamado) {
        const linha = document.createElement("tr");
        const sla = getSlaStatus(chamado);

        linha.innerHTML =
            "<td><strong>" + safeInterno(numeroInterno(chamado)) + "</strong></td>" +
            "<td>" + safeInterno(chamado.titulo || "—") + "</td>" +
            "<td>" + safeInterno(categoriaInterno(chamado)) + "</td>" +
            '<td><span class="ticket-priority ' + safeInterno(cssPrioridade(chamado.prioridade)) + '">' +
            safeInterno(formatarPrioridade(chamado.prioridade)) +
            "</span></td>" +
            '<td><span class="ticket-status ' + safeInterno(cssStatus(chamado.status)) + '">' +
            safeInterno(formatarStatus(chamado.status)) +
            "</span></td>" +
            "<td>" + renderSlaBadge(sla, describeSlaTooltip(chamado, sla)) + "</td>" +
            "<td>" + safeInterno(dataAberturaInterno(chamado)) + "</td>" +
            '<td><button type="button" class="btn btn-secondary btn-visualizar-interno" data-id="' +
            safeInterno(chamado.id) +
            '">Visualizar</button></td>';

        internosTabela.appendChild(linha);
    });

    atualizarContadorInternos(filtrados.length);
}

function atualizarContadorInternos(quantidade) {
    if (!totalInternos) {
        return;
    }
    totalInternos.textContent =
        quantidade === 1 ? "1 chamado" : quantidade + " chamados";
}

if (buscarInterno) {
    buscarInterno.addEventListener("input", renderizarInternos);
}
if (filtroStatusInterno) {
    filtroStatusInterno.addEventListener("change", renderizarInternos);
}
if (filtroPrioridadeInterno) {
    filtroPrioridadeInterno.addEventListener("change", renderizarInternos);
}

// =========================================
// FORMULÁRIO (IDs e endpoint preservados)
// POST /api/chamados { titulo, descricao, categoriaId, interno:true }
// =========================================

function validarFormularioInterno() {
    let valido = true;

    ["internoTituloError", "internoCategoriaError", "internoDescricaoError"].forEach(function (id) {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = "";
        }
    });

    if (!internoTitulo.value.trim()) {
        const el = document.getElementById("internoTituloError");
        if (el) {
            el.textContent = "O título é obrigatório.";
        }
        valido = false;
    }

    if (!internoCategoria.value) {
        const el = document.getElementById("internoCategoriaError");
        if (el) {
            el.textContent = "Selecione uma categoria.";
        }
        mostrarInternosMsg("Selecione uma categoria para definir a prioridade do atendimento.", "error");
        valido = false;
    }

    if (!internoDescricao.value.trim()) {
        const el = document.getElementById("internoDescricaoError");
        if (el) {
            el.textContent = "A descrição é obrigatória.";
        }
        valido = false;
    }

    return valido;
}

if (novoInternoBtn) {
    novoInternoBtn.addEventListener("click", function () {
        internoEditor.hidden = false;
        internoTitulo.focus();
    });
}

if (cancelarInternoBtn) {
    cancelarInternoBtn.addEventListener("click", function () {
        internoForm.reset();
        internoEditor.hidden = true;
    });
}

if (internoForm) {
    internoForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        if (!validarFormularioInterno()) {
            return;
        }

        const btn = internoForm.querySelector('button[type="submit"]');
        const textoOriginal = btn ? btn.textContent : "";
        if (btn) {
            btn.disabled = true;
            btn.textContent = "Enviando...";
        }

        try {
            const r = await apiRequest("/api/chamados", {
                method: "POST",
                body: JSON.stringify({
                    titulo: internoTitulo.value.trim(),
                    descricao: internoDescricao.value.trim(),
                    categoriaId: Number(internoCategoria.value),
                    interno: true
                })
            });

            if (!r) {
                return;
            }

            if (r.status === 403) {
                mostrarInternosMsg("Você não tem permissão para abrir chamados internos.", "error");
                return;
            }

            if (!r.ok) {
                throw { status: r.status };
            }

            internoForm.reset();
            internoEditor.hidden = true;
            mostrarInternosMsg("Chamado interno aberto.", "success");
            await carregarInternos();
        } catch (err) {
            mostrarInternosMsg(getMensagemErroAmigavel(err.status || 0), "error");
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = textoOriginal;
            }
        }
    });
}

// =========================================
// MODAL DE DETALHES (mesmo padrão de chamado.js)
// =========================================

if (internosTabela) {
    internosTabela.addEventListener("click", async function (event) {
        const alvo = event.target.closest ? event.target.closest(".btn-visualizar-interno") : null;
        if (!alvo) {
            return;
        }

        const id = Number(alvo.dataset.id);
        const chamado = internos.find(function (item) {
            return item.id === id;
        });

        if (!chamado) {
            return;
        }

        internoAtual = chamado;

        modalInternoTitulo.textContent = chamado.titulo || "Detalhes do chamado";
        modalInternoNumero.textContent = numeroInterno(chamado);
        modalInternoSolicitante.textContent = nomeSolicitanteInterno(chamado);
        modalInternoCategoria.textContent = categoriaInterno(chamado);

        modalInternoPrioridade.textContent = formatarPrioridade(chamado.prioridade);
        modalInternoPrioridade.className =
            "ticket-priority " + cssPrioridade(chamado.prioridade);

        modalInternoStatus.textContent = formatarStatus(chamado.status);
        modalInternoStatus.className = "ticket-status " + cssStatus(chamado.status);

        novoStatusInterno.value = String(chamado.status || "ABERTO").toUpperCase();

        const sla = getSlaStatus(chamado);
        modalInternoSla.innerHTML = renderSlaBadge(sla, describeSlaTooltip(chamado, sla));

        if (modalInternoSlaLimite) {
            const limite = chamado.dataLimiteResolucao || null;
            modalInternoSlaLimite.textContent = limite
                ? "Limite: " + new Date(limite).toLocaleString("pt-BR")
                : "Sem data limite retornada pela API.";
        }

        modalInternoResponsavel.textContent = nomeResponsavelInterno(chamado);
        modalInternoDescricao.textContent = chamado.descricao || "Descrição não informada";

        await renderizarTimelineInterno(chamado.id);

        modalInterno.hidden = false;
    });
}

function fecharModalInterno() {
    if (modalInterno) {
        modalInterno.hidden = true;
    }
}

if (btnFecharModalInterno) {
    btnFecharModalInterno.addEventListener("click", fecharModalInterno);
}
if (btnFecharModalInternoFooter) {
    btnFecharModalInternoFooter.addEventListener("click", fecharModalInterno);
}

// =========================================
// TIMELINE: GET /api/chamados/{id}/interacoes
// =========================================

async function renderizarTimelineInterno(chamadoId) {
    timelineInterno.innerHTML =
        '<div class="timeline-empty"><p>Carregando interações...</p></div>';

    let interacoes = interacoesCacheInterno[chamadoId] || [];

    try {
        const pagina = await apiGetJson(
            "/api/chamados/" + chamadoId + "/interacoes?page=0&size=50"
        );
        if (pagina && pagina.content) {
            interacoes = pagina.content.map(function (item) {
                return {
                    id: item.id,
                    autor: item.autorNome || ("Usuário #" + item.autorId),
                    tipo: item.tipo || "Comentário",
                    data: item.dataCriacao
                        ? new Date(item.dataCriacao).toLocaleString("pt-BR")
                        : "—",
                    descricao: item.mensagem,
                    anexos: item.anexos || []
                };
            });
            interacoesCacheInterno[chamadoId] = interacoes;
        }
    } catch (erro) {
        // Mantém cache local em caso de falha.
    }

    timelineInterno.innerHTML = "";

    if (interacoes.length === 0) {
        timelineInterno.innerHTML =
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
            safeInterno(interacao.tipo) +
            "</strong><span>" +
            safeInterno(interacao.data) +
            "</span></div>" +
            '<p class="timeline-author">' +
            safeInterno(interacao.autor) +
            "</p>" +
            '<p class="timeline-description">' +
            safeInterno(interacao.descricao) +
            "</p></div>";
        if (interacao.anexos && interacao.anexos.length) {
            item.innerHTML += '<div class="timeline-attachments">' + interacao.anexos.map(function (anexo) {
                const endpoint = "/api/chamados/" + chamadoId + "/interacoes/" + interacao.id + "/anexos/" + anexo.id;
                return '<button type="button" class="btn btn-secondary btn-anexo-download" data-endpoint="' + safeInterno(endpoint) + '" data-filename="' + safeInterno(anexo.nomeArquivo) + '">' + safeInterno(anexo.nomeArquivo) + '</button>';
            }).join("") + '</div>';
        }
        timelineInterno.appendChild(item);
    });
}

if (timelineInterno) {
    timelineInterno.addEventListener("click", async function (event) {
        const botao = event.target.closest ? event.target.closest(".btn-anexo-download") : null;
        if (!botao) {
            return;
        }
        try {
            await apiDownload(botao.dataset.endpoint, botao.dataset.filename);
        } catch (erro) {
            mostrarInternosMsg("Não foi possível baixar o anexo.", "error");
        }
    });
}

// =========================================
// NOVA INTERAÇÃO: POST /api/chamados/{id}/interacoes
// =========================================

if (formNovaInteracaoInterno) {
    formNovaInteracaoInterno.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (!internoAtual) {
            return;
        }

        const descricao = descricaoInteracaoInterno.value.trim();

        if (descricao === "") {
            return;
        }

        if (!tipoInteracaoInterno.value) {
            mostrarInternosMsg("Selecione o tipo de interação.", "error");
            return;
        }

        const dados = new FormData();
        dados.append("mensagem", descricao);
        dados.append("tipo", tipoInteracaoInterno.value);
        Array.from(imagensInterno && imagensInterno.files ? imagensInterno.files : []).forEach(function (arquivo) {
            dados.append("imagens", arquivo);
        });

        try {
            const response = await apiRequest(
                "/api/chamados/" + internoAtual.id + "/interacoes",
                {
                    method: "POST",
                    body: dados
                }
            );

            if (response && response.status === 403) {
                mostrarInternosMsg("Você não tem permissão para interagir neste chamado.", "error");
                return;
            }

            if (response && !response.ok && response.status !== 201) {
                let detalhe = "Não foi possível salvar a interação.";
                try { detalhe = (await response.text()) || detalhe; } catch (e) { }
                mostrarInternosMsg(detalhe, "error");
                return;
            }

            delete interacoesCacheInterno[internoAtual.id];
            formNovaInteracaoInterno.reset();
            if (imagensInterno) {
                imagensInterno.value = "";
            }
            if (previewImagensInterno) {
                previewImagensInterno.innerHTML = "";
            }
            await renderizarTimelineInterno(internoAtual.id);
        } catch (erro) {
            mostrarInternosMsg("Não foi possível salvar a interação no servidor.", "error");
        }
    });
}

// =========================================
// ALTERAR STATUS: PATCH /api/chamados/{id}/status
// =========================================

if (novoStatusInterno) {
    novoStatusInterno.addEventListener("change", async function () {
        if (!internoAtual) {
            return;
        }

        const anterior = internoAtual.status;
        const novo = novoStatusInterno.value;

        try {
            const response = await apiRequest(
                "/api/chamados/" + internoAtual.id + "/status",
                {
                    method: "PATCH",
                    body: JSON.stringify({ status: novo })
                }
            );

            if (!response) {
                return;
            }

            if (response.status === 403) {
                mostrarInternosMsg(
                    "Apenas técnico ou administrador pode marcar como RESOLVIDO.",
                    "error"
                );
                novoStatusInterno.value = String(anterior || "ABERTO").toUpperCase();
                return;
            }

            if (!response.ok) {
                mostrarInternosMsg("Status inválido ou não permitido.", "error");
                novoStatusInterno.value = String(anterior || "ABERTO").toUpperCase();
                return;
            }

            const atualizado = await response.json();
            internoAtual.status = atualizado.status || novo;
            if (atualizado.dataFechamento !== undefined) {
                internoAtual.dataFechamento = atualizado.dataFechamento;
            }

            modalInternoStatus.textContent = formatarStatus(internoAtual.status);
            modalInternoStatus.className = "ticket-status " + cssStatus(internoAtual.status);

            const sla = getSlaStatus(internoAtual);
            modalInternoSla.innerHTML = renderSlaBadge(sla, describeSlaTooltip(internoAtual, sla));

            await carregarInternos();
        } catch (erro) {
            mostrarInternosMsg("Não foi possível alterar o status. Tente novamente.", "error");
            novoStatusInterno.value = String(anterior || "ABERTO").toUpperCase();
        }
    });
}

// =========================================
// PRÉ-VISUALIZAÇÃO DE IMAGENS (local)
// =========================================

if (imagensInterno) {
    imagensInterno.addEventListener("change", function () {
        previewImagensInterno.innerHTML = "";
        const arquivos = Array.from(imagensInterno.files || []);

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
                atualizarArquivosInterno(arquivos);
                container.remove();
            });

            container.appendChild(imagem);
            container.appendChild(botaoRemover);
            previewImagensInterno.appendChild(container);
        });
    });
}

function atualizarArquivosInterno(arquivos) {
    const dataTransfer = new DataTransfer();
    arquivos.forEach(function (arquivo) {
        dataTransfer.items.add(arquivo);
    });
    imagensInterno.files = dataTransfer.files;
}

// =========================================
// LOGOUT
// =========================================

if (btnLogout) {
    btnLogout.addEventListener("click", function () {
        logout();
    });
}

// =========================================
// INICIALIZAÇÃO (permissões + categorias preservadas)
// =========================================

async function carregarCategoriasInterno() {
    const cats = await apiGetJson("/api/categorias");
    internoCategoria.innerHTML = '<option value="">Selecione a categoria</option>' +
        (cats || []).map(function (c) {
            return '<option value="' + safeInterno(c.id) + '">' + safeInterno(c.nome) + '</option>';
        }).join("");
}

async function iniciarInternos() {
    try {
        const me = await apiGetJson("/api/usuarios/me");
        const perms = me.permissoes || [];
        document.querySelectorAll("[data-admin-only]").forEach(function (x) { x.hidden = me.perfil !== "ADMIN"; });
        document.querySelectorAll("[data-permission]").forEach(function (x) { x.hidden = !perms.includes(x.dataset.permission); });

        if (!perms.includes("CHAMADOS_INTERNOS")) {
            if (novoInternoBtn) {
                novoInternoBtn.hidden = true;
            }
            mostrarInternosMsg("Seu perfil pode consultar chamados gerais, mas não possui acesso ao módulo interno.", "error");
        }

        await carregarCategoriasInterno();
        await carregarInternos();
    } catch (e) {
        mostrarInternosMsg(getMensagemErroAmigavel(e.status || 0), "error");
    }
}

iniciarInternos();
