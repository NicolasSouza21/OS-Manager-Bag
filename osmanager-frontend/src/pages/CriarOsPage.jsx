import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrdemServico, getEquipamentos, getLocais, getTiposServico, getFrequencias } from '../services/apiService';
import './CriarOsPage.css';

// ✨ ALTERAÇÃO AQUI: Nova função para formatar data e hora para o input
const formatDateTimeForInput = (date) => {
    const d = new Date(date);
    // Ajusta para o fuso horário local para evitar problemas de um dia a menos
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    // Formata para 'YYYY-MM-DDTHH:mm'
    return d.toISOString().slice(0, 16);
};


function CriarOsPage() {
    const navigate = useNavigate();

    const [tipoManutencao, setTipoManutencao] = useState('CORRETIVA');
    const [formData, setFormData] = useState({
        equipamentoId: '',
        localId: '',
        prioridade: 'MEDIA',
        turno: 'PRIMEIRO', 
        solicitante: '',
        descricaoProblema: '',
        // ✨ ALTERAÇÃO AQUI: O valor inicial agora usa a nova função de data e hora
        dataInicioPreventiva: formatDateTimeForInput(new Date()),
        tipoServicoId: '',
        frequenciaId: '',
    });

    const [listaEquipamentos, setListaEquipamentos] = useState([]);
    const [listaLocais, setListaLocais] = useState([]);
    const [listaTiposServico, setListaTiposServico] = useState([]);
    const [listaFrequencias, setListaFrequencias] = useState([]);

    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const equipamentoSelecionado = listaEquipamentos.find(e => e.id === Number(formData.equipamentoId));

    const carregarDadosIniciais = useCallback(async () => {
        try {
            const [resEquipamentos, resLocais, resTiposServico, resFrequencias] = await Promise.all([
                getEquipamentos(),
                getLocais(),
                getTiposServico(),
                getFrequencias()
            ]);
            setListaEquipamentos(resEquipamentos.data);
            setListaLocais(resLocais.data);
            setListaTiposServico(resTiposServico.data);
            setListaFrequencias(resFrequencias.data);
        } catch (err) {
            console.error("Erro ao carregar dados", err);
            setError("Não foi possível carregar os dados para o formulário.");
        }
    }, []);

    useEffect(() => {
        carregarDadosIniciais();
        setFormData(prev => ({ ...prev, solicitante: localStorage.getItem('userName') || 'Usuário' }));
    }, [carregarDadosIniciais]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTipoManutencaoChange = (tipo) => {
        setTipoManutencao(tipo);
        setFormData(prev => ({
            ...prev,
            dataInicioPreventiva: formatDateTimeForInput(new Date()), // Reseta com data e hora atual
            tipoServicoId: '',
            frequenciaId: '',
            prioridade: 'MEDIA',
            descricaoProblema: ''
        }));
    };

    const handleSubmit = async (evento) => {
        evento.preventDefault();
        setError(null);

        if (tipoManutencao === 'PREVENTIVA' && (!formData.tipoServicoId || !formData.frequenciaId)) {
            alert('Para manutenção preventiva, o Tipo de Serviço e a Frequência são obrigatórios.');
            return;
        }

        setSubmitting(true);
        
        const dadosParaApi = {
            tipoManutencao,
            equipamentoId: Number(formData.equipamentoId),
            localId: Number(formData.localId),
            solicitante: formData.solicitante,
            turno: formData.turno,
        };

        if (tipoManutencao === 'CORRETIVA') {
            dadosParaApi.prioridade = formData.prioridade;
            dadosParaApi.descricaoProblema = formData.descricaoProblema;
        } else { // PREVENTIVA
            dadosParaApi.prioridade = 'MEDIA';
            dadosParaApi.dataInicioPreventiva = formData.dataInicioPreventiva;
            dadosParaApi.tipoServicoId = Number(formData.tipoServicoId);
            dadosParaApi.frequenciaId = Number(formData.frequenciaId);
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

    return (
        <div className="os-page-container">
            <form className="os-form-container" onSubmit={handleSubmit}>
                <header className="os-form-header">
                    <h1>ORDEM DE SERVIÇO DE MANUTENÇÃO</h1>
                    <div className="os-number-box">
                        <label>Nº OS:</label>
                        <span>AUTOMÁTICO</span>
                    </div>
                </header>

                <main className="os-form-body">
                    <div className="form-section-title">SOLICITAÇÃO</div>
                    
                    <div className="form-row">
                        <div className="input-group full-width">
                            <label>TIPO DE MANUTENÇÃO:</label>
                            <div className="maintenance-type-selector">
                                <button
                                    type="button"
                                    className={`maintenance-btn ${tipoManutencao === 'CORRETIVA' ? 'active' : ''}`}
                                    onClick={() => handleTipoManutencaoChange('CORRETIVA')}
                                >
                                    Corretiva
                                </button>
                                <button
                                    type="button"
                                    className={`maintenance-btn ${tipoManutencao === 'PREVENTIVA' ? 'active' : ''}`}
                                    onClick={() => handleTipoManutencaoChange('PREVENTIVA')}
                                >
                                    Preventiva
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label htmlFor="equipamento">EQUIPAMENTO:</label>
                            <select id="equipamento" name="equipamentoId" value={formData.equipamentoId} onChange={handleInputChange} required>
                                <option value="" disabled>Selecione...</option>
                                {listaEquipamentos.map((equip) => (
                                    <option key={equip.id} value={equip.id}>{equip.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Nº ATIVO:</label>
                            <input type="text" value={equipamentoSelecionado?.tag || ''} disabled />
                        </div>
                        <div className="input-group">
                            <label htmlFor="local">LOCAL:</label>
                            <select id="local" name="localId" value={formData.localId} onChange={handleInputChange} required>
                                <option value="" disabled>Selecione...</option>
                                {listaLocais.map((local) => (
                                    <option key={local.id} value={local.id}>{local.nome}</option>
                                ))}
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
                            </div>
                        </>
                    )}

                    {tipoManutencao === 'PREVENTIVA' && (
                        <div className="form-row preventiva-fields">
                             <div className="input-group">
                                <label htmlFor="tipoServicoId">TIPO DE SERVIÇO:</label>
                                <select id="tipoServicoId" name="tipoServicoId" value={formData.tipoServicoId} onChange={handleInputChange} required>
                                    <option value="" disabled>Selecione...</option>
                                    {listaTiposServico.map((servico) => (
                                        <option key={servico.id} value={servico.id}>{servico.nome}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label htmlFor="frequenciaId">FREQUÊNCIA:</label>
                                <select id="frequenciaId" name="frequenciaId" value={formData.frequenciaId} onChange={handleInputChange} required>
                                    <option value="" disabled>Selecione...</option>
                                    {listaFrequencias.map((freq) => (
                                        <option key={freq.id} value={freq.id}>{freq.nome}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label htmlFor="dataInicioPreventiva">INÍCIO PROGRAMADO:</label>
                                {/* ✅ CORREÇÃO: O tipo do input foi alterado para 'datetime-local' */}
                                <input
                                    type="datetime-local"
                                    id="dataInicioPreventiva"
                                    name="dataInicioPreventiva"
                                    value={formData.dataInicioPreventiva}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>
                    )}
                     <div className="form-row">
                         <div className="input-group">
                             <label>SOLICITANTE:</label>
                             <input type="text" name="solicitante" value={formData.solicitante} disabled />
                         </div>
                         <div className="input-group">
                            <label htmlFor="turno">TURNO:</label>
                            <select id="turno" name="turno" value={formData.turno} onChange={handleInputChange} required>
                                <option value="PRIMEIRO">Primeiro</option>
                                <option value="SEGUNDO">Segundo</option>
                                <option value="TERCEIRO">Terceiro</option>
                            </select>
                        </div>
                     </div>
                </main>

                <footer className="os-form-footer">
                    <div className="form-actions">
                        <button type="submit" className="button-save" disabled={submitting}>{submitting ? 'Criando OS...' : 'Criar Ordem de Serviço'}</button>
                        <button type="button" className="button-cancel" onClick={() => navigate(-1)}>CANCELAR</button>
                    </div>
                </footer>
            </form>
        </div>
    );
}

export default CriarOsPage;