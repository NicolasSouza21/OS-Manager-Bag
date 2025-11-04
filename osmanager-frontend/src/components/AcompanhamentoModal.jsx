import React from 'react';
import './AcompanhamentoModal.css'; // Criaremos este CSS no próximo passo

/**
 * Formata uma data/hora ISO para o padrão local (ex: 20/10/2025 14:30)
 */
const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "—";
    try {
        const date = new Date(dateTimeString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch (e) {
        return "Data inválida";
    }
};

/**
 * Modal para exibir o histórico de acompanhamentos (relatórios parciais) de uma OS.
 */
function AcompanhamentoModal({ isOpen, onClose, acompanhamentos, osCodigo }) {
    if (!isOpen) {
        return null;
    }

    // Garante que 'acompanhamentos' seja sempre uma lista, mesmo que 'os.acompanhamentos' seja nulo
    const listaAcompanhamentos = Array.isArray(acompanhamentos) ? acompanhamentos : [];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content acompanhamento-modal" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>Histórico de Acompanhamento da OS #{osCodigo}</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </header>

                <div className="modal-body">
                    {listaAcompanhamentos.length === 0 ? (
                        <p className="historico-vazio">Nenhum relatório parcial salvo para esta OS.</p>
                    ) : (
                        <div className="historico-lista">
                            {/* O .map() já vai exibir na ordem correta (mais recente primeiro), 
                                pois ordenamos no Mapper do backend */}
                            {listaAcompanhamentos.map((item) => (
                                <div key={item.id} className="historico-item">
                                    <div className="historico-header">
                                        <strong className="historico-autor">{item.funcionarioNome || 'Funcionário'}</strong>
                                        <span className="historico-data">{formatDateTime(item.dataHora)}</span>
                                    </div>
                                    
                                    {/* O que foi feito */}
                                    {item.descricao && (
                                        <p className="historico-descricao">
                                            <strong>Relato:</strong> {item.descricao}
                                        </p>
                                    )}
                                    
                                    {/* Pausa */}
                                    {item.minutosPausa > 0 && (
                                        <div className="historico-pausa">
                                            <strong><i className="fas fa-pause-circle"></i> Pausa Registrada</strong>
                                            <span><strong>Duração:</strong> {item.minutosPausa} min.</span>
                                            {item.motivoPausa && (
                                                <span><strong>Motivo:</strong> {item.motivoPausa}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <footer className="modal-footer">
                    <button type="button" className="button-cancel" onClick={onClose}>
                        Fechar
                    </button>
                </footer>
            </div>
        </div>
    );
}

export default AcompanhamentoModal;