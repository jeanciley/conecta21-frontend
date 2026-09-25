// =========================================
// LOGIN - CONECTA21
// =========================================


// Capturando elementos do HTML

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");

const emailError = document.getElementById("emailError");
const senhaError = document.getElementById("senhaError");

const btnEntrar = document.getElementById("btnEntrar");

const loginMessage = document.getElementById("loginMessage");

const toggleSenha = document.getElementById("toggleSenha");

const esqueciSenha = document.getElementById("esqueciSenha");


// =========================================
// FUNÇÕES AUXILIARES
// =========================================

function mostrarErro(campo, mensagem) {

    campo.classList.add("input-error");
    campo.classList.remove("input-success");
}

function limparEstado(campo) {

    campo.classList.remove("input-error");
    campo.classList.remove("input-success");
}


// =========================================
// VALIDAÇÃO DO E-MAIL
// =========================================

function validarEmail() {

    const email = emailInput.value.trim();

    limparEstado(emailInput);
    emailError.textContent = "";

    if (email === "") {

        emailError.textContent = "O e-mail é obrigatório.";

        emailInput.classList.add("input-error");

        return false;
    }

    const emailValido =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailValido) {

        emailError.textContent =
            "Digite um e-mail válido.";

        emailInput.classList.add("input-error");

        return false;
    }

    emailInput.classList.add("input-success");

    return true;
}


// =========================================
// VALIDAÇÃO DA SENHA
// =========================================

function validarSenha() {

    const senha = senhaInput.value;

    limparEstado(senhaInput);
    senhaError.textContent = "";

    if (senha === "") {

        senhaError.textContent =
            "A senha é obrigatória.";

        senhaInput.classList.add("input-error");

        return false;
    }

    if (senha.length < 8) {

        senhaError.textContent =
            "A senha deve possuir pelo menos 8 caracteres.";
    
        senhaInput.classList.add("input-error");
    
        return false;
    }

    senhaInput.classList.add("input-success");

    return true;
}


// =========================================
// MENSAGEM GERAL
// =========================================

function mostrarMensagem(mensagem, tipo) {

    loginMessage.textContent = mensagem;

    loginMessage.className = "login-message " + tipo;
}


function limparMensagem() {

    loginMessage.textContent = "";

    loginMessage.className = "login-message";
}


// =========================================
// MOSTRAR / OCULTAR SENHA
// =========================================

toggleSenha.addEventListener("click", function () {

    if (senhaInput.type === "password") {

        senhaInput.type = "text";

        toggleSenha.textContent = "Ocultar";

        toggleSenha.setAttribute(
            "aria-label",
            "Ocultar senha"
        );

    } else {

        senhaInput.type = "password";

        toggleSenha.textContent = "Mostrar";

        toggleSenha.setAttribute(
            "aria-label",
            "Mostrar senha"
        );
    }
});


// =========================================
// VALIDAÇÃO AO SAIR DO CAMPO
// =========================================

emailInput.addEventListener("blur", validarEmail);

senhaInput.addEventListener("blur", validarSenha);


// =========================================
// LIMPAR ERROS AO DIGITAR
// =========================================

emailInput.addEventListener("input", function () {

    limparMensagem();

    if (emailInput.value.trim() !== "") {
        emailError.textContent = "";
        emailInput.classList.remove("input-error");
    }
});


senhaInput.addEventListener("input", function () {

    limparMensagem();

    if (senhaInput.value !== "") {
        senhaError.textContent = "";
        senhaInput.classList.remove("input-error");
    }
});


// =========================================
// SUBMIT DO LOGIN
// =========================================

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    limparMensagem();

    const emailValido = validarEmail();
    const senhaValida = validarSenha();

    if (!emailValido || !senhaValida) {

        mostrarMensagem(
            "Verifique os dados informados.",
            "error"
        );

        return;
    }

    btnEntrar.disabled = true;
    btnEntrar.textContent = "Entrando...";

    try {
        const response = await fetch(`${API_URL}/api/auth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: emailInput.value.trim(),
                senha: senhaInput.value
            })
        });

        if (response.status === 429) {
            mostrarMensagem(
                "Muitas tentativas de login. Tente novamente em 1 minuto.",
                "error"
            );
            return;
        }

        if (!response.ok) {
            mostrarMensagem(
                "E-mail ou senha inválidos.",
                "error"
            );
            return;
        }

        const dados = await response.json();

        if (!dados || !dados.token) {
            mostrarMensagem(
                "Resposta inesperada do servidor. Tente novamente.",
                "error"
            );
            return;
        }

        salvarToken(dados.token);

        mostrarMensagem("Login realizado com sucesso!", "success");

        window.location.href = "dashboard.html";
    } catch (erro) {
        mostrarMensagem(
            "Não foi possível conectar ao servidor. Verifique se a API está no ar.",
            "error"
        );
    } finally {
        btnEntrar.disabled = false;
        btnEntrar.textContent = "Entrar";
    }

});


// =========================================
// ESQUECI MINHA SENHA
// =========================================

esqueciSenha.addEventListener("click", function (event) {

    event.preventDefault();

    alert(
        "A recuperação de senha será implementada posteriormente."
    );

});