// Local: osmanager-frontend/src/components/ExecucaoModal.jsx
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

function ExecucaoModal({ isOpen, onClose, onFinalizar, onSalvarRelatorio, os, actionLoading, isReportLoading }) {
    // --- Estados para a FINALIZAÇÃO da OS ---
    const [acaoRealizada, setAcaoRealizada] = useState(os?.acaoRealizada || '');
    const [pecasSubstituidas, setPecasSubstituidas] = useState(os?.pecasSubstituidas?.length > 0 ? os.pecasSubstituidas : [{ nomePeca: '', quantidade: 1 }]);
    const [inicio, setInicio] = useState(() => toInputDateTimeFormat(os?.inicio || new Date().toISOString()));
    const [termino, setTermino] = useState(toInputDateTimeFormat(os?.termino || ''));
    const [trocaPecas, setTrocaPecas] = useState(os?.trocaPecas ?? null);
    const [motivoTrocaPeca, setMotivoTrocaPeca] = useState('');
    const [fimDowntime, setFimDowntime] = useState(() => toInputDateTimeFormat(new Date().toISOString()));

    // --- Estados do Checklist de Preventiva ---
    const [servicosDoEquipamento, setServicosDoEquipamento] = useState([]);
    const [loadingServicos, setLoadingServicos] = useState(false);
    const [servicoStatus, setServicoStatus] = useState({});

    // --- Estados do Relatório Parcial / Pausa ---
    const [relatorioDescricao, setRelatorioDescricao] = useState('');
    const [relatorioMotivoPausa, setRelatorioMotivoPausa] = useState('');
    const [relatorioMinutosPausa, setRelatorioMinutosPausa] = useState(''); 
    const [relatorioMinutosTrabalhados, setRelatorioMinutosTrabalhados] = useState('');

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
        if (!isOpen) return; // ✅ PROTEÇÃO: Não executa lógica se fechado

        if (!inicio) {
            setInicio(toInputDateTimeFormat(new Date().toISOString()));
        }
        
        // ✅ CORREÇÃO TELA BRANCA: Uso de Optional Chaining (os?.)
        if (os?.fimDowntime) {
            setFimDowntime(toInputDateTimeFormat(os.fimDowntime));
        } else {
             setFimDowntime(toInputDateTimeFormat(new Date().toISOString()));
        }
    }, [isOpen, inicio, os?.fimDowntime]); // ✅ Dependência segura

    if (!isOpen) return null;

    const handlePecaChange = (index, field, value) => {
        const novasPecas = [...pecasSubstituidas];
        novasPecas[index][field] = value;
        setPecasSubstituidas(novasPecas);
    };

    const adicionarPeca = () => {
        setPecasSubstituidas([...pecasSubstituidas, { nomePeca: '', quantidade: 1 }]);
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

    const handleSalvarTrabalho = async () => {
        const minutosTrabalhados = Number(relatorioMinutosTrabalhados) || 0;

        if (!relatorioDescricao.trim() && minutosTrabalhados <= 0) {
            alert('Preencha o "Relatório" e/ou os "Minutos Trabalhados".');
            return;
        }

        const dadosRelatorio = {
            descricao: relatorioDescricao,
            minutosTrabalhados: minutosTrabalhados,
            motivoPausa: '',
            minutosPausa: 0, 
            ordemServicoId: os.id,
        };

        // Verifica se a função existe antes de chamar
        if (onSalvarRelatorio) {
            await onSalvarRelatorio(dadosRelatorio, () => {
                setRelatorioDescricao('');
                setRelatorioMinutosTrabalhados('');
            });
        } else {
            console.error("Função onSalvarRelatorio não fornecida pelo pai.");
        }
    };

    const handleSalvarPausa = async () => {
        const minutosPausa = Number(relatorioMinutosPausa) || 0;

        if (!relatorioMotivoPausa.trim() || minutosPausa <= 0) {
            alert('Para registrar uma pausa, preencha o "Motivo da Pausa" e os "Minutos de Pausa".');
            return;
        }

        const dadosRelatorio = {
            descricao: '',
            minutosTrabalhados: 0,
            motivoPausa: relatorioMotivoPausa,
            minutosPausa: minutosPausa, 
            ordemServicoId: os.id,
        };

        if (onSalvarRelatorio) {
            await onSalvarRelatorio(dadosRelatorio, () => {
                setRelatorioMotivoPausa('');
                setRelatorioMinutosPausa('');
            });
        }
    };

    const handleFinalizacao = async (statusFinal) => {
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
                const { status, motivo } = servicoStatus[servico.id] || { status: 'NÃO MARCADO', motivo: ''}; 
                if (status === 'NÃO REALIZADO' && motivo) {
                    return `- ${servico.nome}: ${status} (Motivo: ${motivo})`;
                }
                return `- ${servico.nome}: ${status || 'NÃO MARCADO'}`;
            }).join('\n');
        }
        
        if (statusFinal === 'CONCLUIDA' && (!acaoFinalFormatada.trim() || !inicio || !termino)) {
            alert("Para concluir, preencha a Ação Realizada (ou o checklist) e as datas de Início e Término.");
            return;
        }

        if (statusFinal === 'CONCLUIDA' && os.maquinaParada && !fimDowntime) {
             alert("Esta OS foi marcada com 'Máquina Parada'. Por favor, informe a data e hora que a máquina voltou a funcionar.");
            return;
        }

        const dados = {
            acaoRealizada: acaoFinalFormatada,
            trocaPecas,
            pecasSubstituidas: trocaPecas ? pecasSubstituidas.filter(p => p.nomePeca && p.nomePeca.trim()) : [],
            inicio,
            termino,
            motivoTrocaPeca: trocaPecas ? motivoTrocaPeca : null,
            statusFinal,
            fimDowntime: os.maquinaParada ? fimDowntime : null,
        };
        
        if (onFinalizar) {
            await onFinalizar(dados);
        }
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
            <textarea 
                className="acao-realizada-textarea"
                rows="4" 
                value={acaoRealizada} 
                onChange={(e) => setAcaoRealizada(e.target.value)} 
                placeholder="Descreva a solução final aplicada..."
            />
        );
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Registrar Execução da OS: #{os.codigoOs}</h2>
                <div className="form-container">
                    
                    <div className="form-group">
                        <label>Ação Realizada (Solução Final):</label>
                        {renderAcaoRealizada()}
                    </div>
                    <div className="form-group-inline">
                        <div className="form-group"><label>Início da Execução:</label><input type="datetime-local" value={inicio} onChange={(e) => setInicio(e.target.value)} required /></div>
                        <div className="form-group"><label>Término da Execução (Conclusão):</label><input type="datetime-local" value={termino} onChange={(e) => setTermino(e.target.value)} /></div>
                    </div>
                    
                    {os.maquinaParada && (
                         <div className="form-group-inline downtime-section">
                            <div className="form-group downtime-info">
                                <label>Máquina Parou em:</label>
                                <input type="datetime-local" value={toInputDateTimeFormat(os.inicioDowntime)} disabled />
                            </div>
                            <div className="form-group">
                                <label>Máquina Voltou (Fim da Parada):</label>
                                <input 
                                    type="datetime-local" 
                                    value={fimDowntime} 
                                    onChange={(e) => setFimDowntime(e.target.value)} 
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
                                        <input type="text" placeholder="Nome da Peça" value={peca.nomePeca || ''} onChange={(e) => handlePecaChange(index, 'nomePeca', e.target.value)} />
                                        <input type="number" placeholder="Qtd" value={peca.quantidade} min="1" onChange={(e) => handlePecaChange(index, 'quantidade', parseInt(e.target.value, 10) || 1)} />
                                    </div>
                                ))}
                                <button type="button" onClick={adicionarPeca} className="add-peca-btn" disabled={actionLoading}>Adicionar Peça</button>
                            </div>
                        </>
                    )}
                    
                    <div className="acompanhamento-container">
                        
                        <div className="relatorio-trabalho-section">
                            <h3>Registrar Relatório Diário</h3>
                            <p className="section-desc">Registre o que foi feito hoje.</p>
                            
                            <div className="form-group">
                                <label>O que foi feito?</label>
                                <textarea 
                                    rows="3" 
                                    value={relatorioDescricao} 
                                    onChange={(e) => setRelatorioDescricao(e.target.value)}
                                    placeholder="Ex: Desmontagem iniciada..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Minutos Trabalhados</label>
                                <input
                                    type="number"
                                    value={relatorioMinutosTrabalhados}
                                    onChange={(e) => setRelatorioMinutosTrabalhados(e.target.value)}
                                    placeholder="Ex: 120"
                                    min="0"
                                />
                            </div>
                            <button 
                                type="button" 
                                onClick={handleSalvarTrabalho} 
                                className="action-button-modal report-btn" 
                                disabled={isReportLoading || actionLoading} 
                            >
                                {isReportLoading ? 'Salvando...' : 'Salvar Relatório'}
                            </button>
                        </div>

                        <div className="relatorio-pausa-section">
                            <h3>Registrar Pausa</h3>
                            <p className="section-desc">Registre paradas (almoço, espera).</p>
                            
                            <div className="form-group">
                                <label>Motivo da Pausa</label>
                                <textarea 
                                    rows="3" 
                                    value={relatorioMotivoPausa} 
                                    onChange={(e) => setRelatorioMotivoPausa(e.target.value)}
                                    placeholder="Ex: Aguardando peças..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Minutos de Pausa</label>
                                <input
                                    type="number"
                                    value={relatorioMinutosPausa}
                                    onChange={(e) => setRelatorioMinutosPausa(e.target.value)}
                                    placeholder="Ex: 60"
                                    min="0"
                                />
                            </div>
                            <button 
                                type="button" 
                                onClick={handleSalvarPausa} 
                                className="action-button-modal pausa-btn" 
                                disabled={isReportLoading || actionLoading} 
                            >
                                {isReportLoading ? 'Salvando...' : 'Salvar Pausa'}
                            </button>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="action-button-modal cancel-btn" disabled={actionLoading || isReportLoading}>
                            Voltar
                        </button>
                        
                        <button type="button" onClick={() => handleFinalizacao('CONCLUIDA')} className="action-button-modal success-btn" disabled={actionLoading || isReportLoading}>
                           {actionLoading ? 'Finalizando...' : 'Concluir OS'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExecucaoModal;