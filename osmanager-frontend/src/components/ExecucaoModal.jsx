import React, { useState } from 'react';
import './ExecucaoModal.css';

function ExecucaoModal({ isOpen, onClose, onSubmit, os }) {
    const [acaoRealizada, setAcaoRealizada] = useState('');
    const [trocaPecas, setTrocaPecas] = useState(false);
    const [pecasSubstituidas, setPecasSubstituidas] = useState([{ nome: '', quantidade: 1 }]);
    const [inicio, setInicio] = useState('');
    const [termino, setTermino] = useState('');
    const [maquinaParada, setMaquinaParada] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // Para desabilitar os botões durante o envio

    if (!isOpen) return null;

    const handlePecaChange = (index, field, value) => {
        const novasPecas = [...pecasSubstituidas];
        novasPecas[index][field] = value;
        setPecasSubstituidas(novasPecas);
    };

    const adicionarPeca = () => {
        setPecasSubstituidas([...pecasSubstituidas, { nome: '', quantidade: 1 }]);
    };

    // ✅ NOVA FUNÇÃO PARA LIDAR COM A FINALIZAÇÃO
    const handleFinalizacao = async (statusFinal) => {
        if (!acaoRealizada || !inicio || !termino) {
            alert("Por favor, preencha a Ação Realizada e as datas de Início e Término.");
            return;
        }
        setIsSubmitting(true);
        const dados = {
            acaoRealizada,
            trocaPecas,
            pecasSubstituidas: trocaPecas ? pecasSubstituidas.filter(p => p.nome) : [],
            inicio,
            termino,
            maquinaParada,
            statusFinal, // Envia o status final para o backend
        };
        
        await onSubmit(dados); // Chama a função que está no Dashboard
        setIsSubmitting(false);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Registrar Execução da OS: #{os.id}</h2>
                {/* O formulário não precisa mais da tag <form> com onSubmit */}
                <div className="form-container">
                    <div className="form-group">
                        <label>Ação Realizada:</label>
                        <textarea rows="4" value={acaoRealizada} onChange={(e) => setAcaoRealizada(e.target.value)} required />
                    </div>
                    <div className="form-group-inline">
                        <div className="form-group">
                            <label>Início:</label>
                            <input type="datetime-local" value={inicio} onChange={(e) => setInicio(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Término:</label>
                            <input type="datetime-local" value={termino} onChange={(e) => setTermino(e.target.value)} required />
                        </div>
                    </div>
                    <div className="form-group checkbox-group">
                        <input type="checkbox" id="maquinaParada" checked={maquinaParada} onChange={(e) => setMaquinaParada(e.target.checked)} />
                        <label htmlFor="maquinaParada">Máquina Parada?</label>
                    </div>
                    <div className="form-group checkbox-group">
                        <input type="checkbox" id="trocaPecas" checked={trocaPecas} onChange={(e) => setTrocaPecas(e.target.checked)} />
                        <label htmlFor="trocaPecas">Houve Troca de Peças?</label>
                    </div>

                    {trocaPecas && (
                        <div className="pecas-section">
                            <h4>Peças Substituídas</h4>
                            {pecasSubstituidas.map((peca, index) => (
                                <div key={index} className="peca-item">
                                    <input type="text" placeholder="Nome da Peça" value={peca.nome} onChange={(e) => handlePecaChange(index, 'nome', e.target.value)} />
                                    <input type="number" placeholder="Qtd" value={peca.quantidade} min="1" onChange={(e) => handlePecaChange(index, 'quantidade', e.target.value)} />
                                </div>
                            ))}
                            <button type="button" onClick={adicionarPeca} className="add-peca-btn" disabled={isSubmitting}>Adicionar Peça</button>
                        </div>
                    )}
                    
                    {/* ✅ BOTÕES ATUALIZADOS */}
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="action-button-modal cancel-btn" disabled={isSubmitting}>
                            Voltar
                        </button>
                        <button type="button" onClick={() => handleFinalizacao('CANCELADA')} className="action-button-modal danger-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Salvando...' : 'Cancelar OS'}
                        </button>
                        <button type="button" onClick={() => handleFinalizacao('CONCLUIDA')} className="action-button-modal success-btn" disabled={isSubmitting}>
                           {isSubmitting ? 'Salvando...' : 'Concluir OS'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExecucaoModal;