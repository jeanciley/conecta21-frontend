import { estaAutenticado, logout } from './auth.js';

// =========================================
// DASHBOARD - CONECTA21
// Usa: GET /api/dashboard e GET /api/chamados/kanban
// =========================================

if (!estaAutenticado()) {
    window.location.href = "login.html";
}

const btnLogout = document.getElementById("btnLogout");

if (btnLogout) {
    btnLogout.addEventListener("click", function () {
        logout();
    });
}

const metricAbertos = document.getElementById("metricAbertos");
const metricAndamento = document.getElementById("metricAndamento");
const metricResolvidos = document.getElementById("metricResolvidos");
const metricAtraso = document.getElementById("metricAtraso");
const dashboardMsg = document.getElementById("dashboardMsg");
const listaAtraso = document.getElementById("listaAtraso");
const listaCategorias = document.getElementById("listaCategorias");

function mostrarDashboardMsg(texto, tipo) {
    if (!dashboardMsg) {
        return;
    }
    dashboardMsg.hidden = false;
    dashboardMsg.textContent = texto;
    dashboardMsg.className = "dashboard-msg " + (tipo || "error");
}

function limparDashboardMsg() {
    if (!dashboardMsg) {
        return;
    }
    dashboardMsg.hidden = true;
    dashboardMsg.textContent = "";
    dashboardMsg.className = "dashboard-msg";
}

function escapeHtml(valor) {
    return String(valor == null ? "" : valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

async function carregarDashboard() {
    limparDashboardMsg();

    try {
        const dados = await apiGetJson("/api/dashboard");

        if (metricAbertos) {
            metricAbertos.textContent = dados.chamadosAbertos ?? 0;
        }
        if (metricAndamento) {
            metricAndamento.textContent = dados.chamadosEmAndamento ?? 0;
        }
        if (metricResolvidos) {
            metricResolvidos.textContent = dados.chamadosResolvidos ?? 0;
        }
        if (metricAtraso) {
            metricAtraso.textContent = dados.chamadosEmAtraso ?? 0;
        }

        renderizarCategorias(dados.chamadosPorCategoria || {});
    } catch (erro) {
        const status = erro && erro.status ? erro.status : 0;

        if (status === 401) {
            return;
        }

        if (metricAbertos) {
            metricAbertos.textContent = "—";
        }
        if (metricAndamento) {
            metricAndamento.textContent = "—";
        }
        if (metricResolvidos) {
            metricResolvidos.textContent = "—";
        }
        if (metricAtraso) {
            metricAtraso.textContent = "—";
        }

        mostrarDashboardMsg(getMensagemErroAmigavel(status), "error");

        if (listaCategorias) {
            listaCategorias.innerHTML =
                '<div class="empty-state"><p>Não foi possível carregar as categorias.</p></div>';
        }
    }
}

function renderizarCategorias(porCategoria) {
    if (!listaCategorias) {
        return;
    }

    const entradas = Object.entries(porCategoria);

    if (entradas.length === 0) {
        listaCategorias.innerHTML =
            '<div class="empty-state"><h3>Nenhum dado por categoria</h3>' +
            "<p>Os chamados por categoria aparecerão aqui.</p></div>";
        return;
    }

    const itens = entradas
        .map(function (par) {
            return (
                '<li class="categoria-item"><span>' +
                escapeHtml(par[0]) +
                "</span><strong>" +
                escapeHtml(par[1]) +
                "</strong></li>"
            );
        })
        .join("");

    listaCategorias.innerHTML = '<ul class="categoria-list">' + itens + "</ul>";
}

async function carregarAtraso() {
    if (!listaAtraso) {
        return;
    }

    try {
        const kanban = await apiGetJson("/api/chamados/kanban?limite=5");
        const emAtraso = (kanban && kanban.emAtraso) || [];

        if (emAtraso.length === 0) {
            listaAtraso.innerHTML =
                '<div class="empty-state"><h3>Nenhum chamado em atraso</h3>' +
                "<p>Todos os atendimentos estão dentro do SLA.</p></div>";
            return;
        }

        const itens = emAtraso
            .slice(0, 5)
            .map(function (card) {
                const sla = getSlaStatus(card);
                return (
                    '<li class="atraso-item"><div><strong>#' +
                    escapeHtml(card.id) +
                    " — " +
                    escapeHtml(card.titulo) +
                    "</strong><span class=\"atraso-meta\">" +
                    escapeHtml(formatarPrioridade(card.prioridade)) +
                    "</span></div>" +
                    renderSlaBadge(sla) +
                    "</li>"
                );
            })
            .join("");

        listaAtraso.innerHTML = '<ul class="atraso-list">' + itens + "</ul>";
    } catch (erro) {
        const status = erro && erro.status ? erro.status : 0;
        if (status === 401) {
            return;
        }
        listaAtraso.innerHTML =
            '<div class="empty-state"><p>Não foi possível carregar os atrasos.</p></div>';
    }
}

// Inicia o carregamento quando o script é executado
carregarDashboard();
carregarAtraso();