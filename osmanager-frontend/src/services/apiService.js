import axios from 'axios';

// Endereço do backend
const API_URL = 'http://192.168.0.11:8080/api';

const api = axios.create({
    baseURL: API_URL,
});

// Interceptor para adicionar o token Authorization a cada requisição
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- Funções da API ---

/** AUTENTICAÇÃO */
export const login = (credentials) => api.post('/auth/login', credentials);
export const logout = () => {
    localStorage.clear();
};

/** ORDENS DE SERVIÇO */
export const getOrdensServico = (params) => api.get('/ordens-servico', { params });
export const getOsById = (id) => api.get(`/ordens-servico/${id}`);
export const createOrdemServico = (osData) => api.post('/ordens-servico', osData);
export const deleteOrdemServico = (id) => api.delete(`/ordens-servico/${id}`);
export const registrarCiencia = (osId) => api.put(`/ordens-servico/${osId}/ciencia`);
export const iniciarExecucao = (osId) => api.put(`/ordens-servico/${osId}/iniciar-execucao`);
export const registrarExecucao = (osId, dadosExecucao) => api.put(`/ordens-servico/${osId}/execucao`, dadosExecucao);
export const verificarOS = (osId, dadosVerificacao) => api.post(`/ordens-servico/${osId}/verificar`, dadosVerificacao);
export const getHistoricoPorEquipamento = (equipamentoId) => api.get(`/ordens-servico/historico/equipamento/${equipamentoId}`);


/** ACOMPANHAMENTOS DA OS (RELATÓRIOS PARCIAIS) */
export const criarAcompanhamento = (acompanhamentoData) => api.post('/acompanhamentos', acompanhamentoData);
// ✨ ALTERAÇÃO AQUI: Nova função para buscar os relatórios de uma OS
export const getAcompanhamentosPorOS = (osId) => api.get(`/acompanhamentos/os/${osId}`);


/** FUNCIONÁRIOS */
export const getAllFuncionarios = () => api.get('/funcionarios');
export const getFuncionarioById = (id) => api.get(`/funcionarios/${id}`);
export const cadastrarFuncionario = (funcionarioData) => api.post('/funcionarios', funcionarioData);
export const updateFuncionario = (id, funcionarioData) => api.put(`/funcionarios/${id}`, funcionarioData);
export const deleteFuncionario = (id) => api.delete(`/funcionarios/${id}`);

/** EQUIPAMENTOS */
export const getEquipamentos = () => api.get('/equipamentos');
export const createEquipamento = (equipamentoData) => api.post('/equipamentos', equipamentoData);
export const updateEquipamento = (id, equipamentoData) => api.put(`/equipamentos/${id}`, equipamentoData);
export const deleteEquipamento = (id) => api.delete(`/equipamentos/${id}`);
export const listarServicosPorEquipamento = (equipamentoId) => api.get(`/equipamentos/${equipamentoId}/servicos`);
export const associarServico = (equipamentoId, servicoId) => api.post(`/equipamentos/${equipamentoId}/servicos/${servicoId}`);
export const desassociarServico = (equipamentoId, servicoId) => api.delete(`/equipamentos/${equipamentoId}/servicos/${servicoId}`);

/** SETORES */
export const getSetores = () => api.get('/setores');
export const createSetor = (setorData) => api.post('/setores', setorData);
export const updateSetor = (id, setorData) => api.put(`/setores/${id}`, setorData);
export const deleteSetor = (id) => api.delete(`/setores/${id}`);

/** LOCAIS */
export const getLocais = () => api.get('/locais');
export const createLocal = (localData) => api.post('/locais', localData);
export const updateLocal = (id, localData) => api.put(`/locais/${id}`, localData);
export const deleteLocal = (id) => api.delete(`/locais/${id}`);


/** PLANOS DE MANUTENÇÃO PREVENTIVA */
export const getProgramacaoManutencao = (equipamentoId) => api.get(`/planos-preventiva/programacao/${equipamentoId}`);
export const getPlanosPorEquipamento = (equipamentoId) => api.get(`/planos-preventiva/equipamento/${equipamentoId}`);
export const adicionarPlano = (planoData) => api.post('/planos-preventiva', planoData);
export const atualizarPlano = (planoId, planoData) => api.put(`/planos-preventiva/${planoId}`, planoData);
export const deletarPlano = (planoId) => api.delete(`/planos-preventiva/${planoId}`);

/** TIPOS DE SERVIÇO */
export const getTiposServico = () => api.get('/tipos-servico');
export const createTipoServico = (servicoData) => api.post('/tipos-servico', servicoData);
export const updateTipoServico = (id, servicoData) => api.put(`/tipos-servico/${id}`, servicoData);
export const deleteTipoServico = (id) => api.delete(`/tipos-servico/${id}`);

/** FREQUÊNCIAS */
export const getFrequencias = () => api.get('/frequencias');
export const createFrequencia = (frequenciaData) => api.post('/frequencias', frequenciaData);
export const updateFrequencia = (id, frequenciaData) => api.put(`/frequencias/${id}`, frequenciaData);
export const deleteFrequencia = (id) => api.delete(`/frequencias/${id}`);

/** RELATÓRIOS */
export const getDashboardLider = (dataInicio, dataFim) => {
    // Chama o novo endpoint /dashboard-lider
    return api.get('/relatorios/dashboard-lider', { 
        params: {
            dataInicio: dataInicio, // ex: "2025-11-01"
            dataFim: dataFim        // ex: "2025-11-30"
        }
    });
};


export default api;