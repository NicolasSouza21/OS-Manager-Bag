// Local: osmanager-frontend/src/pages/PainelMecanicoPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // ✅ ADICIONADO: Necessário para saber quem é o mecânico
import { 
    registrarCiencia, 
    iniciarExecucao, 
    getEquipamentos, 
    getOrdensServico, 
    registrarExecucao
} from '../services/apiService';
import ExecucaoModal from '../components/ExecucaoModal';
import './PainelMecanicoPage.css';
import { FaCheck, FaPlay, FaTools, FaHourglassHalf, FaClipboardList, FaBusinessTime } from 'react-icons/fa';

// Função para formatar as datas do filtro
const getMesAtualFormatado = (date) => {
    return date.toISOString().slice(0, 10);
};

const getPrimeiroDiaMes = () => {
    const data = new Date();
    return getMesAtualFormatado(new Date(data.getFullYear(), data.getMonth(), 1));
};

const getHoje = () => {
    return getMesAtualFormatado(new Date());
};

// Componente de Card para a OS
const OsCard = ({ os, equipamentoNome, onCiencia, onIniciar, onExecutar }) => {
    const navigate = useNavigate();
    const prioridadeClass = `prioridade-${os.prioridade?.toLowerCase() || 'media'}`;
    const tipoClass = `tipo-${os.tipoManutencao?.toLowerCase() || 'corretiva'}`;

    const handleActionClick = (e, actionFn) => {
        e.stopPropagation();
        actionFn(os);
    };

    return (
        <div className="kanban-card" onClick={() => navigate(`/os/${os.id}`)}>
            <div className="card-header">
                <span className={`card-tipo ${tipoClass}`}>{os.tipoManutencao ? os.tipoManutencao.substring(0, 4) : 'OS'}</span>
                <span className={`card-prioridade ${prioridadeClass}`}>{os.prioridade || 'MÉDIA'}</span>
            </div>
            <div className="card-body">
                <h4 className="card-title">#{os.codigoOs} - {equipamentoNome}</h4>
                <p className="card-descricao">{os.descricaoProblema || os.acaoRealizada}</p>
            </div>
            <div className="card-footer">
                {os.status === 'ABERTA' && (
                    <button className="card-button-ciencia" onClick={(e) => handleActionClick(e, onCiencia)}>
                        <FaCheck /> Assumir
                    </button>
                )}
                {os.status === 'PENDENTE' && (
                    <button className="card-button-iniciar" onClick={(e) => handleActionClick(e, onIniciar)}>
                        <FaPlay /> Iniciar
                    </button>
                )}
                {os.status === 'EM_EXECUCAO' && (
                    <button className="card-button-executar" onClick={(e) => handleActionClick(e, onExecutar)}>
                        <FaTools /> Executar
                    </button>
                )}
            </div>
        </div>
    );
};

// Componente Principal
function PainelMecanicoPage() {
    const [colunas, setColunas] = useState({ osAbertas: [], osPendentes: [], osEmExecucao: [] });
    // ✨ ALTERAÇÃO: KPIs agora são calculados localmente ou zerados, pois removemos a dependência do endpoint inexistente
    const [kpis, setKpis] = useState({ totalHorasPausa: 0, totalPausas: 0, mediaMinutosPausa: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [equipamentos, setEquipamentos] = useState([]);
    
    // Identificação do Usuário
    const [userId, setUserId] = useState(null);
    
    // Estados dos Modais
    const [selectedOs, setSelectedOs] = useState(null);
    const [isExecucaoModalOpen, setIsExecucaoModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Filtros de data para os KPIs
    const [dataInicio, setDataInicio] = useState(getPrimeiroDiaMes());
    const [dataFim, setDataFim] = useState(getHoje());

    // 1. Obter o ID do usuário ao carregar
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserId(decoded.userId);
            } catch (e) {
                console.error("Erro ao decodificar token", e);
            }
        }
    }, []);

    const fetchEquipamentos = useCallback(async () => {
        try {
            const res = await getEquipamentos();
            setEquipamentos(res.data || []);
        } catch (err) {
            console.error("Erro ao buscar equipamentos:", err);
        }
    }, []);

    const fetchPainelData = useCallback(async () => {
        // Só busca dados se tivermos o userId (para filtrar as tarefas dele)
        if (!userId) return;

        setLoading(true);
        setError('');
        try {
            // ✨ ALTERAÇÃO AQUI: Substituímos 'getPainelMecanico' por 3 chamadas padrão 'getOrdensServico'
            const [resAbertas, resPendentes, resExecucao] = await Promise.all([
                // 1. Abertas: Global (sem filtro de mecanico)
                getOrdensServico({ status: 'ABERTA', page: 0, size: 50, sort: 'prioridade,asc' }),
                // 2. Pendentes: Apenas deste mecânico
                getOrdensServico({ status: 'PENDENTE', mecanicoId: userId, page: 0, size: 50 }),
                // 3. Em Execução: Apenas deste mecânico
                getOrdensServico({ status: 'EM_EXECUCAO', mecanicoId: userId, page: 0, size: 50 })
            ]);

            setColunas({
                osAbertas: resAbertas.data.content || [],
                osPendentes: resPendentes.data.content || [],
                osEmExecucao: resExecucao.data.content || []
            });
            
            // Simulação de KPIs com base nos dados carregados (opcional)
            setKpis({
                totalHorasPausa: 0, // Backend needed for real calculation
                totalPausas: 0,
                mediaMinutosPausa: 0
            });

        } catch (err) {
            console.error("Erro ao buscar dados do painel:", err);
            setError("Falha ao carregar as tarefas. Verifique sua conexão.");
        } finally {
            setLoading(false);
        }
    }, [userId]); // Dependência adicionada: userId

    useEffect(() => {
        fetchEquipamentos();
    }, [fetchEquipamentos]);

    useEffect(() => {
        if (userId) {
            fetchPainelData();
        }
    }, [fetchPainelData, userId]);

    const getEquipamentoNome = (id) => {
        return equipamentos.find(e => e.id === id)?.nome || 'Equipamento';
    };

    // --- Ações dos Cards ---
    const handleDarCiencia = async (os) => {
        if (window.confirm(`Assumir a OS #${os.codigoOs}?`)) {
            try {
                await registrarCiencia(os.id);
                fetchPainelData(); 
            } catch (err) {
                alert("Falha ao dar ciência na OS.");
            }
        }
    };

    const handleIniciar = async (os) => {
         try {
            await iniciarExecucao(os.id);
            fetchPainelData();
        } catch (err) {
            alert("Falha ao iniciar a OS.");
        }
    };

    const handleExecutar = (os) => {
        setSelectedOs(os);
        setIsExecucaoModalOpen(true);
    };

    // --- Ações do Modal de Execução ---
    const handleFinalizacaoSubmit = async (dadosExecucao) => {
        if (!selectedOs) return;
        setActionLoading(true);
        try {
            await registrarExecucao(selectedOs.id, dadosExecucao);
            alert(`OS #${selectedOs.codigoOs} foi finalizada com sucesso!`);
            setIsExecucaoModalOpen(false);
            setSelectedOs(null);
            fetchPainelData();
        } catch (error) {
            alert(error?.response?.data?.message || "Falha ao registrar execução.");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="painel-mecanico-container">
            
            <header className="painel-header">
                <h1>Meu Painel de Tarefas</h1>
                <div className="kpi-container">
                    <div className="kpi-filtros">
                        <label>Período:</label>
                        <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
                        <label>até</label>
                        <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
                    </div>
                    {/* KPIs Visuais (Dados Mockados ou zerados até ter endpoint específico) */}
                    <div className="kpi-card">
                        <h3><FaBusinessTime /> Horas em Pausa</h3>
                        <span>{kpis.totalHorasPausa.toFixed(2)}</span>
                    </div>
                    <div className="kpi-card">
                        <h3><FaClipboardList /> Total de Pausas</h3>
                        <span>{kpis.totalPausas}</span>
                    </div>
                    <div className="kpi-card">
                        <h3><FaHourglassHalf /> Média por Pausa</h3>
                        <span>{kpis.mediaMinutosPausa.toFixed(1)} min</span>
                    </div>
                </div>
            </header>

            {error && <p className="painel-error">{error}</p>}
            
            <div className="kanban-container">
                {/* Coluna 1: Novas (Visível para todos) */}
                <div className="kanban-coluna">
                    <h2 className="coluna-titulo" style={{'--cor-coluna': '#dc3545'}}>
                        Novas (Abertas) <span>({colunas.osAbertas.length})</span>
                    </h2>
                    <div className="coluna-body">
                        {loading ? <p>Carregando...</p> : colunas.osAbertas.map(os => (
                            <OsCard 
                                key={os.id} 
                                os={os} 
                                equipamentoNome={getEquipamentoNome(os.equipamentoId)}
                                onCiencia={handleDarCiencia}
                            />
                        ))}
                        {!loading && colunas.osAbertas.length === 0 && <p className="empty-msg">Nenhuma OS aberta no momento.</p>}
                    </div>
                </div>

                {/* Coluna 2: Minha Fila (Pessoal) */}
                <div className="kanban-coluna">
                    <h2 className="coluna-titulo" style={{'--cor-coluna': '#007bff'}}>
                        Minha Fila (Pendentes) <span>({colunas.osPendentes.length})</span>
                    </h2>
                    <div className="coluna-body">
                         {loading ? <p>Carregando...</p> : colunas.osPendentes.map(os => (
                            <OsCard 
                                key={os.id} 
                                os={os} 
                                equipamentoNome={getEquipamentoNome(os.equipamentoId)}
                                onIniciar={handleIniciar}
                            />
                        ))}
                        {!loading && colunas.osPendentes.length === 0 && <p className="empty-msg">Sua fila está vazia.</p>}
                    </div>
                </div>

                {/* Coluna 3: Em Execução (Pessoal) */}
                <div className="kanban-coluna">
                    <h2 className="coluna-titulo" style={{'--cor-coluna': '#ffc107'}}>
                        Em Execução <span>({colunas.osEmExecucao.length})</span>
                    </h2>
                    <div className="coluna-body">
                         {loading ? <p>Carregando...</p> : colunas.osEmExecucao.map(os => (
                            <OsCard 
                                key={os.id} 
                                os={os} 
                                equipamentoNome={getEquipamentoNome(os.equipamentoId)}
                                onExecutar={handleExecutar}
                            />
                        ))}
                        {!loading && colunas.osEmExecucao.length === 0 && <p className="empty-msg">Nenhuma OS em execução.</p>}
                    </div>
                </div>
            </div>

            {isExecucaoModalOpen && selectedOs && (
                <ExecucaoModal 
                    isOpen={isExecucaoModalOpen}
                    onClose={() => setIsExecucaoModalOpen(false)}
                    onSubmit={handleFinalizacaoSubmit} 
                    os={selectedOs}
                    actionLoading={actionLoading}
                />
            )}
        </div>
    );
}

export default PainelMecanicoPage;