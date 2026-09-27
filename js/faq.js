if (!estaAutenticado()) window.location.href = "login.html";
const faqLista = document.getElementById("faqLista"), faqMsg = document.getElementById("faqMensagem"), faqEditor = document.getElementById("faqEditor"), faqForm = document.getElementById("faqForm");
let artigosFaq = [], podeGerenciarFaq = false;
const safeFaq = value => String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function mensagemFaq(texto, erro = false) { faqMsg.hidden = !texto; faqMsg.textContent = texto; faqMsg.style.color = erro ? "#1e3a8a" : "#1e3a8a"; }
async function carregarFaq(termo = "") {
    try {
        const url = termo.trim() ? "/api/artigos?termo=" + encodeURIComponent(termo.trim()) : "/api/artigos";
        artigosFaq = await apiGetJson(url);
        desenharFaq();
    } catch (e) { mensagemFaq(getMensagemErroAmigavel(e.status || 0), true); }
}
function desenharFaq() {
    document.getElementById("faqContagem").textContent = artigosFaq.length === 1 ? "1 artigo disponível" : artigosFaq.length + " artigos disponíveis";
    faqLista.innerHTML = artigosFaq.length ? artigosFaq.map(a => `<details class="faq-item"><summary>${safeFaq(a.titulo)}</summary><span class="faq-category">${safeFaq(a.nomeCategoria || "Geral")}</span><div class="faq-answer">${safeFaq(a.conteudo)}</div>${podeGerenciarFaq ? `<div class="faq-actions"><button class="btn btn-secondary faq-edit" data-id="${a.id}">Editar</button><button class="btn btn-secondary faq-delete" data-id="${a.id}">Excluir</button></div>` : ""}</details>`).join("") : '<div class="empty-state"><h3>Nenhum artigo encontrado</h3><p>Tente outra busca ou consulte a equipe de atendimento.</p></div>';
}
async function iniciarFaq() {
    try {
        const me = await apiGetJson("/api/usuarios/me");
        podeGerenciarFaq = (me.permissoes || []).includes("GERENCIAR_FAQ");
        if (podeGerenciarFaq) {
            faqEditor.hidden = false;
            const cats = await apiGetJson("/api/categorias");
            document.getElementById("faqCategoria").innerHTML = (cats || []).map(c => `<option value="${c.id}">${safeFaq(c.nome)}</option>`).join("");
            if (!cats.length) mensagemFaq("Cadastre uma categoria antes de criar artigos da FAQ.", true);
        }
        document.querySelectorAll("[data-admin-only]").forEach(x => x.hidden = me.perfil !== "ADMIN");
        document.querySelectorAll("[data-permission]").forEach(x => x.hidden = !(me.permissoes || []).includes(x.dataset.permission));
        document.getElementById("btnLogout").addEventListener("click", logout);
        await carregarFaq();
    } catch (e) { mensagemFaq(getMensagemErroAmigavel(e.status || 0), true); }
}
document.getElementById("faqBusca").addEventListener("input", e => carregarFaq(e.target.value));
document.getElementById("faqCancelar").addEventListener("click", () => { faqForm.reset(); document.getElementById("faqId").value = ""; document.getElementById("faqEditorTitulo").textContent = "Novo artigo"; document.getElementById("faqCancelar").hidden = true; });
faqForm.addEventListener("submit", async e => {
    e.preventDefault(); const id = document.getElementById("faqId").value;
    const payload = { titulo: document.getElementById("faqTitulo").value.trim(), conteudo: document.getElementById("faqConteudo").value.trim(), categoriaId: Number(document.getElementById("faqCategoria").value) };
    try {
        const res = await apiRequest(id ? `/api/artigos/${id}` : "/api/artigos", { method: id ? "PUT" : "POST", body: JSON.stringify(payload) });
        if (!res.ok) throw { status: res.status };
        faqForm.reset(); document.getElementById("faqId").value = ""; document.getElementById("faqCancelar").hidden = true; document.getElementById("faqEditorTitulo").textContent = "Novo artigo";
        mensagemFaq(id ? "Artigo atualizado." : "Artigo publicado."); await carregarFaq(document.getElementById("faqBusca").value);
    } catch (err) { mensagemFaq(getMensagemErroAmigavel(err.status || 0), true); }
});
faqLista.addEventListener("click", async e => {
    const edit = e.target.closest(".faq-edit"), del = e.target.closest(".faq-delete");
    if (edit) { const a = artigosFaq.find(x => x.id === Number(edit.dataset.id)); if (!a) return; document.getElementById("faqId").value = a.id; document.getElementById("faqTitulo").value = a.titulo; document.getElementById("faqConteudo").value = a.conteudo; document.getElementById("faqCategoria").value = a.categoriaId; document.getElementById("faqEditorTitulo").textContent = "Editar artigo"; document.getElementById("faqCancelar").hidden = false; faqEditor.scrollIntoView({behavior:"smooth"}); }
    if (del && confirm("Excluir este artigo da base de conhecimento?")) { const r = await apiRequest(`/api/artigos/${del.dataset.id}`, {method:"DELETE"}); if (!r.ok) mensagemFaq(getMensagemErroAmigavel(r.status), true); else { mensagemFaq("Artigo excluído."); await carregarFaq(document.getElementById("faqBusca").value); } }
});
iniciarFaq();
