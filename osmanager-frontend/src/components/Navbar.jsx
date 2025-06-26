// Local: src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { logout } from '../services/apiService';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'ROLE_ADMIN';

  const handleLogout = () => {
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
        
        {isAdmin && (
          <li>
            {/* 👇 CORRIGIDO para apontar para a nova página de gestão 👇 */}
            <Link to="/admin/funcionarios" className="nav-link admin-link">
              Gerenciar Funcionários
            </Link>
          </li>
        )}
        
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