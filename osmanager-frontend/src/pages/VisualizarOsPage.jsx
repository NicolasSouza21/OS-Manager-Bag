import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOsById } from '../services/apiService';
import './VisualizarOsPage.css'; // Usaremos um CSS próprio para esta página

function VisualizarOsPage() {
  // O hook useParams nos permite ler parâmetros da URL. Ex: /os/5 -> id será "5"
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [ordemServico, setOrdemServico] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Este useEffect será executado assim que a página carregar ou quando o ID na URL mudar.
  useEffect(() => {
    // Se por algum motivo não houver ID na URL, não fazemos nada.
    if (!id) return;

    const fetchOsDetails = async () => {
      try {
        setLoading(true);
        // Chamamos a função da API para buscar os dados da OS específica
        const response = await getOsById(id);
        setOrdemServico(response.data);
        setError(null);
      } catch (err) {
        console.error(`Erro ao buscar detalhes da OS ${id}:`, err);
        setError('Falha ao carregar os detalhes da Ordem de Serviço.');
      } finally {
        // Independentemente de sucesso ou erro, paramos o carregamento.
        setLoading(false);
      }
    };

    fetchOsDetails();
  }, [id]); // A lista de dependências [id] garante que isso rode de novo se o ID mudar.

  // Função auxiliar para formatar a data para o padrão brasileiro
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // --- Renderização condicional ---
  if (loading) return <div className="loading-details">Carregando detalhes da OS...</div>;
  if (error) return <div className="error-details">{error}</div>;
  if (!ordemServico) return <div className="no-data-details">Ordem de Serviço não encontrada.</div>;

  // --- Renderização principal (quando os dados foram carregados com sucesso) ---
  return (
    <div className="view-os-page">
      <div className="view-os-form">
        <header className="form-header-main">
          <h1>Detalhes da Ordem de Serviço</h1>
        </header>

        <section className="form-section read-only-section">
          <div className="input-group">
            <label>Nº O.S.</label>
            <input type="text" value={ordemServico.id} disabled />
          </div>
          <div className="input-group">
            <label>Data de Abertura</label>
            <input type="text" value={formatDate(ordemServico.dataAbertura)} disabled />
          </div>
          <div className="input-group">
            <label>Situação O.S.</label>
            <input 
              type="text" 
              value={ordemServico.status || ''} 
              disabled 
              className={`status-input status-${ordemServico.status?.toLowerCase()}-input`} 
            />
          </div>
        </section>

        <section className="form-section">
          <div className="input-group">
            <label>Tipo de Manutenção</label>
            <input type="text" value={ordemServico.tipoManutencao || ''} disabled />
          </div>
          <div className="input-group large-field">
            <label>Equipamento</label>
            <input type="text" value={ordemServico.tipoMaquina || ''} disabled />
          </div>
          <div className="input-group">
            <label>Nº Equipamento</label>
            <input type="text" value={ordemServico.numeroMaquina || ''} disabled />
          </div>
          <div className="input-group">
            <label>Criticidade</label>
            <input type="text" value={ordemServico.prioridade || ''} disabled />
          </div>
          <div className="input-group">
            <label>Solicitante</label>
            <input type="text" value={ordemServico.solicitante || ''} disabled />
          </div>
          <div className="input-group">
            <label>Local</label>
            <input type="text" value={ordemServico.local || 'Não informado'} disabled />
          </div>
          <div className="input-group full-width">
            <label>Descrição do Problema</label>
            <textarea value={ordemServico.descricaoProblema || ''} rows="4" disabled></textarea>
          </div>
          <div className="input-group full-width">
            <label>Observação</label>
            <textarea value={ordemServico.observacao || 'Nenhuma'} rows="4" disabled></textarea>
          </div>
        </section>

        <footer className="form-actions">
          <button type="button" className="button-back" onClick={() => navigate('/dashboard')}>
            Voltar ao Painel
          </button>
        </footer>
      </div>
    </div>
  );
}

export default VisualizarOsPage;