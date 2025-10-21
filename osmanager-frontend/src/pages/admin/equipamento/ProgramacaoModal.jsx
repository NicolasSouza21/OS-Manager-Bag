// Local: osmanager-frontend/src/pages/admin/equipamento/ProgramacaoModal.jsx
import React, { useEffect, useState } from 'react';
import { getHistoricoPorEquipamento } from '../../../services/apiService';
import './GerenciarEquipamentosPage.css'; // Importa o CSS compartilhado

// Função getNextDate (sem alterações)
const getNextDate = (startDate, frequenciaObj) => {
    // ... (código original da função getNextDate)
    if (!frequenciaObj || !frequenciaObj.unidadeTempo || !frequenciaObj.intervalo || !startDate) {
        return null;
    }
    const originalDate = new Date(startDate);
    const date = new Date(originalDate);
    // Remove ajuste UTC inicial
    // date.setMinutes(date.getMinutes() + date.getTimezoneOffset());

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
    // Remove ajuste local final
    // date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date;
};

// Funções auxiliares (sem alterações)
 const formatarData = (data) => {
       if (!data) return 'N/A';
       const date = new Date(data);
       return date.toLocaleDateString('pt-BR');
   }

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
    // Estado original para guardar todas as OS buscadas
    const [ordensPreventivasTodas, setOrdensPreventivasTodas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // ✨ ALTERAÇÃO AQUI: Estados para os filtros
    const [filtroData, setFiltroData] = useState(''); // Formato YYYY-MM-DD
    const [filtroOsNumero, setFiltroOsNumero] = useState('');

    useEffect(() => {
        if (equipamento?.id) {
            setLoading(true);
            setError('');
            getHistoricoPorEquipamento(equipamento.id)
                .then(response => {
                    const todasOsDoEquipamento = response.data || [];

                    const preventivasExistentesVisiveis = todasOsDoEquipamento.filter(os =>
                        os.tipoManutencao === 'PREVENTIVA' &&
                        os.status !== 'CONCLUIDA' && os.status !== 'CANCELADA'
                    );

                    const ultimaPreventivaRegistrada = todasOsDoEquipamento
                         .filter(os => os.tipoManutencao === 'PREVENTIVA' && os.frequencia && os.dataInicioPreventiva)
                         .sort((a, b) => new Date(b.dataInicioPreventiva) - new Date(a.dataInicioPreventiva))
                         [0];

                    const preventivasProjetadas = [];
                    if (ultimaPreventivaRegistrada) {
                        let dataBaseProjecao = new Date(ultimaPreventivaRegistrada.dataInicioPreventiva);
                        const dataLimite = new Date();
                        dataLimite.setFullYear(dataLimite.getFullYear() + 2);
                        let proximaData = getNextDate(dataBaseProjecao, ultimaPreventivaRegistrada.frequencia);

                        while (proximaData && proximaData < dataLimite) {
                            const existeOsRealNaData = preventivasExistentesVisiveis.some(osReal =>
                                osReal.dataInicioPreventiva &&
                                new Date(osReal.dataInicioPreventiva).toDateString() === proximaData.toDateString()
                            );
                            const isSameAsBaseDate = dataBaseProjecao instanceof Date && !isNaN(dataBaseProjecao) && dataBaseProjecao.toDateString() === proximaData.toDateString();

                            if (!existeOsRealNaData && !isSameAsBaseDate) {
                                const virtualId = `${ultimaPreventivaRegistrada.id}-proj-${proximaData.getTime()}`;
                                preventivasProjetadas.push({
                                    id: virtualId,
                                    codigoOs: '(Previsto)',
                                    tipoManutencao: 'PREVENTIVA',
                                    dataInicioPreventiva: proximaData.toISOString(),
                                    tiposServico: Array.isArray(ultimaPreventivaRegistrada.tiposServico) ? ultimaPreventivaRegistrada.tiposServico : [],
                                    frequencia: ultimaPreventivaRegistrada.frequencia,
                                    status: 'PREVISTO',
                                    equipamentoId: equipamento.id,
                                });
                             }
                            dataBaseProjecao = proximaData;
                            proximaData = getNextDate(dataBaseProjecao, ultimaPreventivaRegistrada.frequencia);
                        }
                    }

                    const todasPreventivas = [...preventivasExistentesVisiveis, ...preventivasProjetadas]
                        .sort((a, b) => new Date(a.dataInicioPreventiva) - new Date(b.dataInicioPreventiva));

                    // ✨ ALTERAÇÃO AQUI: Guarda a lista completa no novo estado
                    setOrdensPreventivasTodas(todasPreventivas);
                })
                .catch((err) => {
                    console.error("Erro ao carregar OS preventivas:", err);
                    setError('Falha ao carregar as Ordens de Serviço Preventivas.');
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [equipamento]);

    // ✨ ALTERAÇÃO AQUI: Aplica os filtros antes de renderizar
    const ordensFiltradas = ordensPreventivasTodas.filter(os => {
        // Filtro por Data
        if (filtroData) {
            // Converte a data da OS para YYYY-MM-DD para comparar
            const dataOs = os.dataInicioPreventiva ? new Date(os.dataInicioPreventiva).toISOString().split('T')[0] : null;
            if (dataOs !== filtroData) {
                return false; // Não corresponde à data do filtro
            }
        }
        // Filtro por Número OS (ignora '(Previsto)')
        if (filtroOsNumero && os.codigoOs && os.codigoOs !== '(Previsto)') {
            if (!String(os.codigoOs).includes(filtroOsNumero)) {
                return false; // Não contém o número/texto do filtro
            }
        }
        // Se passou por todos os filtros, inclui na lista
        return true;
    });


    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content programacao-modal" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>Programação Preventiva</h2>
                    <button onClick={onClose} className="btn-fechar-modal">Fechar</button>
                </header>
                <div className="modal-body">
                    <h3>{equipamento.nome}</h3>
                    <h4>Ordens de Serviço Preventivas (Existentes e Projetadas)</h4>

                     {/* ✨ ALTERAÇÃO AQUI: Adiciona os campos de filtro */}
                     <div className="filtros-programacao-modal">
                        <div className="filtro-item">
                            <label htmlFor="filtroData">Filtrar por Data:</label>
                            <input
                                type="date"
                                id="filtroData"
                                value={filtroData}
                                onChange={(e) => setFiltroData(e.target.value)}
                            />
                        </div>
                        <div className="filtro-item">
                            <label htmlFor="filtroOsNumero">Filtrar por Nº OS:</label>
                            <input
                                type="text"
                                id="filtroOsNumero"
                                placeholder="Digite o número..."
                                value={filtroOsNumero}
                                onChange={(e) => setFiltroOsNumero(e.target.value)}
                            />
                        </div>
                        {/* Botão para limpar filtros (opcional) */}
                        {(filtroData || filtroOsNumero) && (
                             <button
                                type="button"
                                className="btn-limpar-filtros"
                                onClick={() => { setFiltroData(''); setFiltroOsNumero(''); }}
                             >
                                Limpar Filtros
                             </button>
                        )}
                    </div>

                    {loading ? <p>Carregando programação...</p> : ordensFiltradas.length > 0 ? ( // ✨ ALTERAÇÃO AQUI: Usa ordensFiltradas
                        <div className="historico-table-container">
                            <table className="programacao-table historico-table">
                                <thead>
                                    <tr>
                                        <th>Nº OS / Status</th>
                                        <th>Data Programada</th>
                                        <th>Serviço(s)</th>
                                        <th>Frequência</th>
                                        <th>Status OS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                     {/* ✨ ALTERAÇÃO AQUI: Mapeia ordensFiltradas */}
                                    {ordensFiltradas.map((os) => (
                                        <tr key={os.id}>
                                            <td>{os.codigoOs || '(Previsto)'}</td>
                                            <td>{formatarData(os.dataInicioPreventiva)}</td>
                                            <td title={getServicosNomes(os.tiposServico)}>
                                                {getServicosNomes(os.tiposServico)}
                                            </td>
                                            <td>{os.frequencia?.nome || 'N/A'}</td>
                                            <td>{getStatusBadge(os.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    // ✨ ALTERAÇÃO AQUI: Mensagem ajustada para quando há filtros aplicados
                    ) : <p className="mensagem-vazia">{filtroData || filtroOsNumero ? 'Nenhuma OS encontrada com os filtros aplicados.' : 'Nenhuma programação preventiva encontrada ou cadastrada para este equipamento.'}</p>}
                     {error && <p className="mensagem-erro">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default ProgramacaoModal;