// =========================================
// DASHBOARD - CONECTA21
// Usa: GET /api/dashboard e GET /api/chamados com filtros suportados.
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
const statusChart = document.getElementById("statusChart");
const slaChart = document.getElementById("slaChart");

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
        renderizarBarras(statusChart, dados.chamadosPorStatus || {}, {
            ABERTO: "Aberto", EM_ANDAMENTO: "Em atendimento", RESOLVIDO: "Resolvido", EM_ATRASO: "Em atraso"
        });
        renderizarBarras(slaChart, {
            "Resposta cumprida": dados.slaRespostaCumprido || 0,
            "Resposta violada": dados.slaRespostaViolado || 0,
            "Resolução cumprida": dados.slaCumpridos || 0,
            "Resolução violada": dados.slaViolados || 0
        });
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

function renderizarBarras(container, valores, rotulos) {
    if (!container) return;
    const entradas = Object.entries(valores);
    if (!entradas.length) {
        container.innerHTML = '<div class="empty-state"><p>Sem dados disponíveis.</p></div>';
        return;
    }
    const maximo = Math.max(1, ...entradas.map(item => Number(item[1]) || 0));
    container.innerHTML = entradas.map(([chave, valor]) => {
        const numero = Number(valor) || 0;
        const largura = numero === 0 ? 0 : Math.max(3, numero / maximo * 100);
        const label = rotulos && rotulos[chave] ? rotulos[chave] : chave;
        const status = { ABERTO: "aberto", EM_ANDAMENTO: "andamento", RESOLVIDO: "resolvido", EM_ATRASO: "em_atraso" }[chave];
        const clicavel = Boolean(status) || /violada/i.test(chave);
        const href = 'chamado.html?status=' + (status || "em_atraso");
        const tag = clicavel ? 'a href="' + href + '"' : "div";
        return '<' + tag + ' class="analytics-bar" title="' + escapeHtml(label + ': ' + numero) + '"><span>' + escapeHtml(label) + '</span>' +
            '<div class="analytics-track"><div class="analytics-fill" style="width:' + largura + '%"></div></div><strong class="analytics-value">' + numero + '</strong></' + (clicavel ? "a" : "div") + ">";
    }).join("");
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

    const maximo = Math.max(1, ...entradas.map(par => Number(par[1]) || 0));
    const itens = entradas.map(function (par) {
        const numero = Number(par[1]) || 0;
        const largura = numero === 0 ? 0 : Math.max(3, numero / maximo * 100);
        return '<div class="analytics-bar" title="' + escapeHtml(par[0] + ': ' + numero) + '"><span>' + escapeHtml(par[0]) + '</span>' +
            '<div class="analytics-track"><div class="analytics-fill" style="width:' + largura + '%"></div></div><strong class="analytics-value">' + numero + '</strong></div>';
    }).join("");
    listaCategorias.innerHTML = '<div class="analytics-bars">' + itens + '</div>';
}

async function carregarAtraso() {
    if (!listaAtraso) {
        return;
    }

    try {
        const pagina = await apiGetJson("/api/chamados?status=EM_ATRASO&page=0&size=5&sort=dataAbertura,DESC");
        const emAtraso = (pagina && pagina.content) || [];

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

carregarDashboard();
carregarAtraso();
