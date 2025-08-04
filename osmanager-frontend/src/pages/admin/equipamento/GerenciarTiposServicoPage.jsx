import React, { useState, useEffect } from 'react';
import { getTiposServico, createTipoServico, deleteTipoServico, getEquipamentos } from '../../../services/apiService';
import { FaCheck } from 'react-icons/fa'; // Importa o ícone de check
import './GerenciarTiposServicoPage.css';

function GerenciarTiposServicoPage() {
    const [tiposServico, setTiposServico] = useState([]);
    const [loading, setLoading] = useState(true);
    const [novoServico, setNovoServico] = useState({ nome: '', descricao: '', equipamentoIds: new Set() });
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
    const [equipamentos, setEquipamentos] = useState([]);

    useEffect(() => {
        carregarDadosIniciais();
    }, []);

    const carregarDadosIniciais = () => {
        setLoading(true);
        Promise.all([getTiposServico(), getEquipamentos()])
            .then(([servicosResp, equipamentosResp]) => {
                setTiposServico(servicosResp.data);
                setEquipamentos(equipamentosResp.data);
            })
            .catch(() => setMensagem({ tipo: 'erro', texto: 'Erro ao carregar dados da página.' }))
            .finally(() => setLoading(false));
    };

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
            setMensagem({ tipo: 'erro', texto: 'Erro ao cadastrar serviço.' });
        }
    };

    const excluirServico = (id) => {
        if (window.confirm('Deseja realmente excluir este serviço?')) {
            deleteTipoServico(id)
                .then(() => {
                    setMensagem({ tipo: 'sucesso', texto: 'Serviço excluído!' });
                    carregarDadosIniciais();
                })
                .catch(() => setMensagem({ tipo: 'erro', texto: 'Erro ao excluir.' }));
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
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tiposServico.map(servico => (
                                <tr key={servico.id}>
                                    <td>{servico.nome}</td>
                                    <td>{servico.descricao}</td>
                                    <td>
                                        <button onClick={() => excluirServico(servico.id)} className="btn-excluir">Excluir</button>
                                    </td>
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