import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import {
    getOsById,
    getEquipamentos,
    getLocais,
    deleteOrdemServico,
    registrarCiencia,
    // As funções 'iniciarExecucao' e 'registrarVerificacaoCQ' foram removidas
    // pois a lógica agora está centralizada no Modal do Dashboard.
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
    const [actionLoading, setActionLoading] = useState(false);

    // Estados do usuário
    const [userRoles, setUserRoles] = useState([]);
    // O userId e verificacaoStatus não são mais necessários nesta página.

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            const decoded = jwtDecode(token);
            setUserRoles(decoded.roles || []);
        }
    }, []);

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
            alert('Ciência registrada com sucesso! O status da OS foi atualizado para "Ciente".');
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

    // --- FUNÇÕES DE FORMATAÇÃO ---
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return "—";
        return new Date(dateTimeString).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString('pt-BR');
    };
    const formatStatusLabel = (status) => {
        if (!status) return 'Pendente';
        return status.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    };

    // --- RENDERIZAÇÃO ---
    if (loading) return <div className="loading-details">Carregando...</div>;
    if (error) return <div className="error-details">{error}</div>;
    if (!ordemServico) return <div className="no-data-details">Ordem de Serviço não encontrada.</div>;

    const isMecanicoOrLider = userRoles.includes('ROLE_MECANICO') || userRoles.includes('ROLE_LIDER');
    const podeExcluir = userRoles.includes('ROLE_ADMIN') || userRoles.includes('ROLE_LIDER');

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
                        <div className="input-group"><label>Solicitante</label><input type="text" value={ordemServico.solicitante || '—'} disabled /></div>
                        <div className="input-group"><label>Data da Solicitação</label><input type="text" value={formatDateTime(ordemServico.dataSolicitacao)} disabled /></div>
                        <div className="input-group"><label>Equipamento</label><input type="text" value={equipamento?.nome || '—'} disabled /></div>
                        <div className="input-group"><label>Local</label><input type="text" value={local?.nome || '—'} disabled /></div>
                    </div>
                    <div className="input-group full-width" style={{marginTop: '1rem'}}><label>Descrição do Problema/Serviço</label><textarea value={ordemServico.descricaoProblema || 'Nenhuma'} rows="3" disabled></textarea></div>
                </section>

                {ordemServico.tipoManutencao === 'PREVENTIVA' && (
                    <section className="form-section preventiva-details">
                        <header><h2>Programação da Preventiva</h2></header>
                        <div className="grid-container">
                            <div className="input-group"><label>Data de Início Programada</label><input type="text" value={formatDate(ordemServico.dataInicioPreventiva)} disabled /></div>
                            <div className="input-group"><label>Data de Fim Programada</label><input type="text" value={formatDate(ordemServico.dataFimPreventiva)} disabled /></div>
                        </div>
                    </section>
                )}

                <section className="form-section">
                    <header><h2>Ciência</h2></header>
                    <div className="grid-container">
                        <div className="input-group"><label>Responsável</label><input type="text" value={ordemServico.liderCienciaNome || "Pendente"} disabled /></div>
                        <div className="input-group"><label>Data e Hora</label><input type="text" value={formatDateTime(ordemServico.dataCiencia)} disabled /></div>
                    </div>
                    {isMecanicoOrLider && ordemServico.status === 'ABERTA' && (
                        <div className="actions-container" style={{ marginTop: '1rem' }}>
                            <button onClick={handleDarCiencia} className="button-action" disabled={actionLoading}>
                                {actionLoading ? 'Registrando...' : 'Dar Ciência'}
                            </button>
                        </div>
                    )}
                </section>
                
                <section className="form-section">
                    <header><h2>Execução do Serviço</h2></header>
                    <div className="grid-container">
                         <div className="input-group"><label>Executado por</label><input type="text" value={ordemServico.executadoPorNome || "Pendente"} disabled /></div>
                         <div className="input-group"><label>Data da Execução</label><input type="text" value={formatDateTime(ordemServico.dataExecucao)} disabled /></div>
                    </div>
                     <div className="input-group full-width" style={{marginTop: '1rem'}}><label>Ação Realizada</label><textarea value={ordemServico.acaoRealizada || 'Aguardando preenchimento no Dashboard.'} rows="3" disabled></textarea></div>
                </section>

                {/* A SEÇÃO DE VERIFICAÇÃO DE QUALIDADE FOI COMPLETAMENTE REMOVIDA DAQUI */}

                <footer className="form-actions">
                    <button type="button" className="button-back" onClick={() => navigate('/dashboard')}>Voltar</button>
                    {podeExcluir && (
                        <button type="button" className="button-delete" onClick={handleDelete} disabled={actionLoading}>
                            {actionLoading ? "Excluindo..." : "Excluir OS"}
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
}

export default VisualizarOsPage;