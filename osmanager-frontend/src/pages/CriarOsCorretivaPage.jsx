// Local: osmanager-frontend/src/pages/CriarOsCorretivaPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrdemServico, getEquipamentos, getLocais } from '../services/apiService';
import './CriarOsPage.css'; // Reutilizaremos o mesmo estilo

function CriarOsCorretivaPage() {
    const navigate = useNavigate();
    const [prioridade, setPrioridade] = useState('MEDIA');
    const [solicitante, setSolicitante] = useState('');
    const [descricaoProblema, setDescricaoProblema] = useState('');
    const [equipamentoId, setEquipamentoId] = useState('');
    const [localId, setLocalId] = useState('');
    const [listaEquipamentos, setListaEquipamentos] = useState([]);
    const [listaLocais, setListaLocais] = useState([]);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const equipamentoSelecionado = listaEquipamentos.find(e => e.id === Number(equipamentoId));

    useEffect(() => {
        const carregarDadosIniciais = async () => {
            try {
                const [resEquipamentos, resLocais] = await Promise.all([
                    getEquipamentos(),
                    getLocais()
                ]);
                setListaEquipamentos(resEquipamentos.data);
                setListaLocais(resLocais.data);
            } catch (err) {
                setError("Não foi possível carregar os dados para o formulário.");
            }
        };
        carregarDadosIniciais();
        setSolicitante(localStorage.getItem('userName') || 'Usuário');
    }, []);

    const handleSubmit = async (evento) => {
        evento.preventDefault();
        setError(null);
        setSubmitting(true);

        const dadosParaApi = {
            tipoManutencao: 'CORRETIVA', // Hardcoded
            equipamentoId: Number(equipamentoId),
            localId: Number(localId),
            prioridade,
            solicitante,
            descricaoProblema,
        };

        try {
            await createOrdemServico(dadosParaApi);
            alert('Ordem de Serviço Corretiva criada com sucesso!');
            navigate('/dashboard');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Falha ao criar a Ordem de Serviço.';
            setError(errorMsg);
            alert(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="os-page-container">
            <form className="os-form-container" onSubmit={handleSubmit}>
                <header className="os-form-header">
                    <div className="os-header-title">
                        <h1>ORDEM DE SERVIÇO - MANUTENÇÃO CORRETIVA</h1>
                    </div>
                </header>
                <main className="os-form-body">
                    {error && <div className="error-message">{error}</div>}
                    <div className="form-row">
                        <div className="input-group">
                            <label htmlFor="equipamento">EQUIPAMENTO:</label>
                            <select id="equipamento" value={equipamentoId} onChange={(e) => setEquipamentoId(e.target.value)} required>
                                <option value="" disabled>Selecione...</option>
                                {listaEquipamentos.map((equip) => (
                                    <option key={equip.id} value={equip.id}>{equip.nome}</option>
                                ))}
                            </select>
                        </div>
                         <div className="input-group">
                            <label>Nº EQUIPAMENTO:</label>
                            <input type="text" value={equipamentoSelecionado?.tag || ''} disabled />
                        </div>
                        <div className="input-group">
                            <label htmlFor="local">LOCAL:</label>
                            <select id="local" value={localId} onChange={(e) => setLocalId(e.target.value)} required>
                                <option value="" disabled>Selecione...</option>
                                {listaLocais.map((local) => (
                                    <option key={local.id} value={local.id}>{local.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="input-group full-width">
                            <label htmlFor="descricaoProblema">DESCRIÇÃO DO PROBLEMA/SERVIÇO:</label>
                            <textarea id="descricaoProblema" rows="4" value={descricaoProblema} onChange={(e) => setDescricaoProblema(e.target.value)} required></textarea>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="input-group">
                            <label htmlFor="criticidade">CRITICIDADE:</label>
                            <select id="criticidade" value={prioridade} onChange={(e) => setPrioridade(e.target.value)} required>
                                <option value="BAIXA">Baixa</option>
                                <option value="MEDIA">Média</option>
                                <option value="ALTA">Alta</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>SOLICITANTE:</label>
                            <input type="text" value={solicitante} disabled />
                        </div>
                    </div>
                </main>
                <footer className="os-form-footer">
                    <div className="form-actions">
                        <button type="submit" className="button-save" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar OS Corretiva'}</button>
                        <button type="button" className="button-cancel" onClick={() => navigate(-1)}>CANCELAR</button>
                    </div>
                </footer>
            </form>
        </div>
    );
}

export default CriarOsCorretivaPage;