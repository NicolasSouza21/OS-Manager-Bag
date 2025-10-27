// ✨ ALTERAÇÃO AQUI: Imports para impressão adicionados
import React, { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useNavigate } from 'react-router-dom';
// ✨ ALTERAÇÃO AQUI: getProgramacaoManutencao foi adicionado para o plano futuro
import { getHistoricoPorEquipamento, getProgramacaoManutencao } from '../../../services/apiService';
import './GerenciarEquipamentosPage.css';


// ✨ ALTERAÇÃO AQUI: Componente de impressão com o novo rodapé
const PrintableHistorico = React.forwardRef(({ equipamento, historico }, ref) => {
    const dataImpressao = new Date().toLocaleDateString('pt-BR');

    return (
        // ✅ CORREÇÃO: Adicionado um div pai e a classe 'printable-container'
        <div ref={ref} className="printable-container">
            <table className="print-table">
                {/* Cabeçalho da Tabela (vai se repetir em cada página) */}
                <thead>
                    <tr>
                        <th colSpan="6" className="printable-header">
                            <h2>Histórico de Manutenção Preventiva</h2>
                            <h3>Equipamento: {equipamento.nome}</h3>
                        </th>
                    </tr>
                    <tr>
                        <th>Nº OS</th>
                        <th>Data</th>
                        <th>Tipo</th>
                        <th>Serviço/Problema</th>
                        <th>Executor</th>
                        <th>Status</th>
                    </tr>
                </thead>

                {/* Corpo da Tabela */}
                <tbody>
                    {historico.map(os => (
                        <tr key={os.id}>
                            <td>{os.codigoOs}</td>
                            <td>{formatarData(os.dataSolicitacao)}</td>
                            <td>{os.tipoManutencao}</td>
                            <td>{os.descricaoProblema}</td>
                            <td>{os.executadoPorNome || 'N/A'}</td>
                            <td>{os.status}</td>
                        </tr>
                    ))}
                </tbody>

                {/* Rodapé da Tabela (vai se repetir em cada página) */}
                <tfoot>
                    <tr>
                        <td colSpan="6" className="printable-footer">
                            <span>FO106 GERENCIAMENTO DE PROGAMAÇÃO DE MANUTENÇÃO PREVENTIVA</span>
                            <span>REV01</span>
                            <span>DATA: {dataImpressao}</span>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
});


const getNextDate = (startDate, frequenciaObj) => {
    // ... (código original da função getNextDate)
     if (!frequenciaObj || !frequenciaObj.unidadeTempo || !frequenciaObj.intervalo || !startDate) {
        return null;
    }
    const originalDate = new Date(startDate);
    const date = new Date(originalDate);
    const { unidadeTempo, intervalo } = frequenciaObj;
    const originalDayOfMonth = date.getDate();

    switch (unidadeTempo) {
        case 'HORA':
             date.setHours(date.getHours() + intervalo);
             if (date.getDate() !== originalDayOfMonth) return null;
            break;
        case 'DIA': date.setDate(date.getDate() + intervalo); break;
        case 'SEMANA': date.setDate(date.getDate() + intervalo * 7); break;
        case 'MES': date.setMonth(date.getMonth() + intervalo); break;
        case 'ANO': date.setFullYear(date.getFullYear() + intervalo); break;
        default: return null;
    }

    if (unidadeTempo !== 'HORA' && date.getDay() === 0) { // Pula Domingos
        date.setDate(date.getDate() + 1);
    }
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
      statusLabel = status.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      switch (status.toUpperCase()) {
          case 'ABERTA': className += 'status-aberta'; break;
          case 'PENDENTE': className += 'status-pendente'; break;
          case 'EM_EXECUCAO': className += 'status-andamento'; break;
          case 'AGUARDANDO_VERIFICACAO': className += 'status-verificacao'; break;
          case 'CONCLUIDA': case 'CONCLUÍDA': className += 'status-concluida'; break;
          case 'CANCELADA': className += 'status-cancelada'; break;
          case 'PREVISTO': className += 'status-previsto'; break;
          default: className += 'status-default';
      }
    } else {
      className += 'status-default';
    }
    return <span className={className}>{statusLabel}</span>;
};

const getServicosNomes = (tiposServico) => {
    if (!Array.isArray(tiposServico) || tiposServico.length === 0) return 'N/A';
    return tiposServico.map(ts => ts.nome).join(', ');
};

const ProgramacaoModal = ({ equipamento, onClose }) => {
    const [programacao, setProgramacao] = useState([]);
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const componentToPrintRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentToPrintRef.current,
    });

    useEffect(() => {
        if (equipamento?.id) {
            setLoading(true);
            setError('');
            Promise.all([
                getProgramacaoManutencao(equipamento.id),
                getHistoricoPorEquipamento(equipamento.id)
            ])
            .then(([programacaoRes, historicoRes]) => {
                setProgramacao(programacaoRes.data || []);

                // ✅ CORREÇÃO AQUI: Filtra o histórico para incluir apenas OS PREVENTIVA
                const historicoPreventivas = (historicoRes.data || []).filter(os => os.tipoManutencao === 'PREVENTIVA');

                const historicoOrdenado = historicoPreventivas.sort((a, b) =>
                    (b.codigoOs || 0) - (a.codigoOs || 0)
                );
                setHistorico(historicoOrdenado);
            })
            .catch((err) => {
                console.error("Erro ao carregar dados do modal:", err);
                setError('Falha ao carregar os dados de manutenção do equipamento.');
            })
            .finally(() => {
                setLoading(false);
            });
        }
    }, [equipamento]);

    const handleRowClick = (os) => {
        if (os.id && !String(os.id).includes('-proj-')) {
            navigate(`/os/${os.id}`);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content programacao-modal" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>Plano de Manutenção e Histórico</h2>
                    <div>
                        <button onClick={handlePrint} className="btn-imprimir-modal">Imprimir Histórico</button>
                        <button onClick={onClose} className="btn-fechar-modal">Fechar</button>
                    </div>
                </header>
                <div className="modal-body">
                    <h3>{equipamento.nome}</h3>

                    <h4>Plano de Manutenção Preventiva</h4>
                    {loading ? <p>Carregando plano...</p> : programacao.length > 0 ? (
                        <div className="tabela-container">
                            <table className="programacao-table">
                                <thead>
                                    <tr>
                                        <th>Serviço</th>
                                        <th>Frequência</th>
                                        <th>Último Manutentor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {programacao.map((item, index) => (
                                        <tr key={`prog-${index}`}>
                                            <td>{item.servico}</td>
                                            <td>{item.frequencia}</td>
                                            <td>{item.ultimoManutentor || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="mensagem-vazia">Nenhum plano de manutenção preventiva cadastrado para este equipamento.</p>}

                    <h4 style={{ marginTop: '2rem' }}>Histórico de Ordens de Serviço Preventivas</h4>
                    {loading ? <p>Carregando histórico...</p> : historico.length > 0 ? (
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
                                    {historico.map(os => {
                                        const isClickable = os.id && !String(os.id).includes('-proj-');
                                        return (
                                            <tr
                                                key={os.id}
                                                onClick={() => handleRowClick(os)}
                                                className={isClickable ? 'clickable-row' : ''}
                                            >
                                                <td>{os.codigoOs}</td>
                                                <td>{formatarData(os.dataSolicitacao)}</td>
                                                <td>{os.tipoManutencao}</td>
                                                <td title={os.descricaoProblema}>{os.descricaoProblema}</td>
                                                <td>{os.executadoPorNome || 'N/A'}</td>
                                                <td>{getStatusBadge(os.status)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="mensagem-vazia">Nenhum histórico de manutenção preventiva encontrado.</p>}
                    {error && <p className="mensagem-erro">{error}</p>}
                </div>
            </div>
            <div style={{ display: "none" }}>
                <PrintableHistorico ref={componentToPrintRef} equipamento={equipamento} historico={historico} />
            </div>
        </div>
    );
};

export default ProgramacaoModal;