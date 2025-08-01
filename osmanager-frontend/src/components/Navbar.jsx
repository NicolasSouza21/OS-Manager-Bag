import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/apiService';
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');

    const normalizedRole = userRole ? userRole.replace('ROLE_', '') : '';

    const isAdmin = normalizedRole === 'ADMIN';
    const isLider = normalizedRole === 'LIDER';
    const isEncarregado = normalizedRole === 'ENCARREGADO';
    const isMecanico = normalizedRole === 'MECANICO';
    
    // Usuários com permissão para acessar áreas de gestão
    const isGestor = isAdmin || isLider || isEncarregado;

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
                    <Link to="/calendario" className="nav-link">Calendário</Link>
                </li>

                {/* ✨ ALTERAÇÃO AQUI: O dropdown foi substituído por um link direto */}
                <li>
                    <Link to="/criar-os" className="nav-link">Criar OS</Link>
                </li>

                {/* Link "Gerenciar Funcionários" - Apenas para ADMIN */}
                {isAdmin && (
                    <li>
                        <Link to="/admin/funcionarios" className="nav-link admin-link">
                            Gerenciar Funcionários
                        </Link>
                    </li>
                )}

                {/* Link para "Gerenciar Equipamentos" - Apenas para Gestores */}
                {isGestor && (
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