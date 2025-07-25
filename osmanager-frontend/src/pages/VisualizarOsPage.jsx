import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getOsById,
    getEquipamentos,
    getLocais,
    deleteOrdemServico,
    registrarCiencia,
    verificarOS,
} from '../services/apiService';
import './VisualizarOsPage.css';

// Componente PainelVerificacao (sem alterações)
const PainelVerificacao = ({ os, onVerificacaoSubmit, actionLoading }) => {
    const [aprovado, setAprovado] = useState(true);
    const [comentario, setComentario] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!aprovado && !comentario.trim()) {
            alert('É obrigatório fornecer um comentário ao reprovar a OS.');
            return;
        }
        onVerificacaoSubmit({
            aprovado: aprovado,
            comentarioVerificacao: comentario,
        });
    };

    return (
        <section className="form-section verification-panel">
            <header><h2>Verificação do Encarregado</h2></header>
            <form onSubmit={handleSubmit}>
                <div className="verification-choice">
                    <label>
                        <input type="radio" name="verificacao" checked={aprovado} onChange={() => setAprovado(true)} />
                        Aprovar Serviço
                    </label>
                    <label>
                        <input type="radio" name="verificacao" checked={!aprovado} onChange={() => setAprovado(false)} />
                        Reprovar Serviço
                    </label>
                </div>
                {!aprovado && (
                    <div className="input-group full-width" style={{ marginTop: '1rem' }}>
                        <label>Motivo da Reprovação (Obrigatório)</label>
                        <textarea
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            rows="3"
                            placeholder="Descreva o que precisa ser corrigido pelo mecânico."
                        ></textarea>
                    </div>
                )}
                <div className="actions-container" style={{ marginTop: '1rem' }}>
                    <button type="submit" className="button-action" disabled={actionLoading}>
                        {actionLoading ? 'Enviando...' : 'Confirmar Verificação'}
                    </button>
                </div>
            </form>
        </section>
    );
};


function VisualizarOsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [ordemServico, setOrdemServico] = useState(null);
    const [equipamento, setEquipamento] = useState(null);
    const [local, setLocal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const userRole = localStorage.getItem('userRole'); 

    const fetchData = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const [osRes, equipsRes, locaisRes] = await Promise.all([
                getOsById(id),
                getEquipamentos(),
                getLocais()
            ]);
            const osData = osRes.data;
            setOrdemServico(osData);

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

    useEffect(() => {
        fetchData();
    }, [id]);

    // --- LÓGICA DAS AÇÕES ---

    const handleDarCiencia = async () => {
        setActionLoading(true);
        try {
            await registrarCiencia(id);
            alert('Ciência registrada com sucesso!');
            fetchData();
        } catch (error) {
            console.error("Erro ao registrar ciência:", error);
            alert(error.response?.data?.message || 'Falha ao registrar ciência.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Tem certeza que deseja excluir esta Ordem de Serviço?")) return;
        setActionLoading(true);
        try {
            await deleteOrdemServico(id);
            alert('Ordem de Serviço excluída com sucesso!');
            navigate('/dashboard');
        } catch (err) {
            alert('Falha ao excluir Ordem de Serviço.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerificacaoSubmit = async (dadosVerificacao) => {
        setActionLoading(true);
        try {
            await verificarOS(id, dadosVerificacao);
            alert('Verificação registrada com sucesso!');
            fetchData();
        } catch (error) {
            console.error("Erro ao registrar verificação:", error);
            alert(error.response?.data?.message || 'Falha ao registrar verificação.');
        } finally {
            setActionLoading(false);
        }
    };

    // --- FUNÇÕES DE FORMATAÇÃO ---
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return "—";
        return new Date(dateTimeString).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };
    
    const formatStatusLabel = (status) => {
        if (!status) return 'Pendente';
        return status.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    };

    // --- RENDERIZAÇÃO ---
    if (loading) return <div className="loading-details">Carregando...</div>;
    if (error) return <div className="error-details">{error}</div>;
    if (!ordemServico) return <div className="no-data-details">Ordem de Serviço não encontrada.</div>;

    const podeExcluir = userRole === 'ADMIN' || userRole === 'LIDER';
    const isEncarregado = userRole === 'ENCARREGado';

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
                        <div className="input-group"><label>Tipo de Manutenção</label><input type="text" value={formatStatusLabel(ordemServico.tipoManutencao)} disabled /></div>
                        
                        {/* ✅ CAMPO DE FREQUÊNCIA ADICIONADO (só aparece se for preventiva) */}
                        {ordemServico.tipoManutencao === 'PREVENTIVA' && ordemServico.frequencia && (
                            <div className="input-group"><label>Frequência</label><input type="text" value={formatStatusLabel(ordemServico.frequencia)} disabled /></div>
                        )}
                        
                        <div className="input-group"><label>Solicitante</label><input type="text" value={ordemServico.solicitante || '—'} disabled /></div>
                        <div className="input-group"><label>Data da Solicitação</label><input type="text" value={formatDateTime(ordemServico.dataSolicitacao)} disabled /></div>
                        <div className="input-group"><label>Equipamento</label><input type="text" value={equipamento?.nome || '—'} disabled /></div>
                        <div className="input-group"><label>Local</label><input type="text" value={local?.nome || '—'} disabled /></div>
                    </div>
                    <div className="input-group full-width" style={{marginTop: '1rem'}}><label>Descrição do Problema/Serviço</label><textarea value={ordemServico.descricaoProblema || 'Nenhuma'} rows="3" disabled></textarea></div>
                </section>
                
                {/* O resto das seções (Execução, Verificação) permanece o mesmo */}
                <section className="form-section">
                    <header><h2>Execução do Serviço</h2></header>
                    <div className="grid-container">
                        <div className="input-group"><label>Executado por</label><input type="text" value={ordemServico.executadoPorNome || "Pendente"} disabled /></div>
                        <div className="input-group"><label>Data da Execução</label><input type="text" value={formatDateTime(ordemServico.dataExecucao)} disabled /></div>
                    </div>
                    <div className="input-group full-width" style={{marginTop: '1rem'}}><label>Ação Realizada</label><textarea value={ordemServico.acaoRealizada || 'Aguardando preenchimento no Dashboard.'} rows="3" disabled></textarea></div>
                </section>
                
                <section className="form-section">
                    <header><h2>Verificação de Qualidade</h2></header>
                    <div className="grid-container">
                        <div className="input-group"><label>Verificado por</label><input type="text" value={ordemServico.verificadoPorNome || "Pendente"} disabled /></div>
                        <div className="input-group"><label>Data da Verificação</label><input type="text" value={formatDateTime(ordemServico.dataVerificacao)} disabled /></div>
                        <div className="input-group"><label>Status da Verificação</label><input type="text" value={formatStatusLabel(ordemServico.statusVerificacao)} disabled /></div>
                    </div>
                    {ordemServico.comentarioVerificacao && (
                        <div className="input-group full-width" style={{marginTop: '1rem'}}>
                            <label>Comentário da Verificação</label>
                            <textarea value={ordemServico.comentarioVerificacao} rows="3" disabled></textarea>
                        </div>
                    )}
                </section>

                {isEncarregado && ordemServico.status === 'AGUARDANDO_VERIFICACAO' && (
                    <PainelVerificacao 
                        os={ordemServico}
                        onVerificacaoSubmit={handleVerificacaoSubmit} 
                        actionLoading={actionLoading}
                    />
                )}

                {/* ✅ BOTÕES DE VOLTAR E EXCLUIR ADICIONADOS AO RODAPÉ */}
                <footer className="form-actions">
                    <button type="button" className="button-cancel" onClick={() => navigate(-1)}>
                        Voltar
                    </button>
                    {podeExcluir && (
                        <button type="button" className="button-delete" onClick={handleDelete} disabled={actionLoading}>
                            {actionLoading ? 'Excluindo...' : 'Excluir OS'}
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
}

export default VisualizarOsPage;