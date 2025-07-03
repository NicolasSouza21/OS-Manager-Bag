// Local: src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/apiService';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (evento) => {
    evento.preventDefault();
    setError('');

    try {
      const credentials = { email, senha };
      const response = await login(credentials);

      // --- 👇👇 LÓGICA DE LOGIN CORRIGIDA E SIMPLIFICADA 👇👇 ---
      
      // 1. Extraímos o token e o objeto 'userInfo' que o backend nos envia.
      const { token, userInfo } = response.data;

      // 2. Verificamos se recebemos os dados esperados.
      if (!token || !userInfo) {
        throw new Error("Resposta da API incompleta. Contacte o administrador.");
      }

      // 3. Guardamos o token e o objeto userInfo inteiro no localStorage.
      //    Guardar o objeto inteiro dá-nos acesso ao ID, nome, cargo, etc. em outras páginas.
      localStorage.setItem('authToken', token);
      localStorage.setItem('userInfo', JSON.stringify(userInfo)); // Guardamos como texto JSON

      console.log('Login bem-sucedido!');
      console.log('Informações do Utilizador Guardadas:', userInfo);
      
      navigate('/dashboard');

    } catch (err) {
      console.error('Erro no login:', err);
      // Pega a mensagem de erro da resposta da API, se existir, ou mostra uma mensagem padrão.
      const errorMessage = err.response?.data?.message || 'Email ou senha inválidos. Tente novamente.';
      setError(errorMessage);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Entrar no Sistema</h2>
        
        {error && <p className="error-message">{error}</p>}
        
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="senha">Senha</label>
          <input
            type="password"
            id="senha"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            required
          />
        </div>
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default LoginPage;