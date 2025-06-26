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
      
      console.log('Token decodificado:', decodedToken);

      // Pega o cargo do usuário
      const userRole = (decodedToken.roles && Array.isArray(decodedToken.roles) && decodedToken.roles.length > 0) 
        ? decodedToken.roles[0] 
        : null;

      if (!userRole) {
        console.error("Não foi possível encontrar o 'role' do usuário no token JWT.");
        setError("Erro de permissão. Contate o administrador.");
        return;
      }
      
      localStorage.setItem('userRole', userRole);

      // --- 👇👇 A NOVA MUDANÇA ESTÁ AQUI 👇👇 ---
      // 1. Pegamos o nome completo do usuário da chave "fullName" que adicionamos no backend
      const userName = decodedToken.fullName;

      // 2. Verificamos se o nome existe e o salvamos no localStorage
      if (userName) {
        localStorage.setItem('userName', userName);
        console.log('Nome do usuário salvo:', userName);
      } else {
        console.warn("A chave 'fullName' não foi encontrada no token.");
      }
      // --- 👆👆 FIM DA MUDANÇA 👆👆 ---
      
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