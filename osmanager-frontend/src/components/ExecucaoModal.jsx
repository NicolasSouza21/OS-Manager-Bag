import React, { useState, useEffect } from 'react';
// ✨ ALTERAÇÃO AQUI: Importa a função para buscar os serviços associados a um equipamento
import { listarServicosPorEquipamento } from '../services/apiService';
import './ExecucaoModal.css';

// Função para formatar a data para o input datetime-local (sem alterações)
const toInputDateTimeFormat = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - userTimezoneOffset);
    return localDate.toISOString().slice(0, 16);
};


function ExecucaoModal({ isOpen, onClose, onSubmit, os, actionLoading }) {
    // States existentes (sem alterações)
    const [acaoRealizada, setAcaoRealizada] = useState(os?.acaoRealizada || '');
    const [trocaPecas, setTrocaPecas] = useState(os?.trocaPecas || false);
    const [pecasSubstituidas, setPecasSubstituidas] = useState(os?.pecasSubstituidas?.length > 0 ? os.pecasSubstituidas : [{ nome: '', quantidade: 1 }]);
    const [inicio, setInicio] = useState(() => toInputDateTimeFormat(os?.inicio || new Date().toISOString()));
    const [termino, setTermino] = useState(toInputDateTimeFormat(os?.termino || ''));
    const [maquinaParada, setMaquinaParada] = useState(os?.maquinaParada || false);

    // ✨ ALTERAÇÃO AQUI: Novos states para controlar o checklist da preventiva
    const [servicosDoEquipamento, setServicosDoEquipamento] = useState([]);
    const [loadingServicos, setLoadingServicos] = useState(false);
    const [servicoStatus, setServicoStatus] = useState({}); // Ex: { 'servicoId-1': 'REALIZADO', 'servicoId-2': 'NAO_REALIZADO' }

    // ✨ ALTERAÇÃO AQUI: Efeito que busca os serviços do equipamento quando o modal de uma OS PREVENTIVA é aberto
    useEffect(() => {
        if (isOpen && os?.tipoManutencao === 'PREVENTIVA' && os?.equipamentoId) {
            setLoadingServicos(true);
            listarServicosPorEquipamento(os.equipamentoId)
                .then(response => {
                    const servicos = response.data || [];
                    setServicosDoEquipamento(servicos);
                    // Inicializa o estado de status para cada serviço como não marcado (null)
                    const initialStatus = {};
                    servicos.forEach(servico => {
                        initialStatus[servico.id] = null; 
                    });
                    setServicoStatus(initialStatus);
                })
                .catch(err => {
                    console.error("Erro ao buscar serviços para o checklist:", err);
                    setServicosDoEquipamento([]);
                })
                .finally(() => {
                    setLoadingServicos(false);
                });
        }
    }, [isOpen, os]);


    useEffect(() => {
        if (!inicio) {
            setInicio(toInputDateTimeFormat(new Date().toISOString()));
        }
    }, [inicio]);


    if (!isOpen) return null;

    const handlePecaChange = (index, field, value) => {
        const novasPecas = [...pecasSubstituidas];
        novasPecas[index][field] = value;
        setPecasSubstituidas(novasPecas);
    };

    const adicionarPeca = () => {
        setPecasSubstituidas([...pecasSubstituidas, { nome: '', quantidade: 1 }]);
    };

    // ✨ ALTERAÇÃO AQUI: Nova função para atualizar o status de um serviço no checklist
    const handleStatusChange = (servicoId, status) => {
        setServicoStatus(prevStatus => ({
            ...prevStatus,
            [servicoId]: status
        }));
    };

    const handleFinalizacao = async (statusFinal) => {
        // ✨ ALTERAÇÃO AQUI: Variável para armazenar o texto final da ação realizada
        let acaoFinalFormatada = acaoRealizada;

        // Se for PREVENTIVA, montamos a descrição a partir do checklist
        if (os.tipoManutencao === 'PREVENTIVA') {
            const todosMarcados = servicosDoEquipamento.every(
                servico => servicoStatus[servico.id] !== null
            );

            if (!todosMarcados && statusFinal === 'CONCLUIDA') {
                alert("Para concluir uma preventiva, todos os serviços do checklist devem ser marcados como 'Realizado' ou 'Não Realizado'.");
                return;
            }

            // Transforma o objeto de status em uma string formatada
            acaoFinalFormatada = servicosDoEquipamento.map(servico => {
                const status = servicoStatus[servico.id] || 'NÃO MARCADO';
                return `- ${servico.nome}: ${status}`;
            }).join('\n');
        }
        
        // Validações básicas
        if (statusFinal === 'CONCLUIDA' && (!acaoFinalFormatada || !inicio || !termino)) {
            alert("Para concluir, preencha a Ação Realizada (ou o checklist) e as datas de Início e Término.");
            return;
        }

        if (os.tipoManutencao === 'PREVENTIVA' && os.dataInicioPreventiva) {
            const dataInicioSelecionada = new Date(inicio);
            const dataProgramada = new Date(os.dataInicioPreventiva);
            dataProgramada.setSeconds(0, 0);
            dataInicioSelecionada.setSeconds(0, 0);

            if (dataInicioSelecionada < dataProgramada) {
                alert(`A data de início não pode ser anterior à data programada da preventiva (${dataProgramada.toLocaleDateString('pt-BR')}).`);
                return;
            }
        }

        const dados = {
            // ✨ ALTERAÇÃO AQUI: Enviamos a string formatada do checklist ou o texto da corretiva
            acaoRealizada: acaoFinalFormatada,
            trocaPecas,
            pecasSubstituidas: trocaPecas ? pecasSubstituidas.filter(p => p.nome.trim()) : [],
            inicio,
            termino,
            maquinaParada,
            statusFinal,
        };
        
        await onSubmit(dados);
    };

    // ✨ ALTERAÇÃO AQUI: Função que renderiza o checklist ou o textarea, dependendo do tipo de OS
    const renderAcaoRealizada = () => {
        if (os.tipoManutencao === 'PREVENTIVA') {
            if (loadingServicos) {
                return <p>Carregando checklist de serviços...</p>;
            }
            if (servicosDoEquipamento.length === 0) {
                return <p>Nenhum serviço de preventiva cadastrado para este equipamento. Adicione no painel de gerenciamento.</p>;
            }
            // Renderiza a lista de serviços com opções
            return (
                <div className="servico-checklist-container">
                    {servicosDoEquipamento.map(servico => (
                        <div key={servico.id} className="servico-checklist-item">
                            <span className="servico-nome">{servico.nome}</span>
                            <div className="servico-opcoes">
                                <label>
                                    <input
                                        type="radio"
                                        name={`servico-${servico.id}`}
                                        checked={servicoStatus[servico.id] === 'REALIZADO'}
                                        onChange={() => handleStatusChange(servico.id, 'REALIZADO')}
                                    />
                                    Realizado
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name={`servico-${servico.id}`}
                                        checked={servicoStatus[servico.id] === 'NÃO REALIZADO'}
                                        onChange={() => handleStatusChange(servico.id, 'NÃO REALIZADO')}
                                    />
                                    Não Realizado
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        // Se for CORRETIVA, continua mostrando o textarea como antes
        return (
            <textarea rows="4" value={acaoRealizada} onChange={(e) => setAcaoRealizada(e.target.value)} required />
        );
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Registrar Execução da OS: #{os.codigoOs}</h2>
                <div className="form-container">
                    <div className="form-group">
                        <label>Ação Realizada:</label>
                        {/* ✨ ALTERAÇÃO AQUI: O conteúdo aqui agora é dinâmico */}
                        {renderAcaoRealizada()}
                    </div>
                    <div className="form-group-inline">
                        <div className="form-group">
                            <label>Início:</label>
                            <input type="datetime-local" value={inicio} onChange={(e) => setInicio(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Término:</label>
                            <input type="datetime-local" value={termino} onChange={(e) => setTermino(e.target.value)} required />
                        </div>
                    </div>
                    <div className="form-group checkbox-group">
                        <input type="checkbox" id="maquinaParada" checked={maquinaParada} onChange={(e) => setMaquinaParada(e.target.checked)} />
                        <label htmlFor="maquinaParada">Máquina Parada?</label>
                    </div>
                    <div className="form-group checkbox-group">
                        <input type="checkbox" id="trocaPecas" checked={trocaPecas} onChange={(e) => setTrocaPecas(e.target.checked)} />
                        <label htmlFor="trocaPecas">Houve Troca de Peças?</label>
                    </div>

                    {trocaPecas && (
                        <div className="pecas-section">
                            <h4>Peças Substituídas</h4>
                            {pecasSubstituidas.map((peca, index) => (
                                <div key={index} className="peca-item">
                                    <input type="text" placeholder="Nome da Peça" value={peca.nome} onChange={(e) => handlePecaChange(index, 'nome', e.target.value)} />
                                    <input type="number" placeholder="Qtd" value={peca.quantidade} min="1" onChange={(e) => handlePecaChange(index, 'quantidade', e.target.value)} />
                                </div>
                            ))}
                            <button type="button" onClick={adicionarPeca} className="add-peca-btn" disabled={actionLoading}>Adicionar Peça</button>
                        </div>
                    )}
                    
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="action-button-modal cancel-btn" disabled={actionLoading}>
                            Voltar
                        </button>
                        
                        {os.tipoManutencao !== 'PREVENTIVA' && (
                            <button type="button" onClick={() => handleFinalizacao('CANCELADA')} className="action-button-modal danger-btn" disabled={actionLoading}>
                                {actionLoading ? 'Salvando...' : 'Cancelar OS'}
                            </button>
                        )}

                        <button type="button" onClick={() => handleFinalizacao('CONCLUIDA')} className="action-button-modal success-btn" disabled={actionLoading}>
                           {actionLoading ? 'Salvando...' : 'Concluir OS'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExecucaoModal;