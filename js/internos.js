if (!estaAutenticado()) window.location.href = "login.html";
const internosMsg = document.getElementById("internosMsg"), internoForm = document.getElementById("internoForm"), internoEditor = document.getElementById("internoEditor"), internosTabela = document.getElementById("internosTabela");
const safeInterno = v => String(v == null ? "" : v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function avisarInterno(t, erro=false){internosMsg.hidden=!t;internosMsg.textContent=t;internosMsg.className="faq-message"+(erro?" error":"");}
async function carregarInternos(){
    try { const pagina=await apiGetJson("/api/chamados?interno=true&page=0&size=100&sort=dataAbertura,DESC"), lista=pagina.content||[];
        internosTabela.innerHTML=lista.length?lista.map(c=>`<tr><td>#${c.id}</td><td>${safeInterno(c.titulo)}</td><td>${safeInterno(c.categoriaNome||"—")}</td><td>${safeInterno(c.prioridade||"—")}</td><td>${safeInterno(c.status)}</td><td>${c.dataAbertura?new Date(c.dataAbertura).toLocaleDateString("pt-BR"):"—"}</td></tr>`).join(""):'<tr><td colspan="6"><div class="empty-state"><p>Nenhum chamado interno registrado.</p></div></td></tr>';
    } catch(e){avisarInterno(getMensagemErroAmigavel(e.status||0),true);}
}
async function iniciarInternos(){try{
    const me=await apiGetJson("/api/usuarios/me"), perms=me.permissoes||[];
    document.querySelectorAll("[data-admin-only]").forEach(x=>x.hidden=me.perfil!=="ADMIN");document.querySelectorAll("[data-permission]").forEach(x=>x.hidden=!perms.includes(x.dataset.permission));
    document.getElementById("btnLogout").addEventListener("click",logout);
    if(!perms.includes("CHAMADOS_INTERNOS")){document.getElementById("novoInternoBtn").hidden=true;avisarInterno("Seu perfil pode consultar chamados gerais, mas não possui acesso ao módulo interno.",true);}
    const cats=await apiGetJson("/api/categorias");document.getElementById("internoCategoria").innerHTML=(cats||[]).map(c=>`<option value="${c.id}">${safeInterno(c.nome)}</option>`).join("");
    await carregarInternos();
}catch(e){avisarInterno(getMensagemErroAmigavel(e.status||0),true);}}
document.getElementById("novoInternoBtn").addEventListener("click",()=>{internoEditor.hidden=false;document.getElementById("internoTitulo").focus();});document.getElementById("cancelarInterno").addEventListener("click",()=>{internoForm.reset();internoEditor.hidden=true;});
internoForm.addEventListener("submit",async e=>{e.preventDefault();const btn=internoForm.querySelector("button[type=submit]")||internoForm.querySelector("button:not([type])");if(btn)btn.disabled=true;try{const r=await apiRequest("/api/chamados",{method:"POST",body:JSON.stringify({titulo:document.getElementById("internoTitulo").value.trim(),descricao:document.getElementById("internoDescricao").value.trim(),categoriaId:Number(document.getElementById("internoCategoria").value),interno:true})});if(!r.ok)throw{status:r.status};internoForm.reset();internoEditor.hidden=true;avisarInterno("Chamado interno aberto.");await carregarInternos();}catch(err){avisarInterno(getMensagemErroAmigavel(err.status||0),true);}finally{if(btn)btn.disabled=false;}});
iniciarInternos();
