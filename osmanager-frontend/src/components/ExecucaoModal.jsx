// ✨ ALTERAÇÃO AQUI: Importa a nova função criarAcompanhamento e a getAllFuncionarios
import React, { useState, useEffect } from 'react';
import { listarServicosPorEquipamento, criarAcompanhamento, getAllFuncionarios } from '../services/apiService';
import './ExecucaoModal.css';

const toInputDateTimeFormat = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - userTimezoneOffset);
    return localDate.toISOString().slice(0, 16);
};

// ✨ ALTERAÇÃO AQUI: A props 'onSubmit' foi dividida em 'onFinalizar' e 'onSalvarRelatorio'
//    Isso já estava no seu código, mas é uma mudança da versão anterior que eu tinha.
function ExecucaoModal({ isOpen, onClose, onFinalizar, onSalvarRelatorio, os, actionLoading, isReportLoading }) {
    // --- Estados para a FINALIZAÇÃO da OS ---
    const [acaoRealizada, setAcaoRealizada] = useState(os?.acaoRealizada || '');
    // ✨ CORREÇÃO AQUI (1/4): Renomeado 'nome' para 'nomePeca' no estado inicial
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
    
    // ✨ ALTERAÇÃO AQUI: Novos estados para a Equipe de Execução
    const [listaMecanicos, setListaMecanicos] = useState([]);
    const [loadingMecanicos, setLoadingMecanicos] = useState(true);
    // Usamos um Set para garantir que os IDs sejam únicos
    const [selectedExecutores, setSelectedExecutores] = useState(new Set());


    // ✨ ALTERAÇÃO AQUI: Novo useEffect para carregar os mecânicos
    useEffect(() => {
        if (isOpen) {
            setLoadingMecanicos(true);
            
            // Pega o ID do usuário logado
            const currentUserId = Number(localStorage.getItem('userId'));
            // Pré-seleciona o usuário logado
            setSelectedExecutores(new Set(currentUserId ? [currentUserId] : []));

            getAllFuncionarios()
                .then(response => {
                    // Filtra para incluir apenas quem pode executar OS
                    const rolesPermitidas = ['MECANICO', 'LIDER', 'ADMIN'];
                    const mecanicosFiltrados = (response.data || []).filter(func => 
                        rolesPermitidas.includes(func.tipoFuncionario)
                    );
                    setListaMecanicos(mecanicosFiltrados);
                })
                .catch(err => {
                    console.error("Erro ao buscar funcionários:", err);
                    setListaMecanicos([]);
                })
                .finally(() => {
                    setLoadingMecanicos(false);
                });
        }
    }, [isOpen]); // Recarrega toda vez que o modal abre


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

    // ... (funções handlePecaChange, handleStatusChange, handleMotivoChange, não modificadas) ...
    const handlePecaChange = (index, field, value) => {
        const novasPecas = [...pecasSubstituidas];
        novasPecas[index][field] = value;
        setPecasSubstituidas(novasPecas);
    };

    const adicionarPeca = () => {
        // ✨ CORREÇÃO AQUI (2/4): Renomeado 'nome' para 'nomePeca' ao adicionar nova peça
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

    // ✨ ALTERAÇÃO AQUI: Nova função para o checkbox da equipe
    const handleExecutorToggle = (mecId) => {
        setSelectedExecutores(prevSet => {
            const newSet = new Set(prevSet);
            if (newSet.has(mecId)) {
                newSet.delete(mecId); // Desmarca
            } else {
                newSet.add(mecId); // Marca
            }
            return newSet;
        });
    };

    /**
     * Salva um acompanhamento (relatório parcial ou pausa) sem fechar o modal.
     */
    const handleSalvarRelatorioParcial = async () => {
        const minutos = Number(relatorioMinutosPausa) || 0;
        if (!relatorioDescricao.trim() && !relatorioMotivoPausa.trim() && minutos <= 0) {
            alert('Preencha pelo menos um campo para salvar o relatório: "O que foi feito", "Motivo da Pausa" ou "Duração".');
            return;
        }

        const dadosRelatorio = {
            descricao: relatorioDescricao,
            motivoPausa: relatorioMotivoPausa,
            minutosPausa: minutos, 
            ordemServicoId: os.id,
        };

        // Usa a função onSalvarRelatorio vinda da DashboardPage
        await onSalvarRelatorio(dadosRelatorio, () => {
            // Função de callback em caso de sucesso
            setRelatorioDescricao('');
            setRelatorioMotivoPausa('');
            setRelatorioMinutosPausa('');
        });
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

        // ✨ ALTERAÇÃO AQUI: Nova validação da equipe de execução
        if (selectedExecutores.size === 0) {
            alert("Por favor, selecione pelo menos um mecânico na 'Equipe de Execução'.");
            return;
        }


        // --- (Objeto de dados da finalização - com o novo campo) ---
        const dados = {
            acaoRealizada: acaoFinalFormatada,
            trocaPecas,
            // ✨ CORREÇÃO AQUI (3/4): Filtra usando 'nomePeca'
            pecasSubstituidas: trocaPecas ? pecasSubstituidas.filter(p => p.nomePeca && p.nomePeca.trim()) : [],
            inicio,
            termino,
            motivoTrocaPeca: trocaPecas ? motivoTrocaPeca : null,
            statusFinal,
            fimDowntime: os.maquinaParada ? fimDowntime : null,
            // ✨ ALTERAÇÃO AQUI: Envia os IDs dos executores como um Array
            executoresIds: Array.from(selectedExecutores),
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

    // ✨ ALTERAÇÃO AQUI: Novo renderizador para a lista de mecânicos
    const renderEquipeExecucao = () => {
        if (loadingMecanicos) return <p>Carregando mecânicos...</p>;
        if (listaMecanicos.length === 0) return <p>Nenhum mecânico cadastrado.</p>;

        return (
            <div className="executor-list-container">
                {listaMecanicos.map(mec => (
                    <div key={mec.id} className="executor-checkbox-item">
                        <label>
                            <input 
                                type="checkbox"
                                checked={selectedExecutores.has(mec.id)}
                                onChange={() => handleExecutorToggle(mec.id)}
                            />
                            {mec.nome}
                        </label>
                    </div>
                ))}
            </div>
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
                    
                    {/* ✨ ALTERAÇÃO AQUI: Nova seção da Equipe de Execução */}
                    <div className="form-group">
                        <label>Equipe de Execução (Selecione quem participou):</label>
                        {renderEquipeExecucao()}
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
                                        {/* ✨ CORREÇÃO AQUI (4/4): 'value' e 'onChange' usam 'nomePeca' */}
                                        <input type="text" placeholder="Nome da Peça" value={peca.nomePeca || ''} onChange={(e) => handlePecaChange(index, 'nomePeca', e.target.value)} />
                                        <input type="number" placeholder="Qtd" value={peca.quantidade} min="1" onChange={(e) => handlePecaChange(index, 'quantidade', parseInt(e.target.value, 10) || 1)} />
                                    </div>
                                ))}
                                <button type="button" onClick={adicionarPeca} className="add-peca-btn" disabled={actionLoading}>Adicionar Peça</button>
                            </div>
                        </>
                    )}
                    
                    {/* ✨ ALTERAÇÃO AQUI: Seção de Relatório Parcial (código mantido) */}
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

                        <div className="form-group-inline">
                            <div className="form-group" style={{ flex: 3 }}>
                                <label htmlFor="relatorioMotivoPausa">Motivo da Pausa (Opcional)</label>
                                <textarea 
                                    id="relatorioMotivoPausa"
                                    rows="1" 
                                    value={relatorioMotivoPausa} 
                                    onChange={(e) => setRelatorioMotivoPausa(e.target.value)}
                                    placeholder="Ex: Aguardando peça, Fim do turno..."
                                    style={{minHeight: '40px'}} 
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
                                    step="5" 
                                />
                            </div>
                        </div>

                        <button 
                            type="button" 
                            onClick={handleSalvarRelatorioParcial} 
                            className="action-button-modal report-btn" 
                            disabled={isReportLoading || actionLoading} 
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