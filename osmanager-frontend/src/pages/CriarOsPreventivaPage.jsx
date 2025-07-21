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

// Função utilitária não precisa de alteração, está correta.
const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    // Adicionado tratamento para fuso horário local para evitar problemas de "um dia antes"
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

    // MELHORIA: Estados separados para mensagens de erro e sucesso para melhor UX
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

    // CORREÇÃO: Lógica para carregar serviços refatorada com async/await e cleanup function
    // para evitar race conditions.
    useEffect(() => {
        const equipamentoId = formData.equipamentoId;

        if (!equipamentoId) {
            setServicosDoEquipamento([]);
            return;
        }

        // Esta função de limpeza é crucial. Ela será executada antes da próxima
        // vez que o efeito rodar, ou quando o componente for desmontado.
        let isMounted = true; 

        const buscarServicos = async () => {
            setLoadingServicos(true);
            setError(null); // Limpa erros antigos
            setServicosDoEquipamento([]);
            
            try {
                const response = await listarServicosPorEquipamento(equipamentoId);
                if (isMounted) { // Só atualiza o estado se o componente ainda estiver "ativo" para esta requisição
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
            isMounted = false; // "Cancela" a requisição anterior se uma nova for disparada
        };
    }, [formData.equipamentoId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            // Se o equipamento mudar, reseta o serviço selecionado. Lógica mantida, está ótima.
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

        const dadosParaApi = {
            ...formData,
            equipamentoId: Number(formData.equipamentoId),
            localId: Number(formData.localId),
            tipoServicoId: Number(formData.tipoServicoId),
            tipoManutencao: 'PREVENTIVA',
            solicitante: localStorage.getItem('userName') || 'Sistema',
            prioridade: 'MEDIA',
        };

        try {
            await createOrdemServico(dadosParaApi);
            // MELHORIA: Usar mensagem de sucesso no estado em vez de alert()
            setSuccessMessage('Ordem de Serviço Preventiva agendada com sucesso!');
            setTimeout(() => navigate('/dashboard'), 2000); // Aguarda 2s para o usuário ler a msg
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
                    {/* MELHORIA: Exibição das mensagens de erro e sucesso */}
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