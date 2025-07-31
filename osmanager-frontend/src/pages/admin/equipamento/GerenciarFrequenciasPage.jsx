import React, { useState, useEffect, useCallback } from 'react';
// ✨ ALTERAÇÃO AQUI: Funções da API que precisaremos criar
import { getFrequencias, createFrequencia, deleteFrequencia } from '../../../services/apiService';
import './GerenciarFrequenciasPage.css'; // ✨ ALTERAÇÃO AQUI: Crie este arquivo de estilo

function GerenciarFrequenciasPage() {
    // Estados para controlar a lista, o formulário, o carregamento e as mensagens
    const [frequencias, setFrequencias] = useState([]);
    const [novaFrequencia, setNovaFrequencia] = useState({ nome: '', descricao: '' });
    const [loading, setLoading] = useState(true);
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

    // Função para carregar as frequências da API
    const carregarFrequencias = useCallback(() => {
        setLoading(true);
        getFrequencias()
            .then(response => {
                setFrequencias(response.data);
            })
            .catch(error => {
                console.error("Erro ao carregar frequências:", error);
                setMensagem({ tipo: 'erro', texto: 'Falha ao carregar frequências.' });
            })
            .finally(() => setLoading(false));
    }, []);

    // Carrega os dados iniciais quando o componente é montado
    useEffect(() => {
        carregarFrequencias();
    }, [carregarFrequencias]);

    // Exibe uma mensagem temporária
    const exibeMensagemTemporaria = (texto, tipo = 'sucesso') => {
        setMensagem({ tipo, texto });
        setTimeout(() => setMensagem({ tipo: '', texto: '' }), 4000);
    };

    // Atualiza o estado do formulário conforme o usuário digita
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNovaFrequencia(prev => ({ ...prev, [name]: value }));
    };

    // Lida com o envio do formulário para criar uma nova frequência
    const handleSubmit = (e) => {
        e.preventDefault();
        createFrequencia(novaFrequencia)
            .then(() => {
                exibeMensagemTemporaria('Frequência criada com sucesso!');
                setNovaFrequencia({ nome: '', descricao: '' }); // Limpa o formulário
                carregarFrequencias(); // Recarrega a lista
            })
            .catch(error => {
                console.error("Erro ao criar frequência:", error.response);
                const msg = error.response?.data?.message || 'Erro ao criar frequência.';
                exibeMensagemTemporaria(msg, 'erro');
            });
    };

    // Lida com a exclusão de uma frequência
    const handleExcluir = (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta frequência?')) {
            deleteFrequencia(id)
                .then(() => {
                    exibeMensagemTemporaria('Frequência excluída com sucesso!');
                    carregarFrequencias(); // Recarrega a lista
                })
                .catch(error => {
                    console.error("Erro ao excluir frequência:", error.response);
                    const msg = error.response?.data?.message || 'Falha ao excluir frequência.';
                    exibeMensagemTemporaria(msg, 'erro');
                });
        }
    };

    if (loading) {
        return <div className="loading-message">Carregando...</div>;
    }

    return (
        <div className="gerenciar-frequencias-container">
            <h1>Gerenciar Frequências de Manutenção</h1>
            {mensagem.texto && <div className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</div>}

            <div className="form-card">
                <h2>Cadastrar Nova Frequência</h2>
                <form onSubmit={handleSubmit} className="form-nova-frequencia">
                    <input
                        type="text"
                        name="nome"
                        value={novaFrequencia.nome}
                        onChange={handleInputChange}
                        placeholder="Nome da Frequência (ex: Semanal)"
                        required
                    />
                    <input
                        type="text"
                        name="descricao"
                        value={novaFrequencia.descricao}
                        onChange={handleInputChange}
                        placeholder="Descrição"
                        required
                    />
                    <button type="submit" className="btn-principal">Adicionar</button>
                </form>
            </div>

            <div className="lista-card">
                <h2>Frequências Cadastradas</h2>
                <table className="frequencias-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Descrição</th>
                            <th style={{ textAlign: 'right' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {frequencias.map(freq => (
                            <tr key={freq.id}>
                                <td>{freq.nome}</td>
                                <td>{freq.descricao}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <button onClick={() => handleExcluir(freq.id)} className="btn-excluir">Excluir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default GerenciarFrequenciasPage;