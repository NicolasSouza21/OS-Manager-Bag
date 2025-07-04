import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrdensServico, getEquipamentos, getLocais } from '../services/apiService';
import { FaSearch } from 'react-icons/fa';
import './DashBoardPage.css';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'ABERTA', label: 'Aberta' },
  { value: 'EM_EXECUCAO', label: 'Em Execução' },
  { value: 'CONCLUIDA', label: 'Concluída' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

// Função que agrupa as Ordens de Serviço por data
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

        if (isSameDay(osDate, today)) {
            dateKey = 'Hoje';
        } else if (isSameDay(osDate, yesterday)) {
            dateKey = 'Ontem';
        } else {
            dateKey = osDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }

        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
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
    const [error, setError] = useState(null);

    // States de filtro
    const [statusFilter, setStatusFilter] = useState('');
    const [localFilter, setLocalFilter] = useState('');
    const [numeroOS, setNumeroOS] = useState('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const [osRes, equipsRes, locaisRes] = await Promise.all([
                    getOrdensServico({ page: 0, size: 100, sort: 'dataSolicitacao,desc' }),
                    getEquipamentos(),
                    getLocais()
                ]);
                setOrdensOriginais(osRes.data.content);
                setEquipamentos(equipsRes.data);
                setLocais(locaisRes.data);
                setLoading(false);
            } catch (err) {
                setError('Falha ao carregar as ordens de serviço.');
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    // useEffect para filtrar e agrupar
    useEffect(() => {
        let filtradas = ordensOriginais;

        if (statusFilter) filtradas = filtradas.filter(os => os.status === statusFilter);
        if (localFilter) filtradas = filtradas.filter(os => String(os.localId) === String(localFilter));
        if (numeroOS) filtradas = filtradas.filter(os => String(os.id) === String(numeroOS));
        if (dataInicio) {
            filtradas = filtradas.filter(os => {
                if (!os.dataSolicitacao) return false;
                return new Date(os.dataSolicitacao) >= new Date(dataInicio);
            });
        }
        if (dataFim) {
             filtradas = filtradas.filter(os => {
                if (!os.dataSolicitacao) return false;
                return new Date(os.dataSolicitacao) <= new Date(dataFim).setHours(23, 59, 59, 999);
            });
        }
        
        setGroupedOrdens(groupOrdensByDate(filtradas));

    }, [statusFilter, localFilter, numeroOS, dataInicio, dataFim, ordensOriginais]);

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const handleViewDetails = (osId) => navigate(`/os/${osId}`);
    const getEquipamentoNome = (id) => equipamentos.find(e => e.id === id)?.nome || 'N/A';
    const getLocalNome = (id) => locais.find(l => l.id === id)?.nome || 'N/A';
    
    // Função para ordenar as chaves de data
    const orderKeys = (keys) => {
        return keys.sort((a, b) => {
            if (a === 'Hoje') return -1;
            if (b === 'Hoje') return 1;
            if (a === 'Ontem') return -1;
            if (b === 'Ontem') return 1;
            const dateA = a.split('/').reverse().join('-');
            const dateB = b.split('/').reverse().join('-');
            return dateB.localeCompare(dateA);
        });
    };

    if (loading) return <div className="loading">Carregando...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="dashboard-container">
            <main>
                <h1 className="dashboard-title">Painel de Ordens de Serviço</h1>
                
                <form className="dashboard-filters" onSubmit={e => e.preventDefault()}>
                    {/* Seus filtros aqui */}
                    <div>
                         <label>Status:</label>
                         <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                             {STATUS_OPTIONS.map(opt => (
                                 <option key={opt.value} value={opt.value}>{opt.label}</option>
                             ))}
                         </select>
                     </div>
                     <div>
                         <label>Local:</label>
                         <select value={localFilter} onChange={e => setLocalFilter(e.target.value)}>
                             <option value="">Todos</option>
                             {locais.map(l => (
                                 <option key={l.id} value={l.id}>{l.nome}</option>
                             ))}
                         </select>
                     </div>
                     <div>
                         <label>Nº O.S.:</label>
                         <input
                             type="number"
                             value={numeroOS}
                             onChange={e => setNumeroOS(e.target.value)}
                             placeholder="Ex: 123"
                             min="1"
                         />
                     </div>
                     <div>
                         <label>Data Inicial:</label>
                         <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
                     </div>
                     <div>
                         <label>Data Final:</label>
                         <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
                     </div>
                </form>

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
                                                <th>Hora</th>
                                                <th>Equipamento</th>
                                                <th>Local</th>
                                                <th>Solicitante</th>
                                                <th>Ciência Por</th>
                                                {/* ✅ 1. NOVA COLUNA ADICIONADA */}
                                                <th>Verificado Por</th>
                                                <th>Visualizar</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groupedOrdens[dateKey].map(os => (
                                                <tr key={os.id}>
                                                    <td><span className={`status-pill status-${os.status?.toLowerCase()}`}>{os.status}</span></td>
                                                    <td>{os.id}</td>
                                                    <td>{formatDateTime(os.dataSolicitacao)}</td>
                                                    <td>{getEquipamentoNome(os.equipamentoId)}</td>
                                                    <td>{getLocalNome(os.localId)}</td>
                                                    <td>{os.solicitante || 'N/A'}</td>
                                                    <td>{os.liderCienciaNome || 'Pendente'}</td>
                                                    {/* ✅ 2. CÉLULA COM O NOME DO ANALISTA */}
                                                    <td>{os.verificadoPorNome || 'Pendente'}</td>
                                                    <td>
                                                        <button className="view-button" title="Visualizar Detalhes" onClick={() => handleViewDetails(os.id)}>
                                                            <FaSearch />
                                                        </button>
                                                    </td>
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
        </div>
    );
}

export default DashboardPage;