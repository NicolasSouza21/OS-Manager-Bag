// Local: src/services/apiService.js
import axios from 'axios';

// O endereço do seu backend agora aponta para o IP correto na sua rede.
const API_URL = 'http://192.168.0.11:8080/api';


const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Função para fazer o login.
 */
export const login = (credentials) => {
  return api.post('/auth/login', credentials);
};

/**
 * Função para buscar a lista de Ordens de Serviço.
 */
export const getOrdensServico = (params) => {
  return api.get('/ordens-servico', { params });
};

/**
 * Função para CRIAR uma nova Ordem de Serviço.
 * @param {object} osData - Os dados da OS a serem enviados no corpo da requisição.
 */
export const createOrdemServico = (osData) => {
  return api.post('/ordens-servico', osData);
};

/**
 * Função para BUSCAR uma Ordem de Serviço específica pelo seu ID.
 * @param {number} id - O ID da OS a ser buscada.
 */
export const getOsById = (id) => {
  return api.get(`/ordens-servico/${id}`);
};


// --- 👇👇 NOVA FUNÇÃO ADICIONADA AQUI 👇👇 ---
/**
 * Função para CADASTRAR um novo funcionário.
 * Requer permissão de ADMIN no backend.
 * @param {object} funcionarioData - Os dados do novo funcionário.
 */
export const cadastrarFuncionario = (funcionarioData) => {
  return api.post('/funcionarios', funcionarioData);
};
// --- 👆👆 FIM DA ADIÇÃO 👆👆 ---


/**
 * Função para fazer o logout (limpa o token e o cargo do usuário do navegador).
 */
export const logout = () => {
  localStorage.removeItem('authToken');
  // É uma boa prática limpar o cargo também ao fazer logout.
  localStorage.removeItem('userRole'); 
};

export default api;
