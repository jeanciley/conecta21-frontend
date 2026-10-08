// =========================================
// DASHBOARD - CONECTA21
// Usa: GET /api/dashboard e GET /api/chamados com filtros suportados.
// =========================================


// =========================================
// VERIFICAÇÃO DE AUTENTICAÇÃO
// =========================================

if (!estaAutenticado()) {
    window.location.href = "login.html";
}


// =========================================
// LOGOUT DA SIDEBAR
// =========================================

const btnLogout = document.getElementById("btnLogout");

if (btnLogout) {

    btnLogout.addEventListener("click", function () {

        logout();

    });

}


// =========================================
// ELEMENTOS DO MENU DO USUÁRIO
// =========================================

const btnUserMenu =
    document.getElementById("btnUserMenu");

const userMenu =
    document.getElementById("userMenu");

const btnUserLogout =
    document.getElementById("btnUserLogout");

const dashboardUserName =
    document.getElementById("dashboardUserName");

const dashboardUserProfile =
    document.getElementById("dashboardUserProfile");

const userInitials =
    document.getElementById("userInitials");


// =========================================
// ELEMENTOS DO DASHBOARD
// =========================================

const metricAbertos =
    document.getElementById("metricAbertos");

const metricAndamento =
    document.getElementById("metricAndamento");

const metricResolvidos =
    document.getElementById("metricResolvidos");

const metricAtraso =
    document.getElementById("metricAtraso");

const dashboardMsg =
    document.getElementById("dashboardMsg");

const listaAtraso =
    document.getElementById("listaAtraso");

const listaCategorias =
    document.getElementById("listaCategorias");

const statusChart =
    document.getElementById("statusChart");

const slaChart =
    document.getElementById("slaChart");

const dashboardViews = {
    externos: {
        interno: false,
        message: dashboardMsg,
        metrics: [metricAbertos, metricAndamento, metricResolvidos, metricAtraso],
        status: statusChart,
        sla: slaChart,
        categories: listaCategorias,
        overdue: listaAtraso
    },
    internos: {
        interno: true,
        message: document.getElementById("dashboardMsgInternos"),
        metrics: [
            document.getElementById("metricAbertosInternos"),
            document.getElementById("metricAndamentoInternos"),
            document.getElementById("metricResolvidosInternos"),
            document.getElementById("metricAtrasoInternos")
        ],
        status: document.getElementById("statusChartInternos"),
        sla: document.getElementById("slaChartInternos"),
        categories: document.getElementById("listaCategoriasInternos"),
        overdue: document.getElementById("listaAtrasoInternos")
    }
};


// =========================================
// MENSAGENS DO DASHBOARD
// =========================================

function mostrarDashboardMsg(texto, tipo, elemento = dashboardMsg) {

    if (!elemento) {
        return;
    }

    elemento.hidden = false;

    elemento.textContent = texto;

    elemento.className =
        "dashboard-msg " + (tipo || "error");
}


function limparDashboardMsg(elemento = dashboardMsg) {

    if (!elemento) {
        return;
    }

    elemento.hidden = true;

    elemento.textContent = "";

    elemento.className =
        "dashboard-msg";
}


// =========================================
// PROTEÇÃO CONTRA HTML
// =========================================

function escapeHtml(valor) {

    return String(valor == null ? "" : valor)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#39;");
}


// =========================================
// FORMATAÇÃO DO PERFIL
// =========================================

function formatarPerfil(perfil) {

    if (!perfil) {
        return "Usuário";
    }

    const perfis = {

        ADMIN: "Administrador",

        TECNICO: "Técnico",

        USUARIO: "Usuário",

        USUARIO_COMUM: "Usuário",

        GESTOR: "Gestor"

    };

    return perfis[perfil] || perfil;
}


// =========================================
// GERA AS INICIAIS DO USUÁRIO
// =========================================

function gerarIniciais(nome) {

    if (!nome) {
        return "U";
    }

    const partes = nome
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (partes.length === 1) {

        return partes[0]
            .substring(0, 2)
            .toUpperCase();

    }

    return (
        partes[0].charAt(0) +
        partes[partes.length - 1].charAt(0)
    ).toUpperCase();
}


// =========================================
// CARREGAR USUÁRIO LOGADO
// =========================================

async function carregarUsuarioDashboard(usuarioAtual = null) {

    try {

        const usuario = usuarioAtual || await apiGetJson("/api/usuarios/me");


        // -----------------------------------------
        // NOME
        // -----------------------------------------

        const nome =
            usuario.nome ||
            usuario.nomeCompleto ||
            usuario.name ||
            usuario.email ||
            "Usuário";


        if (dashboardUserName) {

            dashboardUserName.textContent =
                nome;

        }


        // -----------------------------------------
        // PERFIL
        // -----------------------------------------

        if (dashboardUserProfile) {

            dashboardUserProfile.textContent =
                formatarPerfil(usuario.perfil);

        }


        // -----------------------------------------
        // INICIAIS DO AVATAR
        // -----------------------------------------

        if (userInitials) {

            userInitials.textContent =
                gerarIniciais(nome);

        }


    } catch (erro) {

        const status =
            erro && erro.status
                ? erro.status
                : 0;


        // api.js já trata 401/403.
        if (status === 401 || status === 403) {
            return;
        }


        // Mantém valores padrão caso a API
        // não consiga retornar os dados.

        if (dashboardUserName) {

            dashboardUserName.textContent =
                "Usuário";

        }


        if (dashboardUserProfile) {

            dashboardUserProfile.textContent =
                "Usuário";

        }


        if (userInitials) {

            userInitials.textContent =
                "U";

        }

    }

}


// =========================================
// ABRIR MENU DO USUÁRIO
// =========================================

function abrirMenuUsuario() {

    if (!userMenu || !btnUserMenu) {
        return;
    }

    userMenu.hidden = false;

    btnUserMenu.setAttribute(
        "aria-expanded",
        "true"
    );

}


// =========================================
// FECHAR MENU DO USUÁRIO
// =========================================

function fecharMenuUsuario() {

    if (!userMenu || !btnUserMenu) {
        return;
    }

    userMenu.hidden = true;

    btnUserMenu.setAttribute(
        "aria-expanded",
        "false"
    );

}


// =========================================
// ALTERNAR MENU
// =========================================

function alternarMenuUsuario() {

    if (!userMenu) {
        return;
    }

    if (userMenu.hidden) {

        abrirMenuUsuario();

    } else {

        fecharMenuUsuario();

    }

}


// =========================================
// EVENTO DO BOTÃO DO USUÁRIO
// =========================================

if (btnUserMenu) {

    btnUserMenu.addEventListener(
        "click",
        function (evento) {

            evento.stopPropagation();

            alternarMenuUsuario();

        }
    );

}


// =========================================
// FECHAR AO CLICAR FORA
// =========================================

document.addEventListener(
    "click",
    function (evento) {

        if (!userMenu || userMenu.hidden) {
            return;
        }


        if (
            !userMenu.contains(evento.target) &&
            !btnUserMenu.contains(evento.target)
        ) {

            fecharMenuUsuario();

        }

    }
);


// =========================================
// FECHAR COM ESC
// =========================================

document.addEventListener(
    "keydown",
    function (evento) {

        if (evento.key === "Escape") {

            fecharMenuUsuario();

        }

    }
);


// =========================================
// LOGOUT DO MENU DO USUÁRIO
// =========================================

if (btnUserLogout) {

    btnUserLogout.addEventListener(
        "click",
        function () {

            logout();

        }
    );

}


// =========================================
// CARREGAR DADOS DO DASHBOARD
// =========================================

async function carregarDashboard(chave) {
    const view = dashboardViews[chave];
    limparDashboardMsg(view.message);

    try {
        const endpoint = view.interno ? "/api/dashboard/internos" : "/api/dashboard";
        const dados = await apiGetJson(endpoint);
        const metricas = [
            dados.chamadosAbertos,
            dados.chamadosEmAndamento,
            dados.chamadosResolvidos,
            dados.chamadosEmAtraso
        ];
        view.metrics.forEach((elemento, index) => {
            if (elemento) elemento.textContent = metricas[index] ?? 0;
        });

        renderizarCategorias(dados.chamadosPorCategoria || {}, view.categories);
        renderizarBarras(view.status, dados.chamadosPorStatus || {}, {
            ABERTO: "Aberto",
            EM_ANDAMENTO: "Em atendimento",
            RESOLVIDO: "Resolvido",
            EM_ATRASO: "Em atraso"
        }, view.interno);
        renderizarBarras(view.sla, {
            "No prazo": dados.slaCumpridos || 0,
            "Atrasados": dados.slaViolados || 0
        }, null, view.interno);
    } catch (erro) {
        const status = erro && erro.status ? erro.status : 0;
        if (status === 401) return;
        view.metrics.forEach(elemento => {
            if (elemento) elemento.textContent = "—";
        });
        renderizarBarras(view.status, {}, {}, view.interno);
        renderizarBarras(view.sla, {}, null, view.interno);
        renderizarCategorias({}, view.categories);
        mostrarDashboardMsg(getMensagemErroAmigavel(status), "error", view.message);
    }
}

// =========================================
// RENDERIZAR BARRAS
// =========================================

function renderizarBarras(
    container,
    valores,
    rotulos,
    interno = false
) {

    if (!container) {
        return;
    }


    const entradas =
        Object.entries(valores);


    if (!entradas.length) {

        container.innerHTML =
            '<div class="empty-state">' +
            '<p>Sem dados disponíveis.</p>' +
            '</div>';

        return;
    }


    const maximo =
        Math.max(
            1,
            ...entradas.map(
                item => Number(item[1]) || 0
            )
        );


    container.innerHTML =
        entradas.map(
            ([chave, valor]) => {

                const numero =
                    Number(valor) || 0;


                const largura =
                    numero === 0
                        ? 0
                        : Math.max(
                            3,
                            numero / maximo * 100
                        );


                const label =
                    rotulos && rotulos[chave]
                        ? rotulos[chave]
                        : chave;


                const status = {

                    ABERTO: "aberto",

                    EM_ANDAMENTO: "andamento",

                    RESOLVIDO: "resolvido",

                    EM_ATRASO: "em_atraso"

                }[chave];


                const clicavel =
                    Boolean(status) && !interno;


                const href = "chamado.html?status=" + (status || "")
                    + (interno ? "&interno=true" : "");


                const tag =
                    clicavel
                        ? 'a href="' + href + '"'
                        : "div";


                return (
                    "<" +
                    tag +
                    ' class="analytics-bar" ' +
                    'title="' +
                    escapeHtml(
                        label + ": " + numero
                    ) +
                    '">' +

                    "<span>" +
                    escapeHtml(label) +
                    "</span>" +

                    '<div class="analytics-track">' +

                    '<div class="analytics-fill" ' +
                    'style="width:' +
                    largura +
                    '%"></div>' +

                    "</div>" +

                    '<strong class="analytics-value">' +
                    numero +
                    "</strong>" +

                    "</" +
                    (clicavel ? "a" : "div") +
                    ">"
                );

            }
        ).join("");

}


// =========================================
// RENDERIZAR CATEGORIAS
// =========================================

function renderizarCategorias(porCategoria, container = listaCategorias) {

    if (!container) {
        return;
    }


    const entradas =
        Object.entries(porCategoria);


    if (entradas.length === 0) {

        container.innerHTML =
            '<div class="empty-state">' +

            "<h3>Nenhum dado por categoria</h3>" +

            "<p>" +
            "Os chamados por categoria aparecerão aqui." +
            "</p>" +

            "</div>";

        return;
    }


    const maximo =
        Math.max(
            1,
            ...entradas.map(
                par => Number(par[1]) || 0
            )
        );


    const itens =
        entradas.map(
            function (par) {

                const numero =
                    Number(par[1]) || 0;


                const largura =
                    numero === 0
                        ? 0
                        : Math.max(
                            3,
                            numero / maximo * 100
                        );


                return (
                    '<div class="analytics-bar" ' +
                    'title="' +
                    escapeHtml(
                        par[0] + ": " + numero
                    ) +
                    '">' +

                    "<span>" +
                    escapeHtml(par[0]) +
                    "</span>" +

                    '<div class="analytics-track">' +

                    '<div class="analytics-fill" ' +
                    'style="width:' +
                    largura +
                    '%"></div>' +

                    "</div>" +

                    '<strong class="analytics-value">' +
                    numero +
                    "</strong>" +

                    "</div>"
                );

            }
        ).join("");


    container.innerHTML =
        '<div class="analytics-bars">' +
        itens +
        "</div>";

}


// =========================================
// CARREGAR CHAMADOS EM ATRASO
// =========================================

async function carregarAtraso(chave) {
    const view = dashboardViews[chave];
    const container = view.overdue;
    if (!container) return;

    try {
        const query = "/api/chamados?status=EM_ATRASO&interno=" + view.interno
            + "&page=0&size=5&sort=dataAbertura,DESC";
        const pagina = await apiGetJson(query);
        const emAtraso = (pagina && pagina.content) || [];

        if (!emAtraso.length) {
            container.innerHTML = '<div class="empty-state"><h3>Nenhum chamado em atraso</h3><p>Todos os atendimentos estão dentro do SLA.</p></div>';
            return;
        }

        const itens = emAtraso.map(card => {
            const sla = getSlaStatus(card);
            return '<li class="atraso-item"><div><strong>#' + escapeHtml(card.id)
                + ' — ' + escapeHtml(card.titulo) + '</strong><span class="atraso-meta">'
                + escapeHtml(formatarPrioridade(card.prioridade))
                + '</span></div>' + renderSlaBadge(sla) + '</li>';
        }).join("");
        container.innerHTML = '<ul class="atraso-list">' + itens + '</ul>';
    } catch (erro) {
        const status = erro && erro.status ? erro.status : 0;
        if (status === 401) return;
        container.innerHTML = '<div class="empty-state"><p>Não foi possível carregar os chamados em atraso.</p></div>';
    }
}

async function iniciarDashboard() {
    const tabExternos = document.getElementById("tabExternos");
    const tabInternos = document.getElementById("tabInternos");
    const painelExternos = document.getElementById("painelExternos");
    const painelInternos = document.getElementById("painelInternos");

    try {
        const usuario = await apiGetJson("/api/usuarios/me");
        const permissoes = usuario.permissoes || [];
        const internosPermitidos = permissoes.includes("CHAMADOS_INTERNOS");
        const internoOnly = usuario.perfil === "USUARIO" && internosPermitidos
            && !permissoes.includes("GERENCIAR_CHAMADOS");
        const externosPermitidos = !internoOnly;

        tabExternos.hidden = !externosPermitidos;
        tabInternos.hidden = !internosPermitidos;
        await carregarUsuarioDashboard(usuario);

        async function ativarAba(chave) {
            const internos = chave === "internos";
            if (internos && !internosPermitidos || !internos && !externosPermitidos) return;
            tabExternos.classList.toggle("active", !internos);
            tabInternos.classList.toggle("active", internos);
            tabExternos.setAttribute("aria-selected", String(!internos));
            tabInternos.setAttribute("aria-selected", String(internos));
            painelExternos.hidden = internos;
            painelInternos.hidden = !internos;
            await Promise.all([carregarDashboard(chave), carregarAtraso(chave)]);
        }

        tabExternos.addEventListener("click", () => ativarAba("externos"));
        tabInternos.addEventListener("click", () => ativarAba("internos"));
        await ativarAba(externosPermitidos ? "externos" : "internos");
    } catch (erro) {
        const status = erro && erro.status ? erro.status : 0;
        mostrarDashboardMsg(getMensagemErroAmigavel(status), "error");
    }
}

iniciarDashboard();
