import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    createOrdemServico, 
    getEquipamentos, 
    getLocais, 
    listarServicosPorEquipamento 
} from '../services/apiService';
import './CriarOsPage.css';

const FREQUENCIA_OPTIONS = [
    'UNICA', 'DIARIO', 'BIDIARIO', 'SEMANAL', 'QUINZENAL', 'MENSAL', 
    'BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL'
];

// Função utilitária para formatar a data para o input (sem alterações)
const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

function CriarOsPreventivaPage() {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        equipamentoId: '',
        localId: '',
        tipoServicoId: '',
        frequencia: 'MENSAL',
        dataInicioPreventiva: formatDateForInput(new Date()),
    });

    const [listaEquipamentos, setListaEquipamentos] = useState([]);
    const [listaLocais, setListaLocais] = useState([]);
    const [servicosDoEquipamento, setServicosDoEquipamento] = useState([]);
    const [loadingServicos, setLoadingServicos] = useState(false);

    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const carregarDadosIniciais = async () => {
            try {
                const [resEquipamentos, resLocais] = await Promise.all([getEquipamentos(), getLocais()]);
                setListaEquipamentos(resEquipamentos.data);
                setListaLocais(resLocais.data);
            } catch (err) {
                setError("Falha ao carregar dados iniciais. Tente recarregar a página.");
            }
        };
        carregarDadosIniciais();
    }, []);

    useEffect(() => {
        const equipamentoId = formData.equipamentoId;

        if (!equipamentoId) {
            setServicosDoEquipamento([]);
            return;
        }

        let isMounted = true; 

        const buscarServicos = async () => {
            setLoadingServicos(true);
            setError(null);
            setServicosDoEquipamento([]);
            
            try {
                const response = await listarServicosPorEquipamento(equipamentoId);
                if (isMounted) {
                    setServicosDoEquipamento(response.data);
                }
            } catch (err) {
                if (isMounted) {
                    setError("Erro ao buscar os serviços para este equipamento.");
                }
            } finally {
                if (isMounted) {
                    setLoadingServicos(false);
                }
            }
        };

        buscarServicos();

        return () => {
            isMounted = false;
        };
    }, [formData.equipamentoId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            if (name === 'equipamentoId') {
                newState.tipoServicoId = '';
            }
            return newState;
        });
    };

    const handleSubmit = async (evento) => {
        evento.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setSubmitting(true);

        // ✅ --- CORREÇÃO DE FUSO HORÁRIO APLICADA AQUI ---
        // Pega a data do formulário (ex: "2025-07-25")
        const dateString = formData.dataInicioPreventiva;
        // Cria um novo objeto Date que representa o meio-dia (12:00) na data selecionada,
        // no fuso horário local do usuário. Isso evita que a data mude para o dia anterior
        // ao ser convertida para UTC pelo servidor.
        const safeDate = new Date(`${dateString}T12:00:00`);

        const dadosParaApi = {
            ...formData,
            dataInicioPreventiva: safeDate, // Enviamos o objeto de data "seguro"
            equipamentoId: Number(formData.equipamentoId),
            localId: Number(formData.localId),
            tipoServicoId: Number(formData.tipoServicoId),
            tipoManutencao: 'PREVENTIVA',
            solicitante: localStorage.getItem('userName') || 'Sistema',
            prioridade: 'MEDIA',
        };

        try {
            await createOrdemServico(dadosParaApi);
            setSuccessMessage('Ordem de Serviço Preventiva agendada com sucesso!');
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Falha ao criar a Ordem de Serviço.';
            setError(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="os-page-container">
            <form className="os-form-container" onSubmit={handleSubmit}>
                <header className="os-form-header">
                    <h1>ORDEM DE SERVIÇO - MANUTENÇÃO PREVENTIVA</h1>
                </header>
                <main className="os-form-body">
                    {error && <div className="error-message">{error}</div>}
                    {successMessage && <div className="success-message">{successMessage}</div>}
                    
                    <div className="form-row">
                        <div className="input-group">
                            <label htmlFor="equipamento">EQUIPAMENTO:</label>
                            <select id="equipamento" name="equipamentoId" value={formData.equipamentoId} onChange={handleChange} required>
                                <option value="" disabled>Selecione...</option>
                                {listaEquipamentos.map((equip) => (
                                    <option key={equip.id} value={equip.id}>{equip.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group">
                            <label htmlFor="local">LOCAL:</label>
                            <select id="local" name="localId" value={formData.localId} onChange={handleChange} required>
                                <option value="" disabled>Selecione...</option>
                                {listaLocais.map((local) => (
                                    <option key={local.id} value={local.id}>{local.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="input-group">
                            <label htmlFor="tipoServicoId">SERVIÇO A SER REALIZADO:</label>
                            <select id="tipoServicoId" name="tipoServicoId" value={formData.tipoServicoId} onChange={handleChange} required disabled={!formData.equipamentoId || loadingServicos}>
                                <option value="" disabled>
                                    {loadingServicos ? "Carregando..." : (formData.equipamentoId ? "Selecione um serviço" : "Selecione um equipamento")}
                                </option>
                                {servicosDoEquipamento.map((servico) => (
                                    <option key={servico.id} value={servico.id}>{servico.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group">
                            <label htmlFor="frequencia">FREQUÊNCIA:</label>
                            <select id="frequencia" name="frequencia" value={formData.frequencia} onChange={handleChange} required>
                                {FREQUENCIA_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label htmlFor="dataInicioPreventiva">INÍCIO PROGRAMADO:</label>
                            <input type="date" id="dataInicioPreventiva" name="dataInicioPreventiva" value={formData.dataInicioPreventiva} onChange={handleChange} required />
                        </div>
                    </div>
                </main>
                <footer className="os-form-footer">
                    <button type="submit" className="button-save" disabled={submitting || successMessage}>
                        {submitting ? 'Agendando...' : 'Agendar OS Preventiva'}
                    </button>
                    <button type="button" className="button-cancel" onClick={() => navigate(-1)} disabled={submitting}>
                        CANCELAR
                    </button>
                </footer>
            </form>
        </div>
    );
}

export default CriarOsPreventivaPage;