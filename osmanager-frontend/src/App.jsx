// Local: src/App.jsx
import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';

// Importar todas as páginas e componentes necessários
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CriarOsPage from './pages/CriarOsPage';
import VisualizarOsPage from './pages/VisualizarOsPage';
import Navbar from './components/Navbar';
import CadastroUsuarioPage from './pages/admin/CadastroUsuarioPage';
import ListarFuncionariosPage from './pages/admin/ListarFuncionariosPage';

// --- 👇👇 NOVA PÁGINA DE GESTÃO IMPORTADA AQUI 👇👇 ---
import GerenciarFuncionariosPage from './pages/admin/GerenciarFuncionariosPage';


/**
 * Componente de Layout:
 * Define a estrutura visual para as páginas que precisam da Navbar.
 */
const AppLayout = () => (
  <>
    <Navbar />
    <main className="app-content">
      <Outlet />
    </main>
  </>
);

function App() {
  return (
    <Routes>
      {/* Rota para a página de login (não tem Navbar) */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rota "pai" que usa nosso AppLayout com Navbar. */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/criar-os" element={<CriarOsPage />} />
        <Route path="/os/:id" element={<VisualizarOsPage />} />
        
        {/* --- 👇👇 ROTAS DE ADMINISTRAÇÃO REORGANIZADAS 👇👇 --- */}
        {/* A rota principal agora leva para a página de gestão */}
        <Route path="/admin/funcionarios" element={<GerenciarFuncionariosPage />} />
        {/* A página de listagem agora está numa sub-rota */}
        <Route path="/admin/funcionarios/listar" element={<ListarFuncionariosPage />} />
        {/* A página de cadastro foi movida para uma rota mais consistente */}
        <Route path="/admin/funcionarios/cadastrar" element={<CadastroUsuarioPage />} />

      </Route>

      {/* Redirecionamentos padrão */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;