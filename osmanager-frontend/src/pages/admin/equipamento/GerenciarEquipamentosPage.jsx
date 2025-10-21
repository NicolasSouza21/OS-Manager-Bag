import React, { useEffect, useState, useCallback, Fragment } from 'react';
import {
    getEquipamentos, createEquipamento, updateEquipamento, deleteEquipamento,
    getTiposServico,
    getHistoricoPorEquipamento,
    listarServicosPorEquipamento, associarServico, desassociarServico
} from '../../../services/apiService';
import HistoricoModal from './HistoricoModal';
import ProgramacaoModal from './ProgramacaoModal';
import './GerenciarEquipamentosPage.css';

// ModalAssociarServicos
const ModalAssociarServicos = ({ equipamento, catalogoServicos, onClose, onUpdate }) => {
    const [servicosAssociados, setServicosAssociados] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (equipamento?.id) {
            setLoading(true); // Reinicia o loading ao mudar o equipamento
            listarServicosPorEquipamento(equipamento.id)
                .then(resp => setServicosAssociados(resp.data || [])) // Garante que seja um array
                .catch(err => {
                    console.error("Erro ao listar serviços associados:", err);
                    setServicosAssociados([]); // Define como array vazio em caso de erro
                })
                .finally(() => setLoading(false));
        } else {
            setServicosAssociados([]); // Limpa se não houver equipamento
            setLoading(false);
        }
    }, [equipamento?.id]); // Dependência ajustada para reexecutar se o ID mudar

    const isAssociado = (servicoId) => servicosAssociados.some(s => s.id === servicoId);

    const handleToggleAssociacao = (servico) => {
        const jaAssociado = isAssociado(servico.id);
        const apiCall = jaAssociado
            ? desassociarServico(equipamento.id, servico.id)
            : associarServico(equipamento.id, servico.id);

        // Otimismo UI: Atualiza o estado local imediatamente
        setServicosAssociados(prev =>
            jaAssociado
                ? prev.filter(s => s.id !== servico.id)
                : [...prev, servico] // Adiciona o serviço completo temporariamente
        );

        apiCall
            .then(() => {
                // Sucesso: A UI já está atualizada
                if (onUpdate) onUpdate();
            })
            .catch(err => {
                // Erro: Reverte a mudança na UI e mostra alerta
                console.error("Erro ao atualizar associação:", err);
                alert("Falha ao atualizar associação do serviço.");
                setServicosAssociados(prev => // Reverte
                    jaAssociado
                        ? [...prev, servico] // Readiciona se a remoção falhou
                        : prev.filter(s => s.id !== servico.id) // Remove se a adição falhou
                );
            });
    };

    // Usa um container de loading mais simples dentro do modal
    if (loading) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    {/* Reutiliza o header padrão */}
                    <header className="modal-header">
                        <h2>Serviços para {equipamento?.nome || '...'}</h2>
                        <button onClick={onClose} className="btn-fechar-modal">&times;</button>
                    </header>
                    <div className="modal-body" style={{ textAlign: 'center', padding: '3rem' }}>
                        <p>Carregando serviços...</p>
                    </div>
                </div>
            </div>
        );
     }

    return (
        <div className="modal-overlay" onClick={onClose}>
             {/* ✨ ALTERAÇÃO AQUI: Adiciona 'associar-servicos-modal' para estilos específicos se necessário */}
            <div className="modal-content associar-servicos-modal" onClick={e => e.stopPropagation()}>
                 {/* ✨ ALTERAÇÃO AQUI: Reutiliza a classe modal-header */}
                <header className="modal-header">
                    <h2>Serviços para {equipamento.nome}</h2>
                     {/* ✨ ALTERAÇÃO AQUI: Reutiliza a classe btn-fechar-modal */}
                    <button onClick={onClose} className="btn-fechar-modal">&times;</button>
                </header>
                 {/* ✨ ALTERAÇÃO AQUI: Reutiliza a classe modal-body */}
                <div className="modal-body">
                    <p>Marque os serviços que se aplicam a este equipamento.</p>
                    <div className="lista-servicos-modal">
                        {/* Garante que catalogoServicos seja um array antes de mapear */}
                        {Array.isArray(catalogoServicos) && catalogoServicos.map(servico => (
                            <div key={servico.id} className="servico-item-modal">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={isAssociado(servico.id)}
                                        onChange={() => handleToggleAssociacao(servico)}
                                    />
                                    {servico.nome}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                 {/* ✨ ALTERAÇÃO AQUI: Adiciona o modal-footer envolvendo o botão */}
                <footer className="modal-footer">
                    <button onClick={onClose} className="btn-fechar-modal">Fechar</button>
                </footer>
            </div>
        </div>
    );
};


// Componente principal da página
function GerenciarEquipamentosPage() {
   // ... (Restante do código sem alterações) ...
    const [equipamentos, setEquipamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editandoId, setEditandoId] = useState(null);
    const [formEdicao, setFormEdicao] = useState({ tag: '', nome: '', descricao: '' });
    const [novoEquipamento, setNovoEquipamento] = useState({ nome: '', tag: '' });

    const [tiposServico, setTiposServico] = useState([]);
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
    const [isModalServicosOpen, setIsModalServicosOpen] = useState(false);
    const [equipamentoParaModal, setEquipamentoParaModal] = useState(null);
    const [isProgramacaoModalOpen, setIsProgramacaoModalOpen] = useState(false);
    const [equipamentoParaProgramacao, setEquipamentoParaProgramacao] = useState(null);
    const [isHistoricoModalOpen, setIsHistoricoModalOpen] = useState(false);
    const [equipamentoParaHistorico, setEquipamentoParaHistorico] = useState(null);

    const carregarEquipamentos = useCallback(() => {
        setLoading(true);
        getEquipamentos()
            .then(response => {
                setEquipamentos(response.data);
            })
            .catch(error => {
                console.error("Erro ao carregar equipamentos:", error);
                setMensagem({ tipo: 'erro', texto: 'Falha ao carregar equipamentos.' });
            })
            .finally(() => setLoading(false));
    }, []);

    const carregarTiposServico = useCallback(() => {
        getTiposServico()
            .then(response => setTiposServico(response.data))
            .catch(error => console.error("Erro ao carregar tipos de serviço:", error));
    }, []);

    useEffect(() => {
        carregarEquipamentos();
        carregarTiposServico();
    }, [carregarEquipamentos, carregarTiposServico]);

    const exibeMensagemTemporaria = (texto, tipo = 'sucesso') => {
        setMensagem({ tipo, texto });
        setTimeout(() => setMensagem({ tipo: '', texto: '' }), 4000);
    };

    const limparMensagem = () => {
        if (mensagem.texto) {
            setMensagem({ tipo: '', texto: '' });
        }
    };


    const handleNovoEquipamentoChange = (e) => {
        limparMensagem();
        const { name, value } = e.target;
        setNovoEquipamento(prev => ({ ...prev, [name]: value }));
    };

    const handleNovoEquipamentoSubmit = (e) => {
        e.preventDefault();
        limparMensagem();
        const dadosParaApi = { ...novoEquipamento, descricao: '' };

        createEquipamento(dadosParaApi)
            .then(() => {
                exibeMensagemTemporaria('Equipamento criado com sucesso!');
                setNovoEquipamento({ nome: '', tag: '' });
                carregarEquipamentos();
            })
            .catch(error => {
                const msg = error.response?.data?.message || 'Erro ao criar equipamento.';
                exibeMensagemTemporaria(msg, 'erro');
            });
    };

    const handleExcluir = (id) => {
        limparMensagem();
        if (window.confirm('Tem certeza que deseja excluir este equipamento?')) {
            deleteEquipamento(id)
                .then(() => {
                    exibeMensagemTemporaria('Equipamento excluído com sucesso!');
                    carregarEquipamentos();
                })
                .catch(error => {
                    const msg = error.response?.data?.message || 'Falha ao excluir.';
                    exibeMensagemTemporaria(msg, 'erro');
                });
        }
    };

    const handleEditarClick = (equip) => {
        limparMensagem();
        setEditandoId(equip.id);
        setFormEdicao({ tag: equip.tag || '', nome: equip.nome, descricao: equip.descricao || '' });
    };

    const handleEdicaoChange = (e) => {
        const { name, value } = e.target;
        setFormEdicao(prev => ({ ...prev, [name]: value }));
    };

    const handleSalvarEdicao = (id) => {
        limparMensagem();
        updateEquipamento(id, formEdicao)
            .then(() => {
                exibeMensagemTemporaria('Equipamento atualizado com sucesso!');
                setEditandoId(null);
                carregarEquipamentos();
            })
            .catch(error => {
                const msg = error.response?.data?.message || 'Erro ao atualizar.';
                exibeMensagemTemporaria(msg, 'erro');
            });
    };


    const handleOpenServicosModal = (equipamento) => {
        limparMensagem();
        setEquipamentoParaModal(equipamento);
        setIsModalServicosOpen(true);
    };

    const handleCloseServicosModal = () => {
        setIsModalServicosOpen(false);
        setEquipamentoParaModal(null);
    };

    const handleOpenProgramacaoModal = (equipamento) => {
        limparMensagem();
        setEquipamentoParaProgramacao(equipamento);
        setIsProgramacaoModalOpen(true);
    };

    const handleCloseProgramacaoModal = () => {
        setIsProgramacaoModalOpen(false);
        setEquipamentoParaProgramacao(null);
    };

    const handleOpenHistoricoModal = (equipamento) => {
        limparMensagem();
        setEquipamentoParaHistorico(equipamento);
        setIsHistoricoModalOpen(true);
    };

    const handleCloseHistoricoModal = () => {
        setIsHistoricoModalOpen(false);
        setEquipamentoParaHistorico(null);
    };


    if (loading) return <div className="loading-message">Carregando equipamentos...</div>;

    return (
        <div className="gerenciar-equipamentos-container">
            <h1>Gerenciar Equipamentos e Planos</h1>
            {mensagem.texto && <div className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</div>}
            <div className="form-card">
                <h2>Cadastrar Novo Equipamento</h2>
                <form onSubmit={handleNovoEquipamentoSubmit} className="form-novo-equipamento">
                    <input type="text" name="nome" value={novoEquipamento.nome} onChange={handleNovoEquipamentoChange} placeholder="Nome do Equipamento" required />
                    <input type="text" name="tag" value={novoEquipamento.tag} onChange={handleNovoEquipamentoChange} placeholder="Número do Ativo (Opcional)" />
                    <button type="submit" className="btn-principal">Adicionar</button>
                </form>
            </div>
            <div className="lista-card">
                <h2>Equipamentos Cadastrados</h2>
                <table className="equipamentos-table">
                    <thead>
                        <tr>
                            <th>Nº do Ativo</th>
                            <th>Nome</th>
                            <th>Descrição</th>
                            <th style={{ textAlign: 'right' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {equipamentos.map(equip => (
                             <tr key={equip.id}>
                                {editandoId === equip.id ? (
                                    <>
                                        <td><input type="text" name="tag" value={formEdicao.tag} onChange={handleEdicaoChange} /></td>
                                        <td><input type="text" name="nome" value={formEdicao.nome} onChange={handleEdicaoChange} required /></td>
                                        <td><input type="text" name="descricao" value={formEdicao.descricao} onChange={handleEdicaoChange} required/></td>
                                        <td>
                                            <div className="actions-group">
                                                <button onClick={() => handleSalvarEdicao(equip.id)} className="btn-salvar">Salvar</button>
                                                <button onClick={() => setEditandoId(null)} className="btn-cancelar">Cancelar</button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{equip.tag || '-'}</td>
                                        <td>{equip.nome}</td>
                                        <td>{equip.descricao}</td>
                                        <td>
                                            <div className="actions-container">
                                                <div className="actions-group-vertical">
                                                    <button onClick={() => handleOpenProgramacaoModal(equip)} className="btn-plano">Plano</button>
                                                    <button onClick={() => handleOpenHistoricoModal(equip)} className="btn-historico">Histórico</button>
                                                </div>
                                                <div className="actions-group">
                                                    <button onClick={() => handleOpenServicosModal(equip)} className="btn-servicos">Serviços</button>
                                                    <button onClick={() => handleEditarClick(equip)} className="btn-editar">Editar</button>
                                                    <button onClick={() => handleExcluir(equip.id)} className="btn-excluir">Excluir</button>
                                                </div>
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Renderização dos Modais */}
            {isModalServicosOpen && equipamentoParaModal && (
                <ModalAssociarServicos
                    equipamento={equipamentoParaModal}
                    catalogoServicos={tiposServico}
                    onClose={handleCloseServicosModal}
                    onUpdate={() => {}}
                />
            )}
            {isProgramacaoModalOpen && equipamentoParaProgramacao && (
                <ProgramacaoModal
                    equipamento={equipamentoParaProgramacao}
                    onClose={handleCloseProgramacaoModal}
                />
            )}
            {isHistoricoModalOpen && equipamentoParaHistorico && (
                <HistoricoModal
                    equipamento={equipamentoParaHistorico}
                    onClose={handleCloseHistoricoModal}
                />
            )}
        </div>
    );
}

export default GerenciarEquipamentosPage;