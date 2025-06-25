// Local: src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 1. IMPORTE O useNavigate
import { login } from '../services/apiService';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate(); // 👈 2. INICIE O HOOK
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (evento) => {
    evento.preventDefault();
    setError('');

    try {
      const credentials = { email, senha };
      const response = await login(credentials);
      
      const token = response.data.token;

      console.log('Login realizado com sucesso!');
      console.log('Token recebido:', token);
      
      localStorage.setItem('authToken', token);

      // Feedback para o utilizador (opcional, pode ser removido)
      alert('Login bem-sucedido! Redirecionando...');

      // 👇 3. NAVEGUE PARA O DASHBOARD APÓS O SUCESSO 👇
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