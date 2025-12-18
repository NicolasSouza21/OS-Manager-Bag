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
    // ✨ ALTERAÇÃO AQUI: Adiciona a verificação para Analista de Qualidade
    const isAnalistaCQ = normalizedRole === 'ANALISTA_CQ';
    // ✨ ALTERAÇÃO AQUI: Adiciona a verificação para Mecânico
    const isMecanico = normalizedRole === 'MECANICO';

    // Usuários com permissão para acessar áreas de gestão
    const podeGerenciarEquipamentos = isAdmin || isLider || isEncarregado || isAnalistaCQ;

    // ✨ ALTERAÇÃO AQUI: Lógica de visibilidade dos painéis
    // O Dashboard de gestão é para todos, exceto Mecânico e Solicitante (que não estão na lista)
    const podeVerDashboardGestao = isAdmin || isLider || isEncarregado || isAnalistaCQ;
    // O Painel do Mecânico é para quem executa OS
    const podeVerMeuPainel = isAdmin || isLider || isMecanico;
    
    // O link principal da logo: Mecânico vai para 'meu-painel', os outros para 'dashboard'
    const homeLink = isMecanico ? '/meu-painel' : '/dashboard';


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        // A classe principal "navbar" é a mesma do CSS sugerido
        <nav className="navbar">
            <div className="navbar-brand">
                {/* ✨ ALTERAÇÃO AQUI: O link da logo agora é dinâmico */}
                <NavLink to={homeLink}>Gerenciador de OS</NavLink>
            </div>

            {/* ✨ ALTERAÇÃO: Usando a classe "navbar-nav" para a lista de links */}
            <ul className="navbar-nav">

                {/* ✨ ALTERAÇÃO AQUI: Link "Meu Painel" para Mecânicos/Líderes/Admin */}
                {podeVerMeuPainel && (
                    <li className="nav-item">
                        <NavLink to="/meu-painel" className="nav-link">
                            <i className="fas fa-clipboard-user"></i>
                            <span>Meu Painel</span>
                        </NavLink>
                    </li>
                )}

                {/* ✨ ALTERAÇÃO AQUI: Link "Dashboard" (Gestão) condicional */}
                {podeVerDashboardGestao && (
                    <li className="nav-item">
                        <NavLink to="/dashboard" className="nav-link">
                            <i className="fas fa-tachometer-alt"></i>
                            <span>Dashboard Gestão</span>
                        </NavLink>
                    </li>
                )}
                
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

                {/* ✨ ALTERAÇÃO AQUI: Novo link de Relatórios adicionado */}
                {/* Visível apenas para ADMIN ou LIDER */}
                {(isAdmin || isLider) && (
                    <li className="nav-item">
                        <NavLink to="/relatorios" className="nav-link">
                            <i className="fas fa-chart-bar"></i>
                            <span>Relatórios</span>
                        </NavLink>
                    </li>
                )}

                {/* Link "Gerenciar Funcionários" - Apenas para ADMIN */}
                {isAdmin && (
                    <li className="nav-item">
                        <NavLink to="/admin/funcionarios" className="nav-link">
                            <i className="fas fa-users-cog"></i>
                            <span>Gerenciar Funcionários</span>
                        </NavLink>
                    </li>
                )}

                {/* Link para "Gerenciar Equipamentos" - Agora inclui Analista CQ */}
                {podeGerenciarEquipamentos && (
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