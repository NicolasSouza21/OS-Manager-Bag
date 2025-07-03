import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/apiService';
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();

    // 1. Lemos o cargo do usuário que foi salvo no localStorage
    const userRole = localStorage.getItem('userRole');

    // 2. Criamos as variáveis booleanas para as verificações de permissão
    const isAdmin = userRole === 'ADMIN';
    const isLider = userRole === 'LIDER';

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

                {/* Mostra o link se o utilizador for ADMIN */}
                {isAdmin && (
                    <li>
                        <Link to="/admin/funcionarios" className="nav-link admin-link">
                            Gerenciar Funcionários
                        </Link>
                    </li>
                )}

                {/* --- 👇👇 LINK CORRIGIDO AQUI 👇👇 --- */}
                {(isAdmin || isLider) && (
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