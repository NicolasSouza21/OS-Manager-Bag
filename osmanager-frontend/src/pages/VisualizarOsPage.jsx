import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOsById, getEquipamentos, getLocais } from '../services/apiService';
import './VisualizarOsPage.css';

function VisualizarOsPage() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [ordemServico, setOrdemServico] = useState(null);
  const [equipamento, setEquipamento] = useState(null);
  const [local, setLocal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchAll = async () => {
      try {
        setLoading(true);
        // Busca OS, equipamentos e locais em paralelo
        const [osRes, equipsRes, locaisRes] = await Promise.all([
          getOsById(id),
          getEquipamentos(),
          getLocais()
        ]);
        setOrdemServico(osRes.data);

        // Busca o equipamento e local pelo id do DTO da OS
        const equip = equipsRes.data.find(e => e.id === osRes.data.equipamentoId);
        setEquipamento(equip || null);

        const loc = locaisRes.data.find(l => l.id === osRes.data.localId);
        setLocal(loc || null);

        setError(null);
      } catch (err) {
        setError('Falha ao carregar os detalhes da Ordem de Serviço.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) return <div className="loading-details">Carregando detalhes da OS...</div>;
  if (error) return <div className="error-details">{error}</div>;
  if (!ordemServico) return <div className="no-data-details">Ordem de Serviço não encontrada.</div>;

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
            <input type="text" value={formatDate(ordemServico.dataSolicitacao)} disabled />
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
            <input type="text" value={equipamento ? equipamento.nome : ''} disabled />
          </div>
          <div className="input-group">
            <label>Nº Equipamento</label>
            <input type="text" value={equipamento ? equipamento.tag : ''} disabled />
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
            <input type="text" value={local ? local.nome : ''} disabled />
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