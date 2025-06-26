import React from 'react';
// Usaremos Link para navegação, que é o ideal para links visíveis
import { Link, useNavigate } from 'react-router-dom'; 
import { logout } from '../services/apiService';
import './Navbar.css'; // Vamos criar este arquivo de estilo

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Limpa o token do localStorage
    navigate('/login'); // Redireciona para a página de login
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        {/* Link para o nome do app, que leva ao dashboard */}
        <Link to="/dashboard">OS Manager</Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
        </li>
        <li>
          <Link to="/criar-os" className="nav-link">Criar OS</Link>
        </li>
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