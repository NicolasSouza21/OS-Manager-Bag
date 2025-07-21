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
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
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

/** FUNCIONÁRIOS */
export const getFuncionarios = () => api.get('/funcionarios');
export const cadastrarFuncionario = (funcionarioData) => api.post('/funcionarios', funcionarioData);

/** EQUIPAMENTOS */
export const getEquipamentos = () => api.get('/equipamentos');
export const createEquipamento = (equipamentoData) => api.post('/equipamentos', equipamentoData);
export const updateEquipamento = (id, equipamentoData) => api.put(`/equipamentos/${id}`, equipamentoData);
export const deleteEquipamento = (id) => api.delete(`/equipamentos/${id}`);

/** LOCAIS */
export const getLocais = () => api.get('/locais');

/** PLANOS DE MANUTENÇÃO PREVENTIVA */
export const getPlanosPorEquipamento = (equipamentoId) => api.get(`/planos-preventiva/equipamento/${equipamentoId}`);
export const adicionarPlano = (planoData) => api.post('/planos-preventiva', planoData);
export const atualizarPlano = (planoId, planoData) => api.put(`/planos-preventiva/${planoId}`, planoData);
export const deletarPlano = (planoId) => api.delete(`/planos-preventiva/${planoId}`);

/** TIPOS DE SERVIÇO */
export const getTiposServico = () => api.get('/tipos-servico');
export const createTipoServico = (servicoData) => api.post('/tipos-servico', servicoData);
export const deleteTipoServico = (id) => api.delete(`/tipos-servico/${id}`);

// ✅ FUNÇÕES ADICIONADAS PARA GERENCIAR A RELAÇÃO EQUIPAMENTO <-> SERVIÇO
export const listarServicosPorEquipamento = (equipamentoId) => api.get(`/equipamentos/${equipamentoId}/servicos`);
export const associarServico = (equipamentoId, servicoId) => api.post(`/equipamentos/${equipamentoId}/servicos/${servicoId}`);
export const desassociarServico = (equipamentoId, servicoId) => api.delete(`/equipamentos/${equipamentoId}/servicos/${servicoId}`);

export default api;