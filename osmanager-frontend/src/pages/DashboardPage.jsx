// Local: src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 1. IMPORTE O useNavigate
import { getOrdensServico } from '../services/apiService';
import './DashboardPage.css';

function DashboardPage() {
  const navigate = useNavigate(); // 👈 2. INICIE O HOOK DE NAVEGAÇÃO

  const [ordens, setOrdens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 👇 3. CRIE A FUNÇÃO DE LOGOUT 👇
  const handleLogout = () => {
    // Remove o token do localStorage, "esquecendo" o login
    localStorage.removeItem('authToken');
    
    // Redireciona o utilizador para a página de login
    navigate('/login');
  };

  useEffect(() => {
    const fetchOrdens = async () => {
      try {
        const response = await getOrdensServico();
        setOrdens(response.data.content);
      } catch (err) {
        setError('Falha ao buscar as ordens de serviço. Por favor, faça login novamente.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdens();
  }, []);

  if (loading) {
    return <div className="dashboard-container"><p>A carregar Ordens de Serviço...</p></div>;
  }

  if (error) {
    return <div className="dashboard-container"><p style={{ color: 'red' }}>{error}</p></div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        {/* 👇 4. ADICIONE O 'onClick' AO BOTÃO 👇 */}
        <button onClick={handleLogout} className="logout-button">Sair</button>
      </header>
      
      <main className="os-list-container">
        <h2>Ordens de Serviço Recentes</h2>
        
        {ordens.length === 0 ? (
          <p>Nenhuma ordem de serviço encontrada.</p>
        ) : (
          <ul>
            {ordens.map((ordem) => (
              <li key={ordem.id}>
                <strong>OS #{ordem.id}</strong> - Máquina: {ordem.numeroMaquina} ({ordem.prioridade})
                <p>{ordem.descricaoProblema}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;