// =========================================
// SLA CONFIG - CONECTA21
// =========================================


// =========================================
// VERIFICAÇÃO DE AUTENTICAÇÃO
// =========================================

if (!estaAutenticado()) {

    window.location.href = "login.html";

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

const userInitials =
    document.getElementById("userInitials");

const userMenuName =
    document.getElementById("dashboardUserName");

const userMenuProfile =
    document.getElementById("dashboardUserProfile");


// =========================================
// ELEMENTOS DO SLA
// =========================================

const btnLogoutSla =
    document.getElementById("btnLogout");

const painelSla =
    document.querySelector(
        ".sla-main .dashboard-panel"
    );

const mensagemSla =
    document.getElementById("slaMsg");


// =========================================
// FUNÇÃO DE ESCAPE
// =========================================

const escapeSla = valor =>
    String(valor == null ? "" : valor)
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
// MENU DO USUÁRIO
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
        partes[0][0] +
        partes[partes.length - 1][0]
    ).toUpperCase();

}


async function carregarUsuarioMenu() {

    try {

        const usuario =
            await apiGetJson(
                "/api/usuarios/me"
            );


        const nome =
            usuario.nome ||
            usuario.nomeCompleto ||
            usuario.name ||
            usuario.email ||
            "Usuário";


        const perfil =
            usuario.perfil ||
            "USUARIO";


        userMenuName.textContent =
            nome;

        userMenuProfile.textContent =
            formatarPerfil(perfil);

        userInitials.textContent =
            gerarIniciais(nome);

    } catch (error) {

        userMenuName.textContent =
            "Usuário";

        userMenuProfile.textContent =
            "Usuário";

        userInitials.textContent =
            "U";

    }

}


function abrirMenuUsuario() {

    userMenu.hidden = false;

    btnUserMenu.setAttribute(
        "aria-expanded",
        "true"
    );

}


function fecharMenuUsuario() {

    userMenu.hidden = true;

    btnUserMenu.setAttribute(
        "aria-expanded",
        "false"
    );

}


function alternarMenuUsuario() {

    if (userMenu.hidden) {

        abrirMenuUsuario();

    } else {

        fecharMenuUsuario();

    }

}


btnUserMenu.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        alternarMenuUsuario();

    }
);


userMenu.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

    }
);


document.addEventListener(
    "click",
    function () {

        if (!userMenu.hidden) {

            fecharMenuUsuario();

        }

    }
);


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            !userMenu.hidden
        ) {

            fecharMenuUsuario();

        }

    }
);


btnUserLogout.addEventListener(
    "click",
    function () {

        logout();

    }
);


// =========================================
// LOGOUT DA SIDEBAR
// =========================================

if (btnLogoutSla) {

    btnLogoutSla.addEventListener(
        "click",
        function () {

            logout();

        }
    );

}


// =========================================
// MENSAGEM
// =========================================

function avisoSla(
    texto,
    tipo = "error"
) {

    mensagemSla.hidden = !texto;

    mensagemSla.textContent = texto;

    mensagemSla.className =
        "sla-msg " + tipo;

}


// =========================================
// PRIORIDADES
// =========================================

let prioridadesSla = [];


// =========================================
// RENDERIZAR PRIORIDADES
// =========================================

function renderPrioridades() {

    const corpo =
        document.getElementById(
            "prioridadesLista"
        );


    corpo.innerHTML =
        prioridadesSla
            .map(
                p => `

                    <tr>

                        <td>
                            <strong>
                                ${escapeSla(p.nome)}
                            </strong>
                        </td>

                        <td>
                            ${p.slaRespostaMinutos / 60} h
                        </td>

                        <td>
                            ${p.slaResolucaoMinutos / 60} h
                        </td>

                        <td>
                            ${p.ativa ? "Ativa" : "Inativa"}
                        </td>

                        <td>

                            <button
                                class="btn btn-secondary sla-edit"
                                data-id="${p.id}"
                                type="button"
                            >
                                Editar
                            </button>

                        </td>

                    </tr>

                `
            )
            .join("")
        ||
        `
            <tr>

                <td colspan="5">
                    Nenhuma prioridade cadastrada.
                </td>

            </tr>
        `;


    const seletor =
        document.getElementById(
            "categoriaPrioridade"
        );


    seletor.innerHTML =
        prioridadesSla
            .filter(p => p.ativa)
            .map(
                p => `

                    <option value="${p.id}">
                        ${escapeSla(p.nome)}
                    </option>

                `
            )
            .join("");

}


// =========================================
// ESTRUTURA ADMINISTRATIVA
// =========================================

painelSla.innerHTML = `

    <div class="sla-admin-grid">


        <!-- =================================
             PRIORIDADES E SLA
        ================================== -->

        <section class="sla-admin-card">

            <div class="panel-header">

                <div>

                    <h2>
                        Prioridades e SLAs
                    </h2>

                    <p>
                        Configure prazos de primeira resposta e resolução.
                    </p>

                </div>

            </div>


            <form
                id="prioridadeForm"
                class="sla-editor-form"
            >

                <input
                    id="prioridadeId"
                    type="hidden"
                >


                <label>

                    Nome

                    <input
                        id="prioridadeNome"
                        maxlength="50"
                        required
                    >

                </label>


                <label>

                    SLA de resposta (horas)

                    <input
                        id="slaResposta"
                        type="number"
                        min="0.25"
                        step="0.25"
                        required
                    >

                </label>


                <label>

                    SLA de resolução (horas)

                    <input
                        id="slaResolucao"
                        type="number"
                        min="0.25"
                        step="0.25"
                        required
                    >

                </label>


                <label class="sla-check">

                    <input
                        id="prioridadeAtiva"
                        type="checkbox"
                        checked
                    >

                    Ativa

                </label>


                <button
                    class="btn btn-primary"
                    type="submit"
                >
                    Salvar prioridade
                </button>

            </form>


            <div class="table-container">

                <table class="sla-table">

                    <thead>

                        <tr>

                            <th>
                                Prioridade
                            </th>

                            <th>
                                Resposta
                            </th>

                            <th>
                                Resolução
                            </th>

                            <th>
                                Status
                            </th>

                            <th></th>

                        </tr>

                    </thead>


                    <tbody id="prioridadesLista"></tbody>

                </table>

            </div>

        </section>



        <!-- =================================
             CATEGORIAS
        ================================== -->

        <section class="sla-admin-card">

            <div class="panel-header">

                <div>

                    <h2>
                        Categorias de chamado
                    </h2>

                    <p>
                        Cada categoria aplica sua prioridade automaticamente.
                    </p>

                </div>

            </div>


            <form
                id="categoriaForm"
                class="sla-editor-form"
            >

                <input
                    id="categoriaId"
                    type="hidden"
                >


                <label>

                    Nome da categoria

                    <input
                        id="categoriaNome"
                        maxlength="50"
                        required
                    >

                </label>


                <label>

                    Prioridade aplicada

                    <select
                        id="categoriaPrioridade"
                        required
                    ></select>

                </label>


                <div class="button-group">

                    <button
                        id="salvarCategoria"
                        class="btn btn-primary"
                        type="submit"
                    >
                        Adicionar categoria
                    </button>


                    <button
                        id="cancelarEdicaoCategoria"
                        class="btn btn-secondary"
                        type="button"
                        hidden
                    >
                        Cancelar edição
                    </button>

                </div>

            </form>


            <div
                id="categoriasLista"
                class="category-grid"
                role="list"
            ></div>

        </section>

    </div>

`;


// =========================================
// CARREGAR CONFIGURAÇÃO
// =========================================

async function carregarConfiguracaoSla() {

    try {

        const perfil =
            await apiGetJson(
                "/api/usuarios/me"
            );


        const permissoes =
            perfil.permissoes || [];


        // -------------------------------------
        // VERIFICAR PERMISSÕES
        // -------------------------------------

        if (
            perfil.perfil !== "ADMIN" &&
            !(
                permissoes.includes(
                    "GERENCIAR_PRIORIDADES"
                ) &&
                permissoes.includes(
                    "GERENCIAR_CATEGORIAS"
                )
            )
        ) {

            painelSla.innerHTML = `

                <div class="empty-state">

                    <h3>
                        Área administrativa
                    </h3>

                    <p>
                        Somente administradores podem
                        configurar prioridades, SLAs e categorias.
                    </p>

                </div>

            `;

            return;

        }


        // -------------------------------------
        // CARREGAR DADOS
        // -------------------------------------

        const [
            prioridades,
            categorias
        ] = await Promise.all([

            apiGetJson(
                "/api/prioridades"
            ),

            apiGetJson(
                "/api/categorias"
            )

        ]);


        prioridadesSla =
            prioridades || [];


        renderPrioridades();


        // -------------------------------------
        // RENDERIZAR CATEGORIAS
        // -------------------------------------

        document
            .getElementById(
                "categoriasLista"
            )
            .innerHTML =

            (categorias || [])
                .map(
                    c => `

                        <article
                            class="category-card"
                            role="listitem"
                        >

                            <div>

                                <h3>
                                    ${escapeSla(c.nome)}
                                </h3>

                                <span class="priority-badge">
                                    ${escapeSla(
                                        c.prioridadeNome ||
                                        "Prioridade pendente"
                                    )}
                                </span>

                            </div>


                            <button
                                type="button"
                                class="btn btn-secondary category-edit"
                                data-id="${c.id}"
                                data-prioridade="${c.prioridadeId || ""}"
                                data-nome="${escapeSla(c.nome)}"
                            >
                                Editar prioridade
                            </button>

                        </article>

                    `
                )
                .join("")
            ||
            `
                <div class="empty-state">

                    <p>
                        Nenhuma categoria cadastrada.
                    </p>

                </div>
            `;

    } catch (error) {

        avisoSla(
            getMensagemErroAmigavel(
                error.status || 0
            )
        );

    }

}


// =========================================
// EDITAR PRIORIDADE
// =========================================

painelSla.addEventListener(
    "click",
    function (event) {

        const botao =
            event.target.closest(
                ".sla-edit"
            );


        if (!botao) {
            return;
        }


        const prioridade =
            prioridadesSla.find(
                p =>
                    p.id ===
                    Number(
                        botao.dataset.id
                    )
            );


        if (!prioridade) {
            return;
        }


        document.getElementById(
            "prioridadeId"
        ).value = prioridade.id;


        document.getElementById(
            "prioridadeNome"
        ).value = prioridade.nome;


        document.getElementById(
            "slaResposta"
        ).value =
            prioridade.slaRespostaMinutos / 60;


        document.getElementById(
            "slaResolucao"
        ).value =
            prioridade.slaResolucaoMinutos / 60;


        document.getElementById(
            "prioridadeAtiva"
        ).checked =
            prioridade.ativa;


        document.getElementById(
            "prioridadeNome"
        ).focus();

    }
);


// =========================================
// EDITAR CATEGORIA
// =========================================

painelSla.addEventListener(
    "click",
    function (event) {

        const botao =
            event.target.closest(
                ".category-edit"
            );


        if (!botao) {
            return;
        }


        document.getElementById(
            "categoriaId"
        ).value =
            botao.dataset.id;


        document.getElementById(
            "categoriaNome"
        ).value =
            botao.dataset.nome;


        document.getElementById(
            "categoriaPrioridade"
        ).value =
            botao.dataset.prioridade;


        document.getElementById(
            "salvarCategoria"
        ).textContent =
            "Salvar alterações";


        document.getElementById(
            "cancelarEdicaoCategoria"
        ).hidden = false;


        document.getElementById(
            "categoriaNome"
        ).focus();

    }
);


// =========================================
// CANCELAR EDIÇÃO DE CATEGORIA
// =========================================

document
    .getElementById(
        "cancelarEdicaoCategoria"
    )
    .addEventListener(
        "click",
        function () {

            document
                .getElementById(
                    "categoriaForm"
                )
                .reset();


            document.getElementById(
                "categoriaId"
            ).value = "";


            document.getElementById(
                "salvarCategoria"
            ).textContent =
                "Adicionar categoria";


            this.hidden = true;

        }
    );


// =========================================
// SUBMISSÃO DOS FORMULÁRIOS
// =========================================

painelSla.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // =====================================
        // FORMULÁRIO DE PRIORIDADE
        // =====================================

        if (
            event.target.id ===
            "prioridadeForm"
        ) {

            const id =
                document.getElementById(
                    "prioridadeId"
                ).value;


            const payload = {

                id:
                    id
                        ? Number(id)
                        : null,

                nome:
                    document
                        .getElementById(
                            "prioridadeNome"
                        )
                        .value
                        .trim(),

                slaRespostaMinutos:
                    Math.round(
                        Number(
                            document.getElementById(
                                "slaResposta"
                            ).value
                        ) * 60
                    ),

                slaResolucaoMinutos:
                    Math.round(
                        Number(
                            document.getElementById(
                                "slaResolucao"
                            ).value
                        ) * 60
                    ),

                ativa:
                    document.getElementById(
                        "prioridadeAtiva"
                    ).checked

            };


            const response =
                await apiRequest(
                    id
                        ? `/api/prioridades/${id}`
                        : "/api/prioridades",
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


            if (!response.ok) {

                avisoSla(
                    "Não foi possível salvar a prioridade. Confira os valores e suas permissões."
                );

                return;

            }


            document
                .getElementById(
                    "prioridadeForm"
                )
                .reset();


            document.getElementById(
                "prioridadeId"
            ).value = "";


            document.getElementById(
                "prioridadeAtiva"
            ).checked = true;


            avisoSla(
                "Prioridade salva.",
                "success"
            );


            await carregarConfiguracaoSla();

        }


        // =====================================
        // FORMULÁRIO DE CATEGORIA
        // =====================================

        if (
            event.target.id ===
            "categoriaForm"
        ) {

            const id =
                document.getElementById(
                    "categoriaId"
                ).value;


            const response =
                await apiRequest(
                    id
                        ? `/api/categorias/${id}`
                        : "/api/categorias",
                    {
                        method:
                            id
                                ? "PUT"
                                : "POST",

                        body:
                            JSON.stringify({

                                nome:
                                    document
                                        .getElementById(
                                            "categoriaNome"
                                        )
                                        .value
                                        .trim(),

                                prioridadeId:
                                    Number(
                                        document
                                            .getElementById(
                                                "categoriaPrioridade"
                                            )
                                            .value
                                    )

                            })
                    }
                );


            if (!response.ok) {

                avisoSla(
                    "Não foi possível cadastrar a categoria. Confira se há uma prioridade ativa."
                );

                return;

            }


            event.target.reset();


            document.getElementById(
                "categoriaId"
            ).value = "";


            document.getElementById(
                "salvarCategoria"
            ).textContent =
                "Adicionar categoria";


            document.getElementById(
                "cancelarEdicaoCategoria"
            ).hidden = true;


            avisoSla(
                id
                    ? "Categoria atualizada."
                    : "Categoria cadastrada.",
                "success"
            );


            await carregarConfiguracaoSla();

        }

    }
);


// =========================================
// INICIALIZAÇÃO
// =========================================

carregarUsuarioMenu();

carregarConfiguracaoSla();