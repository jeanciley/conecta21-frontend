import { apiRequest } from './api.js';

export async function carregarKanban(tipos = []) {
    // Monta a query string se houver filtros (ex: ?tipos=TI_INTERNO,FACILITIES)
    const query = tipos.length > 0 ? `?tipos=${tipos.join(',')}` : '';

    const response = await apiRequest(`/chamados/kanban${query}`, {
        method: 'GET'
    });

    if (response && response.ok) {
        return await response.json();
    }
    
    throw new Error("Falha ao carregar o Kanban");
}