import { EmpresaService } from './services/empresaService.js';

// ========================================
// ELEMENTOS DO FORMULÁRIO
// ========================================
const cadastroForm = document.getElementById("cadastroForm");
const btnCadastrar = document.getElementById("btnCadastrar");

const nomeFantasia = document.getElementById("nomeFantasia");
const cnpj = document.getElementById("cnpj");
const nomeUsuario = document.getElementById("nomeUsuario");
const emailUsuario = document.getElementById("emailUsuario");
const senhaUsuario = document.getElementById("senhaUsuario");
const confirmarSenha = document.getElementById("confirmarSenha");
const termos = document.getElementById("termos");

// ========================================
// ELEMENTOS DE ERRO
// ========================================
const nomeFantasiaError = document.getElementById("nomeFantasiaError");
const cnpjError = document.getElementById("cnpjError");
const nomeUsuarioError = document.getElementById("nomeUsuarioError");
const emailUsuarioError = document.getElementById("emailUsuarioError");
const senhaUsuarioError = document.getElementById("senhaUsuarioError");
const confirmarSenhaError = document.getElementById("confirmarSenhaError");
const termosError = document.getElementById("termosError");

// ========================================
// FUNÇÕES AUXILIARES
// ========================================
function mostrarErro(input, elementoErro, mensagem) {
    input.classList.add("input-error");
    input.classList.remove("input-success");
    elementoErro.textContent = mensagem;
}

function mostrarSucesso(input, elementoErro) {
    input.classList.remove("input-error");
    input.classList.add("input-success");
    elementoErro.textContent = "";
}

function limparEstado(input, elementoErro) {
    input.classList.remove("input-error");
    input.classList.remove("input-success");
    elementoErro.textContent = "";
}

// ========================================
// VALIDAÇÕES
// ========================================
function validarNomeFantasia() {
    if (nomeFantasia.value.trim() === "") {
        mostrarErro(nomeFantasia, nomeFantasiaError, "Informe o nome da empresa.");
        return false;
    }
    mostrarSucesso(nomeFantasia, nomeFantasiaError);
    return true;
}

function validarCnpj() {
    const valor = cnpj.value.replace(/\D/g, ''); // Remove não-números
    if (valor.length !== 14) {
        mostrarErro(cnpj, cnpjError, "O CNPJ deve ter 14 números.");
        return false;
    }
    mostrarSucesso(cnpj, cnpjError);
    return true;
}

function validarNomeUsuario() {
    if (nomeUsuario.value.trim().length < 3) {
        mostrarErro(nomeUsuario, nomeUsuarioError, "O nome deve possuir pelo menos 3 caracteres.");
        return false;
    }
    mostrarSucesso(nomeUsuario, nomeUsuarioError);
    return true;
}

function validarEmailUsuario() {
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValido.test(emailUsuario.value.trim())) {
        mostrarErro(emailUsuario, emailUsuarioError, "Informe um e-mail válido.");
        return false;
    }
    mostrarSucesso(emailUsuario, emailUsuarioError);
    return true;
}

function validarSenhaUsuario() {
    const senhaForte = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$/;
    if (!senhaForte.test(senhaUsuario.value)) {
        mostrarErro(senhaUsuario, senhaUsuarioError, "Mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 especial.");
        return false;
    }
    mostrarSucesso(senhaUsuario, senhaUsuarioError);
    return true;
}

function validarConfirmacaoSenha() {
    if (confirmarSenha.value !== senhaUsuario.value || confirmarSenha.value === "") {
        mostrarErro(confirmarSenha, confirmarSenhaError, "As senhas não são iguais.");
        return false;
    }
    mostrarSucesso(confirmarSenha, confirmarSenhaError);
    return true;
}

function validarTermos() {
    if (!termos.checked) {
        termosError.textContent = "Você precisa aceitar os termos para continuar.";
        return false;
    }
    termosError.textContent = "";
    return true;
}

// ========================================
// ENVIO DO FORMULÁRIO API
// ========================================
cadastroForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const nomeFantasiaOk = validarNomeFantasia();
    const cnpjOk = validarCnpj();
    const nomeUsuarioOk = validarNomeUsuario();
    const emailUsuarioOk = validarEmailUsuario();
    const senhaUsuarioOk = validarSenhaUsuario();
    const confirmacaoOk = validarConfirmacaoSenha();
    const termosOk = validarTermos();

    if (!nomeFantasiaOk || !cnpjOk || !nomeUsuarioOk || !emailUsuarioOk || !senhaUsuarioOk || !confirmacaoOk || !termosOk) {
        return;
    }

    // Payload idêntico ao solicitado pelo seu DTO
    const dadosEmpresa = {
        nomeFantasia: nomeFantasia.value.trim(),
        cnpj: cnpj.value.replace(/\D/g, ''), // Envia apenas os números
        nomeUsuario: nomeUsuario.value.trim(),
        emailUsuario: emailUsuario.value.trim(),
        senhaUsuario: senhaUsuario.value
    };

    try {
        btnCadastrar.disabled = true;
        btnCadastrar.textContent = 'Criando conta da Empresa...';

        await EmpresaService.cadastrar(dadosEmpresa);

        alert("Empresa cadastrada com sucesso!");
        window.location.href = 'login.html';

    } catch (error) {
        alert(error.message);
    } finally {
        btnCadastrar.disabled = false;
        btnCadastrar.textContent = 'Criar conta da Empresa';
    }
});