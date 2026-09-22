import { carregarKanban } from './services/chamadoService.js';
import { estaAutenticado, logout } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Proteção de Rota
    if (!estaAutenticado()) {
        window.location.href = 'login.html';
        return;
    }

    // Configuração do botão de sair lateral
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', logout);
    }

    try {
        // 2. Busca todos os chamados da API
        const dados = await carregarKanban();

        // 3. Calcula e preenche as métricas
        const qtdAbertos = dados.abertos ? dados.abertos.length : 0;
        const qtdAndamento = (dados.emAndamento ? dados.emAndamento.length : 0) + (dados.emAtraso ? dados.emAtraso.length : 0);
        const qtdResolvidos = dados.resolvidos ? dados.resolvidos.length : 0;
        const total = qtdAbertos + qtdAndamento + qtdResolvidos;

        document.getElementById('metric-abertos').textContent = qtdAbertos;
        document.getElementById('metric-andamento').textContent = qtdAndamento;
        document.getElementById('metric-resolvidos').textContent = qtdResolvidos;
        document.getElementById('metric-total').textContent = total;

        // 4. Preenche a lista de Chamados Recentes (Juntando abertos e em andamento)
        const chamadosAtivos = [...(dados.abertos || []), ...(dados.emAndamento || []), ...(dados.emAtraso || [])];
        
        // Pega apenas os 5 mais recentes (supondo que o array já vem ordenado do banco)
        const ultimosCinco = chamadosAtivos.slice(0, 5);
        renderizarListaRecentes(ultimosCinco);

    } catch (error) {
        console.error("Erro ao carregar o dashboard:", error);
        document.getElementById('lista-recentes').innerHTML = '<p style="color: red;">Erro ao carregar os dados do servidor.</p>';
    }
});

function renderizarListaRecentes(chamados) {
    const listaElement = document.getElementById('lista-recentes');
    
    if (chamados.length === 0) {
        listaElement.innerHTML = `
            <h3>Nenhum chamado pendente</h3>
            <p>Sua fila de atendimentos está vazia.</p>
        `;
        return;
    }

    // Limpa o aviso de "Carregando..."
    listaElement.innerHTML = '';
    listaElement.className = 'recentes-list'; // Remove a classe empty-state para alinhar corretamente

    chamados.forEach(chamado => {
        // Cria um card simplificado para o dashboard
        const item = document.createElement('div');
        item.className = 'recent-item';
        item.style.borderBottom = '1px solid #eee';
        item.style.padding = '10px 0';
        
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>#${chamado.id} - ${chamado.titulo}</strong>
                    <p style="font-size: 0.85rem; color: #666; margin: 4px 0 0 0;">${chamado.tipo} | Solicitante ID: ${chamado.solicitanteId}</p>
                </div>
                <span class="badge ${chamado.status.toLowerCase()}">${chamado.status}</span>
            </div>
        `;
        listaElement.appendChild(item);
    });
}

function renderizarColuna(idColuna, chamados) {
    const colunaElement = document.getElementById(idColuna);
    if (!colunaElement) return;

    colunaElement.innerHTML = ''; // Limpa simulações estáticas do HTML

    if (!chamados || chamados.length === 0) {
        colunaElement.innerHTML = '<p class="kanban-empty">Nenhum chamado aqui.</p>';
        return;
    }

    // Desenha cada card usando as propriedades do seu DTO Java
    chamados.forEach(chamado => {
        const card = document.createElement('div');
        card.className = 'kanban-card';
        card.innerHTML = `
            <div class="card-header">
                <span class="badge ${chamado.tipo?.toLowerCase()}">${chamado.tipo || 'PADRÃO'}</span>
                <span class="id">#${chamado.id}</span>
            </div>
            <h3 class="card-title">${chamado.titulo}</h3>
            <p class="card-desc">${chamado.descricao}</p>
        `;
        colunaElement.appendChild(card);
    });
}