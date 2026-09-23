// =========================================
// DASHBOARD - CONECTA21
// =========================================


// =========================================
// VERIFICAÇÃO DE AUTENTICAÇÃO
// =========================================

if (!estaAutenticado()) {

    window.location.href = "login.html";

}


// =========================================
// BOTÃO SAIR
// =========================================

const btnLogout =
    document.getElementById("btnLogout");


btnLogout.addEventListener("click", function () {

    logout();

});


// =========================================
// INDICADORES DO DASHBOARD
// =========================================

// Dados temporários para demonstração

const metricas = {

    chamadosAbertos: 12,

    chamadosAndamento: 8,

    chamadosResolvidos: 25,

    totalChamados: 45

};


// =========================================
// ATUALIZAR INDICADORES
// =========================================

document.getElementById("chamadosAbertos").textContent =
    metricas.chamadosAbertos;


document.getElementById("chamadosAndamento").textContent =
    metricas.chamadosAndamento;


document.getElementById("chamadosResolvidos").textContent =
    metricas.chamadosResolvidos;


document.getElementById("totalChamados").textContent =
    metricas.totalChamados;


// =========================================
// CHAMADOS RECENTES
// =========================================

// Dados temporários para demonstração

const chamadosRecentes = [

    {
        numero: "CH-0003",
        titulo: "Erro no sistema",
        prioridade: "Alta",
        status: "Em andamento"
    },

    {
        numero: "CH-0002",
        titulo: "Problema de acesso",
        prioridade: "Média",
        status: "Aberto"
    },

    {
        numero: "CH-0001",
        titulo: "Configuração do computador",
        prioridade: "Baixa",
        status: "Resolvido"
    }

];


// =========================================
// RENDERIZAR CHAMADOS RECENTES
// =========================================

const listaChamadosRecentes =
    document.getElementById("listaChamadosRecentes");


chamadosRecentes.forEach(function (chamado) {

    const chamadoItem =
        document.createElement("div");

    chamadoItem.classList.add("recent-ticket");


    chamadoItem.innerHTML = `

        <div class="recent-ticket-info">

            <span class="recent-ticket-number">
                ${chamado.numero}
            </span>

            <strong>
                ${chamado.titulo}
            </strong>

        </div>


        <div class="recent-ticket-details">

            <span class="ticket-priority priority-${chamado.prioridade.toLowerCase()}">
                ${chamado.prioridade}
            </span>

            <span class="ticket-status status-${chamado.status.toLowerCase().replace(" ", "-")}">
                ${chamado.status}
            </span>

        </div>

    `;


    listaChamadosRecentes.appendChild(chamadoItem);

});


// =========================================
// STATUS DOS CHAMADOS
// =========================================

const statusChamados = [

    {
        nome: "Abertos",
        quantidade: metricas.chamadosAbertos
    },

    {
        nome: "Em atendimento",
        quantidade: metricas.chamadosAndamento
    },

    {
        nome: "Resolvidos",
        quantidade: metricas.chamadosResolvidos
    }

];


// =========================================
// RENDERIZAR STATUS
// =========================================

const listaStatus =
    document.getElementById("statusChamados");


statusChamados.forEach(function (status) {

    const statusItem =
        document.createElement("div");

    statusItem.classList.add("status-item");


    statusItem.innerHTML = `

        <div class="status-info">

            <span>
                ${status.nome}
            </span>

            <strong>
                ${status.quantidade}
            </strong>

        </div>


        <div class="status-bar">

            <div
                class="status-bar-fill"
                style="width: ${(status.quantidade / metricas.totalChamados) * 100}%"
            >
            </div>

        </div>

    `;


    listaStatus.appendChild(statusItem);

});


// =========================================
// LOG
// =========================================

console.log("Métricas:", metricas);

console.log("Chamados recentes:", chamadosRecentes);

console.log("Status dos chamados:", statusChamados);