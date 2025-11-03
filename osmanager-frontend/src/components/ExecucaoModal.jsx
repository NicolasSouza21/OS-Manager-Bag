import React, { useState, useEffect } from 'react';
import { listarServicosPorEquipamento } from '../services/apiService';
import './ExecucaoModal.css';

const toInputDateTimeFormat = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - userTimezoneOffset);
    return localDate.toISOString().slice(0, 16);
};

function ExecucaoModal({ isOpen, onClose, onSubmit, os, actionLoading }) {
    const [acaoRealizada, setAcaoRealizada] = useState(os?.acaoRealizada || '');
    const [pecasSubstituidas, setPecasSubstituidas] = useState(os?.pecasSubstituidas?.length > 0 ? os.pecasSubstituidas : [{ nome: '', quantidade: 1 }]);
    const [inicio, setInicio] = useState(() => toInputDateTimeFormat(os?.inicio || new Date().toISOString()));
    const [termino, setTermino] = useState(toInputDateTimeFormat(os?.termino || ''));

    // ✨ ALTERAÇÃO AQUI: 'maquinaParada' e 'motivoMaquinaParada' foram removidos.
    // O 'os.maquinaParada' (vindo do banco) agora é a nossa fonte da verdade.
    const [trocaPecas, setTrocaPecas] = useState(os?.trocaPecas ?? null);
    const [motivoTrocaPeca, setMotivoTrocaPeca] = useState('');
    
    // ✨ ALTERAÇÃO AQUI: Novo estado para a data/hora que a máquina voltou.
    // Inicia com a hora atual, que é uma suposição razoável para o término.
    const [fimDowntime, setFimDowntime] = useState(() => toInputDateTimeFormat(new Date().toISOString()));

    const [servicosDoEquipamento, setServicosDoEquipamento] = useState([]);
    const [loadingServicos, setLoadingServicos] = useState(false);
    const [servicoStatus, setServicoStatus] = useState({});

    useEffect(() => {
        if (isOpen && os?.tipoManutencao === 'PREVENTIVA' && os?.equipamentoId) {
            setLoadingServicos(true);
            listarServicosPorEquipamento(os.equipamentoId)
                .then(response => {
                    const servicos = response.data || [];
                    setServicosDoEquipamento(servicos);
                    
                    const initialStatus = {};
                    servicos.forEach(servico => {
                        initialStatus[servico.id] = { status: null, motivo: '' }; 
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
        
        // ✨ ALTERAÇÃO AQUI: Se a OS já tem um fimDowntime, preenche o estado
        if (os.fimDowntime) {
            setFimDowntime(toInputDateTimeFormat(os.fimDowntime));
        } else {
             setFimDowntime(toInputDateTimeFormat(new Date().toISOString()));
        }

    }, [inicio, os.fimDowntime]); // Adiciona dependencia

    if (!isOpen) return null;

    const handlePecaChange = (index, field, value) => {
        const novasPecas = [...pecasSubstituidas];
        novasPecas[index][field] = value;
        setPecasSubstituidas(novasPecas);
    };

    const adicionarPeca = () => {
        setPecasSubstituidas([...pecasSubstituidas, { nome: '', quantidade: 1 }]);
    };

    const handleStatusChange = (servicoId, newStatus) => {
        setServicoStatus(prev => ({
            ...prev,
            [servicoId]: { ...prev[servicoId], status: newStatus }
        }));
    };

    const handleMotivoChange = (servicoId, motivo) => {
        setServicoStatus(prev => ({
            ...prev,
            [servicoId]: { ...prev[servicoId], motivo: motivo }
        }));
    };

    const handleFinalizacao = async (statusFinal) => {
        // ✨ ALTERAÇÃO AQUI: Validação do 'maquinaParada' foi removida
        if (statusFinal === 'CONCLUIDA' && (trocaPecas === null)) {
            alert('Por favor, selecione "Sim" ou "Não" para "Houve Troca de Peças".');
            return;
        }

        let acaoFinalFormatada = acaoRealizada;

        if (os.tipoManutencao === 'PREVENTIVA') {
            const todosMarcados = servicosDoEquipamento.every(
                (servico) => servicoStatus[servico.id] && servicoStatus[servico.id].status !== null
            );

            if (!todosMarcados && statusFinal === 'CONCLUIDA') {
                alert("Para concluir, todos os serviços devem ser marcados como 'Realizado' ou 'Não Realizado'.");
                return;
            }
            
            acaoFinalFormatada = servicosDoEquipamento.map(servico => {
                const { status, motivo } = servicoStatus[servico.id] || { status: 'NÃO MARCADO', motivo: ''}; // Garante que status exista
                if (status === 'NÃO REALIZADO' && motivo) {
                    return `- ${servico.nome}: ${status} (Motivo: ${motivo})`;
                }
                return `- ${servico.nome}: ${status || 'NÃO MARCADO'}`;
            }).join('\n');
        }
        
        if (statusFinal === 'CONCLUIDA' && (!acaoFinalFormatada || !inicio || !termino)) {
            alert("Para concluir, preencha a Ação Realizada (ou o checklist) e as datas de Início e Término.");
            return;
        }

        // ✨ ALTERAÇÃO AQUI: Validação do 'fimDowntime'
        if (statusFinal === 'CONCLUIDA' && os.maquinaParada && !fimDowntime) {
             alert("Esta OS foi marcada com 'Máquina Parada'. Por favor, informe a data e hora que a máquina voltou a funcionar.");
            return;
        }


        // ✨ ALTERAÇÃO AQUI: Objeto de dados atualizado para o novo DTO
        const dados = {
            acaoRealizada: acaoFinalFormatada,
            trocaPecas,
            pecasSubstituidas: trocaPecas ? pecasSubstituidas.filter(p => p.nome.trim()) : [],
            inicio,
            termino,
            motivoTrocaPeca: trocaPecas ? motivoTrocaPeca : null,
            statusFinal,
            // Envia o 'fimDowntime' apenas se a máquina estava parada
            fimDowntime: os.maquinaParada ? fimDowntime : null, 
        };
        
        await onSubmit(dados);
    };

    const renderAcaoRealizada = () => {
        if (os.tipoManutencao === 'PREVENTIVA') {
            if (loadingServicos) return <p>Carregando checklist de serviços...</p>;
            if (servicosDoEquipamento.length === 0) return <p>Nenhum serviço de preventiva cadastrado para este equipamento.</p>;
            
            return (
                <div className="servico-checklist-container">
                    {servicosDoEquipamento.map(servico => {
                        const statusInfo = servicoStatus[servico.id] || { status: null, motivo: '' };
                        const isNaoRealizado = statusInfo.status === 'NÃO REALIZADO';
                        
                        return (
                            <div key={servico.id} className="servico-checklist-wrapper">
                                <div className="servico-checklist-item">
                                    <span className="servico-nome">{servico.nome}</span>
                                    <div className="servico-opcoes">
                                        <label><input type="radio" name={`servico-${servico.id}`} checked={statusInfo.status === 'REALIZADO'} onChange={() => handleStatusChange(servico.id, 'REALIZADO')} /> Realizado</label>
                                        <label><input type="radio" name={`servico-${servico.id}`} checked={isNaoRealizado} onChange={() => handleStatusChange(servico.id, 'NÃO REALIZADO')} /> Não Realizado</label>
                                    </div>
                                </div>
                                {isNaoRealizado && (
                                    <div className="servico-motivo-container">
                                        <textarea
                                            className="motivo-textarea"
                                            rows="2"
                                            placeholder="Motivo (obrigatório)"
                                            value={statusInfo.motivo}
                                            onChange={(e) => handleMotivoChange(servico.id, e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            );
        }

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
                        {renderAcaoRealizada()}
                    </div>
                    <div className="form-group-inline">
                        <div className="form-group"><label>Início da Execução:</label><input type="datetime-local" value={inicio} onChange={(e) => setInicio(e.target.value)} required /></div>
                        <div className="form-group"><label>Término da Execução:</label><input type="datetime-local" value={termino} onChange={(e) => setTermino(e.target.value)} required /></div>
                    </div>
                    
                    {/* ✨ ALTERAÇÃO AQUI: Seção de "Máquina Parada" removida daqui */}
                    {/* <div className="form-group"> ... (bloco removido) ... </div>
                    {maquinaParada && ( ... (bloco removido) ... )}
                    */}

                    {/* ✨ ALTERAÇÃO AQUI: Novo campo condicional para FIM do Downtime */}
                    {/* Ele só aparece se a OS foi marcada como 'maquinaParada' na criação */}
                    {os.maquinaParada && (
                         <div className="form-group-inline downtime-section">
                            <div className="form-group downtime-info">
                                <label>Máquina Parou em:</label>
                                <input type="datetime-local" value={toInputDateTimeFormat(os.inicioDowntime)} disabled />
                            </div>
                            <div className="form-group">
                                <label>Máquina Voltou (data/hora):</label>
                                <input 
                                    type="datetime-local" 
                                    value={fimDowntime} 
                                    onChange={(e) => setFimDowntime(e.target.value)} 
                                    required 
                                />
                            </div>
                        </div>
                    )}


                    <div className="form-group">
                        <label>Houve Troca de Peças?</label>
                        <div className="radio-group-container">
                            <label><input type="radio" name="trocaPecas" checked={trocaPecas === true} onChange={() => setTrocaPecas(true)} /> Sim</label>
                            <label><input type="radio" name="trocaPecas" checked={trocaPecas === false} onChange={() => setTrocaPecas(false)} /> Não</label>
                        </div>
                    </div>
                    {trocaPecas && (
                        <>
                            <div className="form-group motivo-explicacao">
                                <label htmlFor="motivoTrocaPeca">Por que as peças foram trocadas?</label>
                                <textarea id="motivoTrocaPeca" rows="2" value={motivoTrocaPeca} onChange={(e) => setMotivoTrocaPeca(e.target.value)} />
                            </div>
                            <div className="pecas-section">
                                <h4>Peças Substituídas</h4>
                                {pecasSubstituidas.map((peca, index) => (
                                    <div key={index} className="peca-item">
                                        <input type="text" placeholder="Nome da Peça" value={peca.nome} onChange={(e) => handlePecaChange(index, 'nome', e.target.value)} />
                                        <input type="number" placeholder="Qtd" value={peca.quantidade} min="1" onChange={(e) => handlePecaChange(index, 'quantidade', parseInt(e.target.value, 10) || 1)} />
                                    </div>
                                ))}
                                <button type="button" onClick={adicionarPeca} className="add-peca-btn" disabled={actionLoading}>Adicionar Peça</button>
                            </div>
                        </>
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