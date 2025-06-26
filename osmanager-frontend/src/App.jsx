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
import GerenciarFuncionariosPage from './pages/admin/GerenciarFuncionariosPage';

// --- 👇👇 IMPORTAMOS O NOSSO NOVO COMPONENTE DE SEGURANÇA 👇👇 ---
import ProtectedRoute from './components/ProtectedRoute';


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
      {/* Rota pública para a página de login */}
      <Route path="/login" element={<LoginPage />} />

      {/* --- 👇👇 APLICAÇÃO DA ROTA PROTEGIDA 👇👇 --- */}
      {/* Agora, criamos uma rota "pai" que usa o nosso ProtectedRoute.
        TODAS as rotas aninhadas dentro dela só serão acessíveis se o 
        utilizador estiver logado (ou seja, se o token existir).
      */}
      <Route element={<ProtectedRoute />}>
        {/* A rota que contém a Navbar e as páginas internas agora está protegida */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/criar-os" element={<CriarOsPage />} />
          <Route path="/os/:id" element={<VisualizarOsPage />} />
          
          {/* Rotas de Administração */}
          <Route path="/admin/funcionarios" element={<GerenciarFuncionariosPage />} />
          <Route path="/admin/funcionarios/listar" element={<ListarFuncionariosPage />} />
          <Route path="/admin/funcionarios/cadastrar" element={<CadastroUsuarioPage />} />
        </Route>
      </Route>

      {/* Redirecionamentos padrão */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;