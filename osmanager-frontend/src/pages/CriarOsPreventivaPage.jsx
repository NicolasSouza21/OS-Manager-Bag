// Local: osmanager-frontend/src/pages/CriarOsPreventivaPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrdemServico, getEquipamentos, getLocais } from '../services/apiService';
import './CriarOsPage.css'; // Reutilizaremos o mesmo estilo

const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    const year = d.getFullYear();
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
}

function CriarOsPreventivaPage() {
    const navigate = useNavigate();
    const [descricaoProblema, setDescricaoProblema] = useState('');
    const [equipamentoId, setEquipamentoId] = useState('');
    const [localId, setLocalId] = useState('');
    const [dataInicioPreventiva, setDataInicioPreventiva] = useState(formatDateForInput(new Date()));
    const [dataFimPreventiva, setDataFimPreventiva] = useState('');
    const [listaEquipamentos, setListaEquipamentos] = useState([]);
    const [listaLocais, setListaLocais] = useState([]);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const carregarDadosIniciais = async () => {
            try {
                const [resEquipamentos, resLocais] = await Promise.all([ getEquipamentos(), getLocais() ]);
                setListaEquipamentos(resEquipamentos.data);
                setListaLocais(resLocais.data);
            } catch (err) {
                setError("Não foi possível carregar os dados para o formulário.");
            }
        };
        carregarDadosIniciais();
    }, []);

    const handleSubmit = async (evento) => {
        evento.preventDefault();
        if (!dataInicioPreventiva || !dataFimPreventiva) {
            alert('Para manutenção preventiva, as datas de início e fim programado são obrigatórias.');
            return;
        }
        setError(null);
        setSubmitting(true);

        const dadosParaApi = {
            tipoManutencao: 'PREVENTIVA', // Hardcoded
            equipamentoId: Number(equipamentoId),
            localId: Number(localId),
            descricaoProblema,
            solicitante: localStorage.getItem('userName') || 'Sistema',
            prioridade: 'MEDIA', // Preventivas podem ter uma prioridade padrão
            dataInicioPreventiva,
            dataFimPreventiva
        };

        try {
            await createOrdemServico(dadosParaApi);
            alert('Ordem de Serviço Preventiva criada com sucesso!');
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
                        <h1>ORDEM DE SERVIÇO - MANUTENÇÃO PREVENTIVA</h1>
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
                            <label htmlFor="descricaoProblema">DESCRIÇÃO DO SERVIÇO A SER REALIZADO:</label>
                            <textarea id="descricaoProblema" rows="4" value={descricaoProblema} onChange={(e) => setDescricaoProblema(e.target.value)} required></textarea>
                        </div>
                    </div>
                    <div className="form-row preventiva-fields">
                        <div className="input-group">
                            <label htmlFor="dataInicioPreventiva">INÍCIO PROGRAMADO:</label>
                            <input type="date" id="dataInicioPreventiva" value={dataInicioPreventiva} onChange={(e) => setDataInicioPreventiva(e.target.value)} required />
                        </div>
                         <div className="input-group">
                            <label htmlFor="dataFimPreventiva">FIM PROGRAMADO:</label>
                            <input type="date" id="dataFimPreventiva" value={dataFimPreventiva} onChange={(e) => setDataFimPreventiva(e.target.value)} required />
                        </div>
                    </div>
                </main>
                <footer className="os-form-footer">
                    <div className="form-actions">
                        <button type="submit" className="button-save" disabled={submitting}>{submitting ? 'Agendando...' : 'Agendar OS Preventiva'}</button>
                        <button type="button" className="button-cancel" onClick={() => navigate(-1)}>CANCELAR</button>
                    </div>
                </footer>
            </form>
        </div>
    );
}

export default CriarOsPreventivaPage;