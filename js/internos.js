// =========================================
// CHAMADOS INTERNOS - CONECTA21
// =========================================


// =========================================
// VERIFICAÇÃO DE AUTENTICAÇÃO
// =========================================

if (!estaAutenticado()) {

    window.location.href = "login.html";

}


// =========================================
// ELEMENTOS DA PÁGINA
// =========================================

const internosMsg =
    document.getElementById("internosMsg");

const internoForm =
    document.getElementById("internoForm");

const internoEditor =
    document.getElementById("internoEditor");

const internosTabela =
    document.getElementById("internosTabela");

const modalChamadoInterno = document.getElementById("modalChamadoInterno");
const modalInternoController = window.Conecta21TicketModal.bind(modalChamadoInterno);
const modalInternoFields = {
    titulo: document.getElementById("modalInternoTitulo"),
    numero: document.getElementById("modalInternoNumeroHeader"),
    statusHeader: document.getElementById("modalInternoStatusHeader"),
    solicitante: document.getElementById("modalInternoSolicitante"),
    categoria: document.getElementById("modalInternoCategoria"),
    prioridade: document.getElementById("modalInternoPrioridade"),
    status: document.getElementById("modalInternoStatus"),
    sla: document.getElementById("modalInternoSla"),
    slaLimite: document.getElementById("modalInternoSlaLimite"),
    responsavel: document.getElementById("modalInternoResponsavel"),
    abertura: document.getElementById("modalInternoAbertura"),
    descricao: document.getElementById("modalInternoDescricao"),
    statusControl: document.querySelector("[data-interno-status-control]"),
    statusSelect: document.getElementById("novoStatusInterno"),
    timeline: document.getElementById("timelineChamadoInterno"),
    interactionForm: document.getElementById("formInteracaoInterno"),
    interactionMessage: document.getElementById("mensagemInteracaoInterno"),
    transferPanel: document.querySelector("[data-interno-transfer]"),
    transferForm: document.getElementById("formTransferirInterno"),
    transferSelect: document.getElementById("novoResponsavelInterno"),
    transferMessage: document.querySelector("[data-interno-transfer-message]")
};

let usuarioAtualInterno = null;
let chamadoInternoAtual = null;


// =========================================
// ELEMENTOS DO MENU DO USUÁRIO
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
// FUNÇÕES AUXILIARES
// =========================================

const safeInterno = v =>
    String(v == null ? "" : v)
        .replace(
            /[&<>"']/g,
            c => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[c])
        );


// =========================================
// MENSAGENS
// =========================================

function avisarInterno(t, erro = false) {

    internosMsg.hidden = !t;

    internosMsg.textContent = t;

    internosMsg.className =
        "faq-message" + (erro ? " error" : "");

}


// =========================================
// FORMATAÇÃO DO PERFIL
// =========================================

function formatarPerfil(perfil) {

    switch (perfil) {

        case "ADMIN":
            return "Administrador";

        case "TECNICO":
            return "Técnico";

        case "USUARIO":
        case "USUARIO_COMUM":
            return "Usuário";

        case "GESTOR":
            return "Gestor";

        default:
            return perfil || "Usuário";

    }

}


// =========================================
// GERAÇÃO DAS INICIAIS
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
        partes[0][0] +
        partes[partes.length - 1][0]
    ).toUpperCase();

}


// =========================================
// CARREGAR DADOS DO USUÁRIO
// =========================================

async function carregarUsuarioMenu() {

    try {

        const usuario =
            await apiGetJson("/api/usuarios/me");

        const nome =
            usuario.nome ||
            usuario.nomeCompleto ||
            usuario.name ||
            usuario.email ||
            "Usuário";

        const perfil =
            usuario.perfil || "USUARIO";

        userMenuName.textContent = nome;

        userMenuProfile.textContent =
            formatarPerfil(perfil);

        userInitials.textContent =
            gerarIniciais(nome);

    } catch (e) {

        userMenuName.textContent =
            "Usuário";

        userMenuProfile.textContent =
            "Usuário";

        userInitials.textContent =
            "U";

    }

}


// =========================================
// ABRIR MENU
// =========================================

function abrirMenuUsuario() {

    userMenu.hidden = false;

    btnUserMenu.setAttribute(
        "aria-expanded",
        "true"
    );

}


// =========================================
// FECHAR MENU
// =========================================

function fecharMenuUsuario() {

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

    if (userMenu.hidden) {

        abrirMenuUsuario();

    } else {

        fecharMenuUsuario();

    }

}


// =========================================
// EVENTO DO BOTÃO DO USUÁRIO
// =========================================

btnUserMenu.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        alternarMenuUsuario();

    }
);


// =========================================
// IMPEDIR FECHAMENTO AO CLICAR NO MENU
// =========================================

userMenu.addEventListener(
    "click",
    event => {

        event.stopPropagation();

    }
);


// =========================================
// FECHAR AO CLICAR FORA
// =========================================

document.addEventListener(
    "click",
    () => {

        if (!userMenu.hidden) {

            fecharMenuUsuario();

        }

    }
);


// =========================================
// FECHAR COM ESC
// =========================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            !userMenu.hidden
        ) {

            fecharMenuUsuario();

        }

    }
);


// =========================================
// LOGOUT PELO MENU
// =========================================

btnUserLogout.addEventListener(
    "click",
    () => {

        logout();

    }
);


// =========================================
// CARREGAR CHAMADOS INTERNOS
// =========================================

async function carregarInternos() {

    try {

        const pagina =
            await apiGetJson(
                "/api/chamados?interno=true&page=0&size=100&sort=dataAbertura,DESC"
            );

        const lista =
            pagina.content || [];
        window.chamadosInternos = lista;


        internosTabela.innerHTML = lista.length
            ? lista.map(chamado => {
                const sla = getSlaStatus(chamado);
                return `
                    <tr>
                        <td><strong>${safeInterno("#" + chamado.id)}</strong></td>
                        <td>${safeInterno(chamado.titulo || "\u2014")}</td>
                        <td>${safeInterno(chamado.categoriaNome || "\u2014")}</td>
                        <td><span class="ticket-priority ${safeInterno(cssPrioridade(chamado.prioridade))}">${safeInterno(formatarPrioridade(chamado.prioridade))}</span></td>
                        <td><span class="ticket-status ${safeInterno(cssStatus(chamado.status))}">${safeInterno(formatarStatus(chamado.status))}</span></td>
                        <td>${renderSlaBadge(sla, describeSlaTooltip(chamado, sla))}</td>
                        <td>${safeInterno(chamado.tecnicoNome || chamado.responsavel || chamado.responsavelNome || "N\u00e3o atribu\u00eddo")}</td>
                        <td><button type="button" class="btn btn-secondary btn-visualizar-interno" data-id="${safeInterno(chamado.id)}">Visualizar</button></td>
                    </tr>`;
            }).join("")
            : `<tr><td colspan="8"><div class="empty-state"><p>Nenhum chamado interno registrado.</p></div></td></tr>`;

    } catch (e) {

        avisarInterno(
            getMensagemErroAmigavel(
                e.status || 0
            ),
            true
        );

    }

}


// =========================================
// INICIALIZAÇÃO
// =========================================

internosTabela.addEventListener("click", event => {
    const button = event.target.closest(".btn-visualizar-interno");
    if (!button) return;
    const chamado = (window.chamadosInternos || []).find(item => String(item.id) === button.dataset.id);
    if (!chamado) return;

    const statusLabel = formatarStatus(chamado.status);
    const statusClass = "ticket-status " + cssStatus(chamado.status);
    const prioridadeLabel = formatarPrioridade(chamado.prioridade);
    const prioridadeClass = "ticket-priority " + cssPrioridade(chamado.prioridade);
    const sla = getSlaStatus(chamado);
    const limite = chamado.dataLimiteResolucao || null;
    chamadoInternoAtual = chamado;

    modalInternoFields.titulo.textContent = chamado.titulo || "Detalhes do chamado interno";
    modalInternoFields.numero.textContent = "#" + chamado.id;
    modalInternoFields.statusHeader.textContent = statusLabel;
    modalInternoFields.statusHeader.className = statusClass;
    modalInternoFields.solicitante.textContent = chamado.solicitanteNome || (chamado.solicitanteId ? "Solicitante #" + chamado.solicitanteId : "\u2014");
    modalInternoFields.categoria.textContent = chamado.categoriaNome || "\u2014";
    modalInternoFields.prioridade.textContent = prioridadeLabel;
    modalInternoFields.prioridade.className = prioridadeClass;
    modalInternoFields.status.textContent = statusLabel;
    modalInternoFields.status.className = statusClass;
    modalInternoFields.sla.innerHTML = renderSlaBadge(sla, describeSlaTooltip(chamado, sla));
    modalInternoFields.slaLimite.textContent = limite ? "Limite: " + new Date(limite).toLocaleString("pt-BR") : "Sem data limite retornada pela API.";
    modalInternoFields.responsavel.textContent = chamado.tecnicoNome || chamado.responsavel || chamado.responsavelNome || "N\u00e3o atribu\u00eddo";
    modalInternoFields.abertura.textContent = chamado.dataAbertura ? new Date(chamado.dataAbertura).toLocaleString("pt-BR") : "\u2014";
    modalInternoFields.descricao.textContent = chamado.descricao || "Descri\u00e7\u00e3o n\u00e3o informada";
    const podeGerenciar = usuarioAtualInterno && (["ADMIN", "TECNICO"].includes(usuarioAtualInterno.perfil)
        || (usuarioAtualInterno.permissoes || []).includes("GERENCIAR_CHAMADOS"));
    modalInternoFields.statusSelect.value = String(chamado.status || "ABERTO").toUpperCase();
    modalInternoFields.statusControl.hidden = !podeGerenciar;
    modalInternoFields.transferPanel.hidden = !podeGerenciar;
    modalInternoFields.transferMessage.textContent = "";
    modalInternoController.open();
    carregarInteracoesInternas(chamado.id);
    if (podeGerenciar) carregarResponsaveisInternos(chamado.id);
});

function mostrarStatusInterno(chamado) {
    const label = formatarStatus(chamado.status);
    const classe = "ticket-status " + cssStatus(chamado.status);
    modalInternoFields.status.textContent = label;
    modalInternoFields.status.className = classe;
    modalInternoFields.statusHeader.textContent = label;
    modalInternoFields.statusHeader.className = classe;
    modalInternoFields.statusSelect.value = String(chamado.status || "ABERTO").toUpperCase();
}

async function carregarInteracoesInternas(chamadoId) {
    modalInternoFields.timeline.innerHTML = '<div class="timeline-empty"><p>Carregando interações...</p></div>';
    try {
        const pagina = await apiGetJson(`/api/chamados/${chamadoId}/interacoes?page=0&size=50`);
        const interacoes = pagina.content || [];
        modalInternoFields.timeline.innerHTML = interacoes.length
            ? interacoes.map(interacao => `
                <article class="timeline-item">
                    <div class="timeline-item-header"><strong>${safeInterno(interacao.autorNome || "Usuário")}</strong><span>${interacao.dataCriacao ? new Date(interacao.dataCriacao).toLocaleString("pt-BR") : ""}</span></div>
                    <span class="timeline-type">${safeInterno(interacao.tipo || "Comentário")}</span>
                    <p>${safeInterno(interacao.mensagem || "")}</p>
                </article>`).join("")
            : '<div class="timeline-empty"><p>Nenhuma interação registrada.</p></div>';
    } catch (erro) {
        modalInternoFields.timeline.innerHTML = '<div class="timeline-empty"><p>Não foi possível carregar as interações.</p></div>';
    }
}

async function carregarResponsaveisInternos(chamadoId) {
    try {
        const responsaveis = await apiGetJson(`/api/chamados/${chamadoId}/responsaveis`);
        modalInternoFields.transferSelect.replaceChildren(new Option("Selecione", ""));
        (responsaveis || []).forEach(item => modalInternoFields.transferSelect.add(
            new Option(`${item.nome} (${item.perfil === "ADMIN" ? "Admin" : "Técnico"})`, item.id)
        ));
        if (!responsaveis || !responsaveis.length) modalInternoFields.transferMessage.textContent = "Não há técnicos ativos disponíveis.";
    } catch (erro) {
        modalInternoFields.transferMessage.textContent = getMensagemErroAmigavel(erro.status || 0);
    }
}

modalInternoFields.statusSelect.addEventListener("change", async () => {
    if (!chamadoInternoAtual) return;
    const anterior = chamadoInternoAtual.status;
    try {
        const response = await apiRequest(`/api/chamados/${chamadoInternoAtual.id}/status`, {
            method: "PATCH", body: JSON.stringify({ status: modalInternoFields.statusSelect.value })
        });
        if (!response.ok) throw { status: response.status };
        chamadoInternoAtual = { ...chamadoInternoAtual, ...(await response.json()) };
        mostrarStatusInterno(chamadoInternoAtual);
        await carregarInternos();
    } catch (erro) {
        modalInternoFields.statusSelect.value = String(anterior || "ABERTO").toUpperCase();
        avisarInterno(getMensagemErroAmigavel(erro.status || 0), true);
    }
});

modalInternoFields.interactionForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (!chamadoInternoAtual) return;
    const mensagem = modalInternoFields.interactionMessage.value.trim();
    if (!mensagem) return;
    try {
        const response = await apiRequest(`/api/chamados/${chamadoInternoAtual.id}/interacoes`, {
            method: "POST", body: JSON.stringify({ mensagem, tipo: "Comentário" })
        });
        if (!response.ok) throw { status: response.status };
        modalInternoFields.interactionForm.reset();
        await carregarInteracoesInternas(chamadoInternoAtual.id);
    } catch (erro) {
        avisarInterno(getMensagemErroAmigavel(erro.status || 0), true);
    }
});

modalInternoFields.transferForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (!chamadoInternoAtual || !modalInternoFields.transferSelect.value) return;
    try {
        const response = await apiRequest(`/api/chamados/${chamadoInternoAtual.id}/responsavel`, {
            method: "PATCH", body: JSON.stringify({ responsavelId: Number(modalInternoFields.transferSelect.value) })
        });
        if (!response.ok) throw { status: response.status };
        chamadoInternoAtual = { ...chamadoInternoAtual, ...(await response.json()) };
        modalInternoFields.responsavel.textContent = chamadoInternoAtual.tecnicoNome || "Não atribuído";
        modalInternoFields.transferMessage.textContent = "Chamado repassado com sucesso.";
        await carregarInteracoesInternas(chamadoInternoAtual.id);
        await carregarInternos();
    } catch (erro) {
        modalInternoFields.transferMessage.textContent = getMensagemErroAmigavel(erro.status || 0);
    }
});


async function iniciarInternos() {

    try {

        // -------------------------------------
        // USUÁRIO LOGADO
        // -------------------------------------

        const me =
            await apiGetJson(
                "/api/usuarios/me"
            );

        usuarioAtualInterno = me;

        const perms =
            me.permissoes || [];


        // -------------------------------------
        // PERMISSÕES DE ADMIN
        // -------------------------------------

        document
            .querySelectorAll("[data-admin-only]")
            .forEach(x => {

                x.hidden =
                    me.perfil !== "ADMIN";

            });


        // -------------------------------------
        // PERMISSÕES ESPECÍFICAS
        // -------------------------------------

        document
            .querySelectorAll("[data-permission]")
            .forEach(x => {

                x.hidden =
                    !perms.includes(
                        x.dataset.permission
                    );

            });


        // -------------------------------------
        // LOGOUT DA SIDEBAR
        // -------------------------------------

        document
            .getElementById("btnLogout")
            .addEventListener(
                "click",
                logout
            );


        // -------------------------------------
        // VERIFICAÇÃO DO MÓDULO INTERNO
        // -------------------------------------

        if (
            !perms.includes(
                "CHAMADOS_INTERNOS"
            )
        ) {

            document
                .getElementById("novoInternoBtn")
                .hidden = true;

            avisarInterno(
                "Seu perfil pode consultar chamados gerais, mas não possui acesso ao módulo interno.",
                true
            );

        }

        if (perms.includes("CHAMADOS_INTERNOS")) {
            const metricas = await apiGetJson("/api/dashboard/internos");
            document.getElementById("internosMetricAbertos").textContent = metricas.chamadosAbertos ?? 0;
            document.getElementById("internosMetricAndamento").textContent = metricas.chamadosEmAndamento ?? 0;
            document.getElementById("internosMetricResolvidos").textContent = metricas.chamadosResolvidos ?? 0;
            document.getElementById("internosMetricAtraso").textContent = metricas.chamadosEmAtraso ?? 0;
        }


        // -------------------------------------
        // CARREGAR CATEGORIAS
        // -------------------------------------

        const cats =
            await apiGetJson(
                "/api/categorias"
            );

        document
            .getElementById("internoCategoria")
            .innerHTML =
                (cats || [])
                    .map(c => `

                        <option value="${c.id}">
                            ${safeInterno(c.nome)}
                        </option>

                    `)
                    .join("");


        // -------------------------------------
        // CARREGAR CHAMADOS
        // -------------------------------------

        await carregarInternos();

    } catch (e) {

        avisarInterno(
            getMensagemErroAmigavel(
                e.status || 0
            ),
            true
        );

    }

}


// =========================================
// BOTÃO NOVO CHAMADO INTERNO
// =========================================

document
    .getElementById("novoInternoBtn")
    .addEventListener(
        "click",
        () => {

            internoEditor.hidden = false;

            document
                .getElementById("internoTitulo")
                .focus();

        }
    );


// =========================================
// CANCELAR NOVO CHAMADO
// =========================================

document
    .getElementById("cancelarInterno")
    .addEventListener(
        "click",
        () => {

            internoForm.reset();

            internoEditor.hidden = true;

        }
    );


// =========================================
// ENVIO DO CHAMADO INTERNO
// =========================================

internoForm.addEventListener(
    "submit",
    async e => {

        e.preventDefault();


        const btn =
            internoForm.querySelector(
                "button[type=submit]"
            ) ||
            internoForm.querySelector(
                "button:not([type])"
            );


        if (btn) {
            btn.disabled = true;
        }


        try {

            const r =
                await apiRequest(
                    "/api/chamados",
                    {
                        method: "POST",

                        body: JSON.stringify({

                            titulo:
                                document
                                    .getElementById(
                                        "internoTitulo"
                                    )
                                    .value
                                    .trim(),

                            descricao:
                                document
                                    .getElementById(
                                        "internoDescricao"
                                    )
                                    .value
                                    .trim(),

                            categoriaId:
                                Number(
                                    document
                                        .getElementById(
                                            "internoCategoria"
                                        )
                                        .value
                                ),

                            interno: true

                        })
                    }
                );


            if (!r.ok) {

                throw {
                    status: r.status
                };

            }


            // -------------------------------
            // LIMPAR FORMULÁRIO
            // -------------------------------

            internoForm.reset();

            internoEditor.hidden = true;


            // -------------------------------
            // MENSAGEM
            // -------------------------------

            avisarInterno(
                "Chamado interno aberto."
            );


            // -------------------------------
            // ATUALIZAR LISTA
            // -------------------------------

            await carregarInternos();

        } catch (err) {

            avisarInterno(
                getMensagemErroAmigavel(
                    err.status || 0
                ),
                true
            );

        } finally {

            if (btn) {
                btn.disabled = false;
            }

        }

    }
);


// =========================================
// INICIALIZAÇÃO DA PÁGINA
// =========================================

carregarUsuarioMenu();

iniciarInternos();
