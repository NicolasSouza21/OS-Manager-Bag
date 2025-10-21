// Local: osmanager-frontend/src/pages/admin/equipamento/HistoricoModal.jsx
import React, { useState, useEffect } from 'react';
import { getHistoricoPorEquipamento } from '../../../services/apiService'; // Importa a função
// ✨ DICA: Certifique-se que o CSS de GerenciarEquipamentosPage.css contém os estilos
// para .historico-table-container, .programacao-table.historico-table e os badges de status.
// Se não, copie-os do CSS original para cá ou importe o CSS aqui.
import './GerenciarEquipamentosPage.css';

const HistoricoModal = ({ equipamento, onClose }) => {
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (equipamento?.id) {
            setLoading(true);
            setError('');
            getHistoricoPorEquipamento(equipamento.id)
                .then(historicoRes => {
                    // Ordena o histórico pelo Nº OS, do mais recente para o mais antigo
                    const historicoOrdenado = historicoRes.data.sort((a, b) =>
                        (parseInt(b.codigoOs || 0, 10)) - (parseInt(a.codigoOs || 0, 10)) // Garante comparação numérica
                    );
                    setHistorico(historicoOrdenado);
                })
                .catch(() => {
                    setError('Falha ao carregar o histórico de OS do equipamento.');
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [equipamento]);

    const formatarData = (data) => {
        if (!data) return 'N/A';
        // Ajusta para garantir que a data seja interpretada como UTC
        const date = new Date(data);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
    }

    const getStatusBadge = (status) => {
        let className = 'status-badge ';
        switch (status?.toUpperCase()) {
            case 'ABERTA': className += 'status-aberta'; break;
            case 'PENDENTE': className += 'status-pendente'; break; // Adicionado se necessário
            case 'EM_EXECUCAO': className += 'status-andamento'; break;
            case 'AGUARDANDO_VERIFICACAO': className += 'status-verificacao'; break; // Adicionado se necessário
            case 'CONCLUIDA': case 'CONCLUÍDA': className += 'status-concluida'; break;
            case 'CANCELADA': className += 'status-cancelada'; break; // Adicionado se necessário
            default: className += 'status-default';
        }
        // Simplifica a exibição do status (ex: EM_EXECUCAO -> Em Execução)
        const statusLabel = status ? status.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) : 'N/A';
        return <span className={className}>{statusLabel}</span>;
    };


    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content programacao-modal historico-modal" onClick={e => e.stopPropagation()}> {/* Adicionada classe 'historico-modal' se precisar de estilos específicos */}
                <header className="modal-header">
                    <h2>Histórico de Ordens de Serviço</h2>
                    <button onClick={onClose} className="btn-fechar-modal">Fechar</button>
                </header>
                <div className="modal-body">
                    <h3>{equipamento.nome}</h3>

                    {/* Título da seção de Histórico */}
                    <h4>Histórico de Ordens de Serviço</h4>

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
                                    {historico.map(os => (
                                        <tr key={`hist-${os.id}`}>
                                            <td>{os.codigoOs || 'N/A'}</td>
                                            {/* Usa a data de execução se disponível, senão a de solicitação */}
                                            <td>{formatarData(os.dataExecucao || os.dataSolicitacao)}</td>
                                            <td>{os.tipoManutencao || 'N/A'}</td>
                                            <td title={os.descricaoProblema || os.acaoRealizada || ''}>
                                                {/* Mostra ação realizada para preventiva, descrição para corretiva */}
                                                {os.tipoManutencao === 'PREVENTIVA' ? os.acaoRealizada || 'Preventiva' : os.descricaoProblema || 'Corretiva'}
                                            </td>
                                            <td>{os.executadoPorNome || 'N/A'}</td>
                                            <td>{getStatusBadge(os.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="mensagem-vazia">Nenhum histórico de manutenção encontrado para este equipamento.</p>}
                    {error && <p className="mensagem-erro">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default HistoricoModal; // Exporta o novo componente