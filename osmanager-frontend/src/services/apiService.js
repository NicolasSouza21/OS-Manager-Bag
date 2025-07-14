import axios from 'axios';

// Endereço do backend
const API_URL = 'http://192.168.0.11:8080/api';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para adicionar o token Authorization a cada requisição
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Garanta que a chave é 'authToken'
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
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


// =========================================================
//         ✅ FUNÇÕES DE AÇÃO PARA O FLUXO FINAL ✅
// =========================================================

/** 1. Mecânico dá ciência na OS (Status: Aberta -> Ciente) */
export const registrarCiencia = (osId) => {
  return api.put(`/ordens-servico/${osId}/ciencia`);
};

/** 2. Mecânico inicia a execução (Status: Ciente -> Em Execução) */
export const iniciarExecucao = (osId) => {
  return api.put(`/ordens-servico/${osId}/iniciar-execucao`);
};

/** 3. Mecânico preenche os detalhes e finaliza a OS (Status: Em Execução -> Concluída/Cancelada) */
export const registrarExecucao = (osId, dadosExecucao) => {
  return api.put(`/ordens-servico/${osId}/execucao`, dadosExecucao);
};


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


export default api;