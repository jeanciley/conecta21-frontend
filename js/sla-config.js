// =========================================
// SLA CONFIG - CONECTA21 (Sprint 3)
// Somente visualização: backend não possui
// endpoint de leitura/edição de SLA.
// Valores fixos: ALTA 4h, MEDIA 24h, BAIXA 48h.
// =========================================

if (!estaAutenticado()) {
    window.location.href = "login.html";
}

const btnLogoutSla = document.getElementById("btnLogout");

if (btnLogoutSla) {
    btnLogoutSla.addEventListener("click", function () {
        logout();
    });
}

const painelSla = document.querySelector(".sla-main .dashboard-panel");
const mensagemSla = document.getElementById("slaMsg");
const escapeSla = valor => String(valor == null ? "" : valor).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));

painelSla.innerHTML = `<div class="sla-admin-grid">
    <section class="sla-admin-card"><div class="panel-header"><div><h2>Prioridades e SLAs</h2><p>Configure prazos de primeira resposta e resolução.</p></div></div>
    <form id="prioridadeForm" class="sla-editor-form"><input id="prioridadeId" type="hidden"><label>Nome<input id="prioridadeNome" maxlength="50" required></label><label>SLA de resposta (horas)<input id="slaResposta" type="number" min="0.25" step="0.25" required></label><label>SLA de resolução (horas)<input id="slaResolucao" type="number" min="0.25" step="0.25" required></label><label class="sla-check"><input id="prioridadeAtiva" type="checkbox" checked> Ativa</label><button class="btn btn-primary" type="submit">Salvar prioridade</button></form>
    <div class="table-container"><table class="sla-table"><thead><tr><th>Prioridade</th><th>Resposta</th><th>Resolução</th><th>Status</th><th></th></tr></thead><tbody id="prioridadesLista"></tbody></table></div></section>
    <section class="sla-admin-card"><div class="panel-header"><div><h2>Categorias de chamado</h2><p>Cada categoria aplica sua prioridade automaticamente.</p></div></div>
    <form id="categoriaForm" class="sla-editor-form"><input id="categoriaId" type="hidden"><label>Nome da categoria<input id="categoriaNome" maxlength="50" required></label><label>Prioridade aplicada<select id="categoriaPrioridade" required></select></label><div class="button-group"><button id="salvarCategoria" class="btn btn-primary" type="submit">Adicionar categoria</button><button id="cancelarEdicaoCategoria" class="btn btn-secondary" type="button" hidden>Cancelar edição</button></div></form><div id="categoriasLista" class="category-grid" role="list"></div></section>
    </div>`;

let prioridadesSla = [];
function avisoSla(texto, tipo = "error") { mensagemSla.hidden = !texto; mensagemSla.textContent = texto; mensagemSla.className = "sla-msg " + tipo; }
function renderPrioridades() {
    const corpo = document.getElementById("prioridadesLista");
    corpo.innerHTML = prioridadesSla.map(p => `<tr><td><strong>${escapeSla(p.nome)}</strong></td><td>${(p.slaRespostaMinutos / 60)} h</td><td>${(p.slaResolucaoMinutos / 60)} h</td><td>${p.ativa ? "Ativa" : "Inativa"}</td><td><button class="btn btn-secondary sla-edit" data-id="${p.id}" type="button">Editar</button></td></tr>`).join("") || '<tr><td colspan="5">Nenhuma prioridade cadastrada.</td></tr>';
    const seletor = document.getElementById("categoriaPrioridade");
    seletor.innerHTML = prioridadesSla.filter(p => p.ativa).map(p => `<option value="${p.id}">${escapeSla(p.nome)}</option>`).join("");
}
async function carregarConfiguracaoSla() {
    try {
        const perfil = await apiGetJson("/api/usuarios/me");
        const permissoes = perfil.permissoes || [];
        if (perfil.perfil !== "ADMIN" && !(permissoes.includes("GERENCIAR_PRIORIDADES") && permissoes.includes("GERENCIAR_CATEGORIAS"))) {
            painelSla.innerHTML = '<div class="empty-state"><h3>Área administrativa</h3><p>Somente administradores podem configurar prioridades, SLAs e categorias.</p></div>';
            return;
        }
        const [prioridades, categorias] = await Promise.all([apiGetJson("/api/prioridades"), apiGetJson("/api/categorias")]);
        prioridadesSla = prioridades || [];
        renderPrioridades();
        document.getElementById("categoriasLista").innerHTML = (categorias || []).map(c => `<article class="category-card" role="listitem"><div><h3>${escapeSla(c.nome)}</h3><span class="priority-badge">${escapeSla(c.prioridadeNome || "Prioridade pendente")}</span></div><button type="button" class="btn btn-secondary category-edit" data-id="${c.id}" data-prioridade="${c.prioridadeId || ""}" data-nome="${escapeSla(c.nome)}">Editar prioridade</button></article>`).join("") || '<div class="empty-state"><p>Nenhuma categoria cadastrada.</p></div>';
    } catch (error) { avisoSla(getMensagemErroAmigavel(error.status || 0)); }
}
painelSla.addEventListener("click", function(event) {
    const botao = event.target.closest(".sla-edit"); if (!botao) return;
    const prioridade = prioridadesSla.find(p => p.id === Number(botao.dataset.id)); if (!prioridade) return;
    document.getElementById("prioridadeId").value = prioridade.id;
    document.getElementById("prioridadeNome").value = prioridade.nome;
    document.getElementById("slaResposta").value = prioridade.slaRespostaMinutos / 60;
    document.getElementById("slaResolucao").value = prioridade.slaResolucaoMinutos / 60;
    document.getElementById("prioridadeAtiva").checked = prioridade.ativa;
    document.getElementById("prioridadeNome").focus();
});
painelSla.addEventListener("click", function(event) {
    const botao = event.target.closest(".category-edit"); if (!botao) return;
    document.getElementById("categoriaId").value = botao.dataset.id;
    document.getElementById("categoriaNome").value = botao.dataset.nome;
    document.getElementById("categoriaPrioridade").value = botao.dataset.prioridade;
    document.getElementById("salvarCategoria").textContent = "Salvar alterações";
    document.getElementById("cancelarEdicaoCategoria").hidden = false;
    document.getElementById("categoriaNome").focus();
});
document.getElementById("cancelarEdicaoCategoria").addEventListener("click", function() {
    document.getElementById("categoriaForm").reset(); document.getElementById("categoriaId").value = "";
    document.getElementById("salvarCategoria").textContent = "Adicionar categoria"; this.hidden = true;
});
painelSla.addEventListener("submit", async function(event) {
    event.preventDefault();
    if (event.target.id === "prioridadeForm") {
        const id = document.getElementById("prioridadeId").value;
        const payload = { id: id ? Number(id) : null, nome: document.getElementById("prioridadeNome").value.trim(), slaRespostaMinutos: Math.round(Number(document.getElementById("slaResposta").value) * 60), slaResolucaoMinutos: Math.round(Number(document.getElementById("slaResolucao").value) * 60), ativa: document.getElementById("prioridadeAtiva").checked };
        const response = await apiRequest(id ? `/api/prioridades/${id}` : "/api/prioridades", { method: id ? "PUT" : "POST", body: JSON.stringify(payload) });
        if (!response.ok) { avisoSla("Não foi possível salvar a prioridade. Confira os valores e suas permissões."); return; }
        document.getElementById("prioridadeForm").reset(); document.getElementById("prioridadeId").value = ""; document.getElementById("prioridadeAtiva").checked = true;
        avisoSla("Prioridade salva.", "success"); await carregarConfiguracaoSla();
    }
    if (event.target.id === "categoriaForm") {
        const id = document.getElementById("categoriaId").value;
        const response = await apiRequest(id ? `/api/categorias/${id}` : "/api/categorias", { method: id ? "PUT" : "POST", body: JSON.stringify({ nome: document.getElementById("categoriaNome").value.trim(), prioridadeId: Number(document.getElementById("categoriaPrioridade").value) }) });
        if (!response.ok) { avisoSla("Não foi possível cadastrar a categoria. Confira se há uma prioridade ativa."); return; }
        event.target.reset(); document.getElementById("categoriaId").value = ""; document.getElementById("salvarCategoria").textContent = "Adicionar categoria"; document.getElementById("cancelarEdicaoCategoria").hidden = true;
        avisoSla(id ? "Categoria atualizada." : "Categoria cadastrada.", "success"); await carregarConfiguracaoSla();
    }
});

carregarConfiguracaoSla();
