import React, { useEffect, useState, useCallback } from 'react';
import {
    getEquipamentos, createEquipamento, updateEquipamento, deleteEquipamento,
    getTiposServico,
    getHistoricoPorEquipamento,
    listarServicosPorEquipamento, associarServico, desassociarServico,
    getSetores, getLocais
} from '../../../services/apiService';
import HistoricoModal from './HistoricoModal';
import ProgramacaoModal from './ProgramacaoModal';
import './GerenciarEquipamentosPage.css';

// --- Modal de Associar Serviços (Mantido igual) ---
const ModalAssociarServicos = ({ equipamento, catalogoServicos, onClose, onUpdate }) => {
    const [servicosAssociados, setServicosAssociados] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (equipamento?.id) {
            setLoading(true);
            listarServicosPorEquipamento(equipamento.id)
                .then(resp => setServicosAssociados(resp.data || []))
                .catch(err => {
                    console.error("Erro ao listar serviços associados:", err);
                    setServicosAssociados([]);
                })
                .finally(() => setLoading(false));
        } else {
            setServicosAssociados([]);
            setLoading(false);
        }
    }, [equipamento?.id]);

    const isAssociado = (servicoId) => servicosAssociados.some(s => s.id === servicoId);

    const handleToggleAssociacao = (servico) => {
        const jaAssociado = isAssociado(servico.id);
        const apiCall = jaAssociado
            ? desassociarServico(equipamento.id, servico.id)
            : associarServico(equipamento.id, servico.id);

        setServicosAssociados(prev =>
            jaAssociado
                ? prev.filter(s => s.id !== servico.id)
                : [...prev, servico]
        );

        apiCall
            .then(() => {
                if (onUpdate) onUpdate();
            })
            .catch(err => {
                console.error("Erro ao atualizar associação:", err);
                alert("Falha ao atualizar associação do serviço.");
                setServicosAssociados(prev =>
                    jaAssociado
                        ? [...prev, servico]
                        : prev.filter(s => s.id !== servico.id)
                );
            });
    };

    if (loading) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content associar-servicos-modal" onClick={e => e.stopPropagation()}>
                    <header className="modal-header"><h2>Carregando...</h2></header>
                    <div className="modal-body" style={{ textAlign: 'center', padding: '3rem' }}><p>Buscando serviços...</p></div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content associar-servicos-modal" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>Serviços para {equipamento.nome}</h2>
                    <button onClick={onClose} className="btn-fechar-modal">&times;</button>
                </header>
                <div className="modal-body">
                    <p style={{ marginBottom: '1rem', color: '#666' }}>Marque os serviços que devem aparecer no checklist de manutenção preventiva deste equipamento.</p>
                    <div className="lista-servicos-modal">
                        {Array.isArray(catalogoServicos) && catalogoServicos.length > 0 ? (
                            catalogoServicos.map(servico => (
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
                            ))
                        ) : (<p>Nenhum serviço cadastrado no sistema.</p>)}
                    </div>
                </div>
                <footer className="modal-footer"><button onClick={onClose} className="btn-fechar-modal">Fechar</button></footer>
            </div>
        </div>
    );
};

// --- Componente Principal ---
function GerenciarEquipamentosPage() {
    const [equipamentos, setEquipamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [listaSetores, setListaSetores] = useState([]);
    const [listaLocais, setListaLocais] = useState([]);

    const [editandoId, setEditandoId] = useState(null);
    const [formEdicao, setFormEdicao] = useState({ tag: '', nome: '', descricao: '', setorId: '', localId: '' });
    const [novoEquipamento, setNovoEquipamento] = useState({ nome: '', tag: '', setorId: '', localId: '' });

    const [tiposServico, setTiposServico] = useState([]);
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
    
    const [isModalServicosOpen, setIsModalServicosOpen] = useState(false);
    const [equipamentoParaModal, setEquipamentoParaModal] = useState(null);
    const [isProgramacaoModalOpen, setIsProgramacaoModalOpen] = useState(false);
    const [equipamentoParaProgramacao, setEquipamentoParaProgramacao] = useState(null);
    const [isHistoricoModalOpen, setIsHistoricoModalOpen] = useState(false);
    const [equipamentoParaHistorico, setEquipamentoParaHistorico] = useState(null);

    const carregarDadosIniciais = useCallback(async () => {
        setLoading(true);
        try {
            const [resEquip, resSetores, resLocais, resServicos] = await Promise.all([
                getEquipamentos(),
                getSetores(),
                getLocais(),
                getTiposServico()
            ]);

            const equipamentosOrdenados = resEquip.data.sort((a, b) => a.nome.localeCompare(b.nome));
            setEquipamentos(equipamentosOrdenados);
            setListaSetores(resSetores.data);
            setListaLocais(resLocais.data);
            setTiposServico(resServicos.data);

        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            setMensagem({ tipo: 'erro', texto: 'Falha ao carregar dados do sistema.' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        carregarDadosIniciais();
    }, [carregarDadosIniciais]);

    const exibeMensagemTemporaria = (texto, tipo = 'sucesso') => {
        setMensagem({ tipo, texto });
        setTimeout(() => setMensagem({ tipo: '', texto: '' }), 4000);
    };

    const limparMensagem = () => {
        if (mensagem.texto) setMensagem({ tipo: '', texto: '' });
    };

    const getLocaisFiltrados = (setorId) => {
        if (!setorId) return [];
        return listaLocais.filter(l => l.setorId === Number(setorId));
    };

    const handleNovoEquipamentoChange = (e) => {
        limparMensagem();
        const { name, value } = e.target;
        
        setNovoEquipamento(prev => {
            const newState = { ...prev, [name]: value };
            if (name === 'setorId') {
                newState.localId = '';
            }
            return newState;
        });
    };

    const handleNovoEquipamentoSubmit = (e) => {
        e.preventDefault();
        limparMensagem();
        
        if(!novoEquipamento.setorId) {
            alert("O Setor é obrigatório.");
            return;
        }

        const dadosParaApi = { 
            ...novoEquipamento, 
            descricao: '',
            setorId: Number(novoEquipamento.setorId),
            localId: novoEquipamento.localId ? Number(novoEquipamento.localId) : null
        };

        createEquipamento(dadosParaApi)
            .then(() => {
                exibeMensagemTemporaria('Equipamento criado com sucesso!');
                setNovoEquipamento({ nome: '', tag: '', setorId: '', localId: '' });
                carregarDadosIniciais();
            })
            .catch(error => {
                const msg = error.response?.data?.message || 'Erro ao criar equipamento. Verifique se a Tag é única.';
                exibeMensagemTemporaria(msg, 'erro');
            });
    };

    const handleExcluir = (id) => {
        limparMensagem();
        if (window.confirm('Tem certeza que deseja excluir este equipamento?')) {
            deleteEquipamento(id)
                .then(() => {
                    exibeMensagemTemporaria('Equipamento excluído com sucesso!');
                    carregarDadosIniciais();
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
        setFormEdicao({ 
            tag: equip.tag || '', 
            nome: equip.nome, 
            descricao: equip.descricao || '',
            setorId: equip.setorId || '',
            localId: equip.localId || ''
        });
    };

    const handleEdicaoChange = (e) => {
        const { name, value } = e.target;
        setFormEdicao(prev => {
            const newState = { ...prev, [name]: value };
            if (name === 'setorId') {
                newState.localId = '';
            }
            return newState;
        });
    };

    const handleSalvarEdicao = (id) => {
        limparMensagem();
        
        if(!formEdicao.setorId) {
            alert("O Setor é obrigatório.");
            return;
        }

        updateEquipamento(id, {
            ...formEdicao,
            setorId: Number(formEdicao.setorId),
            localId: formEdicao.localId ? Number(formEdicao.localId) : null
        })
            .then(() => {
                exibeMensagemTemporaria('Equipamento atualizado com sucesso!');
                setEditandoId(null);
                carregarDadosIniciais();
            })
            .catch(error => {
                const msg = error.response?.data?.message || 'Erro ao atualizar. Verifique duplicidade de Tag.';
                exibeMensagemTemporaria(msg, 'erro');
            });
    };

    // --- Handlers dos Modais ---
    const handleOpenServicosModal = (equip) => { setEquipamentoParaModal(equip); setIsModalServicosOpen(true); };
    const handleCloseServicosModal = () => { setIsModalServicosOpen(false); setEquipamentoParaModal(null); };
    const handleOpenProgramacaoModal = (equip) => { setEquipamentoParaProgramacao(equip); setIsProgramacaoModalOpen(true); };
    const handleCloseProgramacaoModal = () => { setIsProgramacaoModalOpen(false); setEquipamentoParaProgramacao(null); };
    const handleOpenHistoricoModal = (equip) => { setEquipamentoParaHistorico(equip); setIsHistoricoModalOpen(true); };
    const handleCloseHistoricoModal = () => { setIsHistoricoModalOpen(false); setEquipamentoParaHistorico(null); };

    if (loading) return <div className="loading-message">Carregando dados...</div>;

    return (
        <div className="gerenciar-equipamentos-container">
            <h1>Gerenciar Equipamentos e Planos</h1>
            {mensagem.texto && <div className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</div>}
            
            <div className="form-card">
                <h2>Cadastrar Novo Equipamento</h2>
                <form onSubmit={handleNovoEquipamentoSubmit} className="form-novo-equipamento">
                    <div>
                        <label>Nome do Equipamento *</label>
                        <input type="text" name="nome" value={novoEquipamento.nome} onChange={handleNovoEquipamentoChange} placeholder="Ex: Empilhadeira 01" required />
                    </div>
                    <div>
                        <label>Número do Ativo (Tag) *</label>
                        <input type="text" name="tag" value={novoEquipamento.tag} onChange={handleNovoEquipamentoChange} placeholder="Ex: PAT-001" required />
                    </div>
                    
                    <div>
                        <label>Setor *</label>
                        <select name="setorId" value={novoEquipamento.setorId} onChange={handleNovoEquipamentoChange} required>
                            <option value="">Selecione...</option>
                            {listaSetores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                        </select>
                    </div>
                    <div>
                        <label>Local (Opcional)</label>
                        <select 
                            name="localId" 
                            value={novoEquipamento.localId} 
                            onChange={handleNovoEquipamentoChange} 
                            disabled={!novoEquipamento.setorId}
                        >
                            <option value="">
                                {!novoEquipamento.setorId ? 'Escolha setor primeiro' : 'Selecione (Opcional)...'}
                            </option>
                            {getLocaisFiltrados(novoEquipamento.setorId).map(l => (
                                <option key={l.id} value={l.id}>{l.nome}</option>
                            ))}
                        </select>
                    </div>

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
                            <th>Setor</th>
                            <th>Local</th>
                            <th>Descrição</th>
                            <th style={{ textAlign: 'right' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {equipamentos.map(equip => (
                            /* ✨ ALTERAÇÃO AQUI: Refatoração do JSX - O 'tr' agora é retornado PELO ternário */
                            editandoId === equip.id ? (
                                <tr key={equip.id} className="row-editing">
                                    <td><input type="text" name="tag" value={formEdicao.tag} onChange={handleEdicaoChange} required /></td>
                                    <td><input type="text" name="nome" value={formEdicao.nome} onChange={handleEdicaoChange} required /></td>
                                    
                                    <td>
                                        <select name="setorId" value={formEdicao.setorId} onChange={handleEdicaoChange} required style={{width: '100%'}}>
                                            <option value="">Selecione...</option>
                                            {listaSetores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                                        </select>
                                    </td>
                                    
                                    <td>
                                        <select 
                                            name="localId" 
                                            value={formEdicao.localId} 
                                            onChange={handleEdicaoChange} 
                                            style={{width: '100%'}} 
                                            disabled={!formEdicao.setorId}
                                        >
                                            <option value="">Selecione (Opcional)...</option>
                                            {getLocaisFiltrados(formEdicao.setorId).map(l => (
                                                <option key={l.id} value={l.id}>{l.nome}</option>
                                            ))}
                                        </select>
                                    </td>
                                    
                                    <td><input type="text" name="descricao" value={formEdicao.descricao} onChange={handleEdicaoChange} /></td>
                                    <td>
                                        <div className="actions-group">
                                            <button onClick={() => handleSalvarEdicao(equip.id)} className="btn-salvar">Salvar</button>
                                            <button onClick={() => setEditandoId(null)} className="btn-cancelar">Cancelar</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={equip.id}>
                                    <td>{equip.tag || '-'}</td>
                                    <td>{equip.nome}</td>
                                    <td>{equip.setorNome || '-'}</td>
                                    <td>{equip.localNome || '-'}</td>
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
                                </tr>
                            )
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modais */}
            {isModalServicosOpen && equipamentoParaModal && (
                <ModalAssociarServicos equipamento={equipamentoParaModal} catalogoServicos={tiposServico} onClose={handleCloseServicosModal} />
            )}
            {isProgramacaoModalOpen && equipamentoParaProgramacao && (
                <ProgramacaoModal equipamento={equipamentoParaProgramacao} onClose={handleCloseProgramacaoModal} />
            )}
            {isHistoricoModalOpen && equipamentoParaHistorico && (
                <HistoricoModal equipamento={equipamentoParaHistorico} onClose={handleCloseHistoricoModal} />
            )}
        </div>
    );
}

export default GerenciarEquipamentosPage;