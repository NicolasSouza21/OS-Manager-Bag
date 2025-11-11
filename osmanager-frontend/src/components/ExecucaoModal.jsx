// Local: osmanager-frontend/src/components/ExecucaoModal.jsx

// ✨ ALTERAÇÃO AQUI: 'getAllFuncionarios' não é mais necessário
import React, { useState, useEffect } from 'react';
import { listarServicosPorEquipamento, criarAcompanhamento } from '../services/apiService';
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
    // ✨ ALTERAÇÃO AQUI: Campos unificados de relatório/pausa
    const [relatorioDescricao, setRelatorioDescricao] = useState('');
    const [relatorioMotivoPausa, setRelatorioMotivoPausa] = useState('');
    const [relatorioMinutosPausa, setRelatorioMinutosPausa] = useState(''); 
    const [relatorioMinutosTrabalhados, setRelatorioMinutosTrabalhados] = useState('');
    
    // ✨ ALTERAÇÃO AQUI: Estados da Equipe de Execução REMOVIDOS
    // (A lógica agora é automática no backend)


    // ... (useEffect para carregar serviços da preventiva, não modificado) ...
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

    // ... (useEffect para preencher datas, não modificado) ...
    useEffect(() => {
        if (!inicio) {
            setInicio(toInputDateTimeFormat(new Date().toISOString()));
        }
        
        if (os.fimDowntime) {
            setFimDowntime(toInputDateTimeFormat(os.fimDowntime));
        } else {
             setFimDowntime(toInputDateTimeFormat(new Date().toISOString()));
        }

    }, [inicio, os.fimDowntime]);

    if (!isOpen) return null;

    // ... (funções handlePecaChange, adicionarPeca, handleStatusChange, handleMotivoChange, não modificadas) ...
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

    // ✨ ALTERAÇÃO AQUI: Funções de salvar relatório/pausa separadas

    /**
     * Salva um relatório de TRABALHO (o que foi feito + minutos gastos)
     */
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

        // Usa a função onSalvarRelatorio vinda da DashboardPage
        await onSalvarRelatorio(dadosRelatorio, () => {
            // Callback de sucesso: limpa APENAS os campos de relatório
            setRelatorioDescricao('');
            setRelatorioMinutosTrabalhados('');
        });
    };

    /**
     * Salva um registro de PAUSA (motivo + minutos parados)
     */
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

        // Usa a mesma função onSalvarRelatorio
        await onSalvarRelatorio(dadosRelatorio, () => {
            // Callback de sucesso: limpa APENAS os campos de pausa
            setRelatorioMotivoPausa('');
            setRelatorioMinutosPausa('');
        });
    };


    /**
     * Handler para a FINALIZAÇÃO da OS (botão 'Concluir OS')
     */
    const handleFinalizacao = async (statusFinal) => {
        // ... (Validações de trocaPecas, acaoFinalFormatada, inicio, termino, fimDowntime permanecem) ...
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

        // ✨ ALTERAÇÃO AQUI: Validação da equipe de execução REMOVIDA
        
        // --- (Objeto de dados da finalização - sem o campo 'executoresIds') ---
        const dados = {
            acaoRealizada: acaoFinalFormatada,
            trocaPecas,
            pecasSubstituidas: trocaPecas ? pecasSubstituidas.filter(p => p.nomePeca && p.nomePeca.trim()) : [],
            inicio,
            termino,
            motivoTrocaPeca: trocaPecas ? motivoTrocaPeca : null,
            statusFinal,
            fimDowntime: os.maquinaParada ? fimDowntime : null,
            
            // ✨ ALTERAÇÃO AQUI: Linha 'executoresIds' REMOVIDA
        };
        
        // Esta função 'onFinalizar' vem da DashboardPage e é responsável por fechar o modal
        await onFinalizar(dados);
    };

    // ... (renderAcaoRealizada - sem alteração) ...
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
            <textarea rows="4" value={acaoRealizada} onChange={(e) => setAcaoRealizada(e.target.value)} />
        );
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Registrar Execução da OS: #{os.codigoOs}</h2>
                <div className="form-container">
                    {/* --- Seção de Finalização (só preenchida ao concluir) --- */}
                    <div className="form-group">
                        <label>Ação Realizada (Preencher ao Concluir):</label>
                        {renderAcaoRealizada()}
                    </div>
                    <div className="form-group-inline">
                        <div className="form-group"><label>Início da Execução:</label><input type="datetime-local" value={inicio} onChange={(e) => setInicio(e.target.value)} required /></div>
                        <div className="form-group"><label>Término da Execução (Preencher ao Concluir):</label><input type="datetime-local" value={termino} onChange={(e) => setTermino(e.target.value)} /></div>
                    </div>
                    
                    {/* ✨ ALTERAÇÃO AQUI: Seção da Equipe de Execução REMOVIDA */}
                    
                    {os.maquinaParada && (
                         <div className="form-group-inline downtime-section">
                            <div className="form-group downtime-info">
                                <label>Máquina Parou em:</label>
                                <input type="datetime-local" value={toInputDateTimeFormat(os.inicioDowntime)} disabled />
                            </div>
                            <div className="form-group">
                                <label>Máquina Voltou (Preencher ao Concluir):</label>
                                <input 
                                    type="datetime-local" 
                                    value={fimDowntime} 
                                    onChange={(e) => setFimDowntime(e.target.value)} 
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Houve Troca de Peças? (Preencher ao Concluir)</label>
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
                    
                    {/* ✨ ALTERAÇÃO AQUI: Seção de Acompanhamento totalmente refeita */}
                    <div className="acompanhamento-container">
                        
                        {/* Coluna da Esquerda: Relatório de Trabalho */}
                        <div className="relatorio-trabalho-section">
                            <h3>Registrar Relatório de Trabalho</h3>
                            <p>Descreva o que foi feito e quanto tempo levou.</p>
                            
                            <div className="form-group">
                                <label htmlFor="relatorioDescricao">O que foi feito?</label>
                                <textarea 
                                    id="relatorioDescricao"
                                    rows="3" 
                                    value={relatorioDescricao} 
                                    onChange={(e) => setRelatorioDescricao(e.target.value)}
                                    placeholder="Ex: Trocado rolamento X, verificado nível do óleo..."
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="relatorioMinutosTrabalhados">Minutos Trabalhados</label>
                                <input
                                    type="number"
                                    id="relatorioMinutosTrabalhados"
                                    value={relatorioMinutosTrabalhados}
                                    onChange={(e) => setRelatorioMinutosTrabalhados(e.target.value)}
                                    placeholder="Ex: 60"
                                    min="0"
                                    step="15" 
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

                        {/* Coluna da Direita: Registro de Pausa */}
                        <div className="relatorio-pausa-section">
                            <h3>Registrar Pausa</h3>
                            <p>Justifique o tempo não produtivo (almoço, espera, etc).</p>
                            
                            <div className="form-group">
                                <label htmlFor="relatorioMotivoPausa">Motivo da Pausa</label>
                                <textarea 
                                    id="relatorioMotivoPausa"
                                    rows="3" 
                                    value={relatorioMotivoPausa} 
                                    onChange={(e) => setRelatorioMotivoPausa(e.target.value)}
                                    placeholder="Ex: Aguardando peça, Fim do turno, Almoço..."
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="relatorioMinutosPausa">Minutos de Pausa</label>
                                <input
                                    type="number"
                                    id="relatorioMinutosPausa"
                                    value={relatorioMinutosPausa}
                                    onChange={(e) => setRelatorioMinutosPausa(e.target.value)}
                                    placeholder="Ex: 15"
                                    min="0"
                                    step="5" 
                                />
                            </div>
                            <button 
                                type="button" 
                                onClick={handleSalvarPausa} 
                                className="action-button-modal pausa-btn" // Botão com estilo diferente
                                disabled={isReportLoading || actionLoading} 
                            >
                                {isReportLoading ? 'Salvando...' : 'Salvar Pausa'}
                            </button>
                        </div>
                    </div>

                    {/* Botões de Ação Principais */}
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="action-button-modal cancel-btn" disabled={actionLoading || isReportLoading}>
                            Voltar
                        </button>
                        
                        <button type="button" onClick={() => handleFinalizacao('CONCLUIDA')} className="action-button-modal success-btn" disabled={actionLoading || isReportLoading}>
                           {actionLoading ? 'Salvando...' : 'Concluir OS'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExecucaoModal;