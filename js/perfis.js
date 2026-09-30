// =========================================
// PERFIS - CONECTA21
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

const perfilForm =
    document.getElementById("perfilForm");

const perfisLista =
    document.getElementById("perfisLista");

const perfisMsg =
    document.getElementById("perfisMsg");


// =========================================
// VARIÁVEIS
// =========================================

let perfis = [];


// =========================================
// PROTEÇÃO CONTRA HTML INJETADO
// =========================================

const safePerfil = v =>
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

function avisarPerfil(t, err = false) {

    perfisMsg.hidden = !t;

    perfisMsg.textContent = t;

    perfisMsg.className =
        "faq-message" +
        (err ? " error" : "");

}


// =========================================
// LIMPAR FORMULÁRIO
// =========================================

function limparPerfil() {

    perfilForm.reset();

    document.getElementById(
        "perfilId"
    ).value = "";

    document.getElementById(
        "perfilAtivo"
    ).checked = true;

    document.getElementById(
        "perfilTitulo"
    ).textContent = "Criar perfil";

    document.getElementById(
        "perfilCancelar"
    ).hidden = true;

}


// =========================================
// DESENHAR PERFIS
// =========================================

function desenharPerfis() {

    perfisLista.innerHTML =

        perfis.length

            ? perfis
                .map(
                    p => `
                        <article class="category-card">

                            <div>

                                <h3>
                                    ${safePerfil(p.nome)}
                                </h3>

                                <p>
                                    ${safePerfil(
                                        p.descricao ||
                                        "Sem descrição"
                                    )}
                                </p>

                                <span class="priority-badge">

                                    ${
                                        p.ativo
                                            ? "Ativo"
                                            : "Inativo"
                                    }

                                    ·

                                    ${
                                        (p.permissoes || [])
                                            .length
                                    }

                                    permissões

                                </span>

                            </div>


                            <div class="button-group">

                                <button
                                    class="btn btn-secondary profile-edit"
                                    data-id="${p.id}"
                                >
                                    Editar
                                </button>

                                <button
                                    class="btn btn-secondary profile-delete"
                                    data-id="${p.id}"
                                >
                                    Desativar
                                </button>

                            </div>

                        </article>
                    `
                )
                .join("")

            : `
                <div class="empty-state">

                    <p>
                        Nenhum perfil personalizado cadastrado.
                    </p>

                </div>
            `;

}


// =========================================
// CARREGAR PERFIS
// =========================================

async function carregarPerfis() {

    perfis =
        await apiGetJson(
            "/api/perfis"
        );

    desenharPerfis();

}


// =========================================
// MENU DO USUÁRIO
// =========================================

const btnUserMenu =
    document.getElementById(
        "btnUserMenu"
    );

const userMenu =
    document.getElementById(
        "userMenu"
    );

const btnUserLogout =
    document.getElementById(
        "btnUserLogout"
    );

const dashboardUserName =
    document.getElementById(
        "dashboardUserName"
    );

const dashboardUserProfile =
    document.getElementById(
        "dashboardUserProfile"
    );

const userInitials =
    document.getElementById(
        "userInitials"
    );


// =========================================
// FORMATAÇÃO DO PERFIL DO USUÁRIO
// =========================================

function formatarPerfil(perfil) {

    const perfisFormatados = {

        ADMIN:
            "Administrador",

        TECNICO:
            "Técnico",

        USUARIO:
            "Usuário",

        USUARIO_COMUM:
            "Usuário",

        GESTOR:
            "Gestor"

    };

    return (
        perfisFormatados[perfil] ||
        perfil ||
        "Usuário"
    );

}


// =========================================
// GERAR INICIAIS
// =========================================

function gerarIniciais(nome) {

    if (!nome) {

        return "U";

    }


    const partes =
        nome
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
// CARREGAR DADOS DO USUÁRIO LOGADO
// =========================================

async function carregarUsuarioPerfis(usuario) {

    const nome =
        usuario.nome ||
        usuario.nomeCompleto ||
        usuario.name ||
        usuario.email ||
        "Usuário";


    const perfil =
        formatarPerfil(
            usuario.perfil
        );


    dashboardUserName.textContent =
        nome;


    dashboardUserProfile.textContent =
        perfil;


    userInitials.textContent =
        gerarIniciais(nome);

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
// CLIQUE NO BOTÃO DO MENU
// =========================================

btnUserMenu.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        if (userMenu.hidden) {

            abrirMenuUsuario();

        } else {

            fecharMenuUsuario();

        }

    }
);


// =========================================
// FECHAR AO CLICAR FORA
// =========================================

document.addEventListener(
    "click",
    event => {

        if (
            !event.target.closest(
                ".user-area"
            )
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
    event => {

        if (
            event.key === "Escape"
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
// INICIALIZAÇÃO
// =========================================

async function iniciarPerfis() {

    try {

        const me =
            await apiGetJson(
                "/api/usuarios/me"
            );


        // ================================
        // DADOS DO USUÁRIO
        // ================================

        await carregarUsuarioPerfis(
            me
        );


        // ================================
        // LOGOUT DA SIDEBAR
        // ================================

        document
            .getElementById(
                "btnLogout"
            )
            .addEventListener(
                "click",
                logout
            );


        // ================================
        // PERMISSÕES DA SIDEBAR
        // ================================

        document
            .querySelectorAll(
                "[data-admin-only]"
            )
            .forEach(
                x => {

                    x.hidden =
                        me.perfil !== "ADMIN";

                }
            );


        document
            .querySelectorAll(
                "[data-permission]"
            )
            .forEach(
                x => {

                    x.hidden =
                        !(
                            me.permissoes || []
                        ).includes(
                            x.dataset.permission
                        );

                }
            );


        // ================================
        // SOMENTE ADMIN PODE GERENCIAR
        // ================================

        if (
            me.perfil !== "ADMIN"
        ) {

            perfilForm.hidden = true;

            avisarPerfil(
                "Somente administradores podem alterar perfis.",
                true
            );

            return;

        }


        // ================================
        // CARREGAR PERFIS
        // ================================

        await carregarPerfis();


    } catch (e) {

        avisarPerfil(
            getMensagemErroAmigavel(
                e.status || 0
            ),
            true
        );

    }

}


// =========================================
// CANCELAR EDIÇÃO
// =========================================

document
    .getElementById(
        "perfilCancelar"
    )
    .addEventListener(
        "click",
        limparPerfil
    );


// =========================================
// SALVAR PERFIL
// =========================================

perfilForm.addEventListener(
    "submit",
    async e => {

        e.preventDefault();


        const id =
            document.getElementById(
                "perfilId"
            ).value;


        const payload = {

            nome:
                document.getElementById(
                    "perfilNome"
                ).value.trim(),

            descricao:
                document.getElementById(
                    "perfilDescricao"
                ).value.trim(),

            permissoes:
                Array.from(
                    perfilForm.querySelectorAll(
                        ".permission-list input:checked"
                    )
                ).map(
                    x => x.value
                ),

            ativo:
                document.getElementById(
                    "perfilAtivo"
                ).checked

        };


        try {

            const r =
                await apiRequest(
                    id
                        ? `/api/perfis/${id}`
                        : "/api/perfis",
                    {
                        method:
                            id
                                ? "PUT"
                                : "POST",

                        body:
                            JSON.stringify(
                                payload
                            )
                    }
                );


            if (!r.ok) {

                throw {
                    status: r.status
                };

            }


            limparPerfil();

            avisarPerfil(
                "Perfil salvo."
            );


            await carregarPerfis();


        } catch (err) {

            avisarPerfil(
                getMensagemErroAmigavel(
                    err.status || 0
                ),
                true
            );

        }

    }
);


// =========================================
// AÇÕES DOS PERFIS
// =========================================

perfisLista.addEventListener(
    "click",
    async e => {

        const ed =
            e.target.closest(
                ".profile-edit"
            );

        const del =
            e.target.closest(
                ".profile-delete"
            );


        // ================================
        // EDITAR
        // ================================

        if (ed) {

            const p =
                perfis.find(
                    x =>
                        x.id ===
                        Number(
                            ed.dataset.id
                        )
                );


            if (!p) {

                return;

            }


            document.getElementById(
                "perfilId"
            ).value = p.id;


            document.getElementById(
                "perfilNome"
            ).value = p.nome;


            document.getElementById(
                "perfilDescricao"
            ).value =
                p.descricao || "";


            document.getElementById(
                "perfilAtivo"
            ).checked =
                p.ativo;


            perfilForm
                .querySelectorAll(
                    ".permission-list input"
                )
                .forEach(
                    x => {

                        x.checked =
                            (
                                p.permissoes || []
                            ).includes(
                                x.value
                            );

                    }
                );


            document.getElementById(
                "perfilTitulo"
            ).textContent =
                "Editar perfil";


            document.getElementById(
                "perfilCancelar"
            ).hidden = false;


            perfilForm.scrollIntoView({
                behavior: "smooth"
            });

        }


        // ================================
        // DESATIVAR
        // ================================

        if (
            del &&
            confirm(
                "Desativar este perfil? Ele precisa estar sem usuários atribuídos."
            )
        ) {

            const r =
                await apiRequest(
                    `/api/perfis/${del.dataset.id}`,
                    {
                        method: "DELETE"
                    }
                );


            if (!r.ok) {

                avisarPerfil(
                    "Não foi possível desativar. Reatribua os usuários que usam este perfil e tente novamente.",
                    true
                );

            } else {

                avisarPerfil(
                    "Perfil desativado."
                );


                await carregarPerfis();

            }

        }

    }
);


// =========================================
// INICIAR PÁGINA
// =========================================

iniciarPerfis();