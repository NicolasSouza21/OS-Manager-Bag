import React, { useState, useEffect, useCallback } from 'react';
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
import { FaSearch, FaCheck, FaTools, FaPlay, FaClipboardCheck } from 'react-icons/fa';
import './DashBoardPage.css';

const parseSafeDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString);
};

const groupOrdensByDate = (ordens) => {
    const groups = {};
    ordens.forEach(os => {
        const dateString = os.dataSolicitacao;
        const osDate = parseSafeDate(dateString);
        
        if (!osDate) {
            if (!groups['Sem Data']) groups['Sem Data'] = [];
            groups['Sem Data'].push(os);
            return;
        }

        const dateKey = osDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOs, setSelectedOs] = useState(null);
    const [userRole, setUserRole] = useState('');
    const [userId, setUserId] = useState(null);
    
    const [filtros, setFiltros] = useState({
        keyword: '',
        status: '',
        equipamentoId: '',
        localId: '',
        minhasTarefas: false,
        aguardandoVerificacao: false,
    });
    
    const statusOptions = [
        { label: 'Abertas', value: 'ABERTA' },
        { label: 'Ciente', value: 'CIENTE' },
        { label: 'Em Execução', value: 'EM_EXECUCAO' },
        { label: 'Aguardando Verificação', value: 'AGUARDANDO_VERIFICACAO' },
        { label: 'Concluída', value: 'CONCLUIDA' },
        { label: 'Cancelada', value: 'CANCELADA' }
    ];

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: 0,
                size: 200,
                sort: 'dataSolicitacao,desc',
                keyword: filtros.keyword,
                status: filtros.status,
                equipamentoId: filtros.equipamentoId,
                localId: filtros.localId,
                mecanicoId: filtros.minhasTarefas ? userId : null,
                statusVerificacao: filtros.aguardandoVerificacao ? 'PENDENTE' : null,
            };

            Object.keys(params).forEach(key => {
                if (!params[key]) delete params[key];
            });

            const osRes = await getOrdensServico(params);
            setOrdens(osRes.data.content || []);
        } catch (err) {
            console.error("Erro ao carregar Ordens de Serviço:", err);
            setOrdens([]); // Garante que a lista fique vazia em caso de erro
        } finally {
            setLoading(false);
        }
    }, [filtros, userId]);

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
            } catch (error) {
                console.error("Erro ao carregar equipamentos ou locais", error);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (userId !== null) { // A busca só começa quando sabemos quem é o usuário
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
        setFiltros(newFilters);
    };
    
    const formatLabel = (status) => !status ? '' : status.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    const getEquipamentoNome = (id) => equipamentos.find(e => e.id === id)?.nome || 'N/A';
    
    const handleExecucaoSubmit = async (dadosExecucao) => {
        if (!selectedOs) return;
        try {
            await registrarExecucao(selectedOs.id, dadosExecucao);
            alert(`OS #${selectedOs.id} foi finalizada com sucesso!`);
            setIsModalOpen(false);
            setSelectedOs(null);
            fetchData();
        } catch (error) {
            alert(error?.response?.data?.message || "Falha ao registrar execução.");
        }
    };

    const renderAcoes = (os) => {
        const isMecanicoOrLider = userRole === 'MECANICO' || userRole === 'LIDER';
        const isEncarregado = userRole === 'ENCARREGADO';

        return (
            <div className="actions-cell">
                <div className="dynamic-actions-container">
                    {isMecanicoOrLider && os.status === 'ABERTA' && (<button title="Dar Ciência" className="action-button-circle ciencia-btn" onClick={() => registrarCiencia(os.id).then(fetchData)}><FaCheck /></button>)}
                    {isMecanicoOrLider && os.status === 'CIENTE' && (<button title="Iniciar Execução" className="action-button-circle iniciar-btn" onClick={() => iniciarExecucao(os.id).then(fetchData)}><FaPlay /></button>)}
                    {isMecanicoOrLider && os.status === 'EM_EXECUCAO' && (<button title="Preencher e Finalizar OS" className="action-button-circle executar-btn" onClick={() => { setSelectedOs(os); setIsModalOpen(true); }}><FaTools /></button>)}
                    {isEncarregado && os.status === 'AGUARDANDO_VERIFICACAO' && (<button title="Verificar OS" className="action-button-circle verificar-btn" onClick={() => navigate(`/os/${os.id}`)}><FaClipboardCheck /></button>)}
                </div>
                <button title="Visualizar Detalhes" className="view-button" onClick={() => navigate(`/os/${os.id}`)}><FaSearch /></button>
            </div>
        );
    };

    if (loading) return <div className="loading">Carregando...</div>;

    const groupedOrdens = groupOrdensByDate(ordens);

    return (
        <div className="dashboard-container">
            <main>
                <h1 className="dashboard-title">Painel de Ordens de Serviço</h1>
                {/* A Barra de Filtros foi movida para dentro do return para acessar os estados */}
                <div className="filtros-container">
                    <input type="text" name="keyword" className="filtro-input-busca" placeholder="Buscar por Nº OS ou Equipamento..." value={filtros.keyword} onChange={handleFilterChange} />
                    <select name="status" className="filtro-select" value={filtros.status} onChange={handleFilterChange}>
                        <option value="">Status (Todos)</option>
                        {statusOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                    </select>
                    <select name="equipamentoId" className="filtro-select" value={filtros.equipamentoId} onChange={handleFilterChange}>
                        <option value="">Equipamento (Todos)</option>
                        {equipamentos.map(e => (<option key={e.id} value={e.id}>{e.nome}</option>))}
                    </select>
                    <button className={`filtro-btn-rapido ${filtros.minhasTarefas ? 'ativo' : ''}`} onClick={() => handleToggleFilter('minhasTarefas')}>Minhas Tarefas</button>
                    {userRole === 'ENCARREGADO' && (<button className={`filtro-btn-rapido ${filtros.aguardandoVerificacao ? 'ativo' : ''}`} onClick={() => handleToggleFilter('aguardandoVerificacao')}>Aguardando Minha Verificação</button>)}
                </div>
                
                {/* ✅ LÓGICA DE RENDERIZAÇÃO COMPLETA */}
                {ordens.length > 0 ? (
                    Object.keys(groupedOrdens).map(dateKey => (
                        <div key={dateKey} className="os-date-group">
                            <h3 className="date-header">{dateKey}</h3>
                            <div className="table-container">
                                <table className="os-table">
                                    <thead>
                                        <tr>
                                            <th>Status</th>
                                            <th>Nº O.S.</th>
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