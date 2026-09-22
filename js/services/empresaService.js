export const EmpresaService = {
    async cadastrar(dadosEmpresa) {
        try {
            const response = await fetch('http://localhost:8080/api/empresas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosEmpresa)
            });

            if (!response.ok) {
                let mensagem = "Erro ao realizar o cadastro da empresa.";
                try {
                    const erro = await response.json();
                    if (erro.message) mensagem = erro.message;
                } catch (e) { }
                
                throw new Error(mensagem);
            }

            return true; 
        } catch (error) {
            console.error('Erro no EmpresaService:', error);
            throw new Error("Não foi possível conectar ao servidor. Verifique se a API está rodando.");
        }
    }
};