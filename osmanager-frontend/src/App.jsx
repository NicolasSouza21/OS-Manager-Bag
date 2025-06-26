import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';

// Importar todas as páginas e componentes necessários
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CriarOsPage from './pages/CriarOsPage';
import VisualizarOsPage from './pages/VisualizarOsPage';
import Navbar from './components/Navbar';

// 1. Vamos importar a nova página que iremos criar no próximo passo
import CadastroUsuarioPage from './pages/admin/CadastroUsuarioPage';

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
        
        {/* --- 👇👇 ROTA DE ADMINISTRAÇÃO ADICIONADA AQUI 👇👇 --- */}
        {/* 2. Esta rota leva para a nossa nova página de cadastro de usuários. */}
        <Route path="/admin/usuarios" element={<CadastroUsuarioPage />} />
        {/* --- 👆👆 FIM DA ADIÇÃO 👆👆 --- */}

      </Route>

      {/* Redirecionamentos padrão */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
