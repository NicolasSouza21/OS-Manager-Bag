import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/apiService';
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');
    
    // ✅ CORREÇÃO: Verificação de cargos agora inclui o prefixo "ROLE_"
    const isAdmin = userRole === 'ROLE_ADMIN';
    const isLider = userRole === 'ROLE_LIDER';
    const isEncarregado = userRole === 'ROLE_ENCARREGADO';
    const isMecanico = userRole === 'ROLE_MECANICO';
    
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
                
                {/* ✅ NOVO LINK PARA O CALENDÁRIO */}
                <li>
                    <Link to="/calendario" className="nav-link">Calendário</Link>
                </li>

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