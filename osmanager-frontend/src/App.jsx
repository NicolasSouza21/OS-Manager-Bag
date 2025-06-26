import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';

// Importar todas as páginas e componentes necessários
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CriarOsPage from './pages/CriarOsPage';
import VisualizarOsPage from './pages/VisualizarOsPage'; // 1. Importamos a nova página
import Navbar from './components/Navbar';

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
      {/* Todas as rotas filhas aqui dentro terão a barra de navegação no topo. */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/criar-os" element={<CriarOsPage />} />
        
        {/* --- 👇👇 ROTA ADICIONADA AQUI 👇👇 --- */}
        {/* 2. Esta é a rota dinâmica para visualizar uma OS específica. */}
        {/* O ":id" é um parâmetro que pegaremos na página de visualização. */}
        <Route path="/os/:id" element={<VisualizarOsPage />} />
        {/* --- 👆👆 FIM DA ADIÇÃO 👆👆 --- */}

      </Route>

      {/* Redirecionamentos padrão */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;