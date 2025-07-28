import React, { useState, useEffect } from 'react';
import './ExecucaoModal.css';

// Função para formatar a data para o input datetime-local
const toInputDateTimeFormat = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Corrige o fuso horário para a exibição local no input
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - userTimezoneOffset);
    return localDate.toISOString().slice(0, 16);
};


function ExecucaoModal({ isOpen, onClose, onSubmit, os, actionLoading }) {
    // Inicializa os states com os valores existentes na OS, se houver
    const [acaoRealizada, setAcaoRealizada] = useState(os?.acaoRealizada || '');
    const [trocaPecas, setTrocaPecas] = useState(os?.trocaPecas || false);
    const [pecasSubstituidas, setPecasSubstituidas] = useState(os?.pecasSubstituidas?.length > 0 ? os.pecasSubstituidas : [{ nome: '', quantidade: 1 }]);
    
    // Define a data/hora atual como padrão para o início
    const [inicio, setInicio] = useState(() => toInputDateTimeFormat(os?.inicio || new Date().toISOString()));
    const [termino, setTermino] = useState(toInputDateTimeFormat(os?.termino || ''));

    const [maquinaParada, setMaquinaParada] = useState(os?.maquinaParada || false);

    // ✅ Efeito para garantir que a data de início nunca seja nula ao abrir
    useEffect(() => {
        if (!inicio) {
            setInicio(toInputDateTimeFormat(new Date().toISOString()));
        }
    }, [inicio]);


    if (!isOpen) return null;

    const handlePecaChange = (index, field, value) => {
        const novasPecas = [...pecasSubstituidas];
        novasPecas[index][field] = value;
        setPecasSubstituidas(novasPecas);
    };

    const adicionarPeca = () => {
        setPecasSubstituidas([...pecasSubstituidas, { nome: '', quantidade: 1 }]);
    };

    const handleFinalizacao = async (statusFinal) => {
        // Validações básicas (mantidas)
        if (statusFinal === 'CONCLUIDA' && (!acaoRealizada || !inicio || !termino)) {
            alert("Para concluir, preencha a Ação Realizada e as datas de Início e Término.");
            return;
        }

        // ✅ 1. VALIDAÇÃO DA DATA DE INÍCIO PARA PREVENTIVAS
        if (os.tipoManutencao === 'PREVENTIVA' && os.dataInicioPreventiva) {
            const dataInicioSelecionada = new Date(inicio);
            const dataProgramada = new Date(os.dataInicioPreventiva);

            // Zera os segundos para uma comparação mais justa
            dataProgramada.setSeconds(0, 0);
            dataInicioSelecionada.setSeconds(0, 0);

            if (dataInicioSelecionada < dataProgramada) {
                alert(`A data de início não pode ser anterior à data programada da preventiva (${dataProgramada.toLocaleDateString('pt-BR')}).`);
                return;
            }
        }

        const dados = {
            acaoRealizada,
            trocaPecas,
            pecasSubstituidas: trocaPecas ? pecasSubstituidas.filter(p => p.nome.trim()) : [],
            inicio,
            termino,
            maquinaParada,
            statusFinal,
        };
        
        await onSubmit(dados); // Chama a função que está no Dashboard
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Registrar Execução da OS: #{os.codigoOs}</h2>
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
                            <button type="button" onClick={adicionarPeca} className="add-peca-btn" disabled={actionLoading}>Adicionar Peça</button>
                        </div>
                    )}
                    
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="action-button-modal cancel-btn" disabled={actionLoading}>
                            Voltar
                        </button>
                        
                        {/* ✅ 2. BOTÃO "CANCELAR OS" SÓ APARECE SE NÃO FOR PREVENTIVA */}
                        {os.tipoManutencao !== 'PREVENTIVA' && (
                            <button type="button" onClick={() => handleFinalizacao('CANCELADA')} className="action-button-modal danger-btn" disabled={actionLoading}>
                                {actionLoading ? 'Salvando...' : 'Cancelar OS'}
                            </button>
                        )}

                        <button type="button" onClick={() => handleFinalizacao('CONCLUIDA')} className="action-button-modal success-btn" disabled={actionLoading}>
                           {actionLoading ? 'Salvando...' : 'Concluir OS'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExecucaoModal;