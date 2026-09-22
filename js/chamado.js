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
const btnLogout = document.getElementById("btnLogout");
const modalChamado = document.getElementById("modalChamado");
const modalChamadoTitulo = document.getElementById("modalChamadoTitulo");
const modalChamadoNumero = document.getElementById("modalChamadoNumero");
const modalChamadoCliente = document.getElementById("modalChamadoCliente");
const modalChamadoPrioridade = document.getElementById("modalChamadoPrioridade");
const modalChamadoStatus = document.getElementById("modalChamadoStatus");
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

// =========================================
// LISTA REAL DE CHAMADOS DA API
// =========================================

let chamados = [];

// =========================================
// DADOS TEMPORÁRIOS DA TIMELINE
// =========================================

const interacoesChamados = {};

// =========================================
// FUNÇÕES DE FORMATAÇÃO (AJUSTE DTO -> HTML)
// =========================================

function formatarPrioridadeLabel(prio) {
    if (!prio) return "Baixa";
    const p = prio.toUpperCase();
    if (p === "BAIXA") return "Baixa";
    if (p === "MEDIA") return "Média";
    if (p === "ALTA") return "Alta";
    if (p === "CRITICA") return "Crítica";
    return prio;
}

function formatarStatusLabel(status) {
    if (!status) return "Aberto";
    const s = status.toUpperCase();
    if (s === "ABERTO") return "Aberto";
    if (s === "EM_ANDAMENTO") return "Em andamento";
    if (s === "EM_ATRASO") return "Em atraso";
    if (s === "RESOLVIDO") return "Resolvido";
    if (s === "FECHADO") return "Fechado";
    return status;
}

function getStatusCssClass(status) {
    if (!status) return "aberto";
    const s = status.toUpperCase();
    if (s === "EM_ANDAMENTO") return "andamento";
    if (s === "EM_ATRASO") return "atrasado"; // Adicione .ticket-status.atrasado no seu CSS
    if (s === "RESOLVIDO") return "resolvido";
    if (s === "FECHADO") return "fechado";
    return s.toLowerCase();
}

// =========================================
// INICIALIZAÇÃO E INTEGRAÇÃO COM API
// =========================================

async function inicializarChamados() {
    try {
        const dados = await carregarKanban();
        
        // Junta todas as listas devolvidas pelo Spring Boot num único array
        chamados = [
            ...(dados.abertos || []),
            ...(dados.emAndamento || []),
            ...(dados.emAtraso || []),
            ...(dados.resolvidos || [])
        ];

        renderizarChamados();
        console.log("Módulo de chamados carregado com sucesso da API.");

    } catch (error) {
        console.error("Erro ao carregar chamados:", error);
        chamadosTableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <h3 style="color: red;">Erro de comunicação</h3>
                        <p>Não foi possível carregar os chamados do servidor.</p>
                    </div>
                </td>
            </tr>
        `;
    }
}

// =========================================
// EXIBIR CHAMADOS
// =========================================

function renderizarChamados() {

    chamadosTableBody.innerHTML = "";

    const termo = buscarChamado.value.trim().toLowerCase();
    const statusFiltro = filtroStatus.value.toLowerCase();
    const prioridadeFiltro = filtroPrioridade.value.toLowerCase();

    const chamadosFiltrados = chamados.filter(function (chamado) {

        // Pesquisa
        const correspondeBusca =
            String(chamado.id).includes(termo) ||
            (chamado.titulo && chamado.titulo.toLowerCase().includes(termo)) ||
            (chamado.solicitanteId && String(chamado.solicitanteId).includes(termo));

        // Status
        const statusChamado = chamado.status ? chamado.status.toLowerCase() : "";
        let correspondeStatus = false;
        if (statusFiltro === "todos") {
            correspondeStatus = true;
        } else if (statusFiltro === "andamento" && (statusChamado === "em_andamento" || statusChamado === "em_atraso")) {
            correspondeStatus = true;
        } else {
            correspondeStatus = (statusChamado === statusFiltro);
        }

        // Prioridade
        const prioChamado = chamado.prioridade ? chamado.prioridade.toLowerCase() : "";
        const correspondePrioridade = (prioridadeFiltro === "todas" || prioChamado === prioridadeFiltro);

        return correspondeBusca && correspondeStatus && correspondePrioridade;
    });

    if (chamadosFiltrados.length === 0) {
        chamadosTableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <h3>Nenhum chamado encontrado</h3>
                        <p>Tente ajustar os filtros de busca.</p>
                    </div>
                </td>
            </tr>
        `;
        atualizarContador(0);
        return;
    }

    chamadosFiltrados.forEach(function (chamado) {

        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>
                <strong>#${chamado.id}</strong>
            </td>
            <td>
                ${chamado.titulo}
            </td>
            <td>
                ID: ${chamado.solicitanteId || "N/A"}
            </td>
            <td>
                <span class="ticket-priority ${chamado.prioridade ? chamado.prioridade.toLowerCase() : 'baixa'}">
                    ${formatarPrioridadeLabel(chamado.prioridade)}
                </span>
            </td>
            <td>
                <span class="ticket-status ${getStatusCssClass(chamado.status)}">
                    ${formatarStatusLabel(chamado.status)}
                </span>
            </td>
            <td>
                ${chamado.tecnicoId ? 'ID: ' + chamado.tecnicoId : 'Não atribuído'}
            </td>
            <td>
                <button
                    type="button"
                    class="btn btn-secondary btn-visualizar-chamado"
                    data-id="${chamado.id}"
                >
                    Visualizar
                </button>
            </td>
        `;

        chamadosTableBody.appendChild(linha);
    });

    atualizarContador(chamadosFiltrados.length);
}

// =========================================
// ATUALIZAR CONTADOR
// =========================================

function atualizarContador(quantidade) {
    totalChamados.textContent = quantidade === 1 ? "1 chamado" : `${quantidade} chamados`;
}

// =========================================
// VALIDAÇÃO DO FORMULÁRIO (SIMULAÇÃO)
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
    if (prioridadeChamado.value === "") {
        prioridadeChamadoError.textContent = "Selecione uma prioridade.";
        valido = false;
    }
    return valido;
}

// =========================================
// ENVIO DO FORMULÁRIO (SIMULAÇÃO DE POST)
// =========================================

const novoChamadoForm = document.getElementById("novoChamadoForm");

novoChamadoForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!validarFormulario()) return;

    alert("A integração POST para criar chamados será feita na próxima etapa!");
    
    novoChamadoForm.reset();
    formNovoChamado.hidden = true;
});

btnNovoChamado.addEventListener("click", function () {
    formNovoChamado.hidden = false;
});

btnCancelarChamado.addEventListener("click", function () {
    novoChamadoForm.reset();
    tituloChamadoError.textContent = "";
    formNovoChamado.hidden = true;
});

// =========================================
// LOGOUT
// =========================================

btnLogout.addEventListener("click", logout);

// =========================================
// BUSCA E FILTROS
// =========================================

buscarChamado.addEventListener("input", renderizarChamados);
filtroStatus.addEventListener("change", renderizarChamados);
filtroPrioridade.addEventListener("change", renderizarChamados);

// =========================================
// MODAL DE DETALHES DO CHAMADO
// =========================================

chamadosTableBody.addEventListener("click", function (event) {

    if (!event.target.classList.contains("btn-visualizar-chamado")) return;

    const idChamado = parseInt(event.target.dataset.id);
    const chamado = chamados.find(c => c.id === idChamado);

    if (!chamado) return;

    chamadoAtual = chamado;
    
    modalChamadoTitulo.textContent = chamado.titulo;
    modalChamadoNumero.textContent = `#${chamado.id}`;
    modalChamadoCliente.textContent = `ID: ${chamado.solicitanteId || "N/A"}`;
    
    modalChamadoPrioridade.textContent = formatarPrioridadeLabel(chamado.prioridade);
    modalChamadoPrioridade.className = `ticket-priority ${chamado.prioridade ? chamado.prioridade.toLowerCase() : 'baixa'}`;
    
    modalChamadoStatus.textContent = formatarStatusLabel(chamado.status);
    
    // Seleciona o valor no select do modal (mapeamento básico)
    const s = getStatusCssClass(chamado.status);
    novoStatusChamado.value = s === "atrasado" ? "andamento" : s;
    
    modalChamadoStatus.className = `ticket-status ${s}`;
    
    modalChamadoResponsavel.textContent = chamado.tecnicoId ? `ID: ${chamado.tecnicoId}` : "Não atribuído";
    
    modalChamadoDescricao.textContent = chamado.tipo ? `Tipo: ${chamado.tipo}` : "Resumo do cartão Kanban (sem descrição detalhada)";

    renderizarTimeline(chamado.id);
    
    modalChamado.hidden = false;
});

// =========================================
// FECHAR MODAL DE DETALHES
// =========================================

function fecharModalChamado() {
    modalChamado.hidden = true;
}

btnFecharModalChamado.addEventListener("click", fecharModalChamado);
btnFecharModalChamadoFooter.addEventListener("click", fecharModalChamado);

// =========================================
// RENDERIZAR TIMELINE (SIMULADA)
// =========================================

function renderizarTimeline(idChamado) {
    const interacoes = interacoesChamados[idChamado] || [];
    timelineChamado.innerHTML = "";

    if (interacoes.length === 0) {
        timelineChamado.innerHTML = `
            <div class="timeline-empty">
                <p>Nenhuma interação registrada.</p>
            </div>
        `;
        return;
    }

    interacoes.forEach(function (interacao) {
        const item = document.createElement("div");
        item.className = "timeline-item";
        item.innerHTML = `
            <div class="timeline-marker"></div>
            <div class="timeline-content">
                <div class="timeline-item-header">
                    <strong>${interacao.tipo}</strong>
                    <span>${interacao.data}</span>
                </div>
                <p class="timeline-author">${interacao.autor}</p>
                <p class="timeline-description">${interacao.descricao}</p>
            </div>
        `;
        timelineChamado.appendChild(item);
    });
}

// =========================================
// ADICIONAR NOVA INTERAÇÃO (LOCAL)
// =========================================

formNovaInteracao.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!chamadoAtual) return;

    const tipo = tipoInteracao.value;
    const descricao = descricaoInteracao.value.trim();

    if (tipo === "" || descricao === "") return;

    const novaInteracao = {
        autor: `Técnico (ID: ${chamadoAtual.tecnicoId || 'Você'})`,
        tipo: tipo,
        data: new Date().toLocaleString("pt-BR"),
        descricao: descricao
    };

    if (!interacoesChamados[chamadoAtual.id]) {
        interacoesChamados[chamadoAtual.id] = [];
    }

    interacoesChamados[chamadoAtual.id].push(novaInteracao);
    renderizarTimeline(chamadoAtual.id);
    formNovaInteracao.reset();
});

// =========================================
// ALTERAR STATUS DO CHAMADO (LOCAL)
// =========================================

novoStatusChamado.addEventListener("change", function () {
    if (!chamadoAtual) return;
    
    // Altera visualmente (no futuro faremos requisição PUT para o back-end aqui)
    modalChamadoStatus.textContent = formatarStatusLabel(novoStatusChamado.value);
    modalChamadoStatus.className = `ticket-status ${novoStatusChamado.value}`;
});

// =========================================
// PRÉ-VISUALIZAÇÃO DE IMAGENS
// =========================================

imagensChamado.addEventListener("change", function () {
    previewImagens.innerHTML = "";
    const arquivos = Array.from(imagensChamado.files);

    if (arquivos.length === 0) return;

    arquivos.forEach(function (arquivo, indice) {
        if (!arquivo.type.startsWith("image/")) return;

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

function atualizarArquivos(arquivos) {
    const dataTransfer = new DataTransfer();
    arquivos.forEach(arquivo => dataTransfer.items.add(arquivo));
    imagensChamado.files = dataTransfer.files;
}

// INICIA O CARREGAMENTO DOS DADOS DA API
inicializarChamados();