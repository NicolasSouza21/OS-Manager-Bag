// ✨ ALTERAÇÃO AQUI: Importa a nova função criarAcompanhamento
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

function ExecucaoModal({ isOpen, onClose, onSubmit, os, actionLoading }) {
    // --- Estados para a FINALIZAÇÃO da OS ---
    const [acaoRealizada, setAcaoRealizada] = useState(os?.acaoRealizada || '');
    const [pecasSubstituidas, setPecasSubstituidas] = useState(os?.pecasSubstituidas?.length > 0 ? os.pecasSubstituidas : [{ nome: '', quantidade: 1 }]);
    const [inicio, setInicio] = useState(() => toInputDateTimeFormat(os?.inicio || new Date().toISOString()));
    const [termino, setTermino] = useState(toInputDateTimeFormat(os?.termino || ''));
    const [trocaPecas, setTrocaPecas] = useState(os?.trocaPecas ?? null);
    const [motivoTrocaPeca, setMotivoTrocaPeca] = useState('');
    const [fimDowntime, setFimDowntime] = useState(() => toInputDateTimeFormat(new Date().toISOString()));

    // --- Estados do Checklist de Preventiva ---
    const [servicosDoEquipamento, setServicosDoEquipamento] = useState([]);
    const [loadingServicos, setLoadingServicos] = useState(false);
    const [servicoStatus, setServicoStatus] = useState({});

    // ✨ ALTERAÇÃO AQUI: Novos estados para o Relatório Parcial / Pausa
    const [relatorioDescricao, setRelatorioDescricao] = useState('');
    const [relatorioMotivoPausa, setRelatorioMotivoPausa] = useState('');
    // ✨ ALTERAÇÃO AQUI: Novo estado para os minutos da pausa
    const [relatorioMinutosPausa, setRelatorioMinutosPausa] = useState(''); // Começa como string vazia
    const [isReportLoading, setIsReportLoading] = useState(false); // Loading para o botão de salvar relatório

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

    /**
     * Salva um acompanhamento (relatório parcial ou pausa) sem fechar o modal.
     */
    const handleSalvarRelatorioParcial = async () => {
        // ✨ ALTERAÇÃO AQUI: Validação atualizada
        // Permite salvar se qualquer um dos três campos for preenchido
        const minutos = Number(relatorioMinutosPausa) || 0;
        if (!relatorioDescricao.trim() && !relatorioMotivoPausa.trim() && minutos <= 0) {
            alert('Preencha pelo menos um campo para salvar o relatório: "O que foi feito", "Motivo da Pausa" ou "Duração".');
            return;
        }

        setIsReportLoading(true);

        // ✨ ALTERAÇÃO AQUI: Adiciona 'minutosPausa' ao payload
        const dadosRelatorio = {
            descricao: relatorioDescricao,
            motivoPausa: relatorioMotivoPausa,
            minutosPausa: minutos, // Envia o valor numérico
            ordemServicoId: os.id, // Vincula o relatório a esta OS
        };

        try {
            // Chama a nova função da API
            await criarAcompanhamento(dadosRelatorio);
            alert('Relatório parcial salvo com sucesso!');
            // Limpa os campos após salvar
            setRelatorioDescricao('');
            setRelatorioMotivoPausa('');
            setRelatorioMinutosPausa(''); // ✨ ALTERAÇÃO AQUI: Limpa os minutos
        } catch (error) {
            console.error("Erro ao salvar relatório parcial:", error);
            alert(error?.response?.data?.message || "Falha ao salvar relatório parcial.");
        } finally {
            setIsReportLoading(false);
        }
    };


    /**
     * Handler para a FINALIZAÇÃO da OS (botão 'Concluir OS')
     */
    const handleFinalizacao = async (statusFinal) => {
        // ... (Validações de finalização - sem alteração) ...
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

        // --- (Objeto de dados da finalização - sem alteração) ---
        const dados = {
            acaoRealizada: acaoFinalFormatada,
            trocaPecas,
            pecasSubstituidas: trocaPecas ? pecasSubstituidas.filter(p => p.nome.trim()) : [],
            inicio,
            termino,
            motivoTrocaPeca: trocaPecas ? motivoTrocaPeca : null,
            statusFinal,
            fimDowntime: os.maquinaParada ? fimDowntime : null, 
        };
        
        // Esta função 'onSubmit' vem da DashboardPage e é responsável por fechar o modal
        await onSubmit(dados);
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

        // ✨ ALTERAÇÃO AQUI: O 'required' foi removido do textarea principal,
        // já que ele só é obrigatório ao *finalizar* (validação movida para o JS)
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
                                        <input type="text" placeholder="Nome da Peça" value={peca.nome} onChange={(e) => handlePecaChange(index, 'nome', e.target.value)} />
                                        <input type="number" placeholder="Qtd" value={peca.quantidade} min="1" onChange={(e) => handlePecaChange(index, 'quantidade', parseInt(e.target.value, 10) || 1)} />
                                    </div>
                                ))}
                                <button type="button" onClick={adicionarPeca} className="add-peca-btn" disabled={actionLoading}>Adicionar Peça</button>
                            </div>
                        </>
                    )}
                    
                    {/* ✨ ALTERAÇÃO AQUI: Nova seção para Relatório Parcial */}
                    <div className="relatorio-parcial-section">
                        <h3>Registrar Acompanhamento (Pausa / Relatório)</h3>
                        <p>Use esta seção para salvar o progresso ou justificar uma pausa sem finalizar a OS.</p>
                        <div className="form-group">
                            <label htmlFor="relatorioDescricao">O que foi feito até agora?</label>
                            <textarea 
                                id="relatorioDescricao"
                                rows="3" 
                                value={relatorioDescricao} 
                                onChange={(e) => setRelatorioDescricao(e.target.value)}
                                placeholder="Ex: Trocado rolamento X, verificado nível do óleo..."
                            />
                        </div>

                        {/* ✨ ALTERAÇÃO AQUI: Motivo e Duração agora estão lado a lado */}
                        <div className="form-group-inline">
                            <div className="form-group" style={{ flex: 3 }}>
                                <label htmlFor="relatorioMotivoPausa">Motivo da Pausa (Opcional)</label>
                                <textarea 
                                    id="relatorioMotivoPausa"
                                    rows="1" // Reduzido para 1 linha, já que está ao lado
                                    value={relatorioMotivoPausa} 
                                    onChange={(e) => setRelatorioMotivoPausa(e.target.value)}
                                    placeholder="Ex: Aguardando peça, Fim do turno..."
                                    style={{minHeight: '40px'}} // Garante altura mínima
                                />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label htmlFor="relatorioMinutosPausa">Duração (min)</label>
                                <input
                                    type="number"
                                    id="relatorioMinutosPausa"
                                    value={relatorioMinutosPausa}
                                    onChange={(e) => setRelatorioMinutosPausa(e.target.value)}
                                    placeholder="Ex: 30"
                                    min="0"
                                    step="5" // Pulos de 5 min
                                />
                            </div>
                        </div>

                        <button 
                            type="button" 
                            onClick={handleSalvarRelatorioParcial} 
                            className="action-button-modal report-btn" 
                            disabled={isReportLoading || actionLoading} // Desabilita se estiver finalizando a OS ou salvando relatório
                        >
                            {isReportLoading ? 'Salvando Relatório...' : 'Salvar Relatório (e continuar OS)'}
                        </button>
                    </div>

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