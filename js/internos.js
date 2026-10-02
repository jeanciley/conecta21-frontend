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


        internosTabela.innerHTML = lista.length

            ? lista.map(c => `

                <tr>

                    <td>
                        #${c.id}
                    </td>

                    <td>
                        ${safeInterno(c.titulo)}
                    </td>

                    <td>
                        ${safeInterno(
                            c.categoriaNome || "—"
                        )}
                    </td>

                    <td>
                        ${safeInterno(
                            c.prioridade || "—"
                        )}
                    </td>

                    <td>
                        ${safeInterno(c.status)}
                    </td>

                    <td>
                        ${
                            c.dataAbertura
                                ? new Date(
                                    c.dataAbertura
                                ).toLocaleDateString(
                                    "pt-BR"
                                )
                                : "—"
                        }
                    </td>

                </tr>

            `).join("")

            : `

                <tr>

                    <td colspan="6">

                        <div class="empty-state">

                            <p>
                                Nenhum chamado interno registrado.
                            </p>

                        </div>

                    </td>

                </tr>

            `;

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

async function iniciarInternos() {

    try {

        // -------------------------------------
        // USUÁRIO LOGADO
        // -------------------------------------

        const me =
            await apiGetJson(
                "/api/usuarios/me"
            );

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
