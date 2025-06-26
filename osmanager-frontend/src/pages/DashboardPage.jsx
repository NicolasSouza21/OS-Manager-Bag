import React, { useState, useEffect } from 'react';
// 1. Precisamos do 'useNavigate' para navegar para outra página
import { useNavigate } from 'react-router-dom';
import { getOrdensServico } from '../services/apiService';
import { FaSearch } from 'react-icons/fa'; 

import './DashBoardPage.css';

function DashboardPage() {
  // 2. Inicializamos o hook que nos dá a função de navegação
  const navigate = useNavigate();

  const [ordens, setOrdens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrdens = async () => {
      try {
        const params = { page: 0, size: 20, sort: 'id,desc' }; 
        const response = await getOrdensServico(params);
        setOrdens(response.data.content);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao buscar ordens de serviço:", err);
        setError('Falha ao carregar as ordens de serviço.');
        setLoading(false);
      }
    };

    fetchOrdens();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // 3. Criamos a função que será chamada ao clicar na lupa
  const handleViewDetails = (osId) => {
    // A função navigate nos leva para a URL da página de detalhes,
    // passando o ID da OS clicada.
    navigate(`/os/${osId}`);
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-container">
      <main>
        <h1 className="dashboard-title">Painel de Ordens de Serviço</h1>
        
        <div className="table-container">
          <table className="os-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Nº O.S.</th>
                <th>Data Abertura</th>
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
                    <td>{formatDate(os.dataAbertura)}</td>
                    <td>{os.tipoMaquina || 'N/A'}</td>
                    <td>{os.numeroMaquina || 'N/A'}</td>
                    <td>{os.local || 'N/A'}</td>
                    <td>{os.prioridade || 'N/A'}</td>
                    <td>{os.solicitante || 'N/A'}</td>
                    <td>
                      {/* 4. Adicionamos o evento 'onClick' ao botão */}
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
                  <td colSpan="9" className="no-os-message">
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