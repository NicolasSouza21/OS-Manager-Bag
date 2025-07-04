import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getOsById,
  getEquipamentos,
  getLocais,
  updateStatusOs,
  deleteOrdemServico,
  registrarCienciaLider // ✅ 1. Importa a função correta
} from '../services/apiService';
import './VisualizarOsPage.css';

const STATUS_OPTIONS = [
  { value: 'ABERTA', label: 'Aberta' },
  { value: 'EM_EXECUCAO', label: 'Em Execução' },
  { value: 'CONCLUIDA', label: 'Concluída' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

function mapStatusToOptionValue(status) {
    if (!status) return STATUS_OPTIONS[0].value;
    const normalized = status.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/\s/g, "_");
    const match = STATUS_OPTIONS.find(opt => opt.value === normalized);
    if (match) return match.value;
    const looseMatch = STATUS_OPTIONS.find(opt => opt.value.replace(/_/g, "") === normalized.replace(/_/g, ""));
    if (looseMatch) return looseMatch.value;
    return STATUS_OPTIONS[0].value;
}

function VisualizarOsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [ordemServico, setOrdemServico] = useState(null);
    const [equipamento, setEquipamento] = useState(null);
    const [local, setLocal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [novoStatus, setNovoStatus] = useState('');
    const [alterandoStatus, setAlterandoStatus] = useState(false);
    const [excluindo, setExcluindo] = useState(false);
    const [cienciaLoading, setCienciaLoading] = useState(false); // Estado para o botão de ciência

    // ✅ 2. Pega dados do usuário logado do localStorage
    const userRole = localStorage.getItem("userRole");
    const liderIdLogado = localStorage.getItem("userId");

    // ✅ 3. Cria flags para controlar a exibição do botão
    const ehLider = userRole === 'LIDER';
    const cienciaPendente = ordemServico?.mecanicoCienciaId == null;
    const podeTrocarStatus = ['MECANICO', 'ANALISTA_CQ', 'ADMIN', 'LIDER'].includes(userRole);

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
                setOrdemServico(osRes.data);
                const statusConvertido = mapStatusToOptionValue(osRes.data.status);
                setNovoStatus(statusConvertido);
                const equip = equipsRes.data.find(e => e.id === osRes.data.equipamentoId);
                setEquipamento(equip || null);
                const loc = locaisRes.data.find(l => l.id === osRes.data.localId);
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

    // ✅ 4. Nova função para registrar a ciência
    const handleDarCiencia = async () => {
        if (!liderIdLogado) {
            alert("Erro: ID do líder não encontrado. Faça o login novamente.");
            return;
        }

        setCienciaLoading(true);
        try {
            const response = await registrarCienciaLider(id, liderIdLogado);
            setOrdemServico(response.data); // Atualiza o estado da OS com o retorno da API
            alert('Ciência registrada com sucesso!');
        } catch (error) {
            console.error("Erro ao registrar ciência:", error);
            alert('Falha ao registrar ciência. Verifique suas permissões.');
        } finally {
            setCienciaLoading(false);
        }
    };


    const handleStatusChange = async (e) => {
        const valor = e.target.value;
        setNovoStatus(valor);
        setAlterandoStatus(true);
        try {
            await updateStatusOs(id, valor); // Passa apenas a string do status
            setOrdemServico(prev => ({ ...prev, status: valor }));
            alert('Status alterado com sucesso!');
        } catch (err) {
            alert('Falha ao alterar status');
            // Reverte o status no select em caso de erro
            setNovoStatus(ordemServico.status);
        } finally {
            setAlterandoStatus(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Tem certeza que deseja excluir esta Ordem de Serviço?")) {
            return;
        }
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

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
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

                {/* Seção de dados somente leitura */}
                <section className="form-section read-only-section">
                    <div className="input-group">
                        <label>Nº O.S.</label>
                        <input type="text" value={ordemServico.id} disabled />
                    </div>
                    {/* ... outros campos ... */}
                    <div className="input-group">
                        <label>Situação O.S.</label>
                        {podeTrocarStatus ? (
                            <select value={novoStatus} onChange={handleStatusChange} disabled={alterandoStatus} className={`status-input status-${novoStatus?.toLowerCase()}-input`}>
                                {STATUS_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                            </select>
                        ) : (
                            <input type="text" value={(STATUS_OPTIONS.find(opt => opt.value === novoStatus)?.label) || ordemServico.status || ''} disabled className={`status-input status-${novoStatus?.toLowerCase()}-input`} />
                        )}
                    </div>
                </section>

                {/* Seção de detalhes */}
                <section className="form-section">
                    {/* ... outros campos de detalhes ... */}
                     <div className="input-group full-width">
                        <label>Descrição do Problema</label>
                        <textarea value={ordemServico.descricaoProblema || ''} rows="4" disabled></textarea>
                    </div>
                    <div className="input-group full-width">
                        <label>Observação</label>
                        <textarea value={ordemServico.observacao || 'Nenhuma'} rows="4" disabled></textarea>
                    </div>
                </section>
                
                {/* ✅ 5. Seção de Ciência do Líder */}
                <section className="form-section ciencia-lider-section">
                    <div className="input-group">
                        <label>Ciência do Líder</label>
                        <input
                            type="text"
                            value={cienciaPendente ? "Pendente de ciência" : `Ciência registrada pelo líder ID: ${ordemServico.mecanicoCienciaId}`}
                            disabled
                        />
                    </div>
                    
                    {/* Botão só aparece para o líder e se a ciência estiver pendente */}
                    {ehLider && cienciaPendente && (
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


                <footer className="form-actions">
                    <button type="button" className="button-back" onClick={() => navigate('/dashboard')}>Voltar ao Painel</button>
                    {podeTrocarStatus && (
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