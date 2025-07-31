import React, { useEffect, useState, useCallback } from 'react';
import {
    getEquipamentos, createEquipamento, updateEquipamento, deleteEquipamento,
    getTiposServico,
    getPlanosPorEquipamento, adicionarPlano, deletarPlano,
    listarServicosPorEquipamento, associarServico, desassociarServico
} from '../../../services/apiService';
import './GerenciarEquipamentosPage.css';

const FREQUENCIA_OPTIONS = ['UNICA', 'DIARIO', 'BIDIARIO', 'SEMANAL', 'QUINZENAL', 'MENSAL', 'BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL'];

const ModalAssociarServicos = ({ equipamento, catalogoServicos, onClose, onUpdate }) => {
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

function GerenciarEquipamentosPage() {
    const [equipamentos, setEquipamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editandoId, setEditandoId] = useState(null);
    
    // ✨ ALTERAÇÃO AQUI: O estado para edição foi ajustado. O campo 'tag' agora representa o 'Número do Ativo'.
    const [formEdicao, setFormEdicao] = useState({ tag: '', nome: '', descricao: '' });

    // ✨ ALTERAÇÃO AQUI: O estado para um novo equipamento agora reflete os campos simplificados.
    const [novoEquipamento, setNovoEquipamento] = useState({ nome: '', descricao: '', tag: '' });

    const [tiposServico, setTiposServico] = useState([]);
    const [selectedEquip, setSelectedEquip] = useState(null);
    const [planos, setPlanos] = useState([]);
    const [loadingPlanos, setLoadingPlanos] = useState(false);
    const [novoPlano, setNovoPlano] = useState({ tipoServicoId: '', frequencia: 'MENSAL', toleranciaDias: 0 });

    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
    const [isModalServicosOpen, setIsModalServicosOpen] = useState(false);
    const [equipamentoParaModal, setEquipamentoParaModal] = useState(null);

    const carregarEquipamentos = useCallback(() => {
        setLoading(true);
        getEquipamentos()
            .then(response => {
                const equipamentosComServicos = response.data.map(eq => ({
                    ...eq,
                    servicosDisponiveis: eq.servicosDisponiveis || []
                }));
                setEquipamentos(equipamentosComServicos);
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
    
    const carregarPlanosEServicos = useCallback((equipamentoId) => {
        setLoadingPlanos(true);
        Promise.all([
            getPlanosPorEquipamento(equipamentoId),
            listarServicosPorEquipamento(equipamentoId)
        ]).then(([planosResp, servicosResp]) => {
            setPlanos(planosResp.data);
            setEquipamentos(prev => prev.map(eq =>
                eq.id === equipamentoId
                    ? { ...eq, servicosDisponiveis: servicosResp.data }
                    : eq
            ));
        }).catch(err => {
            console.error("Erro ao carregar planos ou serviços:", err);
            setMensagem({ tipo: 'erro', texto: 'Falha ao carregar detalhes do equipamento.' });
        }).finally(() => {
            setLoadingPlanos(false);
        });
    }, []);

    const exibeMensagemTemporaria = (texto, tipo = 'sucesso') => {
        setMensagem({ tipo, texto });
        if (tipo === 'sucesso') {
            setTimeout(() => setMensagem({ tipo: '', texto: '' }), 4000);
        }
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

        // ✅ CORREÇÃO: Prepara o objeto para a API. O campo 'tag' representa o Número do Ativo.
        const dadosParaApi = {
            nome: novoEquipamento.nome,
            descricao: novoEquipamento.descricao,
            tag: novoEquipamento.tag // O campo 'tag' é enviado, mesmo que vazio.
        };

        createEquipamento(dadosParaApi)
            .then(() => {
                exibeMensagemTemporaria('Equipamento criado com sucesso!');
                // ✅ CORREÇÃO: Limpa o formulário para o estado inicial correto.
                setNovoEquipamento({ nome: '', descricao: '', tag: '' });
                carregarEquipamentos();
            })
            .catch(error => {
                console.error("Erro ao criar equipamento:", error.response);
                const msg = error.response?.data?.message || 'Erro ao criar equipamento. Verifique os dados.';
                exibeMensagemTemporaria(msg, 'erro');
            });
    };

    const handleExcluir = (id) => {
        limparMensagem();
        if (window.confirm('Tem certeza que deseja excluir este equipamento? Esta ação não pode ser desfeita.')) {
            deleteEquipamento(id)
                .then(() => {
                    exibeMensagemTemporaria('Equipamento excluído com sucesso!');
                    carregarEquipamentos();
                    setSelectedEquip(null);
                })
                .catch(error => {
                    console.error("LOG DE ERRO DO AXIOS:", error.response);
                    const mensagemErro = error.response?.data?.message || 'Ocorreu uma falha ao tentar excluir.';
                    exibeMensagemTemporaria(mensagemErro, 'erro');
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
                console.error("Erro ao atualizar equipamento:", error.response);
                const msg = error.response?.data?.message || 'Erro ao atualizar equipamento.';
                exibeMensagemTemporaria(msg, 'erro');
            });
    };

    const handleSelectEquipamento = (equip) => {
        if (editandoId === equip.id) return; 
        limparMensagem();
        if (selectedEquip?.id === equip.id) {
            setSelectedEquip(null);
            setPlanos([]);
        } else {
            setSelectedEquip(equip);
            carregarPlanosEServicos(equip.id);
        }
    };

    const handleOpenServicosModal = (equipamento) => {
        limparMensagem();
        setEquipamentoParaModal(equipamento);
        setIsModalServicosOpen(true);
    };

    const handleCloseServicosModal = () => {
        setIsModalServicosOpen(false);
        if (equipamentoParaModal && selectedEquip && equipamentoParaModal.id === selectedEquip.id) {
            carregarPlanosEServicos(selectedEquip.id);
        }
        setEquipamentoParaModal(null);
    };

    if (loading) return <div className="loading-message">Carregando equipamentos...</div>;

    return (
        <div className="gerenciar-equipamentos-container">
            <h1>Gerenciar Equipamentos e Planos</h1>
            {mensagem.texto && <div className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</div>}
            <div className="form-card">
                <h2>Cadastrar Novo Equipamento</h2>
                {/* ✨ ALTERAÇÃO AQUI: Formulário de cadastro simplificado */}
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
                            {/* ✨ ALTERAÇÃO AQUI: A coluna "TAG" agora é "Nº do Ativo" */}
                            <th>Nº do Ativo</th>
                            <th>Nome</th>
                            <th>Descrição</th>
                            <th style={{ textAlign: 'right' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {equipamentos.map(equip => (
                             <tr key={equip.id} onClick={() => handleSelectEquipamento(equip)} className={selectedEquip?.id === equip.id ? 'selected-row' : ''}>
                                {editandoId === equip.id ? (
                                    <>
                                        {/* ✨ ALTERAÇÃO AQUI: Campo de edição para o Nº do Ativo (antigo TAG) */}
                                        <td><input type="text" name="tag" value={formEdicao.tag} onChange={handleEdicaoChange} onClick={e => e.stopPropagation()} placeholder="Nº do Ativo (Opcional)" /></td>
                                        <td><input type="text" name="nome" value={formEdicao.nome} onChange={handleEdicaoChange} onClick={e => e.stopPropagation()} required /></td>
                                        <td><input type="text" name="descricao" value={formEdicao.descricao} onChange={handleEdicaoChange} onClick={e => e.stopPropagation()} required/></td>
                                        <td onClick={e => e.stopPropagation()} style={{ textAlign: 'right' }}>
                                            <button onClick={() => handleSalvarEdicao(equip.id)} className="btn-salvar">Salvar</button>
                                            <button onClick={() => setEditandoId(null)} className="btn-cancelar">Cancelar</button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        {/* O campo `equip.tag` continua vindo do backend, mas agora representa o Nº do Ativo */}
                                        <td>{equip.tag}</td>
                                        <td>{equip.nome}</td>
                                        <td>{equip.descricao}</td>
                                        <td onClick={e => e.stopPropagation()} style={{ textAlign: 'right' }}>
                                            <button onClick={() => handleOpenServicosModal(equip)} className="btn-servicos">Serviços</button>
                                            <button onClick={() => handleEditarClick(equip)} className="btn-editar">Editar</button>
                                            <button onClick={() => handleExcluir(equip.id)} className="btn-excluir">Excluir</button>
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
                    onUpdate={() => carregarPlanosEServicos(equipamentoParaModal.id)}
                />
            )}
        </div>
    );
}

export default GerenciarEquipamentosPage;