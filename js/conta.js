const contaForm = document.getElementById("accountForm");
const senhaConta = document.getElementById("senha");
const confirmacaoConta = document.getElementById("confirmacao");
const mensagemConta = document.getElementById("message");
const tokenConta = new URLSearchParams(window.location.search).get("token");
const ativacaoConta = window.location.pathname.endsWith("ativar-conta.html");

contaForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    mensagemConta.textContent = "";
    if (!tokenConta) { mensagemConta.textContent = "O link está incompleto. Solicite um novo e-mail."; mensagemConta.className = "login-message error"; return; }
    if (!/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$/.test(senhaConta.value)) {
        mensagemConta.textContent = "Use ao menos 8 caracteres, com maiúscula, minúscula, número e caractere especial.";
        mensagemConta.className = "login-message error"; return;
    }
    if (senhaConta.value !== confirmacaoConta.value) { mensagemConta.textContent = "As senhas não coincidem."; mensagemConta.className = "login-message error"; return; }
    const botao = contaForm.querySelector("button"); botao.disabled = true;
    try {
        const caminho = ativacaoConta ? "/api/auth/ativacao" : "/api/auth/redefinir-senha";
        const response = await apiRequest(caminho, { method: "POST", skipAuthRedirect: true, body: JSON.stringify({ token: tokenConta, senha: senhaConta.value }) });
        if (!response.ok) throw new Error(response.status === 400 ? "O link expirou ou já foi utilizado. Solicite outro." : "Não foi possível atualizar a senha.");
        mensagemConta.textContent = ativacaoConta ? "Conta ativada. Você já pode entrar." : "Senha atualizada. Você já pode entrar.";
        mensagemConta.className = "login-message success";
        botao.hidden = true;
        const login = document.createElement("a"); login.href = "login.html"; login.textContent = "Ir para o login"; login.className = "btn btn-primary auth-submit"; contaForm.appendChild(login);
    } catch (error) { mensagemConta.textContent = error.message; mensagemConta.className = "login-message error"; }
    finally { botao.disabled = false; }
});
