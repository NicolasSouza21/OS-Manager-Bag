// Local: osmanager-frontend/src/pages/PainelMecanicoPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { 
    registrarCiencia, 
    iniciarExecucao, 
    getEquipamentos, 
    getOrdensServico, 
    registrarExecucao,
    criarAcompanhamento 
} from '../services/apiService';
import ExecucaoModal from '../components/ExecucaoModal';
import './PainelMecanicoPage.css';

// Ícones básicos seguros
import { FaCheck, FaPlay, FaTools, FaClipboardList, FaBusinessTime, FaHourglassHalf, FaUser, FaPauseCircle } from 'react-icons/fa';

// --- Funções de Data ---
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

// --- COMPONENTE CARD (Agora Inteligente para Pausas) ---
const OsCard = ({ os, equipamentoNome, onCiencia, onIniciar, onExecutar, currentUserName }) => {
    const navigate = useNavigate();
    
    // Classes de Badges
    const tipoLabel = os.tipoManutencao ? os.tipoManutencao.substring(0, 4) : 'OS';
    const tipoClass = `badge-${tipoLabel.toLowerCase()}`; 
    const prioridadeClass = `badge-${os.prioridade?.toLowerCase() || 'media'}`;

    const executorNome = os.executadoPorNome || 'Desconhecido';
    const isMe = currentUserName && executorNome.toLowerCase().includes(currentUserName.toLowerCase().split(' ')[0]);

    const handleActionClick = (e, actionFn) => {
        e.stopPropagation();
        actionFn(os);
    };

    // ✨ LÓGICA DE EXIBIÇÃO INTELIGENTE (PAUSAS E RELATÓRIOS)
    const getConteudoRelatorio = () => {
        // 1. Se tiver acompanhamentos (histórico), pegamos o último para mostrar o status real
        if (os.acompanhamentos && os.acompanhamentos.length > 0) {
            // Pega o último registro (assumindo ordem cronológica ou inserção)
            const ultimo = os.acompanhamentos[os.acompanhamentos.length - 1];
            
            // Se o último registro foi uma PAUSA
            if (ultimo.motivoPausa) {
                return {
                    tipo: 'PAUSA',
                    texto: `⏸️ Pausa: ${ultimo.motivoPausa} (${ultimo.minutosPausa || 0} min)`,
                    cor: '#856404', // Amarelo escuro
                    bg: '#fff3cd',
                    borda: '#ffeeba'
                };
            }
            // Se foi um relatório de trabalho
            if (ultimo.descricao) {
                return {
                    tipo: 'RELATORIO',
                    texto: ultimo.descricao,
                    cor: '#155724', // Verde
                    bg: '#f0fff4',
                    borda: '#28a745'
                };
            }
        }

        // 2. Se não tiver histórico detalhado, tenta usar o campo acumulado acaoRealizada
        if (os.acaoRealizada && os.acaoRealizada.trim().length > 0) {
            return {
                tipo: 'GERAL',
                texto: os.acaoRealizada,
                cor: '#155724',
                bg: '#f0fff4',
                borda: '#28a745'
            };
        }

        return null;
    };

    const infoRelatorio = getConteudoRelatorio();

    return (
        <div className={`kanban-card ${isMe && os.status === 'EM_EXECUCAO' ? 'card-meu-foco' : ''}`} onClick={() => navigate(`/os/${os.id}`)}>
            {/* Header com Badges */}
            <div className="card-header-badges">
                <span className={`card-badge ${tipoClass}`}>{tipoLabel}</span>
                <span className={`card-badge ${prioridadeClass}`}>{os.prioridade || 'MÉDIA'}</span>
            </div>
            
            <div className="card-body">
                <h4 className="card-title">#{os.codigoOs} - {equipamentoNome}</h4>
                
                {/* Seção Problema */}
                <div className="card-problem-box">
                    <p className="card-text-muted">
                        <strong>Problema: </strong>
                        {os.descricaoProblema || 'Sem descrição.'}
                    </p>
                </div>

                {/* Seção Relatório / Pausa (Dinâmica) */}
                {infoRelatorio && (
                    <div className="card-report-box" style={{ 
                        backgroundColor: infoRelatorio.bg, 
                        borderLeft: `4px solid ${infoRelatorio.borda}`,
                        color: infoRelatorio.cor
                    }}>
                        <span className="report-label" style={{ color: infoRelatorio.cor }}>
                            {infoRelatorio.tipo === 'PAUSA' ? <FaPauseCircle /> : <FaClipboardList />} 
                            {infoRelatorio.tipo === 'PAUSA' ? ' Status: Pausado' : ' Último Apontamento:'}
                        </span>
                        <p className="card-text-report" style={{ color: infoRelatorio.cor }}>
                            {infoRelatorio.texto}
                        </p>
                    </div>
                )}
            </div>

            {/* Identificação do Executor */}
            <div className="card-meta">
                <FaUser /> {isMe ? 'Você executando' : executorNome.split(' ')[0]}
            </div>

            <div className="card-footer">
                {os.status === 'ABERTA' && (
                    <button className="btn-card btn-ciencia" onClick={(e) => handleActionClick(e, onCiencia)}>Assumir</button>
                )}
                {os.status === 'PENDENTE' && (
                    <button className="btn-card btn-iniciar" onClick={(e) => handleActionClick(e, onIniciar)}>Iniciar</button>
                )}
                {os.status === 'EM_EXECUCAO' && (
                    <button className="btn-card btn-executar" onClick={(e) => handleActionClick(e, onExecutar)}><FaTools /> Apontar / Finalizar</button>
                )}
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
function PainelMecanicoPage() {
    const [colunas, setColunas] = useState({ osAbertas: [], osPendentes: [], osEmExecucao: [] });
    const [kpis, setKpis] = useState({ totalHorasPausa: 0, totalPausas: 0, mediaMinutosPausa: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [equipamentos, setEquipamentos] = useState([]);
    
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState('');
    
    const [selectedOs, setSelectedOs] = useState(null);
    const [isExecucaoModalOpen, setIsExecucaoModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [isReportLoading, setIsReportLoading] = useState(false);

    const [dataInicio, setDataInicio] = useState(getPrimeiroDiaMes());
    const [dataFim, setDataFim] = useState(getHoje());

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserId(decoded.userId);
                setUserName(decoded.sub || decoded.name || decoded.nome || ''); 
            } catch (e) {
                console.error("Erro token", e);
            }
        }
    }, []);

    const fetchEquipamentos = useCallback(async () => {
        try {
            const res = await getEquipamentos();
            setEquipamentos(res.data || []);
        } catch (err) { console.error(err); }
    }, []);

    const fetchKPIs = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await getOrdensServico({
                mecanicoId: userId,
                dataInicio: dataInicio,
                dataFim: dataFim,
                size: 200 
            });
            const listaOs = res.data.content || [];
            let totalMinutos = 0;
            let qtdPausas = 0;

            listaOs.forEach(os => {
                // Soma de propriedades possíveis de pausa
                const minutos = Number(os.totalMinutosPausa || os.minutosPausa || 0);
                const qtd = Number(os.quantidadePausas || (minutos > 0 ? 1 : 0)); 
                
                // Se tiver lista de acompanhamentos, soma as pausas de lá também para garantir
                if (os.acompanhamentos) {
                    os.acompanhamentos.forEach(acomp => {
                        if (acomp.motivoPausa) {
                            totalMinutos += (acomp.minutosPausa || 0);
                            qtdPausas++;
                        }
                    });
                } else {
                    // Fallback se não tiver lista detalhada
                    totalMinutos += minutos;
                    qtdPausas += qtd;
                }
            });

            // Ajuste simples para não duplicar se a API já retornar somado
            // (Essa lógica depende do backend, aqui é uma proteção genérica)
            const horas = totalMinutos / 60;
            const media = qtdPausas > 0 ? (totalMinutos / qtdPausas) : 0;

            setKpis({ totalHorasPausa: horas, totalPausas: qtdPausas, mediaMinutosPausa: media });
        } catch (error) {
            console.error("Erro KPIs", error);
        }
    }, [userId, dataInicio, dataFim]);

    const fetchPainelData = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        setError('');
        try {
            const [resAbertas, resPendentes, resExecucao] = await Promise.all([
                getOrdensServico({ status: 'ABERTA', page: 0, size: 50, sort: 'prioridade,asc' }),
                getOrdensServico({ status: 'PENDENTE', page: 0, size: 50 }), 
                getOrdensServico({ status: 'EM_EXECUCAO', page: 0, size: 50 })
            ]);

            setColunas({
                osAbertas: resAbertas.data.content || [],
                osPendentes: resPendentes.data.content || [],
                osEmExecucao: resExecucao.data.content || []
            });
            fetchKPIs();
        } catch (err) {
            setError("Falha ao carregar tarefas.");
        } finally {
            setLoading(false);
        }
    }, [userId, fetchKPIs]); 

    useEffect(() => { fetchKPIs(); }, [fetchKPIs, dataInicio, dataFim]);
    useEffect(() => { fetchEquipamentos(); }, [fetchEquipamentos]);
    useEffect(() => { if (userId) fetchPainelData(); }, [fetchPainelData, userId]);

    const getEquipamentoNome = (id) => equipamentos.find(e => e.id === id)?.nome || 'Equipamento';

    const handleDarCiencia = async (os) => {
        if (window.confirm(`Assumir OS #${os.codigoOs}?`)) {
            try { await registrarCiencia(os.id); fetchPainelData(); } catch (err) { alert("Erro ao dar ciência."); }
        }
    };

    const handleIniciar = async (os) => {
        try { await iniciarExecucao(os.id); fetchPainelData(); } catch (err) { alert("Erro ao iniciar."); }
    };

    const handleExecutar = (os) => {
        setSelectedOs(os);
        setIsExecucaoModalOpen(true);
    };

    const handleFinalizacaoSubmit = async (dadosExecucao) => {
        if (!selectedOs) return;
        setActionLoading(true);
        try {
            await registrarExecucao(selectedOs.id, dadosExecucao);
            alert(`OS #${selectedOs.codigoOs} finalizada!`);
            setIsExecucaoModalOpen(false);
            setSelectedOs(null);
            fetchPainelData();
        } catch (error) {
            alert(error?.response?.data?.message || "Erro na finalização.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSalvarRelatorio = async (dadosRelatorio, onSuccess) => {
        if (!selectedOs) return;
        setIsReportLoading(true);
        try {
            // Envia o payload. O backend deve processar 'motivoPausa' ou 'descricao'.
            await criarAcompanhamento({
                ...dadosRelatorio,
                ordemServicoId: selectedOs.id
            });
            
            alert("Registro salvo com sucesso!");
            if (onSuccess) onSuccess(); 
            fetchPainelData(); // Atualiza para mostrar o novo card
        } catch (error) {
            console.error("Erro salvar:", error);
            alert(error?.response?.data?.message || "Erro ao salvar.");
        } finally {
            setIsReportLoading(false);
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
                    <div className="kpi-card"><h3><FaBusinessTime /> Horas Pausa</h3><span>{kpis.totalHorasPausa.toFixed(2)}</span></div>
                    <div className="kpi-card"><h3><FaClipboardList /> Total Pausas</h3><span>{kpis.totalPausas}</span></div>
                    <div className="kpi-card"><h3><FaHourglassHalf /> Média Pausa</h3><span>{kpis.mediaMinutosPausa.toFixed(1)}m</span></div>
                </div>
            </header>
            
            {error && <p className="painel-error">{error}</p>}
            
            <div className="kanban-container">
                <div className="kanban-coluna">
                    <h2 className="coluna-titulo" style={{'--cor-coluna': '#dc3545'}}>Novas ({colunas.osAbertas.length})</h2>
                    <div className="coluna-body">
                        {loading ? <p>Carregando...</p> : colunas.osAbertas.map(os => (
                            <OsCard key={os.id} os={os} equipamentoNome={getEquipamentoNome(os.equipamentoId)} onCiencia={handleDarCiencia} currentUserName={userName} />
                        ))}
                    </div>
                </div>
                <div className="kanban-coluna">
                    <h2 className="coluna-titulo" style={{'--cor-coluna': '#007bff'}}>Minha Fila ({colunas.osPendentes.length})</h2>
                    <div className="coluna-body">
                         {loading ? <p>Carregando...</p> : colunas.osPendentes.map(os => (
                            <OsCard key={os.id} os={os} equipamentoNome={getEquipamentoNome(os.equipamentoId)} onIniciar={handleIniciar} currentUserName={userName} />
                        ))}
                    </div>
                </div>
                <div className="kanban-coluna">
                    <h2 className="coluna-titulo" style={{'--cor-coluna': '#ffc107'}}>Em Execução ({colunas.osEmExecucao.length})</h2>
                    <div className="coluna-body">
                         {loading ? <p>Carregando...</p> : colunas.osEmExecucao.map(os => (
                            <OsCard key={os.id} os={os} equipamentoNome={getEquipamentoNome(os.equipamentoId)} onExecutar={handleExecutar} currentUserName={userName} />
                        ))}
                    </div>
                </div>
            </div>

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