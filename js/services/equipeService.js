const EquipeService = {
    async cadastrarMembro(dadosUsuario) {
        try {
            const response = await apiRequest('/api/usuarios', {
                method: 'POST',
                body: JSON.stringify(dadosUsuario)
            });

            if (!response) throw new Error("Não foi possível estabelecer ligação ao servidor.");
            if (!response.ok) {
                let mensagem = "Erro ao cadastrar o usuário.";
                try { mensagem = (await response.text()) || mensagem; } catch (e) { }
                throw new Error(mensagem);
            }
            return true;
        } catch (error) {
            console.error('Erro no EquipeService:', error);
            throw error;
        }
    },

    // NOVO MÉTODO: Carregar a lista do backend
    async listar() {
        try {
            const response = await apiRequest('/api/usuarios', {
                method: 'GET'
            });

            if (!response) throw new Error("Não foi possível estabelecer ligação ao servidor.");
            if (!response.ok) throw new Error("Erro ao carregar a lista da equipa.");

            return await response.json();
        } catch (error) {
            console.error('Erro ao listar membros:', error);
            throw error;
        }
    },

    async obterPerfilLogado() {
        try {
            const response = await apiRequest('/api/usuarios/me', {
                method: 'GET'
            });

            if (!response || !response.ok) throw new Error("Erro ao carregar o perfil.");
            return await response.json();
        } catch (error) {
            console.error('Erro ao obter perfil logado:', error);
            throw error;
        }
    }
};
