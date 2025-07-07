import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getOsById,
  getEquipamentos,
  getLocais,
  deleteOrdemServico,
  registrarCienciaLider,
  registrarVerificacaoCQ
} from '../services/apiService';
import './VisualizarOsPage.css';

function VisualizarOsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [ordemServico, setOrdemServico] = useState(null);
    const [equipamento, setEquipamento] = useState(null);
    const [local, setLocal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [excluindo, setExcluindo] = useState(false);
    const [cienciaLoading, setCienciaLoading] = useState(false);
    const [verificacaoStatus, setVerificacaoStatus] = useState('');
    const [verificacaoLoading, setVerificacaoLoading] = useState(false);
    
    const userRole = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");

    // Flags de controle de visibilidade
    const ehLider = userRole === 'LIDER';
    const ehAnalistaCQ = userRole === 'ANALISTA_CQ';
    const osEmExecucao = ordemServico?.status === 'EM_EXECUCAO';
    const verificacaoPendente = ordemServico?.statusVerificacao === 'PENDENTE';
    const cienciaPendente = ordemServico?.liderCienciaId == null;
    const podeExcluir = ['ADMIN', 'LIDER'].includes(userRole);

    useEffect(() => {
        if (!id) return;
        const fetchAll = async () => {
            try {
                setLoading(true);
                const [osRes, equipsRes, locaisRes] = await Promise.all([
                    getOsById(id),
                    getEquipamentos(),
                    getLocais()
                ]);
                const osData = osRes.data;
                setOrdemServico(osData);

                if (osData.statusVerificacao && osData.statusVerificacao !== 'PENDENTE') {
                    setVerificacaoStatus(osData.statusVerificacao);
                }

                const equip = equipsRes.data.find(e => e.id === osData.equipamentoId);
                setEquipamento(equip || null);
                const loc = locaisRes.data.find(l => l.id === osData.localId);
                setLocal(loc || null);
                setError(null);
            } catch (err) {
                setError('Falha ao carregar os detalhes da Ordem de Serviço.');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [id]);

    const handleDarCiencia = async () => {
        if (!userId) return alert("Erro: ID do usuário não encontrado. Faça o login novamente.");
        setCienciaLoading(true);
        try {
            const response = await registrarCienciaLider(id, userId);
            setOrdemServico(response.data);
            alert('Ciência registrada com sucesso! O status da OS foi atualizado para "Em Execução".');
        } catch (error) {
            console.error("Erro ao registrar ciência:", error);
            alert('Falha ao registrar ciência.');
        } finally {
            setCienciaLoading(false);
        }
    };

    const handleVerificacaoSubmit = async () => {
        if (!verificacaoStatus) {
            return alert('Por favor, selecione um status para a verificação.');
        }
        setVerificacaoLoading(true);
        try {
            const payload = {
                analistaId: userId,
                statusVerificacao: verificacaoStatus
            };
            const response = await registrarVerificacaoCQ(id, payload);
            setOrdemServico(response.data);
            alert(`Verificação registrada! O status da OS foi atualizado para "${formatStatusLabel(response.data.status)}".`);
        } catch (error) {
            console.error("Erro ao registrar verificação de CQ:", error);
            alert('Falha ao registrar verificação.');
        } finally {
            setVerificacaoLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Tem certeza que deseja excluir esta Ordem de Serviço?")) return;
        setExcluindo(true);
        try {
            await deleteOrdemServico(id);
            alert('Ordem de Serviço excluída com sucesso!');
            navigate('/dashboard');
        } catch (err) {
            alert('Falha ao excluir Ordem de Serviço.');
        } finally {
            setExcluindo(false);
        }
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return "—";
        return new Date(dateTimeString).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const dateParts = dateString.split('-');
        const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    };

    const formatStatusLabel = (status) => {
        if (!status) return 'Pendente';
        return status.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    };

    if (loading) return <div className="loading-details">Carregando...</div>;
    if (error) return <div className="error-details">{error}</div>;
    if (!ordemServico) return <div className="no-data-details">Ordem de Serviço não encontrada.</div>;

    return (
        <div className="view-os-page">
            <div className="view-os-form">
                <header className="form-header-main">
                    <h1>Detalhes da Ordem de Serviço #{ordemServico.id}</h1>
                    <div className={`status-display status-${ordemServico.status?.toLowerCase()}`}>
                        {formatStatusLabel(ordemServico.status)}
                    </div>
                </header>

                <section className="form-section">
                    <header><h2>Abertura e Detalhes</h2></header>
                    <div className="grid-container">
                        <div className="input-group">
                            <label>Tipo de Manutenção</label>
                            <input type="text" value={formatStatusLabel(ordemServico.tipoManutencao)} disabled />
                        </div>
                        <div className="input-group">
                            <label>Solicitante</label>
                            <input type="text" value={ordemServico.solicitante || '—'} disabled />
                        </div>
                        <div className="input-group">
                            <label>Data da Solicitação</label>
                            <input type="text" value={formatDateTime(ordemServico.dataSolicitacao)} disabled />
                        </div>
                        <div className="input-group">
                            <label>Equipamento</label>
                            <input type="text" value={equipamento?.nome || '—'} disabled />
                        </div>
                        <div className="input-group">
                            <label>Local</label>
                            <input type="text" value={local?.nome || '—'} disabled />
                        </div>
                    </div>
                    <div className="input-group full-width">
                        <label>Descrição do Problema/Serviço</label>
                        <textarea value={ordemServico.descricaoProblema || 'Nenhuma'} rows="3" disabled></textarea>
                    </div>
                </section>

                {ordemServico.tipoManutencao === 'PREVENTIVA' && (
                    <section className="form-section preventiva-details">
                        <header><h2>Programação da Preventiva</h2></header>
                         <div className="grid-container">
                             <div className="input-group">
                                <label>Data de Início Programada</label>
                                <input type="text" value={formatDate(ordemServico.dataInicioPreventiva)} disabled />
                            </div>
                            <div className="input-group">
                                <label>Data de Fim Programada</label>
                                <input type="text" value={formatDate(ordemServico.dataFimPreventiva)} disabled />
                            </div>
                        </div>
                    </section>
                )}

                <section className="form-section">
                     <header><h2>Ciência do Líder</h2></header>
                     <div className="grid-container">
                        <div className="input-group">
                            <label>Responsável</label>
                            <input type="text" value={ordemServico.liderCienciaNome || "Pendente"} disabled />
                        </div>
                        <div className="input-group">
                            <label>Data e Hora</label>
                            <input type="text" value={formatDateTime(ordemServico.dataCiencia)} disabled />
                        </div>
                    </div>
                    {ehLider && ordemServico.status === 'ABERTA' && (
                        <div style={{ marginTop: '1rem' }}>
                            <button onClick={handleDarCiencia} className="button-action" disabled={cienciaLoading}>
                                {cienciaLoading ? 'Registrando...' : 'Dar Ciência'}
                            </button>
                        </div>
                    )}
                </section>
                
                <section className="form-section">
                    <header><h2>Execução do Serviço</h2></header>
                    <div className="grid-container">
                         <div className="input-group">
                            <label>Executado por</label>
                            <input type="text" value={ordemServico.executadoPorNome || "Pendente"} disabled />
                        </div>
                        <div className="input-group">
                            <label>Data da Execução</label>
                            <input type="text" value={formatDateTime(ordemServico.dataExecucao)} disabled />
                        </div>
                    </div>
                     <div className="input-group full-width">
                        <label>Ação Realizada</label>
                        <textarea value={ordemServico.acaoRealizada || 'Não informado.'} rows="3" disabled></textarea>
                    </div>
                </section>

                <section className="form-section cq-section">
                    <header><h2>Verificação de Qualidade (CQ)</h2></header>
                    <div className="grid-container">
                        <div className="input-group">
                            <label>Verificado por</label>
                            <input type="text" value={ordemServico.verificadoPorNome || "Pendente"} disabled />
                        </div>
                        <div className="input-group">
                            <label>Resultado da Verificação</label>
                            {ehAnalistaCQ && osEmExecucao && verificacaoPendente ? (
                                <select value={verificacaoStatus} onChange={(e) => setVerificacaoStatus(e.target.value)}>
                                    <option value="">Selecione...</option>
                                    <option value="APROVADO">Aprovado</option>
                                    <option value="REPROVADO">Reprovado</option>
                                </select>
                            ) : (
                                <input type="text" value={formatStatusLabel(ordemServico.statusVerificacao)} disabled />
                            )}
                        </div>
                    </div>
                    {ehAnalistaCQ && osEmExecucao && verificacaoPendente && (
                        <div style={{ marginTop: '1rem' }}>
                            <button onClick={handleVerificacaoSubmit} className="button-action" disabled={verificacaoLoading || !verificacaoStatus}>
                                {verificacaoLoading ? 'Salvando...' : 'Salvar Verificação'}
                            </button>
                        </div>
                    )}
                </section>

                <footer className="form-actions">
                    <button type="button" className="button-back" onClick={() => navigate('/dashboard')}>Voltar</button>
                    {podeExcluir && (
                        <button type="button" className="button-delete" onClick={handleDelete} disabled={excluindo}>
                            {excluindo ? "Excluindo..." : "Excluir OS"}
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
}

export default VisualizarOsPage;