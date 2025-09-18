import React from 'react';
// ✨ ALTERAÇÃO: Importando NavLink para gerenciar o link ativo
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../services/apiService';
import './Navbar.css';

// ✨ DICA: Certifique-se de ter o Font Awesome no seu projeto!
// No seu index.html, adicione: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">

function Navbar() {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');
    // ✨ NOVO: Buscando o nome do usuário para a saudação
    const userName = localStorage.getItem('userName') || 'Usuário';

    const normalizedRole = userRole ? userRole.replace('ROLE_', '') : '';

    const isAdmin = normalizedRole === 'ADMIN';
    const isLider = normalizedRole === 'LIDER';
    const isEncarregado = normalizedRole === 'ENCARREGADO';
    
    // Usuários com permissão para acessar áreas de gestão
    const isGestor = isAdmin || isLider || isEncarregado;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        // A classe principal "navbar" é a mesma do CSS sugerido
        <nav className="navbar">
            <div className="navbar-brand">
                {/* O link da marca não precisa ser um NavLink */}
                <NavLink to="/dashboard">Gerenciador de OS</NavLink>
            </div>

            {/* ✨ ALTERAÇÃO: Usando a classe "navbar-nav" para a lista de links */}
            <ul className="navbar-nav">
                <li className="nav-item">
                    <NavLink to="/dashboard" className="nav-link">
                        <i className="fas fa-tachometer-alt"></i>
                        <span>Dashboard</span>
                    </NavLink>
                </li>
                
                <li className="nav-item">
                    <NavLink to="/calendario" className="nav-link">
                        <i className="fas fa-calendar-alt"></i>
                        <span>Calendário</span>
                    </NavLink>
                </li>

                <li className="nav-item">
                    <NavLink to="/criar-os" className="nav-link">
                        <i className="fas fa-plus-circle"></i>
                        <span>Criar OS</span>
                    </NavLink>
                </li>

                {/* Link "Gerenciar Funcionários" - Apenas para ADMIN */}
                {isAdmin && (
                    <li className="nav-item">
                        <NavLink to="/admin/funcionarios" className="nav-link">
                            <i className="fas fa-users-cog"></i>
                            <span>Gerenciar Funcionários</span>
                        </NavLink>
                    </li>
                )}

                {/* Link para "Gerenciar Equipamentos" - Apenas para Gestores */}
                {isGestor && (
                    <li className="nav-item">
                        <NavLink to="/admin/equipamentos" className="nav-link">
                            <i className="fas fa-tools"></i>
                            <span>Gerenciar Equipamentos</span>
                        </NavLink>
                    </li>
                )}
            </ul>
            
            {/* ✨ NOVO: Área do usuário separada à direita */}
            <div className="navbar-user">
                <span className="user-greeting">Olá, {userName}!</span>
                <button onClick={handleLogout} className="logout-button">
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                </button>
            </div>
        </nav>
    );
}

export default Navbar;