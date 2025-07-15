import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    getOrdensServico, 
    getEquipamentos, 
    getLocais, 
    registrarCiencia, 
    iniciarExecucao,
    registrarExecucao 
} from '../services/apiService';
import ExecucaoModal from '../components/ExecucaoModal';
import { jwtDecode } from 'jwt-decode';
import { FaSearch, FaCheck, FaTools, FaPlay } from 'react-icons/fa';
import './DashBoardPage.css';

const parseSafeDate = (dateString) => {
    if (!dateString) return null;
    if (dateString.includes('T')) {
        return new Date(dateString);
    }
    const parts = dateString.split('-');
    if (parts.length === 3) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return null;
};

const groupOrdensByDate = (ordens) => {
    const groups = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

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
        } else if (osDate.getTime() > today.getTime()) {
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
    const [ordensOriginais, setOrdensOriginais] = useState([]);
    
    // ✅ ESTADOS SEPARADOS PARA UMA RENDERIZAÇÃO MAIS CLARA
    const [tarefasFuturas, setTarefasFuturas] = useState({});
    const [historicoOrdens, setHistoricoOrdens] = useState({});
    
    const [equipamentos, setEquipamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOs, setSelectedOs] = useState(null);
    const [userRoles, setUserRoles] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    
    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [osRes, equipsRes] = await Promise.all([
                getOrdensServico({ page: 0, size: 100, sort: 'id,desc' }),
                getEquipamentos(),
            ]);
            setOrdensOriginais(osRes.data.content);
            setEquipamentos(equipsRes.data);
        } catch (err) {
            console.error("Erro ao carregar dados:", err);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setUserRoles(jwtDecode(token).roles || []);
        }
        fetchAllData();
    }, []);
    
    // ✅ USE EFFECT ATUALIZADO PARA SEPARAR OS GRUPOS
    useEffect(() => {
        let filtradas = [...ordensOriginais];
        if (statusFilter) {
            filtradas = filtradas.filter(os => os.status === statusFilter);
        }
        
        const todosOsGrupos = groupOrdensByDate(filtradas);
        const gruposFuturos = {};
        const gruposPassados = {};

        Object.keys(todosOsGrupos).forEach(key => {
            if (key === 'Hoje' || key === 'Amanhã' || key === 'Datas Futuras') {
                gruposFuturos[key] = todosOsGrupos[key];
            } else {
                gruposPassados[key] = todosOsGrupos[key];
            }
        });

        setTarefasFuturas(gruposFuturos);
        setHistoricoOrdens(gruposPassados);

    }, [statusFilter, ordensOriginais]);

    const handleDarCiencia = async (osId) => {
        if (!window.confirm("Confirmar ciência desta OS?")) return;
        try { await registrarCiencia(osId); fetchAllData(); } 
        catch (error) { alert(error.response?.data?.message || "Falha ao registrar ciência."); }
    };

    const handleIniciarExecucao = async (osId) => {
        if (!window.confirm("Iniciar a execução desta OS?")) return;
        try { await iniciarExecucao(osId); fetchAllData(); } 
        catch (error) { alert(error.response?.data?.message || "Falha ao iniciar execução."); }
    };

    const handleExecucaoSubmit = async (dadosExecucao) => {
        if (!selectedOs) return;
        try {
            await registrarExecucao(selectedOs.id, dadosExecucao);
            alert(`OS #${selectedOs.id} foi finalizada com sucesso!`);
            setIsModalOpen(false);
            setSelectedOs(null);
            fetchAllData();
        } catch (error) {
            alert(error.response?.data?.message || "Falha ao registrar execução.");
        }
    };

    const renderAcoes = (os) => {
        const isMecanicoOrLider = userRoles.includes('ROLE_MECANICO') || userRoles.includes('ROLE_LIDER');
        return (
            <div className="actions-cell">
                <div className="dynamic-actions-container">
                    {isMecanicoOrLider && os.status === 'ABERTA' && (<button title="Dar Ciência" className="action-button-circle ciencia-btn" onClick={() => handleDarCiencia(os.id)}><FaCheck /></button>)}
                    {isMecanicoOrLider && os.status === 'CIENTE' && (<button title="Iniciar Execução" className="action-button-circle iniciar-btn" onClick={() => handleIniciarExecucao(os.id)}><FaPlay /></button>)}
                    {isMecanicoOrLider && os.status === 'EM_EXECUCAO' && (<button title="Preencher e Finalizar OS" className="action-button-circle executar-btn" onClick={() => { setSelectedOs(os); setIsModalOpen(true); }}><FaTools /></button>)}
                </div>
                <button title="Visualizar Detalhes" className="view-button" onClick={() => navigate(`/os/${os.id}`)}><FaSearch /></button>
            </div>
        );
    };

    const formatLabel = (status) => !status ? '' : status.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    const getEquipamentoNome = (id) => equipamentos.find(e => e.id === id)?.nome || 'N/A';
    
    const renderDataRelevante = (os) => {
        const dateString = os.tipoManutencao === 'PREVENTIVA' && os.dataInicioPreventiva ? os.dataInicioPreventiva : os.dataSolicitacao;
        const date = parseSafeDate(dateString);
        if (!date) return 'N/A';
        const options = os.tipoManutencao === 'PREVENTIVA' 
            ? { day: '2-digit', month: '2-digit', year: 'numeric' }
            : { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleString('pt-BR', options);
    };

    const orderKeys = (keys) => {
        const specialOrder = { 'Hoje': 1, 'Amanhã': 2, 'Datas Futuras': 3, 'Ontem': 4 };
        return keys.sort((a, b) => {
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
    };
    
    // Função auxiliar para renderizar um bloco de OS
    const renderOsBlock = (title, groups, noDataMessage) => (
        <div className="os-groups-container">
            <h2 className={`bloco-titulo ${title.includes('Fazer') ? 'bloco-titulo-fazer' : 'bloco-titulo-historico'}`}>
                {title.includes('Fazer') ? '🗓️' : '📜'} {title}
            </h2>
            {Object.keys(groups).length > 0 ? (
                orderKeys(Object.keys(groups)).map(dateKey => (
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
                                    {groups[dateKey].map(os => (
                                        <tr key={os.id}>
                                            <td><span className={`status-pill status-${os.status?.toLowerCase()}`}>{formatLabel(os.status)}</span></td>
                                            <td>{os.id}</td>
                                            <td>{renderDataRelevante(os)}</td>
                                            <td>{formatLabel(os.tipoManutencao)}</td>
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
                <div className="no-os-message">{noDataMessage}</div>
            )}
        </div>
    );
    
    if (loading) return <div className="loading">Carregando...</div>;

    return (
        <div className="dashboard-container">
            <main>
                <h1 className="dashboard-title">Painel de Ordens de Serviço</h1>
                
                {renderOsBlock("Para Fazer", tarefasFuturas, "Nenhuma tarefa futura ou para hoje.")}
                {renderOsBlock("Histórico", historicoOrdens, "Nenhum histórico de OS encontrado.")}
                
            </main>
            
            {isModalOpen && selectedOs && (
                <ExecucaoModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleExecucaoSubmit}
                    os={selectedOs}
                />
            )}
        </div>
    );
}

export default DashboardPage;