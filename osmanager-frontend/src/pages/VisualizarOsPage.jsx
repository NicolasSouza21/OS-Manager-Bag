import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getOsById,
  getEquipamentos,
  getLocais,
  updateStatusOs,
  deleteOrdemServico,
  patchCienciaLider // <--- ADICIONE esta função no seu apiService
} from '../services/apiService';
import './VisualizarOsPage.css';

const STATUS_OPTIONS = [
  { value: 'ABERTA', label: 'Aberta' },
  { value: 'EM_EXECUCAO', label: 'Em Execução' },
  { value: 'CONCLUIDA', label: 'Concluída' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

// Função auxiliar para normalizar o status
function mapStatusToOptionValue(status) {
  if (!status) return STATUS_OPTIONS[0].value;
  const normalized = status
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
    .toUpperCase()
    .replace(/\s/g, "_"); // troca espaços por underline

  const match = STATUS_OPTIONS.find(opt => opt.value === normalized);
  if (match) return match.value;

  const looseMatch = STATUS_OPTIONS.find(opt =>
    opt.value.replace(/_/g, "") === normalized.replace(/_/g, "")
  );
  if (looseMatch) return looseMatch.value;

  return STATUS_OPTIONS[0].value;
}

function VisualizarOsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ordemServico, setOrdemServico] = useState(null);
  const [equipamento, setEquipamento] = useState(null);
  const [local, setLocal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [novoStatus, setNovoStatus] = useState('');
  const [alterandoStatus, setAlterandoStatus] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  // Estado para ciência do líder
  const [cienciaLider, setCienciaLider] = useState(null);
  const [cienciaLoading, setCienciaLoading] = useState(false);

  // Pega perfil - garantir que está no mesmo padrão salvo no backend
  const userRoleRaw = localStorage.getItem("userRole") || "";
  const userRole = userRoleRaw.startsWith("ROLE_") ? userRoleRaw.replace("ROLE_", "") : userRoleRaw;
  const podeTrocarStatus = ['MECANICO', 'ANALISTA_CQ', 'ADMIN'].includes(userRole);
  const podeDarCiencia = userRole === 'LIDER';

  useEffect(() => {
    if (!id) return;

    const fetchAll = async () => {
      try {
        setLoading(true);
        const [osRes, equipsRes, locaisRes] = await Promise.all([
          getOsById(id),
          getEquipamentos(),
          getLocais()
        ]);
        setOrdemServico(osRes.data);

        const statusConvertido = mapStatusToOptionValue(osRes.data.status);
        setNovoStatus(statusConvertido);

        const equip = equipsRes.data.find(e => e.id === osRes.data.equipamentoId);
        setEquipamento(equip || null);

        const loc = locaisRes.data.find(l => l.id === osRes.data.localId);
        setLocal(loc || null);

        setCienciaLider(osRes.data.cienciaLider ?? null);

        setError(null);
      } catch (err) {
        setError('Falha ao carregar os detalhes da Ordem de Serviço.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  const handleStatusChange = async (e) => {
    const valor = e.target.value;
    setNovoStatus(valor);
    setAlterandoStatus(true);
    try {
      await updateStatusOs(id, { status: valor });
      setOrdemServico(prev => ({
        ...prev,
        status: valor,
      }));
      alert('Status alterado com sucesso!');
    } catch (err) {
      alert('Falha ao alterar status');
    } finally {
      setAlterandoStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja excluir esta Ordem de Serviço? Essa ação não pode ser desfeita.")) {
      return;
    }
    setExcluindo(true);
    try {
      await deleteOrdemServico(id);
      alert('Ordem de Serviço excluída com sucesso!');
      navigate('/dashboard');
    } catch (err) {
      alert('Falha ao excluir Ordem de Serviço.');
    } finally {
      setExcluindo(false);
    }
  };

  // Função para dar ciência
  const handleCiencia = async (valor) => {
    setCienciaLoading(true);
    try {
      await patchCienciaLider(id, { ciencia: valor }); // PATCH para backend
      setCienciaLider(valor);
    } catch (e) {
      alert('Erro ao dar ciência.');
    }
    setCienciaLoading(false);
  };

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
            {podeTrocarStatus ? (
              <select
                value={novoStatus}
                onChange={handleStatusChange}
                disabled={alterandoStatus}
                className={`status-input status-${novoStatus?.toLowerCase()}-input`}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input 
                type="text" 
                value={
                  (STATUS_OPTIONS.find(opt => opt.value === novoStatus)?.label) || ordemServico.status || ''
                }
                disabled 
                className={`status-input status-${novoStatus?.toLowerCase()}-input`} 
              />
            )}
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

        {/* Ciência do Líder */}
        <section className="form-section ciencia-lider-section" style={{ marginTop: 20 }}>
          <div className="input-group">
            <label>Ciência do Líder</label>
            <input
              type="text"
              value={
                cienciaLider == null
                  ? "Pendente"
                  : cienciaLider === "SIM"
                  ? "Sim"
                  : cienciaLider === "NAO"
                  ? "Não"
                  : cienciaLider
              }
              disabled
            />
          </div>
          {/* Botões só para Líder */}
          {podeDarCiencia && (
            <div style={{ marginTop: 8 }}>
              <span>Dar ciência: </span>
              <button
                type="button"
                disabled={cienciaLoading || cienciaLider === "SIM"}
                onClick={() => handleCiencia("SIM")}
                style={{ marginRight: 8 }}
              >
                Sim
              </button>
              <button
                type="button"
                disabled={cienciaLoading || cienciaLider === "NAO"}
                onClick={() => handleCiencia("NAO")}
              >
                Não
              </button>
            </div>
          )}
        </section>

        <footer className="form-actions">
          <button type="button" className="button-back" onClick={() => navigate('/dashboard')}>
            Voltar ao Painel
          </button>
          {podeTrocarStatus && (
            <button
              type="button"
              className="button-delete"
              style={{ marginLeft: '16px', backgroundColor: '#c0392b', color: '#fff' }}
              onClick={handleDelete}
              disabled={excluindo}
            >
              {excluindo ? "Excluindo..." : "Excluir OS"}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

export default VisualizarOsPage;