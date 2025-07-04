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

// Funções e constantes que não mudam
function mapStatusToOptionValue(status) {
    if (!status) return 'ABERTA';
    const normalized = status.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/\s/g, "_");
    const STATUS_OPTIONS = ['ABERTA', 'EM_EXECUCAO', 'CONCLUIDA', 'CANCELADA'];
    return STATUS_OPTIONS.find(opt => opt === normalized) || 'ABERTA';
}


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
    
    // Removido 'novoStatus' e 'alterandoStatus' que eram da lógica manual
    
    const userRole = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");

    // Flags de controle de visibilidade
    const ehLider = userRole === 'LIDER';
    const ehAnalistaCQ = userRole === 'ANALISTA_CQ';
    
    // =========================================================
    //           👇👇 A LÓGICA FOI ALTERADA AQUI 👇👇
    // =========================================================
    const osEmExecucao = ordemServico?.status === 'EM_EXECUCAO'; // ✅ A condição agora é para EM_EXECUCAO
    
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

    // A função `handleStatusChange` foi removida pois o status é automático

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
            alert(`Verificação registrada! O status da OS foi atualizado para "${response.data.status}".`);
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

    const formatStatusLabel = (status) => {
        if (!status) return '';
        return status.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    };

    if (loading) return <div className="loading-details">Carregando detalhes da OS...</div>;
    if (error) return <div className="error-details">{error}</div>;
    if (!ordemServico) return <div className="no-data-details">Ordem de Serviço não encontrada.</div>;

    return (
        <div className="view-os-page">
            <div className="view-os-form">
                <header className="form-header-main">
                    <h1>Detalhes da Ordem de Serviço</h1>
                </header>

                <section className="form-section read-only-section">
                     <div className="input-group">
                        <label>Nº O.S.</label>
                        <input type="text" value={ordemServico.id} disabled />
                    </div>
                     <div className="input-group">
                        <label>Situação O.S.</label>
                        <input
                            type="text"
                            value={formatStatusLabel(ordemServico.status)}
                            disabled
                            className={`status-input status-${ordemServico.status?.toLowerCase()}-input`}
                        />
                    </div>
                </section>

                <section className="form-section">
                     <div className="input-group full-width">
                        <label>Descrição do Problema</label>
                        <textarea value={ordemServico.descricaoProblema || ''} rows="4" disabled></textarea>
                    </div>
                    <div className="input-group full-width">
                        <label>Observação</label>
                        <textarea value={ordemServico.observacao || 'Nenhuma'} rows="4" disabled></textarea>
                    </div>
                </section>
                
                <section className="form-section ciencia-lider-section">
                    <div className="input-group">
                        <label>Ciência do Líder</label>
                        <input
                            type="text"
                            value={cienciaPendente ? "Pendente de ciência" : `Ciência registrada por: ${ordemServico.liderCienciaNome}`}
                            disabled
                        />
                    </div>
                    
                    {ehLider && ordemServico.status === 'ABERTA' && (
                        <div style={{ marginTop: 8 }}>
                            <button
                                type="button"
                                className="button-save"
                                disabled={cienciaLoading}
                                onClick={handleDarCiencia}
                            >
                                {cienciaLoading ? 'Registrando...' : 'Dar Ciência'}
                            </button>
                        </div>
                    )}
                </section>
                
                {/* ✅ A CONDIÇÃO AQUI FOI ALTERADA */}
                {ehAnalistaCQ && osEmExecucao && (
                    <section className="form-section cq-section">
                        <header>
                            <h2>Verificação de Qualidade (CQ)</h2>
                        </header>
                        
                        <div className="input-group">
                            <label>Status da Verificação</label>
                            {verificacaoPendente ? (
                                <select
                                    value={verificacaoStatus}
                                    onChange={(e) => setVerificacaoStatus(e.target.value)}
                                    disabled={verificacaoLoading}
                                >
                                    <option value="">Selecione...</option>
                                    <option value="APROVADO">Aprovado</option>
                                    <option value="REPROVADO">Reprovado</option>
                                </select>
                            ) : (
                                <input 
                                    type="text"
                                    value={formatStatusLabel(ordemServico.statusVerificacao)}
                                    disabled
                                    className={`status-input status-${ordemServico.statusVerificacao?.toLowerCase()}-input`}
                                />
                            )}
                        </div>

                        {verificacaoPendente && (
                            <div style={{ marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    className="button-save"
                                    onClick={handleVerificacaoSubmit}
                                    disabled={verificacaoLoading || !verificacaoStatus}
                                >
                                    {verificacaoLoading ? 'Salvando...' : 'Salvar Verificação'}
                                </button>
                            </div>
                        )}
                    </section>
                )}


                <footer className="form-actions">
                    <button type="button" className="button-back" onClick={() => navigate('/dashboard')}>Voltar ao Painel</button>
                    {podeExcluir && (
                        <button type="button" className="button-delete" style={{ marginLeft: '16px' }} onClick={handleDelete} disabled={excluindo}>
                            {excluindo ? "Excluindo..." : "Excluir OS"}
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
}

export default VisualizarOsPage;