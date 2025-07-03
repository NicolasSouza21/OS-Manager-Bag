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

function DashboardPage() {
  const navigate = useNavigate();

  const [ordensOriginais, setOrdensOriginais] = useState([]);
  const [ordens, setOrdens] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [locais, setLocais] = useState([]);
  const [funcionariosNomes, setFuncionariosNomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
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
          getOrdensServico({ page: 0, size: 100, sort: 'id,desc' }),
          getEquipamentos(),
          getLocais()
        ]);
        setOrdensOriginais(osRes.data.content);
        setOrdens(osRes.data.content);
        setEquipamentos(equipsRes.data);
        setLocais(locaisRes.data);

        // Recupera nomes dos funcionários do localStorage
        const nomes = JSON.parse(localStorage.getItem('nomesFuncionarios') || '[]');
        setFuncionariosNomes(nomes);

        setLoading(false);
      } catch (err) {
        setError('Falha ao carregar as ordens de serviço.');
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Filtro local (front-end)
  useEffect(() => {
    let filtradas = ordensOriginais;

    if (statusFilter) {
      filtradas = filtradas.filter(os => os.status === statusFilter);
    }
    if (localFilter) {
      filtradas = filtradas.filter(os => String(os.localId) === String(localFilter));
    }
    if (numeroOS) {
      filtradas = filtradas.filter(os => String(os.id) === String(numeroOS));
    }
    if (dataInicio) {
      filtradas = filtradas.filter(os => {
        if (!os.dataSolicitacao) return false;
        const dataOS = new Date(os.dataSolicitacao).setHours(0,0,0,0);
        const dataIni = new Date(dataInicio).setHours(0,0,0,0);
        return dataOS >= dataIni;
      });
    }
    if (dataFim) {
      filtradas = filtradas.filter(os => {
        if (!os.dataSolicitacao) return false;
        const dataOS = new Date(os.dataSolicitacao).setHours(0,0,0,0);
        const dataF = new Date(dataFim).setHours(0,0,0,0);
        return dataOS <= dataF;
      });
    }
    setOrdens(filtradas);
  }, [statusFilter, localFilter, numeroOS, dataInicio, dataFim, ordensOriginais]);

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (osId) => {
    navigate(`/os/${osId}`);
  };

  // Funções auxiliares para buscar nome/tag do equipamento/local
  const getEquipamentoNome = (id) => {
    if (!id) return 'N/A';
    const eq = equipamentos.find(e => e.id === id);
    return eq ? eq.nome : 'N/A';
  };
  const getEquipamentoTag = (id) => {
    if (!id) return 'N/A';
    const eq = equipamentos.find(e => e.id === id);
    return eq ? eq.tag : 'N/A';
  };
  const getLocalNome = (id) => {
    if (!id) return 'N/A';
    const loc = locais.find(l => l.id === id);
    return loc ? loc.nome : 'N/A';
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-container">
      <main>
        <h1 className="dashboard-title">Painel de Ordens de Serviço</h1>

        <form
          className="dashboard-filters"
          onSubmit={e => e.preventDefault()}
        >
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
            <input
              type="date"
              value={dataInicio}
              onChange={e => setDataInicio(e.target.value)}
            />
          </div>
          <div>
            <label>Data Final:</label>
            <input
              type="date"
              value={dataFim}
              onChange={e => setDataFim(e.target.value)}
            />
          </div>
        </form>
        <div className="table-container">
          <table className="os-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Nº O.S.</th>
                <th>Data e Hora Abertura</th>
                <th>Data e Hora Final</th>
                <th>Equipamento</th>
                <th>Nº Equipamento</th>
                <th>Local</th>
                <th>Criticidade</th>
                <th>Solicitante</th>
                <th>Visualizar</th>
              </tr>
            </thead>
            <tbody>
              {ordens.length > 0 ? (
                ordens.map(os => (
                  <tr key={os.id}>
                    <td>
                      <span className={`status-pill status-${os.status?.toLowerCase()}`}>
                        {os.status}
                      </span>
                    </td>
                    <td>{os.id}</td>
                    <td>{formatDateTime(os.dataSolicitacao)}</td>
                    <td>{formatDateTime(os.dataLimite)}</td>
                    <td>{getEquipamentoNome(os.equipamentoId)}</td>
                    <td>{getEquipamentoTag(os.equipamentoId)}</td>
                    <td>{getLocalNome(os.localId)}</td>
                    <td>{os.prioridade || 'N/A'}</td>
                    <td>{os.solicitante || 'N/A'}</td>
                    <td>
                      <button
                        className="view-button"
                        title="Visualizar Detalhes"
                        onClick={() => handleViewDetails(os.id)}
                      >
                        <FaSearch />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="no-os-message">
                    Nenhuma ordem de serviço encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;