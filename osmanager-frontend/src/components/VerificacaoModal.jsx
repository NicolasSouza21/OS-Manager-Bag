import React, { useState } from 'react';
import './VerificacaoModal.css'; // O CSS que criaremos a seguir

function VerificacaoModal({ isOpen, onClose, onSubmit, os, actionLoading }) {
    const [aprovado, setAprovado] = useState(true);
    const [comentario, setComentario] = useState('');

    if (!isOpen) {
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!aprovado && !comentario.trim()) {
            alert('É obrigatório fornecer um comentário ao reprovar a OS.');
            return;
        }
        onSubmit({
            aprovado: aprovado,
            comentarioVerificacao: comentario,
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>Verificar Ordem de Serviço #{os?.codigoOs}</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </header>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <p><strong>Equipamento:</strong> {os?.equipamentoNome || 'N/A'}</p>
                        <p><strong>Ação Realizada:</strong> {os?.acaoRealizada || 'Nenhuma ação descrita.'}</p>
                        
                        <div className="verification-choice">
                            <label>
                                <input 
                                    type="radio" 
                                    name="verificacao" 
                                    checked={aprovado} 
                                    onChange={() => setAprovado(true)} 
                                />
                                Aprovar Serviço
                            </label>
                            <label>
                                <input 
                                    type="radio" 
                                    name="verificacao" 
                                    checked={!aprovado} 
                                    onChange={() => setAprovado(false)} 
                                />
                                Reprovar Serviço
                            </label>
                        </div>

                        {!aprovado && (
                            <div className="comment-section">
                                <label htmlFor="comentario">Motivo da Reprovação (Obrigatório)</label>
                                <textarea
                                    id="comentario"
                                    value={comentario}
                                    onChange={(e) => setComentario(e.target.value)}
                                    rows="4"
                                    placeholder="Descreva o que precisa ser corrigido pelo mecânico."
                                ></textarea>
                            </div>
                        )}
                    </div>

                    <footer className="modal-footer">
                        <button type="button" className="button-cancel" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="button-action" disabled={actionLoading}>
                            {actionLoading ? 'Enviando...' : 'Confirmar Verificação'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
}

export default VerificacaoModal;