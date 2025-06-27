// Local: src/pages/LoginPage.jsx
import { useState } from 'react';
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
      
      // 1. Extraímos o token E o cargo da resposta da API
      const { token, role } = response.data;

      // 2. Guardamos AMBAS as informações no localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', role); // <-- A LINHA ESSENCIAL QUE FALTAVA

      console.log(`Login bem-sucedido! Role: ${role}, Token: ${token}`);
      
      alert('Login bem-sucedido! Redirecionando...');
      navigate('/dashboard');

    } catch (err) {
      console.error('Erro no login:', err);
      setError('Email ou senha inválidos. Tente novamente.');
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