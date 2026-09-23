// =========================================
// CHAMADOS - CONECTA21
// =========================================


// =========================================
// VERIFICAÇÃO DE AUTENTICAÇÃO
// =========================================

if (!estaAutenticado()) {

    window.location.href = "login.html";

}


// =========================================
// ELEMENTOS DO HTML
// =========================================

const btnNovoChamado =
    document.getElementById("btnNovoChamado");

const formNovoChamado =
    document.getElementById("formNovoChamado");

const novoChamadoForm =
    document.getElementById("novoChamadoForm");

const btnCancelarChamado =
    document.getElementById("btnCancelarChamado");

const buscarChamado =
    document.getElementById("buscarChamado");

const filtroStatus =
    document.getElementById("filtroStatus");

const filtroPrioridade =
    document.getElementById("filtroPrioridade");

const chamadosTableBody =
    document.getElementById("chamadosTableBody");

const totalChamados =
    document.getElementById("totalChamados");

const btnLogout =
    document.getElementById("btnLogout");


// =========================================
// CAMPOS DO FORMULÁRIO
// =========================================

const tituloChamado =
    document.getElementById("tituloChamado");

const clienteChamado =
    document.getElementById("clienteChamado");

const prioridadeChamado =
    document.getElementById("prioridadeChamado");

const responsavelChamado =
    document.getElementById("responsavelChamado");

const descricaoChamado =
    document.getElementById("descricaoChamado");


// =========================================
// MENSAGENS DE ERRO
// =========================================

const tituloChamadoError =
    document.getElementById("tituloChamadoError");

const clienteChamadoError =
    document.getElementById("clienteChamadoError");

const prioridadeChamadoError =
    document.getElementById("prioridadeChamadoError");

const responsavelChamadoError =
    document.getElementById("responsavelChamadoError");

const descricaoChamadoError =
    document.getElementById("descricaoChamadoError");


// =========================================
// ELEMENTOS DE IMAGEM - NOVO CHAMADO
// =========================================

const imagensNovoChamado =
    document.getElementById("imagensNovoChamado");

const previewImagensNovoChamado =
    document.getElementById("previewImagensNovoChamado");


// =========================================
// ELEMENTOS DO MODAL
// =========================================

const modalChamado =
    document.getElementById("modalChamado");

const modalWindow =
    modalChamado.querySelector(".modal-window");

const btnFecharModalChamado =
    document.getElementById("btnFecharModalChamado");

const btnFecharModalChamadoFooter =
    document.getElementById("btnFecharModalChamadoFooter");

const btnSalvarAlteracoesChamado =
    document.getElementById("btnSalvarAlteracoesChamado");

const modalChamadoTitulo =
    document.getElementById("modalChamadoTitulo");

const modalChamadoNumero =
    document.getElementById("modalChamadoNumero");

const modalChamadoCliente =
    document.getElementById("modalChamadoCliente");

const modalChamadoPrioridade =
    document.getElementById("modalChamadoPrioridade");

const modalChamadoStatus =
    document.getElementById("modalChamadoStatus");

const novoStatusChamado =
    document.getElementById("novoStatusChamado");

const modalChamadoResponsavel =
    document.getElementById("modalChamadoResponsavel");

const modalChamadoDescricao =
    document.getElementById("modalChamadoDescricao");

const timelineChamado =
    document.getElementById("timelineChamado");


// =========================================
// ELEMENTOS DE INTERAÇÃO
// =========================================

const formNovaInteracao =
    document.getElementById("formNovaInteracao");

const tipoInteracao =
    document.getElementById("tipoInteracao");

const descricaoInteracao =
    document.getElementById("descricaoInteracao");


// =========================================
// ELEMENTOS DE IMAGEM - MODAL
// =========================================

const imagensChamado =
    document.getElementById("imagensChamado");

const previewImagens =
    document.getElementById("previewImagens");


// =========================================
// CONTROLE DO CHAMADO ATUAL
// =========================================

let chamadoAtual = null;


// =========================================
// RASCUNHO DO CHAMADO
// =========================================

let chamadoEdicao = null;


// =========================================
// IMAGENS DO NOVO CHAMADO
// =========================================

let imagensSelecionadasNovoChamado = [];


// =========================================
// URLS TEMPORÁRIAS DAS IMAGENS
// =========================================

let urlsImagensModal = [];

let urlsImagensNovoChamado = [];


// =========================================
// ELEMENTO QUE ABRIU O MODAL
// =========================================

let ultimoElementoFocado = null;


// =========================================
// DADOS TEMPORÁRIOS DOS CHAMADOS
// =========================================

let chamados = [

    {
        numero: "CH-0001",
        titulo: "Computador não liga",
        cliente: "João da Silva",
        prioridade: "alta",
        status: "aberto",
        responsavel: "Carlos Oliveira",
        descricao:
            "O cliente informou que o computador não liga."
    },

    {
        numero: "CH-0002",
        titulo: "Erro ao acessar o sistema",
        cliente: "Maria Souza",
        prioridade: "media",
        status: "andamento",
        responsavel: "Ana Costa",
        descricao:
            "A cliente informou que não consegue acessar o sistema."
    },

    {
        numero: "CH-0003",
        titulo: "Solicitação de instalação de software",
        cliente: "Empresa ABC",
        prioridade: "baixa",
        status: "aguardando",
        responsavel: "Carlos Oliveira",
        descricao:
            "Solicitação para instalação de software em um computador."
    }

];


// =========================================
// TIMELINE TEMPORÁRIA
// =========================================

const interacoesChamados = {

    "CH-0001": [

        {
            autor: "João da Silva",
            tipo: "Chamado aberto",
            data: "17/09/2026 09:15",
            descricao:
                "O cliente informou que o computador não liga."
        },

        {
            autor: "Carlos Oliveira",
            tipo: "Chamado atribuído",
            data: "17/09/2026 09:30",
            descricao:
                "O chamado foi atribuído ao técnico Carlos Oliveira."
        },

        {
            autor: "Carlos Oliveira",
            tipo: "Interação adicionada",
            data: "17/09/2026 10:00",
            descricao:
                "O técnico iniciou a análise do equipamento."
        }

    ]

};


// =========================================
// ESCAPAR HTML
// =========================================
// Evita que textos digitados pelo usuário
// sejam interpretados como HTML.

function escaparHtml(valor) {

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =========================================
// FUNÇÕES DE VALIDAÇÃO
// =========================================

function limparErros() {

    tituloChamadoError.textContent = "";
    clienteChamadoError.textContent = "";
    prioridadeChamadoError.textContent = "";
    responsavelChamadoError.textContent = "";
    descricaoChamadoError.textContent = "";

}


function validarNovoChamado() {

    let valido = true;

    limparErros();


    if (tituloChamado.value.trim() === "") {

        tituloChamadoError.textContent =
            "Informe o título do chamado.";

        valido = false;

    }


    if (clienteChamado.value.trim() === "") {

        clienteChamadoError.textContent =
            "Informe o cliente.";

        valido = false;

    }


    if (prioridadeChamado.value === "") {

        prioridadeChamadoError.textContent =
            "Selecione a prioridade.";

        valido = false;

    }


    if (responsavelChamado.value.trim() === "") {

        responsavelChamadoError.textContent =
            "Informe o responsável.";

        valido = false;

    }


    if (descricaoChamado.value.trim() === "") {

        descricaoChamadoError.textContent =
            "Informe a descrição do chamado.";

        valido = false;

    }


    return valido;

}


// =========================================
// ABRIR FORMULÁRIO
// =========================================

btnNovoChamado.addEventListener("click", () => {

    formNovoChamado.hidden = false;

    tituloChamado.focus();

});


// =========================================
// CANCELAR NOVO CHAMADO
// =========================================

btnCancelarChamado.addEventListener("click", () => {

    novoChamadoForm.reset();

    limparErros();

    limparImagensNovoChamado();

    formNovoChamado.hidden = true;

});


// =========================================
// CADASTRAR NOVO CHAMADO
// =========================================

novoChamadoForm.addEventListener("submit", (event) => {

    event.preventDefault();


    if (!validarNovoChamado()) {

        return;

    }


    const proximoNumero =
        chamados.length + 1;


    const novoChamado = {

        numero:
            `CH-${String(proximoNumero).padStart(4, "0")}`,

        titulo:
            tituloChamado.value.trim(),

        cliente:
            clienteChamado.value.trim(),

        prioridade:
            prioridadeChamado.value,

        status:
            "aberto",

        responsavel:
            responsavelChamado.value.trim(),

        descricao:
            descricaoChamado.value.trim(),

        imagens:
            [...imagensSelecionadasNovoChamado]

    };


    chamados.push(novoChamado);


    renderizarChamados();


    novoChamadoForm.reset();

    limparErros();

    limparImagensNovoChamado();

    formNovoChamado.hidden = true;

});


// =========================================
// LOGOUT
// =========================================

btnLogout.addEventListener("click", () => {

    logout();

});


// =========================================
// RENDERIZAR CHAMADOS
// =========================================

function renderizarChamados() {

    chamadosTableBody.innerHTML = "";


    const termo =
        buscarChamado.value.trim().toLowerCase();

    const statusSelecionado =
        filtroStatus.value;

    const prioridadeSelecionada =
        filtroPrioridade.value;


    const chamadosFiltrados =
        chamados.filter((chamado) => {

            const correspondeBusca =

                chamado.numero
                    .toLowerCase()
                    .includes(termo)

                ||

                chamado.titulo
                    .toLowerCase()
                    .includes(termo)

                ||

                chamado.cliente
                    .toLowerCase()
                    .includes(termo);


            const correspondeStatus =

                statusSelecionado === "todos"

                ||

                chamado.status === statusSelecionado;


            const correspondePrioridade =

                prioridadeSelecionada === "todas"

                ||

                chamado.prioridade === prioridadeSelecionada;


            return (
                correspondeBusca
                &&
                correspondeStatus
                &&
                correspondePrioridade
            );

        });


    if (chamadosFiltrados.length === 0) {

        chamadosTableBody.innerHTML = `

            <tr>

                <td colspan="7">

                    <div class="empty-state">

                        <h3>
                            Nenhum chamado encontrado
                        </h3>

                        <p>
                            Não existem chamados que correspondam aos filtros selecionados.
                        </p>

                    </div>

                </td>

            </tr>

        `;

    }


    chamadosFiltrados.forEach((chamado) => {

        const tr =
            document.createElement("tr");


        tr.innerHTML = `

            <td>
                <strong class="ticket-number">
                    ${escaparHtml(chamado.numero)}
                </strong>
            </td>

            <td>
                ${escaparHtml(chamado.titulo)}
            </td>

            <td>
                ${escaparHtml(chamado.cliente)}
            </td>

            <td>

                <span class="ticket-priority ${escaparHtml(chamado.prioridade)}">
                    ${escaparHtml(formatarPrioridade(chamado.prioridade))}
                </span>

            </td>

            <td>

                <span class="ticket-status ${escaparHtml(chamado.status)}">
                    ${escaparHtml(formatarStatus(chamado.status))}
                </span>

            </td>

            <td>
                ${escaparHtml(chamado.responsavel)}
            </td>

            <td>

                <button
                    type="button"
                    class="btn btn-secondary btn-visualizar-chamado"
                    data-numero="${escaparHtml(chamado.numero)}"
                    aria-label="Visualizar ${escaparHtml(chamado.numero)}"
                >
                    Visualizar
                </button>

            </td>

        `;


        chamadosTableBody.appendChild(tr);

    });


    totalChamados.textContent =

        chamadosFiltrados.length === 1

            ? "1 chamado"

            : `${chamadosFiltrados.length} chamados`;

}


// =========================================
// FORMATAR PRIORIDADE
// =========================================

function formatarPrioridade(prioridade) {

    const prioridades = {

        baixa: "Baixa",
        media: "Média",
        alta: "Alta",
        critica: "Crítica"

    };


    return prioridades[prioridade] || prioridade;

}


// =========================================
// FORMATAR STATUS
// =========================================

function formatarStatus(status) {

    const statusMap = {

        aberto: "Aberto",
        andamento: "Em andamento",
        aguardando: "Aguardando",
        resolvido: "Resolvido",
        fechado: "Fechado"

    };


    return statusMap[status] || status;

}


// =========================================
// FILTROS
// =========================================

buscarChamado.addEventListener(
    "input",
    renderizarChamados
);


filtroStatus.addEventListener(
    "change",
    renderizarChamados
);


filtroPrioridade.addEventListener(
    "change",
    renderizarChamados
);


// =========================================
// VISUALIZAR CHAMADO
// =========================================

chamadosTableBody.addEventListener(
    "click",
    (event) => {

        const botao =
            event.target.closest(
                ".btn-visualizar-chamado"
            );


        if (!botao) {

            return;

        }


        const numero =
            botao.dataset.numero;


        const chamado =
            chamados.find(
                (item) => item.numero === numero
            );


        if (!chamado) {

            return;

        }


        abrirModalChamado(chamado);

    }
);


// =========================================
// CRIAR RASCUNHO
// =========================================

function criarRascunhoChamado(chamado) {

    const interacoes =
        interacoesChamados[chamado.numero] || [];


    return {

        ...chamado,

        imagens:
            [...(chamado.imagens || [])],

        interacoes:
            interacoes.map((interacao) => ({
                ...interacao
            }))

    };

}


// =========================================
// ABRIR MODAL
// =========================================

function abrirModalChamado(chamado) {

    ultimoElementoFocado =
        document.activeElement;


    chamadoAtual = chamado;


    chamadoEdicao =
        criarRascunhoChamado(chamado);


    modalChamadoTitulo.textContent =
        chamadoEdicao.titulo;


    modalChamadoNumero.textContent =
        chamadoEdicao.numero;


    modalChamadoCliente.textContent =
        chamadoEdicao.cliente;


    modalChamadoPrioridade.textContent =
        formatarPrioridade(
            chamadoEdicao.prioridade
        );


    modalChamadoPrioridade.className =
        `ticket-priority ${chamadoEdicao.prioridade}`;


    modalChamadoStatus.textContent =
        formatarStatus(
            chamadoEdicao.status
        );


    modalChamadoStatus.className =
        `ticket-status ${chamadoEdicao.status}`;


    novoStatusChamado.value =
        chamadoEdicao.status;


    modalChamadoResponsavel.textContent =
        chamadoEdicao.responsavel;


    modalChamadoDescricao.textContent =
        chamadoEdicao.descricao ||
        "Descrição não informada";


    renderizarTimeline();

    renderizarImagensDoChamado();


    imagensChamado.value = "";


    modalChamado.hidden = false;

    document.body.classList.add("modal-aberto");


    requestAnimationFrame(() => {

        btnFecharModalChamado.focus();

    });

}


// =========================================
// LIBERAR URLS DAS IMAGENS DO MODAL
// =========================================

function liberarUrlsImagensModal() {

    urlsImagensModal.forEach((url) => {

        URL.revokeObjectURL(url);

    });


    urlsImagensModal = [];

}


// =========================================
// RENDERIZAR IMAGENS DO CHAMADO
// =========================================

function renderizarImagensDoChamado() {

    liberarUrlsImagensModal();

    previewImagens.innerHTML = "";


    if (!chamadoEdicao) {

        return;

    }


    const imagens =
        chamadoEdicao.imagens || [];


    if (imagens.length === 0) {

        return;

    }


    imagens.forEach((arquivo, index) => {

        const container =
            document.createElement("div");


        container.className =
            "preview-imagem-item";


        const imagem =
            document.createElement("img");


        const url =
            URL.createObjectURL(arquivo);


        urlsImagensModal.push(url);


        imagem.src = url;

        imagem.alt =
            `Imagem anexada ${index + 1}`;


        const botao =
            document.createElement("button");


        botao.type = "button";

        botao.className =
            "btn-remover-imagem";

        botao.textContent =
            "Remover";


        botao.setAttribute(
            "aria-label",
            `Remover imagem ${index + 1}`
        );


        botao.addEventListener(
            "click",
            () => {

                if (!chamadoEdicao) {

                    return;

                }


                chamadoEdicao.imagens.splice(
                    index,
                    1
                );


                renderizarImagensDoChamado();

            }
        );


        container.appendChild(imagem);

        container.appendChild(botao);

        previewImagens.appendChild(container);

    });

}


// =========================================
// SALVAR ALTERAÇÕES
// =========================================

function salvarAlteracoesChamado() {

    if (
        !chamadoAtual
        ||
        !chamadoEdicao
    ) {

        return;

    }


    chamadoAtual.status =
        chamadoEdicao.status;


    chamadoAtual.imagens =
        [...(chamadoEdicao.imagens || [])];


    interacoesChamados[
        chamadoAtual.numero
    ] =
        [...(chamadoEdicao.interacoes || [])];


    renderizarChamados();


    fecharModalChamado();

}


// =========================================
// FECHAR MODAL
// =========================================

function fecharModalChamado() {

    modalChamado.hidden = true;


    liberarUrlsImagensModal();


    chamadoAtual = null;

    chamadoEdicao = null;


    imagensChamado.value = "";

    previewImagens.innerHTML = "";

    formNovaInteracao.reset();


    document.body.classList.remove("modal-aberto");


    if (
        ultimoElementoFocado
        &&
        typeof ultimoElementoFocado.focus === "function"
    ) {

        ultimoElementoFocado.focus();

    }


    ultimoElementoFocado = null;

}


// =========================================
// BOTÃO SALVAR
// =========================================

btnSalvarAlteracoesChamado.addEventListener(
    "click",
    salvarAlteracoesChamado
);


// =========================================
// BOTÕES DE FECHAR
// =========================================

btnFecharModalChamado.addEventListener(
    "click",
    fecharModalChamado
);


btnFecharModalChamadoFooter.addEventListener(
    "click",
    fecharModalChamado
);


// =========================================
// FECHAR CLICANDO FORA
// =========================================

modalChamado.addEventListener(
    "click",
    (event) => {

        if (
            event.target === modalChamado
        ) {

            fecharModalChamado();

        }

    }
);


// =========================================
// FECHAR COM ESC
// =========================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape"
            &&
            !modalChamado.hidden
        ) {

            fecharModalChamado();

        }

    }
);


// =========================================
// RENDERIZAR TIMELINE
// =========================================

function renderizarTimeline() {

    timelineChamado.innerHTML = "";


    if (!chamadoEdicao) {

        return;

    }


    const interacoes =
        chamadoEdicao.interacoes || [];


    if (interacoes.length === 0) {

        timelineChamado.innerHTML = `

            <div class="timeline-empty">

                <p>
                    Nenhuma interação registrada para este chamado.
                </p>

            </div>

        `;

        return;

    }


    interacoes.forEach((interacao) => {

        const item =
            document.createElement("div");


        item.className =
            "timeline-item";


        item.innerHTML = `

            <div class="timeline-marker"></div>

            <div class="timeline-content">

                <div class="timeline-item-header">

                    <strong class="timeline-author">
                        ${escaparHtml(interacao.autor)}
                    </strong>

                    <span>
                        ${escaparHtml(interacao.data)}
                    </span>

                </div>

                <strong class="timeline-type">
                    ${escaparHtml(interacao.tipo)}
                </strong>

                <p class="timeline-description">
                    ${escaparHtml(interacao.descricao)}
                </p>

            </div>

        `;


        timelineChamado.appendChild(item);

    });

}


// =========================================
// ADICIONAR NOVA INTERAÇÃO
// =========================================

formNovaInteracao.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        if (!chamadoEdicao) {

            return;

        }


        const tipo =
            tipoInteracao.value;


        const descricao =
            descricaoInteracao.value.trim();


        if (
            tipo === ""
            ||
            descricao === ""
        ) {

            return;

        }


        chamadoEdicao.interacoes.push({

            autor:
                chamadoEdicao.responsavel,

            tipo:
                tipo,

            data:
                new Date().toLocaleString(
                    "pt-BR"
                ),

            descricao:
                descricao

        });


        renderizarTimeline();


        formNovaInteracao.reset();

    }
);


// =========================================
// ALTERAÇÃO DE STATUS
// =========================================

novoStatusChamado.addEventListener(
    "change",
    () => {

        if (!chamadoEdicao) {

            return;

        }


        chamadoEdicao.status =
            novoStatusChamado.value;


        modalChamadoStatus.textContent =
            formatarStatus(
                chamadoEdicao.status
            );


        modalChamadoStatus.className =
            `ticket-status ${chamadoEdicao.status}`;

    }
);


// =========================================
// ADICIONAR IMAGENS AO CHAMADO
// =========================================

imagensChamado.addEventListener(
    "change",
    () => {

        if (!chamadoEdicao) {

            return;

        }


        const novasImagens =
            Array.from(imagensChamado.files);


        if (!chamadoEdicao.imagens) {

            chamadoEdicao.imagens = [];

        }


        novasImagens.forEach((arquivo) => {

            if (
                arquivo.type.startsWith("image/")
            ) {

                chamadoEdicao.imagens.push(
                    arquivo
                );

            }

        });


        renderizarImagensDoChamado();


        imagensChamado.value = "";

    }
);


// =========================================
// URLS DAS IMAGENS DO NOVO CHAMADO
// =========================================

function liberarUrlsImagensNovoChamado() {

    urlsImagensNovoChamado.forEach((url) => {

        URL.revokeObjectURL(url);

    });


    urlsImagensNovoChamado = [];

}


// =========================================
// PRÉ-VISUALIZAÇÃO - NOVO CHAMADO
// =========================================

imagensNovoChamado.addEventListener(
    "change",
    () => {

        const novosArquivos =
            Array.from(imagensNovoChamado.files);


        novosArquivos.forEach((arquivo) => {

            if (
                arquivo.type.startsWith("image/")
            ) {

                imagensSelecionadasNovoChamado.push(
                    arquivo
                );

            }

        });


        atualizarPreviewImagensNovoChamado();

        atualizarInputImagensNovoChamado();

    }
);


// =========================================
// ATUALIZAR PREVIEW - NOVO CHAMADO
// =========================================

function atualizarPreviewImagensNovoChamado() {

    liberarUrlsImagensNovoChamado();

    previewImagensNovoChamado.innerHTML = "";


    imagensSelecionadasNovoChamado.forEach(
        (arquivo, index) => {

            const container =
                document.createElement("div");


            container.className =
                "preview-imagem-item";


            const imagem =
                document.createElement("img");


            const url =
                URL.createObjectURL(arquivo);


            urlsImagensNovoChamado.push(url);


            imagem.src = url;


            imagem.alt =
                `Imagem anexada ${index + 1}`;


            const botao =
                document.createElement("button");


            botao.type =
                "button";


            botao.className =
                "btn-remover-imagem";


            botao.textContent =
                "Remover";


            botao.setAttribute(
                "aria-label",
                `Remover imagem ${index + 1}`
            );


            botao.addEventListener(
                "click",
                () => {

                    imagensSelecionadasNovoChamado.splice(
                        index,
                        1
                    );


                    atualizarPreviewImagensNovoChamado();

                    atualizarInputImagensNovoChamado();

                }
            );


            container.appendChild(imagem);

            container.appendChild(botao);

            previewImagensNovoChamado.appendChild(
                container
            );

        }
    );

}


// =========================================
// ATUALIZAR INPUT DE IMAGENS
// =========================================

function atualizarInputImagensNovoChamado() {

    const dataTransfer =
        new DataTransfer();


    imagensSelecionadasNovoChamado.forEach(
        (arquivo) => {

            dataTransfer.items.add(arquivo);

        }
    );


    imagensNovoChamado.files =
        dataTransfer.files;

}


// =========================================
// LIMPAR IMAGENS DO NOVO CHAMADO
// =========================================

function limparImagensNovoChamado() {

    liberarUrlsImagensNovoChamado();


    imagensSelecionadasNovoChamado = [];


    previewImagensNovoChamado.innerHTML = "";


    imagensNovoChamado.value = "";

}


// =========================================
// INICIALIZAÇÃO
// =========================================

renderizarChamados();