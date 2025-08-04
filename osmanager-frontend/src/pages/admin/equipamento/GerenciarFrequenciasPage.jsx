import React, { useState, useEffect, useCallback } from 'react';
// ✨ ALTERAÇÃO AQUI: Importa a nova função 'updateFrequencia'
import { getFrequencias, createFrequencia, deleteFrequencia, updateFrequencia } from '../../../services/apiService';
import './GerenciarFrequenciasPage.css';

const UNIDADE_TEMPO_OPTIONS = ['HORA', 'DIA', 'SEMANA', 'MES', 'ANO'];

function GerenciarFrequenciasPage() {
    const [frequencias, setFrequencias] = useState([]);
    const [novaFrequencia, setNovaFrequencia] = useState({ 
        nome: '', 
        unidadeTempo: 'DIA',
        intervalo: 1
    });
    const [loading, setLoading] = useState(true);
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

    // ✨ ALTERAÇÃO AQUI: Novos estados para controlar o modo de edição
    const [editandoId, setEditandoId] = useState(null); // Guarda o ID da frequência em edição
    const [formEdicao, setFormEdicao] = useState({ nome: '', intervalo: 1, unidadeTempo: 'DIA' }); // Guarda os dados do form de edição

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

    useEffect(() => {
        carregarFrequencias();
    }, [carregarFrequencias]);

    const exibeMensagemTemporaria = (texto, tipo = 'sucesso') => {
        setMensagem({ tipo, texto });
        setTimeout(() => setMensagem({ tipo: '', texto: '' }), 4000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const valorProcessado = name === 'intervalo' ? parseInt(value, 10) || 1 : value;
        setNovaFrequencia(prev => ({ ...prev, [name]: valorProcessado }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createFrequencia(novaFrequencia)
            .then(() => {
                exibeMensagemTemporaria('Frequência criada com sucesso!');
                setNovaFrequencia({ nome: '', unidadeTempo: 'DIA', intervalo: 1 });
                carregarFrequencias();
            })
            .catch(error => {
                console.error("Erro ao criar frequência:", error.response);
                const msg = error.response?.data?.message || 'Erro ao criar frequência.';
                exibeMensagemTemporaria(msg, 'erro');
            });
    };

    const handleExcluir = (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta frequência?')) {
            deleteFrequencia(id)
                .then(() => {
                    exibeMensagemTemporaria('Frequência excluída com sucesso!');
                    carregarFrequencias();
                })
                .catch(error => {
                    console.error("Erro ao excluir frequência:", error.response);
                    const msg = error.response?.data?.message || 'Falha ao excluir frequência. Verifique se ela não está em uso.';
                    exibeMensagemTemporaria(msg, 'erro');
                });
        }
    };
    
    // ✨ ALTERAÇÃO AQUI: Novas funções para lidar com a edição
    const handleEditarClick = (freq) => {
        setEditandoId(freq.id);
        setFormEdicao({ ...freq }); // Preenche o formulário de edição com os dados da frequência
    };

    const handleCancelarEdicao = () => {
        setEditandoId(null); // Sai do modo de edição
    };

    const handleEdicaoChange = (e) => {
        const { name, value } = e.target;
        const valorProcessado = name === 'intervalo' ? parseInt(value, 10) || 1 : value;
        setFormEdicao(prev => ({ ...prev, [name]: valorProcessado }));
    };

    const handleSalvarEdicao = (id) => {
        updateFrequencia(id, formEdicao)
            .then(() => {
                exibeMensagemTemporaria('Frequência atualizada com sucesso!');
                setEditandoId(null); // Sai do modo de edição
                carregarFrequencias(); // Recarrega a lista
            })
            .catch(error => {
                console.error("Erro ao atualizar frequência:", error.response);
                const msg = error.response?.data?.message || 'Falha ao atualizar frequência.';
                exibeMensagemTemporaria(msg, 'erro');
            });
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
                    <input type="text" name="nome" value={novaFrequencia.nome} onChange={handleInputChange} placeholder="Tipo (ex: Mensal, Bimestral, etc)" required style={{ flex: 2 }}/>
                    <input type="number" name="intervalo" value={novaFrequencia.intervalo} onChange={handleInputChange} placeholder="Intervalo" required min="1" style={{ flex: 1 }}/>
                    <select name="unidadeTempo" value={novaFrequencia.unidadeTempo} onChange={handleInputChange} required style={{ flex: 1 }}>
                        {UNIDADE_TEMPO_OPTIONS.map(option => (<option key={option} value={option}>{option}</option>))}
                    </select>
                    <button type="submit" className="btn-principal">Adicionar</button>
                </form>
            </div>

            <div className="lista-card">
                <h2>Frequências Cadastradas</h2>
                <table className="frequencias-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Intervalo</th>
                            <th>Unidade</th>
                            <th style={{ textAlign: 'right' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {frequencias.map(freq => (
                            <tr key={freq.id}>
                                {editandoId === freq.id ? (
                                    // ✨ ALTERAÇÃO AQUI: Modo de Edição
                                    <>
                                        <td><input type="text" name="nome" value={formEdicao.nome} onChange={handleEdicaoChange} style={{width: '100%'}}/></td>
                                        <td><input type="number" name="intervalo" value={formEdicao.intervalo} onChange={handleEdicaoChange} min="1" style={{width: '80px'}}/></td>
                                        <td>
                                            <select name="unidadeTempo" value={formEdicao.unidadeTempo} onChange={handleEdicaoChange}>
                                                {UNIDADE_TEMPO_OPTIONS.map(option => (<option key={option} value={option}>{option}</option>))}
                                            </select>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button onClick={() => handleSalvarEdicao(freq.id)} className="btn-salvar">Salvar</button>
                                            <button onClick={handleCancelarEdicao} className="btn-cancelar">Cancelar</button>
                                        </td>
                                    </>
                                ) : (
                                    // Modo de Visualização Normal
                                    <>
                                        <td>{freq.nome}</td>
                                        <td>{freq.intervalo}</td>
                                        <td>{freq.unidadeTempo}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button onClick={() => handleEditarClick(freq)} className="btn-editar">Editar</button>
                                            <button onClick={() => handleExcluir(freq.id)} className="btn-excluir">Excluir</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default GerenciarFrequenciasPage;