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
import { FaSearch, FaCheck, FaTools, FaPlay } from 'react-icons/fa'; // FaPlay já está importado
import './DashBoardPage.css';

const STATUS_OPTIONS = [
    { value: '', label: 'Todos' },
    { value: 'ABERTA', label: 'Aberta' },
    { value: 'CIENTE', label: 'Ciente' },
    { value: 'EM_EXECUCAO', label: 'Em Execução' },
    { value: 'CONCLUIDA', label: 'Concluída' },
    { value: 'CANCELADA', label: 'Cancelada' },
];

const TIPO_MANUTENCAO_OPTIONS = [
    { value: '', label: 'Todos' },
    { value: 'CORRETIVA', label: 'Corretiva' },
    { value: 'PREVENTIVA', label: 'Preventiva' },
];

const groupOrdensByDate = (ordens) => {
    const groups = {};
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const isSameDay = (d1, d2) => 
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

    ordens.forEach(os => {
        const osDate = new Date(os.dataSolicitacao);
        let dateKey;

        if (isSameDay(osDate, today)) { dateKey = 'Hoje'; } 
        else if (isSameDay(osDate, yesterday)) { dateKey = 'Ontem'; } 
        else { dateKey = osDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }); }

        if (!groups[dateKey]) { groups[dateKey] = []; }
        groups[dateKey].push(os);
    });
    return groups;
};

function DashboardPage() {
    const navigate = useNavigate();
    const [ordensOriginais, setOrdensOriginais] = useState([]);
    const [groupedOrdens, setGroupedOrdens] = useState({});
    const [equipamentos, setEquipamentos] = useState([]);
    const [locais, setLocais] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOs, setSelectedOs] = useState(null);
    const [userRoles, setUserRoles] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [tipoManutencaoFilter, setTipoManutencaoFilter] = useState('');

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [osRes, equipsRes, locaisRes] = await Promise.all([
                getOrdensServico({ page: 0, size: 100, sort: 'id,desc' }),
                getEquipamentos(),
                getLocais()
            ]);
            setOrdensOriginais(osRes.data.content);
            setEquipamentos(equipsRes.data);
            setLocais(locaisRes.data);
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
    
    useEffect(() => {
        let filtradas = [...ordensOriginais];
        if (statusFilter) {
            filtradas = filtradas.filter(os => os.status === statusFilter);
        }
        if (tipoManutencaoFilter) {
             filtradas = filtradas.filter(os => os.tipoManutencao === tipoManutencaoFilter);
        }
        setGroupedOrdens(groupOrdensByDate(filtradas));
    }, [statusFilter, tipoManutencaoFilter, ordensOriginais]);

    const handleDarCiencia = async (osId) => {
        if (!window.confirm("Confirmar ciência desta OS?")) return;
        try {
            await registrarCiencia(osId);
            fetchAllData();
        } catch (error) {
            alert(error.response?.data?.message || "Falha ao registrar ciência.");
        }
    };

    const handleIniciarExecucao = async (osId) => {
        if (!window.confirm("Iniciar a execução desta OS?")) return;
        try {
            await iniciarExecucao(osId);
            fetchAllData();
        } catch (error) {
            alert(error.response?.data?.message || "Falha ao iniciar execução.");
        }
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
                {/* ✅ Container para os botões que aparecem e somem */}
                <div className="dynamic-actions-container">
                    {isMecanicoOrLider && os.status === 'ABERTA' && (
                        <button title="Dar Ciência" className="action-button-circle ciencia-btn" onClick={() => handleDarCiencia(os.id)}>
                            <FaCheck />
                        </button>
                    )}
                    {isMecanicoOrLider && os.status === 'CIENTE' && (
                        <button title="Iniciar Execução" className="action-button-circle iniciar-btn" onClick={() => handleIniciarExecucao(os.id)}>
                            <FaPlay />
                        </button>
                    )}
                    {isMecanicoOrLider && os.status === 'EM_EXECUCAO' && (
                        <button title="Preencher e Finalizar OS" className="action-button-circle executar-btn" onClick={() => { setSelectedOs(os); setIsModalOpen(true); }}>
                            <FaTools />
                        </button>
                    )}
                </div>
    
                {/* Botão de visualizar fica fora do container dinâmico */}
                <button title="Visualizar Detalhes" className="view-button" onClick={() => navigate(`/os/${os.id}`)}>
                    <FaSearch />
                </button>
            </div>
        );
    };

    const formatLabel = (status) => !status ? '' : status.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    const getEquipamentoNome = (id) => equipamentos.find(e => e.id === id)?.nome || 'N/A';
    const getLocalNome = (id) => locais.find(l => l.id === id)?.nome || 'N/A';
    const orderKeys = (keys) => {
        return keys.sort((a, b) => {
            if (a === 'Hoje') return -1; if (b === 'Hoje') return 1;
            if (a === 'Ontem') return -1; if (b === 'Ontem') return 1;
            const dateA = a.split('/').reverse().join('-');
            const dateB = b.split('/').reverse().join('-');
            return dateB.localeCompare(dateA);
        });
    };
    
    if (loading) return <div className="loading">Carregando...</div>;

    return (
        <div className="dashboard-container">
            <main>
                <h1 className="dashboard-title">Painel de Ordens de Serviço</h1>
                 <div className="os-groups-container">
                    {Object.keys(groupedOrdens).length > 0 ? (
                        orderKeys(Object.keys(groupedOrdens)).map(dateKey => (
                            <div key={dateKey} className="os-date-group">
                                <h2 className="date-header">{dateKey}</h2>
                                <div className="table-container">
                                    <table className="os-table">
                                        <thead>
                                            <tr>
                                                <th>Status</th>
                                                <th>Nº O.S.</th>
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
                                                    <td>{os.id}</td>
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
                        <div className="no-os-message">Nenhuma ordem de serviço encontrada para os filtros selecionados.</div>
                    )}
                </div>
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