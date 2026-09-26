// =========================================
// VERIFICAÇÃO DE AUTENTICAÇÃO
// =========================================
if (!estaAutenticado()) {
    window.location.href = "login.html";
}

// =========================================
// ELEMENTOS DO HTML
// =========================================
const nomeUsuarioLogado = document.getElementById("nomeUsuarioLogado");
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
// LISTA DE USUÁRIOS (Sincronizada com o Backend)
// =========================================
let usuarios = [];

function escapeHtmlEquipe(valor) {
    return String(valor == null ? "" : valor).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

async function inicializarEquipe() {
    try {
        const dadosBackend = await EquipeService.listar();
        
        usuarios = dadosBackend.map(u => ({
            id: u.id,
            nome: u.nome,
            email: u.email,
            tipo: u.perfil ? u.perfil.toLowerCase() : 'usuario',
            status: u.ativo === false ? 'Aguardando ativação' : 'Ativo'
        }));
        
        renderizarUsuarios();
    } catch (error) {
        console.error("Erro ao carregar equipe:", error);
        usuariosTableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        <h3>Erro ao carregar usuários</h3>
                        <p>Não foi possível carregar a lista da equipe. Verifique a conexão com a API.</p>
                    </div>
                </td>
            </tr>
        `;
    }
}

// =========================================
// ABRIR/FECHAR FORMULÁRIO
// =========================================
btnNovoUsuario.addEventListener("click", function () {
    formUsuario.hidden = false;
    nomeUsuario.focus();
});

btnCancelarUsuario.addEventListener("click", function () {
    usuarioForm.reset();
    limparErros();
    formUsuario.hidden = true;
});

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
        nomeUsuarioError.textContent = "O nome é obrigatório.";
        valido = false;
    }

    const email = emailUsuario.value.trim();
    if (email === "") {
        emailUsuarioError.textContent = "O e-mail é obrigatório.";
        valido = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailUsuarioError.textContent = "Digite um e-mail válido.";
        valido = false;
    }

    if (tipoUsuario.value === "") {
        tipoUsuarioError.textContent = "Selecione o tipo de usuário.";
        valido = false;
    }

    return valido;
}

// =========================================
// CADASTRAR USUÁRIO (Integração API)
// =========================================
usuarioForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!validarFormulario()) return;

    const perfilEnum = tipoUsuario.value.toUpperCase();

    const payload = {
        nome: nomeUsuario.value.trim(),
        email: emailUsuario.value.trim(),
        perfil: perfilEnum
    };

    const btnSubmit = usuarioForm.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.textContent;

    try {
        btnSubmit.disabled = true;
        btnSubmit.textContent = "Cadastrando...";

        await EquipeService.cadastrarMembro(payload);

        alert("Usuário cadastrado. O link de ativação foi enviado por e-mail.");

        usuarioForm.reset();
        limparErros();
        formUsuario.hidden = true;

        await inicializarEquipe();

    } catch (error) {
        alert(error.message);
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = textoOriginal;
    }
});

// =========================================
// EXIBIR USUÁRIOS
// =========================================
function renderizarUsuarios() {
    const termo = buscarUsuario.value.trim().toLowerCase();
    const tipoFiltro = filtroTipo.value;

    const usuariosFiltrados = usuarios.filter(function (usuario) {
        const correspondeBusca = usuario.nome.toLowerCase().includes(termo) || usuario.email.toLowerCase().includes(termo);
        const correspondeTipo = tipoFiltro === "todos" || usuario.tipo === tipoFiltro;
        return correspondeBusca && correspondeTipo;
    });

    usuariosTableBody.innerHTML = "";

    if (usuariosFiltrados.length === 0) {
        usuariosTableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        <h3>Nenhum usuário encontrado</h3>
                        <p>Cadastre um usuário para preencher a equipe.</p>
                    </div>
                </td>
            </tr>
        `;
    } else {
        usuariosFiltrados.forEach(function (usuario) {
            const linha = document.createElement("tr");
            linha.innerHTML = `
                <td><strong>${escapeHtmlEquipe(usuario.nome)}</strong></td>
                <td>${escapeHtmlEquipe(usuario.email)}</td>
                <td><span class="user-type ${escapeHtmlEquipe(usuario.tipo)}">${usuario.tipo === "tecnico" ? "Técnico" : usuario.tipo === "admin" ? "Administrador" : "Usuário"}</span></td>
                <td><span class="user-status">${escapeHtmlEquipe(usuario.status)}</span></td>
                <td><button type="button" class="btn btn-secondary btn-visualizar" data-email="${escapeHtmlEquipe(usuario.email)}">Visualizar</button></td>
            `;
            usuariosTableBody.appendChild(linha);
        });
    }
    atualizarContador();
}

function atualizarContador() {
    const quantidade = usuarios.length;
    totalUsuarios.textContent = quantidade === 1 ? "1 usuário" : `${quantidade} usuários`;
}

buscarUsuario.addEventListener("input", renderizarUsuarios);
filtroTipo.addEventListener("change", renderizarUsuarios);
btnLogout.addEventListener("click", () => logout());


// =========================================
// MODAL DE VISUALIZAÇÃO
// =========================================
const modalUsuario = document.getElementById("modalUsuario");
const modalUsuarioTitulo = document.getElementById("modalUsuarioTitulo");
const modalNome = document.getElementById("modalNome");
const modalEmail = document.getElementById("modalEmail");
const modalTipo = document.getElementById("modalTipo");
const modalStatus = document.getElementById("modalStatus");
const btnFecharModal = document.getElementById("btnFecharModal");
const btnFecharModalFooter = document.getElementById("btnFecharModalFooter");

usuariosTableBody.addEventListener("click", function (event) {
    if (!event.target.classList.contains("btn-visualizar")) return;

    const email = event.target.dataset.email;
    const usuario = usuarios.find(u => u.email === email);
    if (!usuario) return;

    modalUsuarioTitulo.textContent = usuario.nome;
    modalNome.textContent = usuario.nome;
    modalEmail.textContent = usuario.email;
    modalTipo.textContent = usuario.tipo === "tecnico" ? "Técnico" : usuario.tipo === "admin" ? "Administrador" : "Usuário";
    modalStatus.textContent = usuario.status;
    
    modalUsuario.hidden = false;
});

function fecharModal() {
    modalUsuario.hidden = true;
}

btnFecharModal.addEventListener("click", fecharModal);
btnFecharModalFooter.addEventListener("click", fecharModal);

// =========================================
// INICIALIZAÇÃO DA PÁGINA E DO PERFIL
// =========================================
async function inicializarPagina() {
    try {
        const perfil = await EquipeService.obterPerfilLogado();
        
        // Exibe apenas o primeiro nome para manter o layout limpo
        const primeiroNome = perfil.nome.split(' ')[0];
        if (perfil.perfil !== "ADMIN") btnNovoUsuario.hidden = true;
        nomeUsuarioLogado.textContent = primeiroNome;

        await inicializarEquipe();
    } catch (error) {
        nomeUsuarioLogado.textContent = "Usuário";
        await inicializarEquipe();
    }
}

inicializarPagina();
