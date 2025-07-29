import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    getOrdensServico, 
    getEquipamentos, 
    getLocais, 
    registrarCiencia, 
    iniciarExecucao,
    registrarExecucao,
    verificarOS
} from '../services/apiService';
import ExecucaoModal from '../components/ExecucaoModal';
import VerificacaoModal from '../components/VerificacaoModal';
import { jwtDecode } from 'jwt-decode';
import { FaSearch, FaCheck, FaTools, FaPlay, FaClipboardCheck } from 'react-icons/fa';
import './DashBoardPage.css';

// ✨ NOVO: Hook customizado para "atrasar" a busca (debounce)
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Cria um timer que só vai atualizar o valor após o 'delay'
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Limpa o timer se o valor mudar antes do fim do 'delay'
        // Isso garante que a busca só ocorra quando o usuário parar de digitar
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // Roda apenas se o valor ou o delay mudarem

    return debouncedValue;
}

// Funções de formatação de data (SEU CÓDIGO ORIGINAL)
const parseSafeDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset);
};

// Função de agrupar por data (SEU CÓDIGO ORIGINAL)
const groupOrdensByDate = (ordens) => {
    const groups = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    ordens.forEach(os => {
        const dateString = os.tipoManutencao === 'PREVENTIVA' && os.dataInicioPreventiva 
            ? os.dataInicioPreventiva 
            : os.dataSolicitacao;
        const osDate = parseSafeDate(dateString);

        if (!osDate) {
            if (!groups['Sem Data']) { groups['Sem Data'] = []; }
            groups['Sem Data'].push(os);
            return;
        }
        
        osDate.setHours(0, 0, 0, 0);

        let dateKey;
        if (osDate.getTime() === today.getTime()) { 
            dateKey = 'Hoje';
        } else if (osDate.getTime() === tomorrow.getTime()) {
            dateKey = 'Amanhã';
        } else if (osDate.getTime() === yesterday.getTime()) { 
            dateKey = 'Ontem';
        } else if (osDate > tomorrow) {
            dateKey = 'Datas Futuras';
        } else {
            dateKey = osDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }

        if (!groups[dateKey]) { groups[dateKey] = []; }
        groups[dateKey].push(os);
    });
    return groups;
};


function DashboardPage() {
    const navigate = useNavigate();
    const [ordens, setOrdens] = useState([]);
    const [equipamentos, setEquipamentos] = useState([]);
    const [locais, setLocais] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOs, setSelectedOs] = useState(null);
    const [userRole, setUserRole] = useState('');
    const [userId, setUserId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [isExecucaoModalOpen, setIsExecucaoModalOpen] = useState(false);
    const [isVerificacaoModalOpen, setIsVerificacaoModalOpen] = useState(false);
    
    // O estado 'filtros' é atualizado instantaneamente a cada digitação
    const [filtros, setFiltros] = useState({
        keyword: '', 
        status: '', 
        equipamentoId: '', 
        localId: '',
        tipoManutencao: '',
        minhasTarefas: false, 
        aguardandoVerificacao: false,
        dataInicio: '',
        dataFim: '',
    });
    
    // ✨ ALTERAÇÃO 1: Cria uma versão "atrasada" dos filtros que só atualiza 500ms após o usuário parar de digitar
    const debouncedFiltros = useDebounce(filtros, 500);

    const statusOptions = [
        { label: 'Abertas', value: 'ABERTA' }, { label: 'Ciente', value: 'CIENTE' },
        { label: 'Em Execução', value: 'EM_EXECUCAO' }, { label: 'Aguardando Verificação', value: 'AGUARDANDO_VERIFICACAO' },
        { label: 'Concluída', value: 'CONCLUIDA' }, { label: 'Cancelada', value: 'CANCELADA' }
    ];

    // ✨ ALTERAÇÃO 2: A função `fetchData` agora usa a versão "atrasada" (debounced) dos filtros
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: 0, 
                size: 200, 
                sort: 'dataSolicitacao,desc',
                keyword: debouncedFiltros.keyword, 
                status: debouncedFiltros.aguardandoVerificacao ? 'AGUARDANDO_VERIFICACAO' : debouncedFiltros.status,
                tipoManutencao: debouncedFiltros.tipoManutencao,
                equipamentoId: debouncedFiltros.equipamentoId, 
                localId: debouncedFiltros.localId,
                mecanicoId: debouncedFiltros.minhasTarefas ? userId : null,
                dataInicio: debouncedFiltros.dataInicio,
                dataFim: debouncedFiltros.dataFim,
            };
            Object.keys(params).forEach(key => { if (!params[key]) delete params[key]; });
            
            const osRes = await getOrdensServico(params);
            setOrdens(osRes.data.content || []);
        } catch (err) {
            console.error("Erro ao carregar Ordens de Serviço:", err);
            setOrdens([]);
        } finally {
            setLoading(false);
        }
    }, [debouncedFiltros, userId]); // A dependência agora é a versão "atrasada"

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            const decoded = jwtDecode(token);
            setUserRole(decoded.roles[0] || '');
            setUserId(decoded.userId || null);
        }
        const fetchInitialData = async () => {
            try {
                const [equipsRes, locaisRes] = await Promise.all([getEquipamentos(), getLocais()]);
                setEquipamentos(equipsRes.data);
                setLocais(locaisRes.data);
            } catch (error) { console.error("Erro ao carregar equipamentos ou locais", error); }
        };
        fetchInitialData();
    }, []);

    // ✨ ALTERAÇÃO 3: O useEffect que dispara a busca agora depende da função `fetchData`
    // Ele só vai rodar quando o `debouncedFiltros` mudar, pois isso recria a `fetchData`.
    useEffect(() => {
        if (userId !== null) { 
            fetchData(); 
        }
    }, [fetchData, userId]);
    
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({ ...prev, [name]: value }));
    };

    const handleToggleFilter = (filterName) => {
        const newFilters = { 
            ...filtros, 
            minhasTarefas: false, 
            aguardandoVerificacao: false, 
            [filterName]: !filtros[filterName] 
        };
        if (newFilters.aguardandoVerificacao) {
            newFilters.status = '';
        }
        setFiltros(newFilters);
    };
    
    const formatLabel = (status) => !status ? '' : status.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    const getEquipamentoNome = (id) => equipamentos.find(e => e.id === id)?.nome || 'N/A';
    
    const renderDataRelevante = (os) => {
        const dateString = os.tipoManutencao === 'PREVENTIVA' && os.dataInicioPreventiva ? os.dataInicioPreventiva : os.dataSolicitacao;
        const date = parseSafeDate(dateString);
        if (!date) return '—';
        const options = os.tipoManutencao === 'PREVENTIVA' ? { day: '2-digit', month: '2-digit', year: 'numeric' } : { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleString('pt-BR', options);
    };

    const handleExecucaoSubmit = async (dadosExecucao) => {
        if (!selectedOs) return;
        setActionLoading(true);
        try {
            await registrarExecucao(selectedOs.id, dadosExecucao);
            alert(`OS #${selectedOs.codigoOs} foi finalizada com sucesso!`);
            setIsExecucaoModalOpen(false);
            setSelectedOs(null);
            fetchData();
        } catch (error) {
            alert(error?.response?.data?.message || "Falha ao registrar execução.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerificacaoSubmit = async (dadosVerificacao) => {
        if (!selectedOs) return;
        setActionLoading(true);
        try {
            await verificarOS(selectedOs.id, dadosVerificacao);
            alert(`OS #${selectedOs.codigoOs} foi verificada com sucesso!`);
            setIsVerificacaoModalOpen(false);
            setSelectedOs(null);
            fetchData();
        } catch (error) {
            alert(error?.response?.data?.message || "Falha ao registrar verificação.");
        } finally {
            setActionLoading(false);
        }
    };
    
    const renderAcoes = (os) => {
        const isMecanicoOrLider = userRole.includes('MECANICO') || userRole.includes('LIDER');
        const isEncarregado = userRole.includes('ENCARREGADO');

        return (
            <div className="actions-cell">
                <div className="dynamic-actions-container">
                    {isMecanicoOrLider && os.status === 'ABERTA' && (<button title="Dar Ciência" className="action-button-circle ciencia-btn" onClick={() => registrarCiencia(os.id).then(fetchData)}><FaCheck /></button>)}
                    {isMecanicoOrLider && os.status === 'CIENTE' && (<button title="Iniciar Execução" className="action-button-circle iniciar-btn" onClick={() => iniciarExecucao(os.id).then(fetchData)}><FaPlay /></button>)}
                    {isMecanicoOrLider && os.status === 'EM_EXECUCAO' && (<button title="Preencher e Finalizar OS" className="action-button-circle executar-btn" onClick={() => { setSelectedOs(os); setIsExecucaoModalOpen(true); }}><FaTools /></button>)}
                    
                    {isEncarregado && os.status === 'AGUARDANDO_VERIFICACAO' && (
                        <button title="Verificar OS" className="action-button-circle verificar-btn" onClick={() => { setSelectedOs(os); setIsVerificacaoModalOpen(true); }}>
                            <FaClipboardCheck />
                        </button>
                    )}
                </div>
                <button title="Visualizar Detalhes" className="view-button" onClick={() => navigate(`/os/${os.id}`)}><FaSearch /></button>
            </div>
        );
    };

    if (loading) return <div className="loading">Carregando...</div>;

    const groupedOrdens = groupOrdensByDate(ordens);
    const orderedDateKeys = Object.keys(groupedOrdens).sort((a, b) => {
        const specialOrder = { 'Hoje': 1, 'Amanhã': 2, 'Datas Futuras': 3, 'Ontem': 4 };
        const aOrder = specialOrder[a];
        const bOrder = specialOrder[b];
        if (aOrder && bOrder) return aOrder - bOrder;
        if (aOrder) return -1;
        if (bOrder) return 1;
        if (a === 'Sem Data') return 1;
        if (b === 'Sem Data') return -1;
        const dateA = a.split('/').reverse().join('-');
        const dateB = b.split('/').reverse().join('-');
        return dateB.localeCompare(dateA);
    });

    return (
        <div className="dashboard-container">
            <main>
                <h1 className="dashboard-title">Painel de Ordens de Serviço</h1>

                <div className="filtros-container">
                    <input type="text" name="keyword" className="filtro-input-busca" placeholder="Buscar por Nº OS ou Equipamento..." value={filtros.keyword} onChange={handleFilterChange} />
                    
                    <div className="filtro-data-item">
                        <label htmlFor="dataInicio">De:</label>
                        <input type="date" name="dataInicio" id="dataInicio" className="filtro-input-data" value={filtros.dataInicio} onChange={handleFilterChange} />
                    </div>

                    <div className="filtro-data-item">
                        <label htmlFor="dataFim">Até:</label>
                        <input type="date" name="dataFim" id="dataFim" className="filtro-input-data" value={filtros.dataFim} onChange={handleFilterChange} />
                    </div>

                    <select name="tipoManutencao" className="filtro-select" value={filtros.tipoManutencao} onChange={handleFilterChange}>
                        <option value="">Tipo (Todos)</option>
                        <option value="CORRETIVA">Corretiva</option>
                        <option value="PREVENTIVA">Preventiva</option>
                    </select>
                    <select name="status" className="filtro-select" value={filtros.status} onChange={handleFilterChange} disabled={filtros.aguardandoVerificacao}>
                        <option value="">Status (Todos)</option>
                        {statusOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                    </select>
                    <select name="equipamentoId" className="filtro-select" value={filtros.equipamentoId} onChange={handleFilterChange}>
                        <option value="">Equipamento (Todos)</option>
                        {equipamentos.map(e => (<option key={e.id} value={e.id}>{e.nome}</option>))}
                    </select>
                    <button className={`filtro-btn-rapido ${filtros.minhasTarefas ? 'ativo' : ''}`} onClick={() => handleToggleFilter('minhasTarefas')}>Minhas Tarefas</button>
                    
                    {userRole.includes('ENCARREGADO') && (<button className={`filtro-btn-rapido ${filtros.aguardandoVerificacao ? 'ativo' : ''}`} onClick={() => handleToggleFilter('aguardandoVerificacao')}>Aguardando Minha Verificação</button>)}
                </div>
                
                <div className="os-list-container">
                    {ordens.length > 0 ? (
                        orderedDateKeys.map(dateKey => (
                            <div key={dateKey} className="os-date-group">
                                <h3 className="date-header">{dateKey}</h3>
                                <div className="table-container">
                                    <table className="os-table">
                                        <thead>
                                            <tr>
                                                <th>Status</th>
                                                <th>Nº O.S.</th>
                                                <th>Data Abertura / Programada</th>
                                                <th>Tipo</th>
                                                <th>Equipamento</th>
                                                <th>Solicitante</th>
                                                <th>Ciência Por</th>
                                                <th>Executado Por</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groupedOrdens[dateKey].map(os => (
                                                <tr key={os.id}>
                                                    <td><span className={`status-pill status-${os.status?.toLowerCase()}`}>{formatLabel(os.status)}</span></td>
                                                    <td>{os.codigoOs}</td>
                                                    <td>{renderDataRelevante(os)}</td>
                                                    <td><span className={`tipo-pill tipo-${os.tipoManutencao?.toLowerCase()}`}>{formatLabel(os.tipoManutencao)}</span></td>
                                                    <td>{getEquipamentoNome(os.equipamentoId)}</td>
                                                    <td>{os.solicitante || 'N/A'}</td>
                                                    <td>{os.liderCienciaNome || 'Pendente'}</td>
                                                    <td>{os.executadoPorNome || 'Pendente'}</td>
                                                    <td>{renderAcoes(os)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-os-message">Nenhuma Ordem de Serviço encontrada com os filtros atuais.</div>
                    )}
                </div>
            </main>

            {isExecucaoModalOpen && selectedOs && (
                <ExecucaoModal 
                    isOpen={isExecucaoModalOpen}
                    onClose={() => setIsExecucaoModalOpen(false)}
                    onSubmit={handleExecucaoSubmit}
                    os={selectedOs}
                    actionLoading={actionLoading}
                />
            )}

            {isVerificacaoModalOpen && selectedOs && (
                <VerificacaoModal
                    isOpen={isVerificacaoModalOpen}
                    onClose={() => setIsVerificacaoModalOpen(false)}
                    onSubmit={handleVerificacaoSubmit}
                    os={{...selectedOs, equipamentoNome: getEquipamentoNome(selectedOs.equipamentoId)}}
                    actionLoading={actionLoading}
                />
            )}
        </div>
    );
}

export default DashboardPage;