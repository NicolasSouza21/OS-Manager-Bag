// Local: src/services/apiService.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
});

// 👇 INTERCETOR ADICIONADO 👇
// Este código é executado ANTES de cada requisição ser enviada.
api.interceptors.request.use(
  (config) => {
    // 1. Pega o token do localStorage
    const token = localStorage.getItem('authToken');
    
    // 2. Se o token existir, adiciona-o ao cabeçalho 'Authorization'
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 3. Retorna a configuração da requisição modificada
    return config;
  },
  (error) => {
    // Faz alguma coisa com o erro da requisição
    return Promise.reject(error);
  }
);


/**
 * Função para fazer o login.
 * @param {object} credentials - Um objeto contendo o email e a senha.
 */
export const login = (credentials) => {
  return api.post('/auth/login', credentials);
};

/**
 * 👇 NOVA FUNÇÃO ADICIONADA 👇
 * Função para buscar a lista de Ordens de Serviço.
 * @param {object} params - Objeto com parâmetros de filtro e paginação (ex: { page: 0, size: 10 })
 */
export const getOrdensServico = (params) => {
  // Agora, quando esta função for chamada, o intercetor acima
  // irá adicionar o token de autorização automaticamente.
  return api.get('/ordens-servico', { params });
};


export default api;