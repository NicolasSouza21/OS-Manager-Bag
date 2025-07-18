import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/apiService';
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');
    
    // ✅ Adicionando verificações para os novos cargos de gestão
    const isAdmin = userRole === 'ADMIN';
    const isLider = userRole === 'LIDER';
    const isQualidade = userRole === 'ANALISTA_QC'
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

                {/* Dropdown para "Criar OS" - Mantido como está */}
                <li className="nav-item dropdown">
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

                {/* Link "Gerenciar Funcionários" - Apenas para ADMIN */}
                {isAdmin && (
                    <li>
                        <Link to="/admin/funcionarios" className="nav-link admin-link">
                            Gerenciar Funcionários
                        </Link>
                    </li>
                )}

                {/* ✅Admin, Líder e Qualidade podem gerenciar equipamentos */}
                {(isAdmin || isLider || isQualidade) && (
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