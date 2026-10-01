// =========================================
// VERIFICAÇÃO DE AUTENTICAÇÃO
// =========================================

if (!estaAutenticado()) {
    window.location.href = "login.html";
}


// =========================================
// ELEMENTOS DO HTML
// =========================================

const btnNovoUsuario = document.getElementById("btnNovoUsuario");
const btnCancelarUsuario = document.getElementById("btnCancelarUsuario");
const formUsuario = document.getElementById("formUsuario");
const usuarioForm = document.getElementById("usuarioForm");
const usuariosTableBody = document.getElementById("usuariosTableBody");
const totalUsuarios = document.getElementById("totalUsuarios");
const buscarUsuario = document.getElementById("buscarUsuario");
const filtroTipo = document.getElementById("filtroTipo");
const btnLogout = document.getElementById("btnLogout");

const nomeUsuario = document.getElementById("nomeUsuario");
const emailUsuario = document.getElementById("emailUsuario");
const tipoUsuario = document.getElementById("tipoUsuario");

document.getElementById("senhaUsuario")?.closest(".form-group")?.remove();

const nomeUsuarioError = document.getElementById("nomeUsuarioError");
const emailUsuarioError = document.getElementById("emailUsuarioError");
const tipoUsuarioError = document.getElementById("tipoUsuarioError");


// =========================================
// ELEMENTOS DO MENU DO USUÁRIO
// =========================================

const btnUserMenu = document.getElementById("btnUserMenu");
const userMenu = document.getElementById("userMenu");
const btnUserLogout = document.getElementById("btnUserLogout");

const userInitials = document.getElementById("userInitials");

const userMenuName =
    document.getElementById("dashboardUserName");

const userMenuProfile =
    document.getElementById("dashboardUserProfile");


// =========================================
// LISTA DE USUÁRIOS
// Sincronizada com o Backend
// =========================================

let usuarios = [];


function escapeHtmlEquipe(valor) {

    return String(valor == null ? "" : valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

}


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

    const perfilNormalizado =
        String(perfil || "")
            .trim()
            .toUpperCase();

    return perfis[perfilNormalizado] || perfil || "Usuário";

}


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
            usuario.perfil ||
            "USUARIO";

        if (userMenuName) {

            userMenuName.textContent = nome;

        }

        if (userMenuProfile) {

            userMenuProfile.textContent =
                formatarPerfil(perfil);

        }

        if (userInitials) {

            userInitials.textContent =
                gerarIniciais(nome);

        }

    } catch (error) {

        console.error(
            "Erro ao carregar usuário logado:",
            error
        );

        if (userMenuName) {

            userMenuName.textContent =
                "Usuário";

        }

        if (userMenuProfile) {

            userMenuProfile.textContent =
                "Usuário";

        }

        if (userInitials) {

            userInitials.textContent =
                "U";

        }

    }

}


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


document.addEventListener(
    "click",
    function (event) {

        if (
            userMenu &&
            btnUserMenu &&
            !userMenu.contains(event.target) &&
            !btnUserMenu.contains(event.target)
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
// ABRIR / FECHAR FORMULÁRIO
// =========================================

btnNovoUsuario.addEventListener(
    "click",
    function () {

        formUsuario.hidden = false;

        nomeUsuario.focus();

    }
);


btnCancelarUsuario.addEventListener(
    "click",
    function () {

        usuarioForm.reset();

        limparErros();

        formUsuario.hidden = true;

    }
);


function limparErros() {

    nomeUsuarioError.textContent = "";

    emailUsuarioError.textContent = "";

    tipoUsuarioError.textContent = "";

}


// =========================================
// VALIDAR FORMULÁRIO
// =========================================

function validarFormulario() {

    let valido = true;

    limparErros();


    if (nomeUsuario.value.trim() === "") {

        nomeUsuarioError.textContent =
            "O nome é obrigatório.";

        valido = false;

    }


    const email =
        emailUsuario.value.trim();


    if (email === "") {

        emailUsuarioError.textContent =
            "O e-mail é obrigatório.";

        valido = false;

    } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {

        emailUsuarioError.textContent =
            "Digite um e-mail válido.";

        valido = false;

    }


    if (tipoUsuario.value === "") {

        tipoUsuarioError.textContent =
            "Selecione o tipo de usuário.";

        valido = false;

    }


    return valido;

}


// =========================================
// CADASTRAR USUÁRIO
// Integração com API
// =========================================

usuarioForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (!validarFormulario()) {
            return;
        }


        const valorPerfil =
            tipoUsuario.value;


        const perfilCustomizadoId =
            valorPerfil.startsWith("CUSTOM:")
                ? Number(valorPerfil.slice(7))
                : null;


        const payload = {

            nome: nomeUsuario.value.trim(),

            email: emailUsuario.value.trim(),

            perfil: perfilCustomizadoId
                ? "USUARIO"
                : valorPerfil,

            perfilCustomizadoId

        };


        const btnSubmit =
            usuarioForm.querySelector(
                'button[type="submit"]'
            );


        const textoOriginal =
            btnSubmit.textContent;


        try {

            btnSubmit.disabled = true;

            btnSubmit.textContent =
                "Cadastrando...";


            await EquipeService.cadastrarMembro(
                payload
            );


            alert(
                "Usuário cadastrado. O link de ativação foi enviado por e-mail."
            );


            usuarioForm.reset();

            limparErros();

            formUsuario.hidden = true;


            await inicializarEquipe();


        } catch (error) {

            alert(error.message);

        } finally {

            btnSubmit.disabled = false;

            btnSubmit.textContent =
                textoOriginal;

        }

    }
);


// =========================================
// INICIALIZAR EQUIPE
// =========================================

async function inicializarEquipe() {

    try {

        const dadosBackend =
            await EquipeService.listar();


        usuarios =
            dadosBackend.map(u => ({

                id: u.id,

                nome: u.nome,

                email: u.email,

                tipo: u.perfilCustomizadoId
                    ? `custom:${u.perfilCustomizadoId}`
                    : (
                        u.perfil
                            ? u.perfil.toLowerCase()
                            : "usuario"
                    ),

                perfilNome:
                    u.perfilNome ||
                    u.perfil ||
                    "Cliente",

                excluido:
                    Boolean(u.excluido),

                status:
                    u.excluido
                        ? "Excluído"
                        : u.ativo === false
                            ? "Aguardando ativação"
                            : "Ativo"

            }));


        renderizarUsuarios();


    } catch (error) {

        console.error(
            "Erro ao carregar equipe:",
            error
        );


        usuariosTableBody.innerHTML = `

            <tr>

                <td colspan="5">

                    <div class="empty-state">

                        <h3>
                            Erro ao carregar usuários
                        </h3>

                        <p>
                            Não foi possível carregar a lista da equipe.
                            Verifique a conexão com a API.
                        </p>

                    </div>

                </td>

            </tr>

        `;

    }

}


// =========================================
// EXIBIR USUÁRIOS
// =========================================

function renderizarUsuarios() {

    const termo =
        buscarUsuario.value
            .trim()
            .toLowerCase();


    const tipoFiltro =
        filtroTipo.value;


    const usuariosFiltrados =
        usuarios.filter(
            function (usuario) {

                const correspondeBusca =
                    usuario.nome
                        .toLowerCase()
                        .includes(termo) ||

                    usuario.email
                        .toLowerCase()
                        .includes(termo);


                const correspondeTipo =
                    tipoFiltro === "todos" ||
                    usuario.tipo === tipoFiltro;


                return (
                    correspondeBusca &&
                    correspondeTipo
                );

            }
        );


    usuariosTableBody.innerHTML = "";


    if (usuariosFiltrados.length === 0) {

        usuariosTableBody.innerHTML = `

            <tr>

                <td colspan="5">

                    <div class="empty-state">

                        <h3>
                            Nenhum usuário encontrado
                        </h3>

                        <p>
                            Cadastre um usuário para preencher a equipe.
                        </p>

                    </div>

                </td>

            </tr>

        `;

    } else {

        usuariosFiltrados.forEach(
            function (usuario) {

                const linha =
                    document.createElement("tr");


                linha.innerHTML = `

                    <td>
                        <strong>
                            ${escapeHtmlEquipe(usuario.nome)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtmlEquipe(usuario.email)}
                    </td>

                    <td>
                        <span
                            class="user-type ${escapeHtmlEquipe(usuario.tipo)}"
                        >
                            ${escapeHtmlEquipe(usuario.perfilNome)}
                        </span>
                    </td>

                    <td>
                        <span class="user-status">
                            ${escapeHtmlEquipe(usuario.status)}
                        </span>
                    </td>

                    <td>

                        <div class="button-group">

                            <button
                                type="button"
                                class="btn btn-secondary btn-visualizar"
                                data-email="${escapeHtmlEquipe(usuario.email)}"
                            >
                                Visualizar
                            </button>

                            ${
                                usuario.excluido
                                    ? ""
                                    : `
                                        <button
                                            type="button"
                                            class="btn btn-secondary btn-excluir-usuario"
                                            data-id="${usuario.id}"
                                        >
                                            Excluir
                                        </button>
                                    `
                            }

                        </div>

                    </td>

                `;


                usuariosTableBody.appendChild(
                    linha
                );

            }
        );

    }


    atualizarContador();

}


function atualizarContador() {

    const quantidade =
        usuarios.length;


    totalUsuarios.textContent =
        quantidade === 1
            ? "1 usuário"
            : `${quantidade} usuários`;

}


buscarUsuario.addEventListener(
    "input",
    renderizarUsuarios
);


filtroTipo.addEventListener(
    "change",
    renderizarUsuarios
);


if (btnLogout) {

    btnLogout.addEventListener(
        "click",
        function () {

            logout();

        }
    );

}


// =========================================
// MODAL DE VISUALIZAÇÃO
// =========================================

const modalUsuario =
    document.getElementById("modalUsuario");

const modalUsuarioTitulo =
    document.getElementById("modalUsuarioTitulo");

const modalNome =
    document.getElementById("modalNome");

const modalEmail =
    document.getElementById("modalEmail");

const modalTipo =
    document.getElementById("modalTipo");

const modalStatus =
    document.getElementById("modalStatus");

const btnFecharModal =
    document.getElementById("btnFecharModal");

const btnFecharModalFooter =
    document.getElementById(
        "btnFecharModalFooter"
    );


usuariosTableBody.addEventListener(
    "click",
    function (event) {

        // =====================================
        // EXCLUIR USUÁRIO
        // =====================================

        const btnExcluir =
            event.target.closest(
                ".btn-excluir-usuario"
            );


        if (btnExcluir) {

            const usuario =
                usuarios.find(
                    u =>
                        u.id ===
                        Number(btnExcluir.dataset.id)
                );


            if (
                usuario &&
                confirm(
                    `Excluir o acesso de ${usuario.nome}?`
                )
            ) {

                apiRequest(
                    `/api/usuarios/${usuario.id}`,
                    {
                        method: "DELETE"
                    }
                )
                    .then(
                        async response => {

                            if (!response.ok) {

                                alert(
                                    getMensagemErroAmigavel(
                                        response.status
                                    )
                                );

                                return;

                            }


                            await inicializarEquipe();

                        }
                    )
                    .catch(
                        () => {

                            alert(
                                "Não foi possível excluir o usuário."
                            );

                        }
                    );

            }

            return;

        }


        // =====================================
        // VISUALIZAR USUÁRIO
        // =====================================

        if (
            !event.target.classList.contains(
                "btn-visualizar"
            )
        ) {

            return;

        }


        const email =
            event.target.dataset.email;


        const usuario =
            usuarios.find(
                u =>
                    u.email === email
            );


        if (!usuario) {
            return;
        }


        modalUsuarioTitulo.textContent =
            usuario.nome;

        modalNome.textContent =
            usuario.nome;

        modalEmail.textContent =
            usuario.email;


        modalTipo.textContent =
            usuario.tipo === "tecnico"
                ? "Técnico"
                : usuario.tipo === "admin"
                    ? "Administrador"
                    : "Usuário";


        modalStatus.textContent =
            usuario.status;


        modalUsuario.hidden = false;

    }
);


// =========================================
// FECHAR MODAL
// =========================================

function fecharModal() {

    modalUsuario.hidden = true;

}


btnFecharModal.addEventListener(
    "click",
    fecharModal
);


btnFecharModalFooter.addEventListener(
    "click",
    fecharModal
);


// =========================================
// INICIALIZAÇÃO DA PÁGINA E DO PERFIL
// =========================================

async function inicializarPagina() {

    try {

        const perfil =
            await EquipeService.obterPerfilLogado();


        // =====================================
        // PERMISSÃO PARA CADASTRAR USUÁRIOS
        // =====================================

        if (
            !(perfil.permissoes || [])
                .includes("GERENCIAR_USUARIOS")
        ) {

            btnNovoUsuario.hidden = true;

        }


        // =====================================
        // PERMISSÕES DO MENU LATERAL
        // =====================================

        document
            .querySelectorAll("[data-admin-only]")
            .forEach(
                x => {

                    x.hidden =
                        perfil.perfil !== "ADMIN";

                }
            );


        document
            .querySelectorAll("[data-permission]")
            .forEach(
                x => {

                    x.hidden =
                        !(perfil.permissoes || [])
                            .includes(
                                x.dataset.permission
                            );

                }
            );


        // =====================================
        // CARREGAR PERFIS PERSONALIZADOS
        // =====================================

        if (
            (perfil.permissoes || [])
                .includes("GERENCIAR_USUARIOS")
        ) {

            const perfis =
                await apiGetJson(
                    "/api/perfis"
                );


            perfis
                .filter(p => p.ativo)
                .forEach(
                    p => {

                        tipoUsuario.add(
                            new Option(
                                p.nome,
                                `CUSTOM:${p.id}`
                            )
                        );

                    }
                );

        }


        await inicializarEquipe();


    } catch (error) {

        console.error(
            "Erro ao inicializar página:",
            error
        );


        await inicializarEquipe();

    }

}


// =========================================
// INICIALIZAÇÃO GERAL
// =========================================

carregarUsuarioMenu();

inicializarPagina();