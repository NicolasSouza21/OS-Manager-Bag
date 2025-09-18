import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrdemServico, getEquipamentos, getLocais, getTiposServico, getFrequencias, getSetores } from '../services/apiService';
import './CriarOsPage.css';

const formatDateForInput = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
};

function CriarOsPage() {
    const navigate = useNavigate();
    const [tipoManutencao, setTipoManutencao] = useState('CORRETIVA');

    // ✨ ALTERAÇÃO AQUI: 'turno' foi removido do estado inicial.
    const [formData, setFormData] = useState({
        equipamentoId: '',
        localId: '',
        prioridade: 'MEDIA',
        solicitante: '',
        descricaoProblema: '',
        dataInicioPreventiva: formatDateForInput(new Date()),
        tipoServicoIds: new Set(),
        frequenciaId: '',
    });

    const [listaEquipamentos, setListaEquipamentos] = useState([]);
    const [listaLocais, setListaLocais] = useState([]);
    const [listaFrequencias, setListaFrequencias] = useState([]);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [listaSetores, setListaSetores] = useState([]);
    const [setorSelecionadoId, setSetorSelecionadoId] = useState('');
    const [locaisFiltrados, setLocaisFiltrados] = useState([]);
    const [servicosDisponiveis, setServicosDisponiveis] = useState([]);

    const equipamentoSelecionado = listaEquipamentos.find(e => e.id === Number(formData.equipamentoId));

    const carregarDadosIniciais = useCallback(async () => {
        try {
            const [resEquipamentos, resLocais, resFrequencias, resSetores] = await Promise.all([
                getEquipamentos(), getLocais(), getFrequencias(), getSetores()
            ]);
            setListaEquipamentos(resEquipamentos.data);
            setListaLocais(resLocais.data);
            setListaFrequencias(resFrequencias.data);
            setListaSetores(resSetores.data);
        } catch (err) {
            console.error("Erro ao carregar dados", err);
            setError("Não foi possível carregar os dados para o formulário.");
        }
    }, []);

    useEffect(() => {
        carregarDadosIniciais();
        setFormData(prev => ({ ...prev, solicitante: localStorage.getItem('userName') || 'Usuário' }));
    }, [carregarDadosIniciais]);

    useEffect(() => {
        if (setorSelecionadoId) {
            const filtrados = listaLocais.filter(local => local.setorId === Number(setorSelecionadoId));
            setLocaisFiltrados(filtrados);
        } else {
            setLocaisFiltrados([]);
        }
        setFormData(prev => ({ ...prev, localId: '' }));
    }, [setorSelecionadoId, listaLocais]);

    useEffect(() => {
        if (equipamentoSelecionado && equipamentoSelecionado.servicosDisponiveis) {
            setServicosDisponiveis(equipamentoSelecionado.servicosDisponiveis);
        } else {
            setServicosDisponiveis([]);
        }
        setFormData(prev => ({ ...prev, tipoServicoIds: new Set() }));
    }, [equipamentoSelecionado]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSetorChange = (e) => {
        setSetorSelecionadoId(e.target.value);
    };

    const handleServicoChange = (servicoId) => {
        setFormData(prev => {
            const newIds = new Set(prev.tipoServicoIds);
            if (newIds.has(servicoId)) {
                newIds.delete(servicoId);
            } else {
                newIds.add(servicoId);
            }
            return { ...prev, tipoServicoIds: newIds };
        });
    };

    const handleTipoManutencaoChange = (tipo) => {
        setTipoManutencao(tipo);
        setFormData(prev => ({
            ...prev,
            dataInicioPreventiva: formatDateForInput(new Date()),
            tipoServicoIds: new Set(),
            frequenciaId: '',
            prioridade: 'MEDIA',
            descricaoProblema: ''
        }));
    };

    const handleSubmit = async (evento) => {
        evento.preventDefault();
        setError(null);

        if (tipoManutencao === 'PREVENTIVA' && (formData.tipoServicoIds.size === 0 || !formData.frequenciaId)) {
            alert('Para manutenção preventiva, selecione ao menos um Tipo de Serviço e a Frequência.');
            return;
        }

        setSubmitting(true);

        const dadosBase = {
            tipoManutencao,
            equipamentoId: Number(formData.equipamentoId),
            localId: formData.localId ? Number(formData.localId) : null,
        };

        let dadosParaApi;

        if (tipoManutencao === 'CORRETIVA') {
            dadosParaApi = {
                ...dadosBase,
                solicitante: formData.solicitante,
                prioridade: formData.prioridade,
                descricaoProblema: formData.descricaoProblema,
                // ✨ ALTERAÇÃO AQUI: O campo 'turno' não é mais enviado.
            };
        } else { // PREVENTIVA
            dadosParaApi = {
                ...dadosBase,
                prioridade: 'MEDIA',
                dataInicioPreventiva: formData.dataInicioPreventiva,
                tipoServicoIds: Array.from(formData.tipoServicoIds),
                frequenciaId: Number(formData.frequenciaId),
            };
        }

        try {
            await createOrdemServico(dadosParaApi);
            alert('Ordem de Serviço criada com sucesso!');
            navigate('/dashboard');
        } catch (err) {
            console.error("Erro ao criar OS:", err.response?.data || err.message);
            const errorMsg = err.response?.data?.message || 'Falha ao criar a Ordem de Serviço.';
            setError(errorMsg);
            alert(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const isLocalDisabled = !setorSelecionadoId || locaisFiltrados.length === 0;

    return (
        <div className="os-page-container">
            <form className="os-form-container" onSubmit={handleSubmit}>
                <header className="os-form-header">
                    <h1>ORDEM DE SERVIÇO DE MANUTENÇÃO</h1>
                </header>
                <main className="os-form-body">
                    <div className="form-section-title">SOLICITAÇÃO</div>
                    <div className="form-row">
                        <div className="input-group full-width">
                            <label>TIPO DE MANUTENÇÃO:</label>
                            <div className="maintenance-type-selector">
                                <button type="button" className={`maintenance-btn ${tipoManutencao === 'CORRETIVA' ? 'active' : ''}`} onClick={() => handleTipoManutencaoChange('CORRETIVA')}>Corretiva</button>
                                <button type="button" className={`maintenance-btn ${tipoManutencao === 'PREVENTIVA' ? 'active' : ''}`} onClick={() => handleTipoManutencaoChange('PREVENTIVA')}>Preventiva</button>
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label htmlFor="equipamento">EQUIPAMENTO:</label>
                            <select id="equipamento" name="equipamentoId" value={formData.equipamentoId} onChange={handleInputChange} required>
                                <option value="" disabled>Selecione...</option>
                                {listaEquipamentos.map((equip) => (<option key={equip.id} value={equip.id}>{equip.nome}</option>))}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Nº ATIVO:</label>
                            <input type="text" value={equipamentoSelecionado?.tag || ''} disabled />
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="input-group">
                            <label htmlFor="setor">SETOR:</label>
                            <select id="setor" name="setor" value={setorSelecionadoId} onChange={handleSetorChange} required>
                                <option value="" disabled>Selecione um setor</option>
                                {listaSetores.map((setor) => (<option key={setor.id} value={setor.id}>{setor.nome}</option>))}
                            </select>
                        </div>
                        <div className="input-group">
                            <label htmlFor="local">LOCAL:</label>
                            <select id="local" name="localId" value={formData.localId} onChange={handleInputChange} disabled={isLocalDisabled}>
                                <option value="">
                                    {!setorSelecionadoId ? 'Escolha um setor primeiro' : (locaisFiltrados.length === 0 ? 'Nenhum local para este setor' : 'Selecione um local (Opcional)')}
                                </option>
                                {locaisFiltrados.map((local) => (<option key={local.id} value={local.id}>{local.nome}</option>))}
                            </select>
                        </div>
                    </div>

                    {tipoManutencao === 'CORRETIVA' && (
                        <>
                            <div className="form-row">
                                <div className="input-group full-width">
                                    <label htmlFor="descricaoProblema">DESCRIÇÃO DO PROBLEMA/SERVIÇO:</label>
                                    <textarea id="descricaoProblema" name="descricaoProblema" rows="3" value={formData.descricaoProblema} onChange={handleInputChange} required></textarea>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="input-group">
                                    <label htmlFor="prioridade">PRIORIDADE:</label>
                                    <select id="prioridade" name="prioridade" value={formData.prioridade} onChange={handleInputChange} required>
                                        <option value="BAIXA">Baixa</option>
                                        <option value="MEDIA">Média</option>
                                        <option value="ALTA">Alta</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>SOLICITANTE:</label>
                                    <input type="text" name="solicitante" value={formData.solicitante} disabled />
                                </div>
                                {/* ✨ ALTERAÇÃO AQUI: Campo de turno foi completamente REMOVIDO do formulário */}
                            </div>
                        </>
                    )}

                    {tipoManutencao === 'PREVENTIVA' && (
                        <>
                            <div className="input-group full-width">
                                <label>SERVIÇOS A SEREM REALIZADOS:</label>
                                {formData.equipamentoId ? (
                                    servicosDisponiveis.length > 0 ? (
                                        <div className="servicos-checkbox-container">
                                            {servicosDisponiveis.map(servico => (
                                                <label key={servico.id} className="checkbox-label">
                                                    <input type="checkbox" checked={formData.tipoServicoIds.has(servico.id)} onChange={() => handleServicoChange(servico.id)} />
                                                    {servico.nome}
                                                </label>
                                            ))}
                                        </div>
                                    ) : (<p className="info-text">Nenhum serviço de preventiva associado a este equipamento.</p>)
                                ) : (<p className="info-text">Selecione um equipamento para ver os serviços disponíveis.</p>)}
                            </div>
                            <div className="form-row preventiva-fields">
                                <div className="input-group">
                                    <label htmlFor="frequenciaId">FREQUÊNCIA:</label>
                                    <select id="frequenciaId" name="frequenciaId" value={formData.frequenciaId} onChange={handleInputChange} required>
                                        <option value="" disabled>Selecione...</option>
                                        {listaFrequencias.map((freq) => (<option key={freq.id} value={freq.id}>{freq.nome}</option>))}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label htmlFor="dataInicioPreventiva">INÍCIO PROGRAMADO:</label>
                                    <input type="date" id="dataInicioPreventiva" name="dataInicioPreventiva" value={formData.dataInicioPreventiva} onChange={handleInputChange} required />
                                </div>
                            </div>
                        </>
                    )}
                </main>
                <footer className="os-form-footer">
                    <button type="submit" className="button-save" disabled={submitting}>{submitting ? 'Criando OS...' : 'Criar Ordem de Serviço'}</button>
                    <button type="button" className="button-cancel" onClick={() => navigate(-1)}>CANCELAR</button>
                </footer>
            </form>
        </div>
    );
}

export default CriarOsPage;