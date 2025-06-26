import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/apiService';
import { jwtDecode } from 'jwt-decode';
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
      
      const token = response.data.token;

      localStorage.setItem('authToken', token);

      const decodedToken = jwtDecode(token);
      
      console.log('Token decodificado:', decodedToken); // Mantenha este log para depuração

      // --- CORREÇÃO APLICADA AQUI ---
      // Verificamos se a propriedade 'roles' existe e é um array.
      // Se não existir, consideramos um cargo padrão ou nulo para evitar o erro.
      const userRole = (decodedToken.roles && Array.isArray(decodedToken.roles) && decodedToken.roles.length > 0) 
        ? decodedToken.roles[0] 
        : null;

      if (!userRole) {
        // Se, mesmo após a decodificação, não encontrarmos um cargo, informamos um erro.
        console.error("Não foi possível encontrar o 'role' do usuário no token JWT.");
        setError("Erro de permissão. Contate o administrador.");
        return; // Impede o restante da execução
      }
      // --- FIM DA CORREÇÃO ---
      
      localStorage.setItem('userRole', userRole);

      console.log('Login realizado com sucesso!');
      console.log('Cargo do usuário salvo:', userRole);
      
      alert('Login bem-sucedido! Redirecionando...');

      navigate('/dashboard');

    } catch (err) {
      console.error('Erro no login:', err);
      // Mantém a mensagem de erro genérica para o usuário
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