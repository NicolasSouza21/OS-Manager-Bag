import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrdemServico, getEquipamentos, getLocais, getTiposServico, getFrequencias, getSetores } from '../services/apiService';
import './CriarOsPage.css';

const formatDateTimeForInput = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
};

function CriarOsPage() {
    const navigate = useNavigate();
    const [tipoManutencao, setTipoManutencao] = useState('CORRETIVA');
    
    // ✨ ALTERAÇÃO AQUI: 'tipoServicoId' foi trocado por 'tipoServicoIds' que agora é um Set.
    const [formData, setFormData] = useState({
        equipamentoId: '',
        localId: '',
        prioridade: 'MEDIA',
        turno: 'PRIMEIRO',
        solicitante: '',
        descricaoProblema: '',
        dataInicioPreventiva: formatDateTimeForInput(new Date()),
        tipoServicoIds: new Set(), // Agora é um Set para múltiplos IDs
        frequenciaId: '',
    });

    // Listas de dados para os selects
    const [listaEquipamentos, setListaEquipamentos] = useState([]);
    const [listaLocais, setListaLocais] = useState([]);
    const [listaFrequencias, setListaFrequencias] = useState([]);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Estados para controle do formulário dinâmico
    const [listaSetores, setListaSetores] = useState([]);
    const [setorSelecionadoId, setSetorSelecionadoId] = useState('');
    const [locaisFiltrados, setLocaisFiltrados] = useState([]);

    // ✨ ALTERAÇÃO AQUI: Novo estado para guardar apenas os serviços do equipamento selecionado.
    const [servicosDisponiveis, setServicosDisponiveis] = useState([]);

    const equipamentoSelecionado = listaEquipamentos.find(e => e.id === Number(formData.equipamentoId));

    const carregarDadosIniciais = useCallback(async () => {
        try {
            const [resEquipamentos, resLocais, resFrequencias, resSetores] = await Promise.all([
                getEquipamentos(),
                getLocais(),
                getFrequencias(),
                getSetores()
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
    
    // Filtra locais quando um setor é selecionado
    useEffect(() => {
        if (setorSelecionadoId) {
            const filtrados = listaLocais.filter(local => local.setorId === Number(setorSelecionadoId));
            setLocaisFiltrados(filtrados);
        } else {
            setLocaisFiltrados([]);
        }
        setFormData(prev => ({ ...prev, localId: '' }));
    }, [setorSelecionadoId, listaLocais]);

    // ✨ ALTERAÇÃO AQUI: Filtra os serviços disponíveis quando um equipamento é selecionado.
    useEffect(() => {
        if (equipamentoSelecionado && equipamentoSelecionado.servicosDisponiveis) {
            setServicosDisponiveis(equipamentoSelecionado.servicosDisponiveis);
        } else {
            setServicosDisponiveis([]);
        }
        // Limpa os serviços selecionados sempre que o equipamento muda
        setFormData(prev => ({ ...prev, tipoServicoIds: new Set() }));
    }, [equipamentoSelecionado]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSetorChange = (e) => {
        setSetorSelecionadoId(e.target.value);
    };

    // ✨ ALTERAÇÃO AQUI: Nova função para lidar com a seleção de múltiplos serviços (checkbox).
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
            dataInicioPreventiva: formatDateTimeForInput(new Date()),
            tipoServicoIds: new Set(), // Limpa o Set de serviços
            frequenciaId: '',
            prioridade: 'MEDIA',
            descricaoProblema: ''
        }));
    };

    const handleSubmit = async (evento) => {
        evento.preventDefault();
        setError(null);

        // ✨ ALTERAÇÃO AQUI: Validação para a lista de serviços.
        if (tipoManutencao === 'PREVENTIVA' && (formData.tipoServicoIds.size === 0 || !formData.frequenciaId)) {
            alert('Para manutenção preventiva, selecione ao menos um Tipo de Serviço e a Frequência.');
            return;
        }

        setSubmitting(true);
        
        const dadosParaApi = {
            tipoManutencao,
            equipamentoId: Number(formData.equipamentoId),
            solicitante: formData.solicitante,
            turno: formData.turno,
        };
        
        if (formData.localId) {
            dadosParaApi.localId = Number(formData.localId);
        }

        if (tipoManutencao === 'CORRETIVA') {
            dadosParaApi.prioridade = formData.prioridade;
            dadosParaApi.descricaoProblema = formData.descricaoProblema;
        } else { // PREVENTIVA
            dadosParaApi.prioridade = 'MEDIA';
            dadosParaApi.dataInicioPreventiva = formData.dataInicioPreventiva;
            // ✨ ALTERAÇÃO AQUI: Envia a lista de IDs como um array.
            dadosParaApi.tipoServicoIds = Array.from(formData.tipoServicoIds);
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
                </header>
                <main className="os-form-body">
                    <div className="form-section-title">SOLICITAÇÃO</div>
                    <div className="form-row">
                        <div className="input-group full-width">
                            <label>TIPO DE MANUTENÇÃO:</label>
                            <div className="maintenance-type-selector">
                                <button type="button" className={`maintenance-btn ${tipoManutencao === 'CORRETIVA' ? 'active' : ''}`} onClick={() => handleTipoManutencaoChange('CORRETIVA')} >
                                    Corretiva
                                </button>
                                <button type="button" className={`maintenance-btn ${tipoManutencao === 'PREVENTIVA' ? 'active' : ''}`} onClick={() => handleTipoManutencaoChange('PREVENTIVA')} >
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
                    </div>
                    
                    <div className="form-row">
                        <div className="input-group">
                            <label htmlFor="setor">SETOR:</label>
                            <select id="setor" name="setor" value={setorSelecionadoId} onChange={handleSetorChange}>
                                <option value="">Selecione um setor (Opcional)</option>
                                {listaSetores.map((setor) => (
                                    <option key={setor.id} value={setor.id}>{setor.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group">
                            <label htmlFor="local">LOCAL:</label>
                            <select id="local" name="localId" value={formData.localId} onChange={handleInputChange} disabled={!setorSelecionadoId}>
                                <option value="">
                                    {setorSelecionadoId ? 'Selecione um local (Opcional)' : 'Escolha um setor primeiro'}
                                </option>
                                {locaisFiltrados.map((local) => (
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
                        <>
                            {/* ✨ ALTERAÇÃO AQUI: O select foi substituído por uma lista de checkboxes */}
                            <div className="input-group full-width">
                                <label>SERVIÇOS A SEREM REALIZADOS:</label>
                                {formData.equipamentoId ? (
                                    servicosDisponiveis.length > 0 ? (
                                        <div className="servicos-checkbox-container">
                                            {servicosDisponiveis.map(servico => (
                                                <label key={servico.id} className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.tipoServicoIds.has(servico.id)}
                                                        onChange={() => handleServicoChange(servico.id)}
                                                    />
                                                    {servico.nome}
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="info-text">Nenhum serviço de preventiva associado a este equipamento.</p>
                                    )
                                ) : (
                                    <p className="info-text">Selecione um equipamento para ver os serviços disponíveis.</p>
                                )}
                            </div>

                            <div className="form-row preventiva-fields">
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
                        </>
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
                    <button type="submit" className="button-save" disabled={submitting}>{submitting ? 'Criando OS...' : 'Criar Ordem de Serviço'}</button>
                    <button type="button" className="button-cancel" onClick={() => navigate(-1)}>CANCELAR</button>
                </footer>
            </form>
        </div>
    );
}

export default CriarOsPage;