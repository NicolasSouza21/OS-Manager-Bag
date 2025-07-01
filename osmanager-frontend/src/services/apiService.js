import axios from 'axios';

// Endereço do backend
const API_URL = 'http://192.168.0.11:8080/api';

// Cria instância do axios
const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para adicionar o token Authorization a cada requisição
api.interceptors.request.use(
  (config) => {
    // Sempre pega o token mais recente do localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Remove o header se não houver token para evitar requisições com token inválido
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Funções da API ---

/** Login */
export const login = (credentials) => api.post('/auth/login', credentials);

/** Lista OS */
export const getOrdensServico = (params) => api.get('/ordens-servico', { params });

/** Cria OS */
export const createOrdemServico = (osData) => api.post('/ordens-servico', osData);

/** Busca OS por ID */
export const getOsById = (id) => api.get(`/ordens-servico/${id}`);

/** Cadastra funcionário (precisa ADMIN) */
export const cadastrarFuncionario = (funcionarioData) => api.post('/funcionarios', funcionarioData);

/** Lista equipamentos */
export const getEquipamentos = () => api.get('/equipamentos');

/** Lista locais */
export const getLocais = () => api.get('/locais');

/** Lista funcionários */
export const getFuncionarios = () => api.get('/funcionarios');

/** Cria equipamento */
export const createEquipamento = (equipamentoData) => api.post('/equipamentos', equipamentoData);

/** Logout */
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
};

/** Atualiza status da OS */
export const updateStatusOs = (id, { status }) =>
  api.put(`/ordens-servico/${id}/status`, { status });

/** Atualiza equipamento */
export const updateEquipamento = (id, equipamentoData) => api.put(`/equipamentos/${id}`, equipamentoData);

/** Deleta equipamento */
export const deleteEquipamento = (id) => api.delete(`/equipamentos/${id}`);


export const deleteOrdemServico = (id) => api.delete(`/ordens-servico/${id}`);



export default api;

