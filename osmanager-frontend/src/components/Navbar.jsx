import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/apiService';
import './Navbar.css'; // O CSS também será atualizado

function Navbar() {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');
    const isAdmin = userRole === 'ADMIN';
    const isMecanico = userRole === 'MECANICO';

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

                {/* ✅ NOVO: Dropdown para "Criar OS" */}
                <li className="nav-item dropdown">
                    {/* Usamos 'a' em vez de 'Link' para o item principal para não navegar */}
                    <a href="#" className="nav-link dropdown-toggle">Criar OS</a>
                    <ul className="dropdown-menu">
                        <li>
                            <Link to="/criar-os/corretiva" className="dropdown-item">
                                🔧 OS Corretiva
                            </Link>
                        </li>
                        <li>
                            <Link to="/criar-os/preventiva" className="dropdown-item">
                                🗓️ OS Preventiva
                            </Link>
                        </li>
                    </ul>
                </li>

                {/* Mostra o link se o utilizador for ADMIN */}
                {isAdmin && (
                    <li>
                        <Link to="/admin/funcionarios" className="nav-link admin-link">
                            Gerenciar Funcionários
                        </Link>
                    </li>
                )}

                {/* Link para Gerenciar Equipamentos */}
                {(isAdmin || isMecanico) && (
                    <li>
                        <Link to="/admin/equipamentos" className="nav-link">
                            Gerenciar Equipamentos
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