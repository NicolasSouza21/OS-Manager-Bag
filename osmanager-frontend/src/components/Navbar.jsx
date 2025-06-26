import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { logout } from '../services/apiService';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();

  // 1. Lemos o cargo do usuário que foi salvo no localStorage durante o login
  const userRole = localStorage.getItem('userRole');

  // 2. Criamos uma variável booleana para verificar se o usuário é ADMIN
  //    O Spring Security geralmente adiciona o prefixo "ROLE_", então verificamos por "ROLE_ADMIN"
  const isAdmin = userRole === 'ROLE_ADMIN';

  const handleLogout = () => {
    // A função logout do apiService já limpa o token. 
    // Vamos garantir que a role também seja limpa.
    localStorage.removeItem('userRole'); 
    logout(); 
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">OS Manager</Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
        </li>
        <li>
          <Link to="/criar-os" className="nav-link">Criar OS</Link>
        </li>
        
        {/* --- 👇👇 RENDERIZAÇÃO CONDICIONAL AQUI 👇👇 --- */}
        {/* 3. Este bloco <li> só será renderizado na tela se a variável 'isAdmin' for verdadeira */}
        {isAdmin && (
          <li>
            <Link to="/admin/usuarios" className="nav-link admin-link">
              Gerenciar Usuários
            </Link>
          </li>
        )}
        {/* --- 👆👆 FIM DA CONDIÇÃO 👆👆 --- */}
        
      </ul>
      <div className="navbar-actions">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
