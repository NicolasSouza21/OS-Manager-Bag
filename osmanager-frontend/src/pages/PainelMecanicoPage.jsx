// Local: osmanager-frontend/src/pages/PainelMecanicoPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPainelMecanico, registrarCiencia, iniciarExecucao, getEquipamentos } from '../services/apiService';
import ExecucaoModal from '../components/ExecucaoModal'; // Vamos reutilizar o modal
import './PainelMecanicoPage.css'; // Vamos criar este CSS a seguir
import { FaCheck, FaPlay, FaTools, FaHourglassHalf, FaClipboardList, FaBusinessTime } from 'react-icons/fa';

// Função para formatar as datas do filtro
const getMesAtualFormatado = (date) => {
    return date.toISOString().slice(0, 10); // Retorna "YYYY-MM-DD"
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
        e.stopPropagation(); // Impede que o clique no botão acione o clique no card
        actionFn(os);
    };

    return (
        <div className="kanban-card" onClick={() => navigate(`/os/${os.id}`)}>
            <div className="card-header">
                <span className={`card-tipo ${tipoClass}`}>{os.tipoManutencao.substring(0, 4)}</span>
                <span className={`card-prioridade ${prioridadeClass}`}>{os.prioridade || 'MÉDIA'}</span>
            </div>
            <div className="card-body">
                <h4 className="card-title">#{os.codigoOs} - {equipamentoNome}</h4>
                <p className="card-descricao">{os.descricaoProblema}</p>
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
    const [kpis, setKpis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [equipamentos, setEquipamentos] = useState([]);
    
    // Estados dos Modais
    const [selectedOs, setSelectedOs] = useState(null);
    const [isExecucaoModalOpen, setIsExecucaoModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false); // Loading para finalizar OS
    const [isReportLoading, setIsReportLoading] = useState(false); // Loading para salvar relatório

    // Filtros de data para os KPIs
    const [dataInicio, setDataInicio] = useState(getPrimeiroDiaMes());
    const [dataFim, setDataFim] = useState(getHoje());

    const fetchEquipamentos = useCallback(async () => {
        try {
            const res = await getEquipamentos();
            setEquipamentos(res.data || []);
        } catch (err) {
            console.error("Erro ao buscar equipamentos:", err);
        }
    }, []);

    const fetchPainelData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await getPainelMecanico(dataInicio, dataFim);
            setColunas({
                osAbertas: res.data.osAbertas || [],
                osPendentes: res.data.osPendentes || [],
                osEmExecucao: res.data.osEmExecucao || []
            });
            setKpis(res.data.kpisPausa || null);
        } catch (err) {
            console.error("Erro ao buscar dados do painel:", err);
            setError("Falha ao carregar o painel. Verifique sua conexão ou tente mais tarde.");
        } finally {
            setLoading(false);
        }
    }, [dataInicio, dataFim]);

    useEffect(() => {
        fetchEquipamentos();
        fetchPainelData();
    }, [fetchEquipamentos, fetchPainelData]);

    const getEquipamentoNome = (id) => {
        return equipamentos.find(e => e.id === id)?.nome || 'Equipamento';
    };

    // --- Ações dos Cards ---
    const handleDarCiencia = async (os) => {
        if (window.confirm(`Assumir a OS #${os.codigoOs}?`)) {
            try {
                await registrarCiencia(os.id);
                fetchPainelData(); // Atualiza o painel
            } catch (err) {
                alert("Falha ao dar ciência na OS.");
            }
        }
    };

    const handleIniciar = async (os) => {
         try {
            await iniciarExecucao(os.id);
            fetchPainelData(); // Atualiza o painel
        } catch (err) {
            alert("Falha ao iniciar a OS.");
        }
    };

    const handleExecutar = (os) => {
        setSelectedOs(os);
        setIsExecucaoModalOpen(true);
    };

    // --- Ações do Modal de Execução ---
    // (Lógica reaproveitada do DashboardPage)
    const handleFinalizacaoSubmit = async (dadosExecucao) => {
        if (!selectedOs) return;
        setActionLoading(true);
        try {
            await registrarExecucao(selectedOs.id, dadosExecucao);
            alert(`OS #${selectedOs.codigoOs} foi finalizada com sucesso!`);
            setIsExecucaoModalOpen(false);
            setSelectedOs(null);
            fetchPainelData(); // Atualiza o painel
        } catch (error) {
            alert(error?.response?.data?.message || "Falha ao registrar execução.");
        } finally {
            setActionLoading(false);
        }
    };

    // (Lógica reaproveitada do DashboardPage)
    const handleSalvarRelatorio = async (dadosRelatorio, onSuccessCallback) => {
        setIsReportLoading(true);
        try {
            await criarAcompanhamento(dadosRelatorio);
            alert('Acompanhamento salvo com sucesso!');
            if (onSuccessCallback) onSuccessCallback();
            // Não precisamos recarregar o painel aqui, só o modal
        } catch (error) {
            console.error("Erro ao salvar acompanhamento:", error);
            alert(error?.response?.data?.message || "Falha ao salvar o acompanhamento.");
        } finally {
            setIsReportLoading(false);
        }
    };

    return (
        <div className="painel-mecanico-container">
            
            {/* --- Cabeçalho e KPIs --- */}
            <header className="painel-header">
                <h1>Meu Painel de Tarefas</h1>
                <div className="kpi-container">
                    {/* Filtros de Data para KPIs */}
                    <div className="kpi-filtros">
                        <label>Exibindo KPIs de:</label>
                        <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
                        <label>até:</label>
                        <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
                    </div>
                    {/* KPIs de Pausa */}
                    {kpis ? (
                        <>
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
                        </>
                    ) : (
                        <p>Calculando KPIs...</p>
                    )}
                </div>
            </header>

            {error && <p className="painel-error">{error}</p>}
            
            {/* --- Colunas do Kanban --- */}
            <div className="kanban-container">
                {/* Coluna 1: Novas */}
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
                    </div>
                </div>

                {/* Coluna 2: Minha Fila */}
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
                    </div>
                </div>

                {/* Coluna 3: Em Execução */}
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
                    </div>
                </div>
            </div>

            {/* Modal de Execução (Reaproveitado) */}
            {isExecucaoModalOpen && selectedOs && (
                <ExecucaoModal 
                    isOpen={isExecucaoModalOpen}
                    onClose={() => setIsExecucaoModalOpen(false)}
                    onFinalizar={handleFinalizacaoSubmit}
                    onSalvarRelatorio={handleSalvarRelatorio}
                    os={selectedOs}
                    actionLoading={actionLoading}
                    isReportLoading={isReportLoading}
                />
            )}
        </div>
    );
}

export default PainelMecanicoPage;