// ✅ IMPORTS ATUALIZADOS E CORRIGIDOS
// ✨ ALTERAÇÃO AQUI: Adiciona 'useCallback' à importação do React
import React, { useEffect, useState, useRef, Fragment, useCallback } from 'react'; 
import ReactDOM from 'react-dom';
import { useReactToPrint } from 'react-to-print';
import { useNavigate } from 'react-router-dom';
import { 
    getHistoricoPorEquipamento, 
    getProgramacaoManutencao,
    // ✨ ALTERAÇÃO AQUI: Novas importações da API para EDIÇÃO
    getPlanosPorEquipamento,
    getFrequencias,
    listarServicosPorEquipamento,
    adicionarPlano,
    atualizarPlano,
    deletarPlano
} from '../../../services/apiService';
import './GerenciarEquipamentosPage.css';

// ✨ ALTERAÇÃO AQUI: Componente de impressão renomeado e totalmente modificado
//                 para imprimir o PLANO, não o HISTÓRICO.
const PrintablePlano = React.forwardRef(({ equipamento, programacao, planosRaw }, ref) => {
  const dataImpressao = new Date().toLocaleDateString('pt-BR');

  // Função para formatar a Frequência como na planilha
  const formatFreq = (freq) => {
    if (!freq) return 'N/A';
    if (freq.unidadeTempo === 'SEMANA' && freq.intervalo === 1) return 'semanalmente';
    if (freq.unidadeTempo === 'DIA') return freq.intervalo.toString();
    if (freq.unidadeTempo === 'MES') return (freq.intervalo * 30).toString(); // Aproximação
    if (freq.unidadeTempo === 'ANO') return (freq.intervalo * 365).toString();
    return freq.nome; // Fallback
  };

  return (
    <div ref={ref} className="printable-container">
      <div className="print-header-simple">
          <h2>Programação de Manutenção Preventiva - {equipamento?.nome || 'N/A'}</h2>
          <span>FO - 106 REV.01</span>
      </div>
      <table className="print-table plano"> {/* Adiciona a classe 'plano' */}
        <thead>
          <tr>
            <th style={{ width: '20%' }}>Equipamento</th>
            <th style={{ width: '35%' }}>Serviços</th>
            <th style={{ width: '10%' }}>Frêq./Dia</th>
            <th style={{ width: '15%' }}>Tempo Padrão</th>
            <th style={{ width: '20%' }}>MANUTENTOR</th>
          </tr>
        </thead>
        <tbody>
          {/* Itera sobre 'planosRaw' que tem a frequência detalhada */}
          {Array.isArray(planosRaw) && planosRaw.map((plano, index) => {
            // ✨ ALTERAÇÃO AQUI: Removida a lógica de 'ultimoManutentor'.
            // Agora usamos 'plano.manutentor' diretamente, que vem do backend.
            return (
              <tr key={plano.id}>
                {/* Célula do Equipamento (só na primeira linha) */}
                {index === 0 && (
                  <td className="equipamento-cell" rowSpan={planosRaw.length}>
                    {equipamento?.nome || 'N/A'}
                  </td>
                )}
                {/* Células de dados */}
                <td>{plano.tipoServicoNome}</td>
                <td style={{ textAlign: 'center' }}>{formatFreq(plano.frequencia)}</td>
                <td style={{ textAlign: 'center' }}>{formatTempoPadrao(plano.tempoPadrao)}</td>
                {/* ✨ ALTERAÇÃO AQUI: Puxa o 'manutentor' do plano */}
                <td>{plano.manutentor || 'N/A'}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
            {/* Você pode adicionar um rodapé de "TOTAL" aqui se precisar no futuro */}
        </tfoot>
      </table>
    </div>
  );
});
// --- FIM DA ALTERAÇÃO ---

// ✅ FUNÇÕES AUXILIARES (Sem alterações)
const getNextDate = (startDate, frequenciaObj) => {
  if (!frequenciaObj || !frequenciaObj.unidadeTempo || !frequenciaObj.intervalo || !startDate) return null;
  const date = new Date(startDate);
  const { unidadeTempo, intervalo } = frequenciaObj;
  const originalDayOfMonth = date.getDate();

  switch (unidadeTempo) {
    case 'HORA':
      date.setHours(date.getHours() + intervalo);
      if (date.getDate() !== originalDayOfMonth) return null;
      break;
    case 'DIA':
      date.setDate(date.getDate() + intervalo);
      break;
    case 'SEMANA':
      date.setDate(date.getDate() + intervalo * 7);
      break;
    case 'MES':
      date.setMonth(date.getMonth() + intervalo);
      break;
    case 'ANO':
      date.setFullYear(date.getFullYear() + intervalo);
      break;
    default:
      return null;
  }
  if (unidadeTempo !== 'HORA' && date.getDay() === 0) date.setDate(date.getDate() + 1);
  return date;
};

const formatarData = (data) => {
  if (!data) return 'N/A';
  const date = new Date(data);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
};

const getStatusBadge = (status) => {
  let className = 'status-badge ';
  let statusLabel = 'N/A';
  if (status) {
    statusLabel = status
      .replace(/_/g, ' ')
      .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    switch (status.toUpperCase()) {
      case 'ABERTA':
        className += 'status-aberta'; break;
      case 'PENDENTE':
        className += 'status-pendente'; break;
      case 'EM_EXECUCAO':
        className += 'status-andamento'; break;
      case 'AGUARDANDO_VERIFICACAO':
        className += 'status-verificacao'; break;
      case 'CONCLUIDA':
      case 'CONCLUÍDA':
        className += 'status-concluida'; break;
      case 'CANCELADA':
        className += 'status-cancelada'; break;
      case 'PREVISTO':
        className += 'status-previsto'; break;
      default:
        className += 'status-default';
    }
  } else {
    className += 'status-default';
  }
  return <span className={className}>{statusLabel}</span>;
};

const getServicosNomes = (tiposServico) => {
  if (!Array.isArray(tiposServico) || tiposServico.length === 0) return 'N/A';
  return tiposServico.map((ts) => ts.nome).join(', ');
};

const formatTempoPadrao = (tempo) => {
    if (!tempo) return 'N/A';
    if (tempo.includes(':')) {
        return tempo;
    }
    try {
      const minutos = parseInt(tempo, 10);
      if (isNaN(minutos)) return tempo;
      const h = Math.floor(minutos / 60).toString().padStart(2, '0');
      const m = (minutos % 60).toString().padStart(2, '0');
      return `${h}:${m}:00`;
    } catch (e) {
      return tempo;
    }
};

// ✅ COMPONENTE PRINCIPAL
const ProgramacaoModal = ({ equipamento, onClose }) => {
  // Estados de Visualização
  const [programacao, setProgramacao] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // ✨ ALTERAÇÃO AQUI: 'isPrinting' state REMOVIDO
  // const [isPrinting, setIsPrinting] = useState(false);

  const navigate = useNavigate();
  // ✨ ALTERAÇÃO AQUI: Renomeado o Ref para o plano
  const planoComponentRef = useRef();

  // ✨ ALTERAÇÃO AQUI: Novos estados para Edição
  const [editMode, setEditMode] = useState(false);
  const [planosRaw, setPlanosRaw] = useState([]); // Lista de Planos (DTOs)
  const [frequenciasList, setFrequenciasList] = useState([]);
  const [servicosList, setServicosList] = useState([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);

  // Estados para o formulário de "Novo Plano"
  // ✨ ALTERAÇÃO AQUI: Adiciona o campo 'manutentor'
  const [formNovoPlano, setFormNovoPlano] = useState({
      tipoServicoId: '',
      frequenciaId: '',
      tempoPadrao: '00:00:00',
      toleranciaDias: 7,
      manutentor: 'Manutenção mecânica' // Default
  });

  // Estados para edição inline
  const [editPlanoId, setEditPlanoId] = useState(null);
  const [formEditPlano, setFormEditPlano] = useState({
      frequenciaId: '',
      tempoPadrao: '',
      toleranciaDias: 0,
      manutentor: '' // ✨ ALTERAÇÃO AQUI: Adiciona o campo
  });
  // Fim da alteração

  // ✨ ALTERAÇÃO AQUI: Hook de impressão simplificado
  const handlePrint = useReactToPrint({
    content: () => planoComponentRef.current, // Aponta direto para a ref
    pageStyle: `
      @page { size: A4 portrait; margin: 15mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body *:not(.printable-container):not(.printable-container *) {
          display: none !important;
          visibility: hidden !important;
        }
        .printable-container, .printable-container * {
          visibility: visible !important;
          display: revert !important;
        }
        .print-header-simple {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        .print-header-simple h2 {
            font-size: 14pt;
            margin: 0;
            font-family: 'Arial', sans-serif;
        }
        .print-header-simple span {
            font-size: 10pt;
            font-weight: bold;
            font-family: 'Arial', sans-serif;
        }
        .print-table.plano {
            width: 100%;
            border-collapse: collapse;
            font-size: 10pt;
            font-family: 'Arial', sans-serif;
        }
        .print-table.plano th, .print-table.plano td {
            border: 1px solid #000;
            padding: 4px 6px;
            text-align: left;
            vertical-align: middle;
        }
        .print-table.plano th {
            background-color: #E0E0E0 !important;
            font-weight: bold;
            text-align: center;
        }
        .print-table.plano .equipamento-cell {
            font-weight: bold;
            text-align: center;
            vertical-align: middle;
        }
      }
    `,
  });
  
  // ✨ ALTERAÇÃO AQUI: 'triggerPrint' e 'useEffect[isPrinting]' REMOVIDOS

  // ✨ ALTERAÇÃO AQUI: Função de recarregar dados separada
  const carregarDados = useCallback(() => {
    if (equipamento?.id) {
        setLoading(true);
        setError('');
        
        // Chamadas para a visualização
        const p1 = getProgramacaoManutencao(equipamento.id);
        const p2 = getHistoricoPorEquipamento(equipamento.id);
        
        // Chamadas para o modo de edição
        const p3 = getPlanosPorEquipamento(equipamento.id);
        const p4 = getFrequencias();
        const p5 = listarServicosPorEquipamento(equipamento.id);

        Promise.all([p1, p2, p3, p4, p5])
            .then(([programacaoRes, historicoRes, planosRawRes, frequenciasRes, servicosRes]) => {
                // Seta dados de visualização
                setProgramacao(programacaoRes.data || []);
                const historicoPreventivas = (historicoRes.data || []).filter(
                    (os) => os.tipoManutencao === 'PREVENTIVA'
                );
                const historicoOrdenado = historicoPreventivas.sort((a, b) =>
                    (String(b.codigoOs || '0')).localeCompare(String(a.codigoOs || '0'), undefined, { numeric: true })
                );
                setHistorico(historicoOrdenado);
                
                // Seta dados de edição
                setPlanosRaw(planosRawRes.data || []);
                setFrequenciasList(frequenciasRes.data || []);
                setServicosList(servicosRes.data || []);
            })
            .catch((err) => {
                console.error('Erro ao carregar dados do modal:', err);
                setError('Falha ao carregar os dados de manutenção do equipamento.');
            })
            .finally(() => {
                setLoading(false);
                setLoadingCatalogs(false);
            });
    }
  }, [equipamento]); // Fim da alteração

  useEffect(() => {
    carregarDados();
  }, [carregarDados]); 

  const handleRowClick = (os) => {
    if (os.id && !String(os.id).includes('-proj-')) navigate(`/os/${os.id}`);
  };

  // ✨ ALTERAÇÃO AQUI: Funções de Handler para Edição
  const handleNovoPlanoChange = (e) => {
      const { name, value } = e.target;
      setFormNovoPlano(prev => ({ ...prev, [name]: value }));
  };

  const handleAdicionarPlano = (e) => {
      e.preventDefault();
      if (!formNovoPlano.tipoServicoId || !formNovoPlano.frequenciaId) {
          alert("Por favor, selecione um serviço e uma frequência.");
          return;
      }
      
      const novoPlano = {
          ...formNovoPlano,
          equipamentoId: equipamento.id,
          tipoServicoId: Number(formNovoPlano.tipoServicoId),
          frequenciaId: Number(formNovoPlano.frequenciaId),
          toleranciaDias: Number(formNovoPlano.toleranciaDias) || 0
          // 'manutentor' já está incluído pelo spread '...formNovoPlano'
      };

      adicionarPlano(novoPlano)
          .then(() => {
              alert("Plano adicionado com sucesso!");
              // ✨ ALTERAÇÃO AQUI: Reseta o 'manutentor'
              setFormNovoPlano({ tipoServicoId: '', frequenciaId: '', tempoPadrao: '00:00:00', toleranciaDias: 7, manutentor: 'Manutenção mecânica' });
              carregarDados(); // Recarrega tudo
          })
          .catch(err => {
              console.error("Erro ao adicionar plano:", err);
              alert(err.response?.data?.message || "Erro ao adicionar plano.");
          });
  };

  const handleDeletarPlano = (planoId) => {
      if (window.confirm("Tem certeza que deseja remover este serviço do plano?")) {
          deletarPlano(planoId)
              .then(() => {
                  alert("Plano removido com sucesso!");
                  carregarDados();
              })
              .catch(err => {
                  console.error("Erro ao deletar plano:", err);
                  alert(err.response?.data?.message || "Erro ao deletar plano.");
              });
      }
  };
  
  // ✨ ALTERAÇÃO AQUI: Nova função para salvar edição inline
  const handleInlineChangeAndSave = (e, plano) => {
      const { name, value } = e.target;
      
      // Cria o DTO base para atualização
      const dto = { 
          id: plano.id,
          equipamentoId: plano.equipamentoId,
          frequenciaId: plano.frequenciaId,
          tipoServicoId: plano.tipoServicoId,
          toleranciaDias: plano.toleranciaDias,
          tempoPadrao: plano.tempoPadrao,
          manutentor: plano.manutentor,
          [name]: value // Sobrescreve o campo que mudou
      };
      
      // Otimismo UI: Atualiza o estado local imediatamente
      setPlanosRaw(prevPlanos => 
          prevPlanos.map(p => 
              p.id === plano.id ? { ...p, [name]: value } : p
          )
      );

      atualizarPlano(plano.id, dto)
        .then(() => {
            // Atualiza os dados de visualização (programacao)
            getProgramacaoManutencao(equipamento.id).then(res => setProgramacao(res.data || []));
        })
        .catch(err => {
            alert("Erro ao salvar: " + err.message);
            carregarDados(); // Recarrega tudo para reverter a mudança visual
        });
  };
  // Fim da alteração

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content programacao-modal" onClick={(e) => e.stopPropagation()}>
          <header className="modal-header">
            <h2>Plano de Manutenção e Histórico</h2>
            <div>
              {/* ✨ ALTERAÇÃO AQUI: Botão para alternar modo de edição */}
              <button
                onClick={() => setEditMode(!editMode)}
                className="btn-imprimir-modal" // Reutilizando estilo
                style={{ backgroundColor: editMode ? '#c82333' : '#007bff' }}
              >
                {editMode ? 'Cancelar Edição' : 'Editar Plano'}
              </button>
              {/* Fim da alteração */}

              {/* ✨ ALTERAÇÃO AQUI: Botão de impressão agora chama 'handlePrint' DIRETAMENTE */}
              <button
                onClick={handlePrint} 
                className="btn-imprimir-modal"
                disabled={loading || (!Array.isArray(planosRaw) || planosRaw.length === 0)}
              >
                Imprimir Plano
              </button>
              <button onClick={onClose} className="btn-fechar-modal">
                Fechar
              </button>
            </div>
          </header>

          <div className="modal-body">
            <h3>{equipamento?.nome || 'Carregando...'}</h3>

            {/* ✨ ALTERAÇÃO AQUI: Título condicional */}
            <h4>{editMode ? 'Editar Plano de Manutenção' : 'Plano de Manutenção (Resumo)'}</h4>
            
            {loading ? (
              <p>Carregando plano...</p>
            ) : (
                // ✨ ALTERAÇÃO AQUI: Renderização condicional (Modo Edição vs Modo Visualização)
                <Fragment>
                    {/* --- MODO EDIÇÃO --- */}
                    {editMode ? (
                        <div className="tabela-container plano-edicao-container">
                            <table className="programacao-table plano-edit-table">
                                <thead>
                                    <tr>
                                        <th>Serviço</th>
                                        <th>Frequência</th>
                                        <th>Tempo Padrão</th>
                                        {/* ✨ ALTERAÇÃO AQUI: Nova coluna */}
                                        <th>Manutentor</th>
                                        <th>Tolerância (dias)</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {planosRaw.map((plano) => (
                                        <tr key={plano.id}>
                                            <td>{plano.tipoServicoNome}</td>
                                            <td>{plano.frequencia?.nome || 'N/A'}</td>
                                            <td>
                                                <input 
                                                    type="text" 
                                                    name="tempoPadrao" // Nome do campo
                                                    defaultValue={plano.tempoPadrao || '00:00:00'}
                                                    placeholder="HH:mm:ss"
                                                    // ✨ ALTERAÇÃO AQUI: onBlur agora passa o 'plano'
                                                    onBlur={(e) => handleInlineChangeAndSave(e, plano)}
                                                />
                                            </td>
                                            {/* ✨ ALTERAÇÃO AQUI: Nova célula para Manutentor */}
                                            <td>
                                                <select 
                                                    name="manutentor"
                                                    defaultValue={plano.manutentor || 'Manutenção mecânica'}
                                                    onChange={(e) => handleInlineChangeAndSave(e, plano)}
                                                >
                                                    <option>Manutenção mecânica</option>
                                                    <option>Manutenção elétrica</option>
                                                    {/* // ✅ CORREÇÃO: Linhas removidas */}
                                                </select>
                                            </td>
                                            <td>
                                                 <input 
                                                    type="number" 
                                                    name="toleranciaDias" // Nome do campo
                                                    defaultValue={plano.toleranciaDias || 0}
                                                    min="0"
                                                    style={{ width: '80px' }}
                                                    // ✨ ALTERAÇÃO AQUI: onBlur agora passa o 'plano'
                                                    onBlur={(e) => handleInlineChangeAndSave(e, plano)}
                                                />
                                            </td>
                                            <td>
                                                <button 
                                                    className="btn-acao btn-excluir" 
                                                    onClick={() => handleDeletarPlano(plano.id)}
                                                    style={{width: '90px', padding: '0.4rem 0.8rem', fontSize: '0.85rem'}}
                                                >
                                                    Excluir
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                {/* ✨ ALTERAÇÃO AQUI: Mudado para tfoot para semântica e estilo */ }
                                <tfoot className="form-add-plano-footer">
                                    <tr className="form-add-plano">
                                        <td>
                                            <select name="tipoServicoId" value={formNovoPlano.tipoServicoId} onChange={handleNovoPlanoChange} required>
                                                <option value="" disabled>Selecione um serviço</option>
                                                {servicosList.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                                            </select>
                                        </td>
                                        <td>
                                            <select name="frequenciaId" value={formNovoPlano.frequenciaId} onChange={handleNovoPlanoChange} required>
                                                <option value="" disabled>Selecione uma frequência</option>
                                                {frequenciasList.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                                            </select>
                                        </td>
                                        <td>
                                            <input type="text" name="tempoPadrao" value={formNovoPlano.tempoPadrao} onChange={handleNovoPlanoChange} placeholder="HH:mm:ss" />
                                        </td>
                                        {/* ✨ ALTERAÇÃO AQUI: Novo select 'manutentor' no formulário */}
                                        <td>
                                            <select name="manutentor" value={formNovoPlano.manutentor} onChange={handleNovoPlanoChange}>
                                                <option>Manutenção mecânica</option>
                                                <option>Manutenção elétrica</option>
                                                {/* // ✅ CORREÇÃO: Linhas removidas */}
                                            </select>
                                        </td>
                                        <td>
                                            <input type="number" name="toleranciaDias" value={formNovoPlano.toleranciaDias} onChange={handleNovoPlanoChange} style={{ width: '80px' }} />
                                        </td>
                                        <td>
                                            <button 
                                                className="btn-acao btn-salvar"
                                                onClick={handleAdicionarPlano}
                                                style={{width: '90px', padding: '0.4rem 0.8rem', fontSize: '0.85rem'}}
                                            >
                                                Adicionar
                                            </button>
                                        </td>
                                    </tr>
                                </tfoot>
                              </table>
                        </div>
                    ) : (
                        /* --- MODO VISUALIZAÇÃO (O que já existia) --- */
                        programacao.length > 0 ? (
                          <div className="tabela-container">
                            <table className="programacao-table">
                              <thead>
                                <tr>
                                  <th>Serviço</th>
                                  <th>Frequência</th>
                                  <th>Tempo Padrão</th>
                                  {/* ✨ ALTERAÇÃO AQUI: Título da coluna */}
                                  <th>Manutentor</th>
                                </tr>
                              </thead>
                              <tbody>
                                {programacao.map((item, index) => (
                                  <tr key={`prog-${index}`}>
                                    <td>{item.servico}</td>
                                    <td>{item.frequencia}</td>
                                    <td>{formatTempoPadrao(item.tempoPadrao)}</td>
                                    {/* ✨ ALTERAÇÃO AQUI: Puxa o 'manutentor' do DTO */}
                                    <td>{item.manutentor || 'N/A'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="mensagem-vazia">Nenhum plano cadastrado.</p>
                        )
                    )}
                </Fragment>
            )}
            {/* Fim da alteração */}


            <h4 style={{ marginTop: '2rem' }}>Histórico de Ordens de Serviço Preventivas</h4>
            {loading ? (
              <p>Carregando histórico...</p>
            ) : historico.length > 0 ? (
              <div className="historico-table-container">
                <table className="programacao-table historico-table">
                  <thead>
                    <tr>
                      <th>Nº OS</th>
                      <th>Data</th>
                      <th>Tipo</th>
                      <th>Serviço/Problema</th>
                      <th>Executor</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historico.map((os) => {
                      const isClickable = os.id && !String(os.id).includes('-proj-');
                      return (
                        <tr
                          key={os.id}
                          onClick={() => handleRowClick(os)}
                          className={isClickable ? 'clickable-row' : ''}
                        >
                          <td>{os.codigoOs || 'N/A'}</td>
                          <td>{formatarData(os.dataSolicitacao)}</td>
                          <td>{os.tipoManutencao}</td>
                          <td title={os.descricaoProblema}>{os.descricaoProblema}</td>
                          <td>{(os.executores && os.executores.length > 0) ? os.executores.map(e => e.nome).join(', ') : (os.executadoPorNome || 'N/A')}</td>
                          <td>{getStatusBadge(os.status)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mensagem-vazia">Nenhum histórico encontrado.</p>
            )}

            {error && <p className="mensagem-erro">{error}</p>}
          </div>
        </div>
      </div>

      {/* ✨ ALTERAÇÃO AQUI: Portal agora renderiza SEMPRE (se houver equipamento), mas fica escondido */}
      <div className="print-hidden-wrapper">
          {equipamento && (
            <PrintablePlano
                ref={planoComponentRef}
                equipamento={equipamento}
                programacao={programacao}
                planosRaw={planosRaw}
            />
          )}
      </div>
    </>
  );
};

export default ProgramacaoModal;