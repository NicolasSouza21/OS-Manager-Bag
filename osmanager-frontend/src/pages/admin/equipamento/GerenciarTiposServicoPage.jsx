import React, { useState, useEffect, useCallback } from 'react';
// ✨ ALTERAÇÃO AQUI: Importa a nova função 'updateTipoServico' que criaremos a seguir.
import { getTiposServico, createTipoServico, deleteTipoServico, getEquipamentos, updateTipoServico } from '../../../services/apiService';
import { FaCheck } from 'react-icons/fa';
import './GerenciarTiposServicoPage.css';

function GerenciarTiposServicoPage() {
    const [tiposServico, setTiposServico] = useState([]);
    const [loading, setLoading] = useState(true);
    const [novoServico, setNovoServico] = useState({ nome: '', descricao: '', equipamentoIds: new Set() });
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
    const [equipamentos, setEquipamentos] = useState([]);

    // ✨ ALTERAÇÃO AQUI: Estados para controlar o modo de edição da tabela.
    const [editandoId, setEditandoId] = useState(null);
    const [formEdicao, setFormEdicao] = useState({ nome: '', descricao: '' });

    const carregarDadosIniciais = useCallback(() => {
        setLoading(true);
        Promise.all([getTiposServico(), getEquipamentos()])
            .then(([servicosResp, equipamentosResp]) => {
                setTiposServico(servicosResp.data);
                setEquipamentos(equipamentosResp.data);
            })
            .catch(() => setMensagem({ tipo: 'erro', texto: 'Erro ao carregar dados da página.' }))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        carregarDadosIniciais();
    }, [carregarDadosIniciais]);

    const handleNovoChange = (e) => {
        const { name, value } = e.target;
        setNovoServico(prev => ({ ...prev, [name]: value }));
    };
    
    const handleEquipamentoSelect = (equipamentoId) => {
        setNovoServico(prev => {
            const newEquipamentoIds = new Set(prev.equipamentoIds);
            if (newEquipamentoIds.has(equipamentoId)) {
                newEquipamentoIds.delete(equipamentoId);
            } else {
                newEquipamentoIds.add(equipamentoId);
            }
            return { ...prev, equipamentoIds: newEquipamentoIds };
        });
    };

    const handleAdicionarSubmit = async (e) => {
        e.preventDefault();
        setMensagem({ tipo: '', texto: '' });
        
        const dadosParaApi = {
            ...novoServico,
            equipamentoIds: Array.from(novoServico.equipamentoIds)
        };
        
        try {
            await createTipoServico(dadosParaApi);
            setMensagem({ tipo: 'sucesso', texto: 'Serviço cadastrado e associado com sucesso!' });
            setNovoServico({ nome: '', descricao: '', equipamentoIds: new Set() });
            carregarDadosIniciais();
        } catch (err) {
            // ✨ ALTERAÇÃO AQUI: Agora extraímos a mensagem do erro vinda do Backend
            const errorMsg = err.response?.data?.message || 'Erro ao cadastrar serviço.';
            setMensagem({ tipo: 'erro', texto: errorMsg });
        }
    };

    const excluirServico = (id) => {
        if (window.confirm('Deseja realmente excluir este serviço?')) {
            deleteTipoServico(id)
                .then(() => {
                    setMensagem({ tipo: 'sucesso', texto: 'Serviço excluído!' });
                    carregarDadosIniciais();
                })
                .catch((err) => {
                    // ✨ ALTERAÇÃO AQUI: Também melhoramos a mensagem de erro na exclusão
                    const errorMsg = err.response?.data?.message || 'Erro ao excluir.';
                    setMensagem({ tipo: 'erro', texto: errorMsg });
                });
        }
    };

    // ✨ ALTERAÇÃO AQUI: Funções para controlar a edição na tabela.
    const handleEditarClick = (servico) => {
        setEditandoId(servico.id);
        setFormEdicao({ nome: servico.nome, descricao: servico.descricao || '' });
    };

    const handleCancelarEdicao = () => {
        setEditandoId(null);
    };

    const handleEdicaoChange = (e) => {
        const { name, value } = e.target;
        setFormEdicao(prev => ({ ...prev, [name]: value }));
    };

    const handleSalvarEdicao = async (id) => {
        try {
            await updateTipoServico(id, formEdicao);
            setMensagem({ tipo: 'sucesso', texto: 'Serviço atualizado com sucesso!' });
            setEditandoId(null);
            carregarDadosIniciais();
        } catch (err) {
            // ✨ ALTERAÇÃO AQUI: Garante que a mensagem do backend seja exibida
            setMensagem({ tipo: 'erro', texto: err.response?.data?.message || 'Erro ao atualizar o serviço.' });
        }
    };


    return (
        <div className="gerenciar-servicos-container">
            <div className="form-card">
                <h2>Cadastrar Novo Tipo de Serviço</h2>
                <form onSubmit={handleAdicionarSubmit}>
                    <div className="input-group">
                        <label htmlFor="nome">Nome do Serviço</label>
                        <input id="nome" name="nome" type="text" value={novoServico.nome} onChange={handleNovoChange} placeholder="Ex: Limpeza Externa do Painel" required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="descricao">Descrição (Opcional)</label>
                        <textarea id="descricao" name="descricao" value={novoServico.descricao} onChange={handleNovoChange} placeholder="Detalhes sobre o que fazer neste serviço" rows={2} />
                    </div>
                    
                    <div className="input-group">
                        <label>Associar este serviço aos seguintes equipamentos:</label>
                        <div className="equipamentos-card-list">
                            {equipamentos.map(equip => {
                                const isSelecionado = novoServico.equipamentoIds.has(equip.id);
                                return (
                                    <div 
                                        key={equip.id} 
                                        className={`equipamento-card ${isSelecionado ? 'selecionado' : ''}`}
                                        onClick={() => handleEquipamentoSelect(equip.id)}
                                    >
                                        <input 
                                            type="checkbox"
                                            checked={isSelecionado}
                                            readOnly
                                            style={{ display: 'none' }}
                                        />
                                        <div>
                                            <strong>{equip.nome}</strong>
                                            <br />
                                            <small>Tag: {equip.tag || 'N/A'}</small>
                                        </div>
                                        {isSelecionado && <span className="check-icon"><FaCheck /></span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <button className="btn-submit" type="submit">Cadastrar Serviço</button>
                </form>
            </div>

            {mensagem.texto && <div className={`mensagem-feedback ${mensagem.tipo}`}>{mensagem.texto}</div>}

            <div className="lista-card">
                <h2>Catálogo de Serviços</h2>
                {loading ? <p>Carregando...</p> : (
                    <table className="servicos-table">
                        <thead>
                            <tr>
                                <th>Nome do Serviço</th>
                                <th>Descrição</th>
                                <th style={{ textAlign: 'right' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tiposServico.map(servico => (
                                <tr key={servico.id}>
                                    {/* ✨ ALTERAÇÃO AQUI: Lógica condicional para mostrar inputs ou texto */}
                                    {editandoId === servico.id ? (
                                        <>
                                            <td>
                                                <input
                                                    type="text"
                                                    name="nome"
                                                    value={formEdicao.nome}
                                                    onChange={handleEdicaoChange}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    name="descricao"
                                                    value={formEdicao.descricao}
                                                    onChange={handleEdicaoChange}
                                                />
                                            </td>
                                            <td className="actions-cell">
                                                <button onClick={() => handleSalvarEdicao(servico.id)} className="btn-salvar">Salvar</button>
                                                <button onClick={handleCancelarEdicao} className="btn-cancelar">Cancelar</button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{servico.nome}</td>
                                            <td>{servico.descricao}</td>
                                            <td className="actions-cell">
                                                <button onClick={() => handleEditarClick(servico)} className="btn-editar">Editar</button>
                                                <button onClick={() => excluirServico(servico.id)} className="btn-excluir">Excluir</button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default GerenciarTiposServicoPage;