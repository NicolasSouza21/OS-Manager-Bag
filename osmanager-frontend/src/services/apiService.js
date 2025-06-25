// Local: src/services/apiService.js
import axios from 'axios';

// Define o endereço base da nossa API Java.
const API_URL = 'http://localhost:8080/api';

// Cria uma instância do axios já configurada com o endereço base.
const api = axios.create({
  baseURL: API_URL,
});

/**
 * Função para fazer o login.
 * @param {object} credentials - Um objeto contendo o email e a senha.
 * @returns {Promise} - A promessa da chamada da API.
 */
export const login = (credentials) => {
  // Envia uma requisição POST para o endpoint /auth/login
  // O axios junta automaticamente: 'http://localhost:8080/api' + '/auth/login'
  return api.post('/auth/login', credentials);
};

// No futuro, podemos adicionar outras funções para conversar com a API aqui.
// ex: export const buscarOrdensDeServico = () => api.get('/ordens-servico');

export default api;