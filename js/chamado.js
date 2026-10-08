// =========================================
// CHAMADOS - CONECTA21 (Sprint 3)
// Lista paginada via GET /api/chamados (inclui prioridade e SLA).
// =========================================

if (!estaAutenticado()) {
    window.location.href = "login.html";
}


// =========================================
// ELEMENTOS DO HTML
// =========================================

const btnNovoChamado =
    document.getElementById("btnNovoChamado");

const formNovoChamado =
    document.getElementById("formNovoChamado");

const btnCancelarChamado =
    document.getElementById("btnCancelarChamado");

const tituloChamado =
    document.getElementById("tituloChamado");

const clienteChamado =
    document.getElementById("clienteChamado");

const categoriaChamado =
    document.getElementById("categoriaChamado");

document
    .getElementById("prioridadeChamado")
    ?.closest(".form-group")
    ?.remove();

const descricaoChamado =
    document.getElementById("descricaoChamado");

const tituloChamadoError =
    document.getElementById("tituloChamadoError");

const clienteChamadoError =
    document.getElementById("clienteChamadoError");

const descricaoChamadoError =
    document.getElementById("descricaoChamadoError");

const buscarChamado =
    document.getElementById("buscarChamado");

const filtroStatus =
    document.getElementById("filtroStatus");

const statusInicial =
    new URLSearchParams(window.location.search).get("status");

if (statusInicial) {
    filtroStatus.value = statusInicial;
}

const filtroPrioridade =
    document.getElementById("filtroPrioridade");

const chamadosTableBody =
    document.getElementById("chamadosTableBody");

const totalChamados =
    document.getElementById("totalChamados");

const chamadosMsg =
    document.getElementById("chamadosMsg");

const btnLogout =
    document.getElementById("btnLogout");


// =========================================
// MENU DO USUÁRIO
// =========================================

const btnUserMenu =
    document.getElementById("btnUserMenu");

const userMenu =
    document.getElementById("userMenu");

const btnUserLogout =
    document.getElementById("btnUserLogout");

const userInitials =
    document.getElementById("userInitials");

const userMenuName =
    document.getElementById("dashboardUserName");

const userMenuProfile =
    document.getElementById("dashboardUserProfile");


// =========================================
// ELEMENTOS DO MODAL
// =========================================

const modalChamado =
    document.getElementById("modalChamado");

const modalChamadoTitulo =
    document.getElementById("modalChamadoTitulo");

const modalChamadoNumero =
    document.getElementById("modalChamadoNumero");
const modalChamadoNumeroHeader =
    document.getElementById("modalChamadoNumeroHeader");
const modalChamadoStatusHeader =
    document.getElementById("modalChamadoStatusHeader");
const modalChamadoController =
    window.Conecta21TicketModal.bind(modalChamado);

const modalChamadoCliente =
    document.getElementById("modalChamadoCliente");

const modalChamadoPrioridade =
    document.getElementById("modalChamadoPrioridade");

const modalChamadoStatus =
    document.getElementById("modalChamadoStatus");

const modalChamadoSla =
    document.getElementById("modalChamadoSla");

const modalChamadoSlaLimite =
    document.getElementById("modalChamadoSlaLimite");

const modalChamadoResponsavel =
    document.getElementById("modalChamadoResponsavel");

const modalChamadoDescricao =
    document.getElementById("modalChamadoDescricao");

const btnFecharModalChamado =
    document.getElementById("btnFecharModalChamado");

const btnFecharModalChamadoFooter =
    document.getElementById("btnFecharModalChamadoFooter");

const timelineChamado =
    document.getElementById("timelineChamado");

const novoStatusChamado =
    document.getElementById("novoStatusChamado");

const formNovaInteracao =
    document.getElementById("formNovaInteracao");

const imagensChamado =
    document.getElementById("imagensChamado");

const previewImagens =
    document.getElementById("previewImagens");

const tipoInteracao =
    document.getElementById("tipoInteracao");

const descricaoInteracao =
    document.getElementById("descricaoInteracao");

const controleStatusChamado = document.querySelector("[data-ticket-status-control]");
const painelTransferenciaChamado = document.querySelector("[data-ticket-transfer]");
const formularioTransferenciaChamado = document.getElementById("formTransferirChamado");
const seletorNovoResponsavelChamado = document.getElementById("novoResponsavelChamado");
const mensagemTransferenciaChamado = document.querySelector("[data-ticket-transfer-message]");


let chamadoAtual = null;
let chamados = [];
let usuarioAtualChamados = null;
const interacoesCache = {};


// =========================================
// MENU DO USUÁRIO
// =========================================

function formatarPerfil(perfil) {

    const perfis = {
        ADMIN: "Administrador",
        TECNICO: "Técnico",
        USUARIO: "Usuário",
        USUARIO_COMUM: "Usuário",
        GESTOR: "Gestor"
    };

    return perfis[perfil] || perfil || "Usuário";
}


function gerarIniciais(nome) {

    const nomeLimpo = String(nome || "Usuário")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (nomeLimpo.length === 0) {
        return "U";
    }

    if (nomeLimpo.length === 1) {
        return nomeLimpo[0]
            .substring(0, 2)
            .toUpperCase();
    }

    return (
        nomeLimpo[0].charAt(0) +
        nomeLimpo[nomeLimpo.length - 1].charAt(0)
    ).toUpperCase();
}


async function carregarUsuarioMenu() {

    if (!userMenuName || !userMenuProfile || !userInitials) {
        return;
    }

    try {

        const usuario =
            await apiGetJson("/api/usuarios/me");

        usuarioAtualChamados = usuario;
        atualizarPermissoesDoModalChamado();

        const nome =
            usuario.nome ||
            usuario.nomeCompleto ||
            usuario.name ||
            usuario.email ||
            "Usuário";

        const perfil =
            usuario.perfil ||
            "USUARIO";

        userMenuName.textContent = nome;

        userMenuProfile.textContent =
            formatarPerfil(perfil);

        userInitials.textContent =
            gerarIniciais(nome);

    } catch (erro) {

        userMenuName.textContent = "Usuário";
        userMenuProfile.textContent = "Usuário";
        userInitials.textContent = "U";

    }

}

function usuarioPodeGerenciarChamados(usuario = usuarioAtualChamados) {
    return !!usuario && (["ADMIN", "TECNICO"].includes(usuario.perfil)
        || (usuario.permissoes || []).includes("GERENCIAR_CHAMADOS"));
}

function atualizarPermissoesDoModalChamado() {
    const permitido = usuarioPodeGerenciarChamados();
    if (controleStatusChamado) controleStatusChamado.hidden = !permitido;
    if (painelTransferenciaChamado) painelTransferenciaChamado.hidden = !permitido;
}


function abrirMenuUsuario() {

    if (!btnUserMenu || !userMenu) {
        return;
    }

    userMenu.hidden = false;

    btnUserMenu.setAttribute(
        "aria-expanded",
        "true"
    );

}


function fecharMenuUsuario() {

    if (!btnUserMenu || !userMenu) {
        return;
    }

    userMenu.hidden = true;

    btnUserMenu.setAttribute(
        "aria-expanded",
        "false"
    );

}


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


if (btnUserMenu) {

    btnUserMenu.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            alternarMenuUsuario();

        }
    );

}


if (userMenu) {

    userMenu.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

        }
    );

}


document.addEventListener(
    "click",
    function (event) {

        if (
            userMenu &&
            !userMenu.hidden &&
            !event.target.closest(".user-area")
        ) {

            fecharMenuUsuario();

        }

    }
);


document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            fecharMenuUsuario();

        }

    }
);


if (btnUserLogout) {

    btnUserLogout.addEventListener(
        "click",
        function () {

            logout();

        }
    );

}


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

    chamadosMsg.className =
        "sla-msg " + (tipo || "error");

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
// A listagem paginada retorna detalhe, prioridade e prazo SLA.
// =========================================

async function carregarChamados() {

    limparChamadosMsg();

    chamadosTableBody.innerHTML =
        '<tr><td colspan="8"><div class="empty-state"><p>Carregando chamados...</p></div></td></tr>';

    try {

        const pagina =
            await apiGetJson(
                "/api/chamados?page=0&size=100&sort=dataAbertura,DESC"
            );

        chamados =
            (
                pagina &&
                pagina.content
                    ? pagina.content
                    : []
            ).map(function (item) {

                return {
                    ...item,
                    cliente: item.solicitanteNome,
                    responsavel: item.tecnicoNome
                };

            });

    } catch (erro) {

        if (erro && erro.status === 401) {
            return;
        }

        mostrarChamadosMsg(
            getMensagemErroAmigavel(
                erro && erro.status
                    ? erro.status
                    : 0
            ),
            "error"
        );

        chamados = [];

    }

    chamados.sort(function (a, b) {

        return (b.id || 0) - (a.id || 0);

    });


    const prioridadesDisponiveis =
        [
            ...new Set(
                chamados
                    .map(chamado => chamado.prioridade)
                    .filter(Boolean)
            )
        ];


    if (filtroPrioridade) {

        const selecionada =
            filtroPrioridade.value;

        filtroPrioridade.innerHTML =
            '<option value="todas">Todas</option>' +
            prioridadesDisponiveis
                .map(
                    p =>
                        '<option value="' +
                        escapeHtmlChamado(p) +
                        '">' +
                        escapeHtmlChamado(
                            formatarPrioridade(p)
                        ) +
                        "</option>"
                )
                .join("");

        if (
            prioridadesDisponiveis.includes(
                selecionada
            )
        ) {

            filtroPrioridade.value =
                selecionada;

        }

    }


    if (chamados.length === 0) {

        mostrarChamadosMsg(
            "Nenhum chamado retornado pela API. Verifique se o backend está no ar e se há chamados cadastrados.",
            "error"
        );

    }

    renderizarChamados();

}


// =========================================
// VALIDAÇÃO DO FORMULÁRIO
// =========================================

function validarFormulario() {

    let valido = true;

    tituloChamadoError.textContent = "";
    clienteChamadoError.textContent = "";
    descricaoChamadoError.textContent = "";


    if (tituloChamado.value.trim() === "") {

        tituloChamadoError.textContent =
            "O título é obrigatório.";

        valido = false;

    }


    if (
        !categoriaChamado ||
        categoriaChamado.value === ""
    ) {

        mostrarChamadosMsg(
            "Selecione uma categoria para definir o SLA do atendimento.",
            "error"
        );

        valido = false;

    }


    if (descricaoChamado.value.trim() === "") {

        descricaoChamadoError.textContent =
            "A descrição é obrigatória.";

        valido = false;

    }


    return valido;

}


// =========================================
// ENVIO DO FORMULÁRIO
// POST /api/chamados
// =========================================

const novoChamadoForm =
    document.getElementById("novoChamadoForm");


novoChamadoForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (!validarFormulario()) {
            return;
        }


        const botao =
            novoChamadoForm.querySelector(
                'button[type="submit"]'
            );

        const textoOriginal =
            botao
                ? botao.textContent
                : "";


        if (botao) {

            botao.disabled = true;

            botao.textContent =
                "Cadastrando...";

        }


        try {

            const response =
                await apiRequest(
                    "/api/chamados",
                    {
                        method: "POST",

                        body: JSON.stringify({

                            titulo:
                                tituloChamado
                                    .value
                                    .trim(),

                            descricao:
                                descricaoChamado
                                    .value
                                    .trim(),

                            categoriaId:
                                Number(
                                    categoriaChamado.value
                                )

                        })

                    }
                );


            if (!response) {
                return;
            }


            if (response.status === 403) {

                mostrarChamadosMsg(
                    "Você não tem permissão para criar chamados.",
                    "error"
                );

                return;

            }


            if (!response.ok) {

                mostrarChamadosMsg(
                    "Não foi possível cadastrar o chamado. Tente novamente.",
                    "error"
                );

                return;

            }


            novoChamadoForm.reset();

            formNovoChamado.hidden = true;


            mostrarChamadosMsg(
                "Chamado cadastrado com sucesso!",
                "success"
            );


            await carregarChamados();

        } catch (erro) {

            mostrarChamadosMsg(
                "Não foi possível conectar ao servidor para cadastrar o chamado.",
                "error"
            );

        } finally {

            if (botao) {

                botao.disabled = false;

                botao.textContent =
                    textoOriginal;

            }

        }

    }
);


// =========================================
// ABRIR / CANCELAR FORMULÁRIO
// =========================================

btnNovoChamado.addEventListener(
    "click",
    function () {

        formNovoChamado.hidden = false;

        carregarOpcoesChamado();

    }
);


async function carregarOpcoesChamado() {

    try {

        const perfil =
            await apiGetJson(
                "/api/usuarios/me"
            );

        const categorias = await apiGetJson("/api/categorias");


        clienteChamado.value =
            perfil.nome;


        if (perfil.perfil === "USUARIO") {

            document.body.classList.add(
                "cliente-view"
            );

            filtroPrioridade
                .closest(".filter-group")
                .hidden = true;

            modalChamadoPrioridade
                .closest(".detalhe-item")
                .hidden = true;

        }


        if (categoriaChamado) {

            categoriaChamado.innerHTML =
                '<option value="">Selecione a categoria</option>' +

                categorias
                    .map(
                        c =>
                            '<option value="' +
                            escapeHtmlChamado(c.id) +
                            '">' +
                            escapeHtmlChamado(c.nome) +
                            "</option>"
                    )
                    .join("");

        }

    } catch (erro) {

        mostrarChamadosMsg(
            getMensagemErroAmigavel(
                erro && erro.status
                    ? erro.status
                    : 0
            ),
            "error"
        );

    }

}


btnCancelarChamado.addEventListener(
    "click",
    function () {

        novoChamadoForm.reset();

        tituloChamadoError.textContent = "";
        clienteChamadoError.textContent = "";
            descricaoChamadoError.textContent = "";

        formNovoChamado.hidden = true;

    }
);


// =========================================
// LOGOUT - MENU LATERAL
// =========================================

btnLogout.addEventListener(
    "click",
    function () {

        logout();

    }
);


// =========================================
// EXIBIR CHAMADOS
// =========================================

function correspondeStatus(chamado, filtro) {

    if (filtro === "todos") {
        return true;
    }

    const statusApi =
        String(
            chamado.status || ""
        ).toUpperCase();


    const mapa = {

        aberto: "ABERTO",

        andamento: "EM_ANDAMENTO",

        aguardando: "AGUARDANDO",

        resolvido: "RESOLVIDO",

        fechado: "FECHADO",

        em_atraso: "EM_ATRASO"

    };


    return statusApi ===
        (
            mapa[filtro] ||
            filtro.toUpperCase()
        );

}


function correspondePrioridade(chamado, filtro) {

    if (filtro === "todas") {
        return true;
    }

    const pri =
        String(
            chamado.prioridade || ""
        ).toUpperCase();

    return pri === filtro.toUpperCase();

}


function renderizarChamados() {

    chamadosTableBody.innerHTML = "";


    const termo =
        buscarChamado.value
            .trim()
            .toLowerCase();


    const statusFiltro =
        filtroStatus.value;

    const prioridadeFiltro =
        filtroPrioridade.value;


    const chamadosFiltrados =
        chamados.filter(
            function (chamado) {

                const correspondeBusca =

                    String(
                        chamado.id || ""
                    ).includes(termo)

                    ||

                    (
                        chamado.numero || ""
                    )
                        .toLowerCase()
                        .includes(termo)

                    ||

                    (
                        chamado.titulo || ""
                    )
                        .toLowerCase()
                        .includes(termo)

                    ||

                    nomeCliente(chamado)
                        .toLowerCase()
                        .includes(termo);


                return (

                    correspondeBusca &&

                    correspondeStatus(
                        chamado,
                        statusFiltro
                    ) &&

                    correspondePrioridade(
                        chamado,
                        prioridadeFiltro
                    )

                );

            }
        );


    if (chamadosFiltrados.length === 0) {

        chamadosTableBody.innerHTML =
            '<tr><td colspan="8"><div class="empty-state">' +

            "<h3>Nenhum chamado encontrado</h3>" +

            "<p>Ajuste os filtros ou cadastre um novo chamado.</p>" +

            "</div></td></tr>";

        atualizarContador(0);

        return;

    }


    chamadosFiltrados.forEach(
        function (chamado) {

            const linha =
                document.createElement("tr");

            const sla =
                getSlaStatus(chamado);


            linha.innerHTML =

                "<td><strong>" +
                escapeHtmlChamado(
                    numeroChamado(chamado)
                ) +
                "</strong></td>" +

                "<td>" +
                escapeHtmlChamado(
                    chamado.titulo || "—"
                ) +
                "</td>" +

                "<td>" +
                escapeHtmlChamado(
                    nomeCliente(chamado)
                ) +
                "</td>" +

                '<td><span class="ticket-priority ' +
                escapeHtmlChamado(
                    cssPrioridade(
                        chamado.prioridade
                    )
                ) +
                '">' +

                escapeHtmlChamado(
                    formatarPrioridade(
                        chamado.prioridade
                    )
                ) +

                "</span></td>" +

                '<td><span class="ticket-status ' +
                escapeHtmlChamado(
                    cssStatus(
                        chamado.status
                    )
                ) +
                '">' +

                escapeHtmlChamado(
                    formatarStatus(
                        chamado.status
                    )
                ) +

                "</span></td>" +

                "<td>" +
                renderSlaBadge(
                    sla,
                    describeSlaTooltip(
                        chamado,
                        sla
                    )
                ) +
                "</td>" +

                "<td>" +
                escapeHtmlChamado(
                    nomeResponsavel(chamado)
                ) +
                "</td>" +

                '<td><button type="button" class="btn btn-secondary btn-visualizar-chamado" data-id="' +
                escapeHtmlChamado(
                    chamado.id
                ) +
                '">Visualizar</button></td>';


            chamadosTableBody.appendChild(
                linha
            );

        }
    );


    atualizarContador(
        chamadosFiltrados.length
    );

}


// =========================================
// ATUALIZAR CONTADOR
// =========================================

function atualizarContador(quantidade) {

    totalChamados.textContent =
        quantidade === 1
            ? "1 chamado"
            : `${quantidade} chamados`;

}


// =========================================
// BUSCA E FILTROS
// =========================================

buscarChamado.addEventListener(
    "input",
    renderizarChamados
);

filtroStatus.addEventListener(
    "change",
    renderizarChamados
);

filtroPrioridade.addEventListener(
    "change",
    renderizarChamados
);


// =========================================
// MODAL DE DETALHES DO CHAMADO
// =========================================

chamadosTableBody.addEventListener(
    "click",
    async function (event) {

        if (
            !event.target.classList.contains(
                "btn-visualizar-chamado"
            )
        ) {
            return;
        }


        const id =
            Number(
                event.target.dataset.id
            );


        const chamado =
            chamados.find(
                function (item) {

                    return item.id === id;

                }
            );


        if (!chamado) {
            return;
        }


        chamadoAtual =
            chamado;


        modalChamadoTitulo.textContent =
            chamado.titulo ||
            "Detalhes do chamado";


        modalChamadoNumero.textContent =
            numeroChamado(chamado);
        modalChamadoNumeroHeader.textContent =
            numeroChamado(chamado);


        modalChamadoCliente.textContent =
            nomeCliente(chamado);


        modalChamadoPrioridade.textContent =
            formatarPrioridade(
                chamado.prioridade
            );


        modalChamadoPrioridade.className =
            "ticket-priority " +
            cssPrioridade(
                chamado.prioridade
            );


        modalChamadoStatus.textContent =
            formatarStatus(
                chamado.status
            );


        modalChamadoStatus.className =
            "ticket-status " +
            cssStatus(
                chamado.status
            );
        modalChamadoStatusHeader.textContent = formatarStatus(chamado.status);
        modalChamadoStatusHeader.className = modalChamadoStatus.className;


        novoStatusChamado.value =
            String(
                chamado.status ||
                "ABERTO"
            ).toUpperCase();


        const sla =
            getSlaStatus(chamado);


        modalChamadoSla.innerHTML =
            renderSlaBadge(
                sla,
                describeSlaTooltip(
                    chamado,
                    sla
                )
            );


        if (modalChamadoSlaLimite) {

            const limite =
                chamado.dataLimiteResolucao ||
                null;


            modalChamadoSlaLimite.textContent =
                limite

                    ? "Limite: " +
                      new Date(
                          limite
                      ).toLocaleString(
                          "pt-BR"
                      )

                    : "Sem data limite retornada pela API.";

        }


        modalChamadoResponsavel.textContent =
            nomeResponsavel(chamado);


        modalChamadoDescricao.textContent =
            chamado.descricao ||
            "Descrição não informada";


        await renderizarTimeline(
            chamado.id
        );


        atualizarPermissoesDoModalChamado();
        modalChamadoController.open();
        mensagemTransferenciaChamado.textContent = "";
        if (usuarioPodeGerenciarChamados()) carregarResponsaveisParaTransferencia(chamado.id);

        window.dispatchEvent(new CustomEvent("conecta21:ticket-opened", { detail: chamado }));

    }
);


async function carregarResponsaveisParaTransferencia(chamadoId) {
    seletorNovoResponsavelChamado.replaceChildren(new Option("Selecione", ""));
    try {
        const responsaveis = await apiGetJson(`/api/chamados/${chamadoId}/responsaveis`);
        (responsaveis || []).forEach(item => seletorNovoResponsavelChamado.add(
            new Option(`${item.nome} (${item.perfil === "ADMIN" ? "Admin" : "Técnico"})`, item.id)
        ));
        if (!responsaveis || !responsaveis.length) mensagemTransferenciaChamado.textContent = "Não há técnicos ativos disponíveis.";
    } catch (erro) {
        mensagemTransferenciaChamado.textContent = getMensagemErroAmigavel(erro.status || 0);
    }
}

formularioTransferenciaChamado.addEventListener("submit", async event => {
    event.preventDefault();
    if (!chamadoAtual || !seletorNovoResponsavelChamado.value) return;
    try {
        const response = await apiRequest(`/api/chamados/${chamadoAtual.id}/responsavel`, {
            method: "PATCH",
            body: JSON.stringify({ responsavelId: Number(seletorNovoResponsavelChamado.value) })
        });
        if (!response.ok) throw { status: response.status };
        const atualizado = await response.json();
        chamadoAtual = { ...chamadoAtual, ...atualizado };
        modalChamadoResponsavel.textContent = atualizado.tecnicoNome || "Não atribuído";
        mensagemTransferenciaChamado.textContent = "Chamado repassado com sucesso.";
        delete interacoesCache[chamadoAtual.id];
        await renderizarTimeline(chamadoAtual.id);
        await carregarChamados();
    } catch (erro) {
        mensagemTransferenciaChamado.textContent = getMensagemErroAmigavel(erro.status || 0);
    }
});


// =========================================
// FECHAR MODAL
// =========================================

function fecharModalChamado() {
    modalChamadoController.close();
}


// =========================================
// TIMELINE
// GET /api/chamados/{id}/interacoes
// =========================================

async function renderizarTimeline(chamadoId) {

    timelineChamado.innerHTML =
        '<div class="timeline-empty"><p>Carregando interações...</p></div>';


    let interacoes =
        interacoesCache[chamadoId] ||
        [];


    try {

        const pagina =
            await apiGetJson(
                "/api/chamados/" +
                chamadoId +
                "/interacoes?page=0&size=50"
            );


        if (
            pagina &&
            pagina.content
        ) {

            interacoes =
                pagina.content.map(
                    function (item) {

                        return {

                            id:
                                item.id,

                            autor:
                                item.autorNome ||
                                (
                                    "Usuário #" +
                                    item.autorId
                                ),

                            tipo:
                                item.tipo ||
                                "Comentário",

                            data:
                                item.dataCriacao

                                    ? new Date(
                                        item.dataCriacao
                                    ).toLocaleString(
                                        "pt-BR"
                                    )

                                    : "—",

                            descricao:
                                item.mensagem,

                            anexos:
                                item.anexos || []

                        };

                    }
                );


            interacoesCache[chamadoId] =
                interacoes;

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


    interacoes.forEach(
        function (interacao) {

            const item =
                document.createElement("div");

            item.className =
                "timeline-item";


            item.innerHTML =

                '<div class="timeline-marker"></div>' +

                '<div class="timeline-content">' +

                '<div class="timeline-item-header">' +

                "<strong>" +

                escapeHtmlChamado(
                    interacao.tipo
                ) +

                "</strong>" +

                "<span>" +

                escapeHtmlChamado(
                    interacao.data
                ) +

                "</span>" +

                "</div>" +

                '<p class="timeline-author">' +

                escapeHtmlChamado(
                    interacao.autor
                ) +

                "</p>" +

                '<p class="timeline-description">' +

                escapeHtmlChamado(
                    interacao.descricao
                ) +

                "</p></div>";


            if (
                interacao.anexos &&
                interacao.anexos.length
            ) {

                item.innerHTML +=
                    '<div class="timeline-attachments">' +

                    interacao.anexos
                        .map(
                            function (anexo) {

                                const endpoint =
                                    "/api/chamados/" +
                                    chamadoId +
                                    "/interacoes/" +
                                    interacao.id +
                                    "/anexos/" +
                                    anexo.id;


                                return (

                                    '<button type="button" class="btn btn-secondary btn-anexo-download" data-endpoint="' +
                                    escapeHtmlChamado(
                                        endpoint
                                    ) +
                                    '" data-filename="' +
                                    escapeHtmlChamado(
                                        anexo.nomeArquivo
                                    ) +
                                    '">' +

                                    escapeHtmlChamado(
                                        anexo.nomeArquivo
                                    ) +

                                    "</button>"

                                );

                            }
                        )
                        .join("") +

                    "</div>";

            }


            timelineChamado.appendChild(
                item
            );

        }
    );

}


// =========================================
// DOWNLOAD DE ANEXOS
// =========================================

timelineChamado.addEventListener(
    "click",
    async function (event) {

        const botao =
            event.target.closest(
                ".btn-anexo-download"
            );


        if (!botao) {
            return;
        }


        try {

            await apiDownload(
                botao.dataset.endpoint,
                botao.dataset.filename
            );

        } catch (erro) {

            mostrarChamadosMsg(
                "Não foi possível baixar o anexo.",
                "error"
            );

        }

    }
);


// =========================================
// NOVA INTERAÇÃO
// POST /api/chamados/{id}/interacoes
// =========================================

formNovaInteracao.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (!chamadoAtual) {
            return;
        }


        const descricao =
            descricaoInteracao.value.trim();


        if (descricao === "") {
            return;
        }


        if (!tipoInteracao.value) {

            mostrarChamadosMsg(
                "Selecione o tipo de interação.",
                "error"
            );

            return;

        }


        const dados =
            new FormData();


        dados.append(
            "mensagem",
            descricao
        );


        dados.append(
            "tipo",
            tipoInteracao.value
        );


        Array.from(
            imagensChamado &&
            imagensChamado.files
                ? imagensChamado.files
                : []
        ).forEach(
            function (arquivo) {

                dados.append(
                    "imagens",
                    arquivo
                );

            }
        );


        try {

            const response =
                await apiRequest(
                    "/api/chamados/" +
                    chamadoAtual.id +
                    "/interacoes",
                    {
                        method: "POST",
                        body: dados
                    }
                );


            if (
                response &&
                response.status === 403
            ) {

                mostrarChamadosMsg(
                    "Você não tem permissão para interagir neste chamado.",
                    "error"
                );

                return;

            }


            if (
                response &&
                !response.ok &&
                response.status !== 201
            ) {

                let detalhe =
                    "Não foi possível salvar a interação.";

                try {

                    detalhe =
                        (await response.text()) ||
                        detalhe;

                } catch (e) { }


                mostrarChamadosMsg(
                    detalhe,
                    "error"
                );

                return;

            }


            delete interacoesCache[
                chamadoAtual.id
            ];


            formNovaInteracao.reset();


            if (imagensChamado) {
                imagensChamado.value = "";
            }


            if (previewImagens) {
                previewImagens.innerHTML = "";
            }


            await renderizarTimeline(
                chamadoAtual.id
            );

        } catch (erro) {

            mostrarChamadosMsg(
                "Não foi possível salvar a interação no servidor.",
                "error"
            );

        }

    }
);


// =========================================
// ALTERAR STATUS
// PATCH /api/chamados/{id}/status
// =========================================

novoStatusChamado.addEventListener(
    "change",
    async function () {

        if (!chamadoAtual) {
            return;
        }


        const anterior =
            chamadoAtual.status;

        const novo =
            novoStatusChamado.value;


        try {

            const response =
                await apiRequest(
                    "/api/chamados/" +
                    chamadoAtual.id +
                    "/status",
                    {
                        method: "PATCH",

                        body: JSON.stringify({
                            status: novo
                        })

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


                novoStatusChamado.value =
                    String(
                        anterior ||
                        "ABERTO"
                    ).toUpperCase();


                return;

            }


            if (!response.ok) {

                mostrarChamadosMsg(
                    "Status inválido ou não permitido.",
                    "error"
                );


                novoStatusChamado.value =
                    String(
                        anterior ||
                        "ABERTO"
                    ).toUpperCase();


                return;

            }


            const atualizado =
                await response.json();


            chamadoAtual.status =
                atualizado.status ||
                novo;


            if (
                atualizado.dataFechamento !==
                undefined
            ) {

                chamadoAtual.dataFechamento =
                    atualizado.dataFechamento;

            }


            modalChamadoStatus.textContent =
                formatarStatus(
                    chamadoAtual.status
                );


            modalChamadoStatus.className =
                "ticket-status " +
                cssStatus(
                    chamadoAtual.status
                );

            modalChamadoStatusHeader.textContent = formatarStatus(chamadoAtual.status);
            modalChamadoStatusHeader.className = modalChamadoStatus.className;


            const sla =
                getSlaStatus(
                    chamadoAtual
                );


            modalChamadoSla.innerHTML =
                renderSlaBadge(
                    sla,
                    describeSlaTooltip(
                        chamadoAtual,
                        sla
                    )
                );


            await carregarChamados();

        } catch (erro) {

            mostrarChamadosMsg(
                "Não foi possível alterar o status. Tente novamente.",
                "error"
            );


            novoStatusChamado.value =
                String(
                    anterior ||
                    "ABERTO"
                ).toUpperCase();

        }

    }
);


// =========================================
// PRÉ-VISUALIZAÇÃO DE IMAGENS
// =========================================

if (imagensChamado) {

    imagensChamado.addEventListener(
        "change",
        function () {

            previewImagens.innerHTML = "";


            const arquivos =
                Array.from(
                    imagensChamado.files || []
                );


            if (arquivos.length === 0) {
                return;
            }


            arquivos.forEach(
                function (arquivo, indice) {

                    if (
                        !arquivo.type.startsWith(
                            "image/"
                        )
                    ) {

                        return;

                    }


                    const container =
                        document.createElement(
                            "div"
                        );


                    container.className =
                        "preview-imagem-item";


                    const imagem =
                        document.createElement(
                            "img"
                        );


                    imagem.src =
                        URL.createObjectURL(
                            arquivo
                        );


                    imagem.alt =
                        "Imagem anexada ao chamado";


                    const botaoRemover =
                        document.createElement(
                            "button"
                        );


                    botaoRemover.type =
                        "button";


                    botaoRemover.className =
                        "btn-remover-imagem";


                    botaoRemover.textContent =
                        "Remover";


                    botaoRemover.addEventListener(
                        "click",
                        function () {

                            arquivos.splice(
                                indice,
                                1
                            );


                            atualizarArquivos(
                                arquivos
                            );


                            container.remove();

                        }
                    );


                    container.appendChild(
                        imagem
                    );

                    container.appendChild(
                        botaoRemover
                    );

                    previewImagens.appendChild(
                        container
                    );

                }
            );

        }
    );

}


function atualizarArquivos(arquivos) {

    const dataTransfer =
        new DataTransfer();


    arquivos.forEach(
        function (arquivo) {

            dataTransfer.items.add(
                arquivo
            );

        }
    );


    imagensChamado.files =
        dataTransfer.files;

}


// =========================================
// INICIALIZAÇÃO
// =========================================

carregarUsuarioMenu();

carregarChamados();

async function carregarModuloContratado() {
    try {
        const [modulos, usuario] = await Promise.all([
            apiGetJson("/api/modulos"),
            apiGetJson("/api/usuarios/me")
        ]);
        if (!modulos.gmudAtivo || !["ADMIN", "TECNICO"].includes(usuario.perfil)) return;
        if (document.querySelector('script[data-modulo="gmud"]')) return;

        const script = document.createElement("script");
        script.src = "js/gmud.js";
        script.dataset.modulo = "gmud";
        script.onload = () => {
            if (!modalChamado.hidden && chamadoAtual) {
                window.dispatchEvent(new CustomEvent("conecta21:ticket-opened", { detail: chamadoAtual }));
            }
        };
        document.body.appendChild(script);
    } catch (_) {
        // Se o contrato ou a sessão n\u00e3o estiverem ativos, a tela padr\u00e3o continua sem a feature.
    }
}

carregarModuloContratado();
