import React, { useEffect, useState, useCallback, Fragment } from 'react';
import {
    getEquipamentos, createEquipamento, updateEquipamento, deleteEquipamento,
    getTiposServico,
    getProgramacaoManutencao,
    // ✨ ALTERAÇÃO AQUI: Importa a nova função de histórico
    getHistoricoPorEquipamento,
    listarServicosPorEquipamento, associarServico, desassociarServico
} from '../../../services/apiService';
import './GerenciarEquipamentosPage.css';

// O componente ModalAssociarServicos permanece o mesmo, não precisa de alterações
const ModalAssociarServicos = ({ equipamento, catalogoServicos, onClose, onUpdate }) => {
    // ... (código original do ModalAssociarServicos sem alterações) ...
    const [servicosAssociados, setServicosAssociados] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (equipamento?.id) {
            listarServicosPorEquipamento(equipamento.id)
                .then(resp => setServicosAssociados(resp.data))
                .catch(err => console.error("Erro ao listar serviços associados:", err))
                .finally(() => setLoading(false));
        }
    }, [equipamento.id]);

    const isAssociado = (servicoId) => servicosAssociados.some(s => s.id === servicoId);

    const handleToggleAssociacao = (servico) => {
        const jaAssociado = isAssociado(servico.id);
        const apiCall = jaAssociado
            ? desassociarServico(equipamento.id, servico.id)
            : associarServico(equipamento.id, servico.id);

        apiCall.then(() => {
            setServicosAssociados(prev =>
                jaAssociado
                    ? prev.filter(s => s.id !== servico.id)
                    : [...prev, servico]
            );
            if (onUpdate) onUpdate();
        }).catch(err => {
            console.error("Erro ao atualizar associação:", err);
            alert("Falha ao atualizar associação do serviço.");
        });
    };

    if (loading) return <div className="modal-overlay"><div className="modal-content"><p>Carregando serviços...</p></div></div>;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Serviços para {equipamento.nome}</h2>
                <p>Marque os serviços que se aplicam a este equipamento.</p>
                <div className="lista-servicos-modal">
                    {catalogoServicos.map(servico => (
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
                <button onClick={onClose} className="btn-fechar-modal">Fechar</button>
            </div>
        </div>
    );
};


// ✨ ALTERAÇÃO AQUI: Novo componente para o Modal de Programação e Histórico
const ProgramacaoModal = ({ equipamento, onClose }) => {
    const [programacao, setProgramacao] = useState([]);
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (equipamento?.id) {
            setLoading(true);
            setError('');
            Promise.all([
                getProgramacaoManutencao(equipamento.id),
                getHistoricoPorEquipamento(equipamento.id)
            ])
            .then(([programacaoRes, historicoRes]) => {
                setProgramacao(programacaoRes.data);
                // Ordena o histórico pelo Nº OS, do mais recente para o mais antigo
                const historicoOrdenado = historicoRes.data.sort((a, b) => 
                    (b.codigoOs || 0) - (a.codigoOs || 0)
                );
                setHistorico(historicoOrdenado);
            })
            .catch(() => {
                setError('Falha ao carregar os dados de manutenção do equipamento.');
            })
            .finally(() => {
                setLoading(false);
            });
        }
    }, [equipamento]);

    const formatarData = (data) => {
        if (!data) return 'N/A';
        // Ajusta para garantir que a data seja interpretada como UTC
        const date = new Date(data);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
    }
    
    // ✨ NOVO: Função para criar os badges de status
    const getStatusBadge = (status) => {
        let className = 'status-badge ';
        switch (status?.toUpperCase()) {
            case 'ABERTA':
                className += 'status-aberta';
                break;
            case 'CONCLUIDA':
            case 'CONCLUÍDA':
                className += 'status-concluida';
                break;
            case 'EM ANDAMENTO':
                className += 'status-andamento';
                break;
            default:
                className += 'status-default';
        }
        return <span className={className}>{status || 'N/A'}</span>;
    };


    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content programacao-modal" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>Plano de Manutenção e Histórico</h2>
                    <button onClick={onClose} className="btn-fechar-modal">Fechar</button>
                </header>
                <div className="modal-body">
                    <h3>{equipamento.nome}</h3>
                    
                    <h4>Plano de Manutenção Preventiva</h4>
                    {loading ? <p>Carregando plano...</p> : programacao.length > 0 ? (
                        // ✨ NOVO: Adicionado container para a tabela
                        <div className="tabela-container">
                            <table className="programacao-table">
                                <thead>
                                    <tr>
                                        <th>Serviço</th>
                                        <th>Frequência</th>
                                        <th>Último Manutentor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {programacao.map((item, index) => (
                                        <tr key={`prog-${index}`}>
                                            <td>{item.servico}</td>
                                            <td>{item.frequencia}</td>
                                            <td>{item.ultimoManutentor || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="mensagem-vazia">Nenhum plano de manutenção preventiva cadastrado para este equipamento.</p>}
                    
                    <h4 style={{marginTop: '2rem'}}>Histórico de Ordens de Serviço</h4>
                    {loading ? <p>Carregando histórico...</p> : historico.length > 0 ? (
                        <div className="historico-table-container">
                            <table className="programacao-table historico-table">
                                <thead>
                                    <tr>
                                        <th>Nº OS</th>
                                        <th>Data</th>
                                        <th>Tipo</th>
                                        <th>Serviço/Problema</th>
                                        <th>Executor</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historico.map(os => (
                                        <tr key={`hist-${os.id}`}>
                                            <td>{os.codigoOs}</td>
                                            <td>{formatarData(os.dataSolicitacao)}</td>
                                            <td>{os.tipoManutencao}</td>
                                            {/* ✨ NOVO: Adicionado title para ver texto completo no hover */}
                                            <td title={os.descricaoProblema}>{os.descricaoProblema}</td>
                                            <td>{os.executadoPorNome || 'N/A'}</td>
                                            {/* ✨ ALTERADO: Usando o badge de status */}
                                            <td>{getStatusBadge(os.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="mensagem-vazia">Nenhum histórico de manutenção encontrado.</p>}
                     {error && <p className="mensagem-erro">{error}</p>}
                </div>
            </div>
        </div>
    );
};

// ... (Restante do arquivo GerenciarEquipamentosPage.js sem alterações) ...
function GerenciarEquipamentosPage() {
    const [equipamentos, setEquipamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editandoId, setEditandoId] = useState(null);
    const [formEdicao, setFormEdicao] = useState({ tag: '', nome: '', descricao: '' });
    const [novoEquipamento, setNovoEquipamento] = useState({ nome: '', descricao: '', tag: '' });

    const [tiposServico, setTiposServico] = useState([]);
    
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
    const [isModalServicosOpen, setIsModalServicosOpen] = useState(false);
    const [equipamentoParaModal, setEquipamentoParaModal] = useState(null);

    const [isProgramacaoModalOpen, setIsProgramacaoModalOpen] = useState(false);
    const [equipamentoParaProgramacao, setEquipamentoParaProgramacao] = useState(null);

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
        createEquipamento(novoEquipamento)
            .then(() => {
                exibeMensagemTemporaria('Equipamento criado com sucesso!');
                setNovoEquipamento({ nome: '', descricao: '', tag: '' });
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
        setFormEdicao({ tag: equip.tag, nome: equip.nome, descricao: equip.descricao || '' });
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

    if (loading) return <div className="loading-message">Carregando equipamentos...</div>;

    return (
        <div className="gerenciar-equipamentos-container">
            <h1>Gerenciar Equipamentos e Planos</h1>
            {mensagem.texto && <div className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</div>}
            <div className="form-card">
                <h2>Cadastrar Novo Equipamento</h2>
                <form onSubmit={handleNovoEquipamentoSubmit} className="form-novo-equipamento">
                    <input type="text" name="nome" value={novoEquipamento.nome} onChange={handleNovoEquipamentoChange} placeholder="Nome do Equipamento" required />
                    <input type="text" name="descricao" value={novoEquipamento.descricao} onChange={handleNovoEquipamentoChange} placeholder="Descrição" required />
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
                                        <td>{equip.tag}</td>
                                        <td>{equip.nome}</td>
                                        <td>{equip.descricao}</td>
                                        <td>
                                            <div className="actions-container">
                                                <button onClick={() => handleOpenProgramacaoModal(equip)} className="btn-plano">Plano</button>
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
        </div>
    );
}

export default GerenciarEquipamentosPage;