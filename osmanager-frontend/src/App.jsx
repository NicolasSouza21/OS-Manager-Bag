import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';

// Importar todas as páginas e componentes necessários
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CriarOsPage from './pages/CriarOsPage';
import VisualizarOsPage from './pages/VisualizarOsPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // ✅ 1. IMPORTE O NOVO COMPONENTE FOOTER
import CadastroUsuarioPage from './pages/admin/CadastroUsuarioPage';
import ListarFuncionariosPage from './pages/admin/ListarFuncionariosPage';
import GerenciarFuncionariosPage from './pages/admin/GerenciarFuncionariosPage';

// --- IMPORTS DE EQUIPAMENTO ---
import AdicionarEquipamentoPage from './pages/admin/equipamento/AdicionarEquipamentoPage';
import GerenciarEquipamentosPage from './pages/admin/equipamento/GerenciarEquipamentosPage';
import EquipamentoMenuPage from './pages/admin/equipamento/EquipamentoMenuPage';

// --- IMPORTS DE LOCAIS ---
import LocaisListPage from './pages/admin/equipamento/LocaisListPage';
import LocalAddPage from './pages/admin/equipamento/LocalAddPage';

/**
 * Componente de Layout:
 * Define a estrutura visual para as páginas que precisam da Navbar e do Footer.
 */
// ✅ 2. AJUSTE NO LAYOUT PARA ENCAIXAR O FOOTER CORRETAMENTE
const AppLayout = () => (
  <div className="app-layout">
    <Navbar />
    <main className="app-content">
      <Outlet />
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <Routes>
      {/* Rota para a página de login (não tem Navbar/Footer) */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rota "pai" que usa nosso AppLayout com Navbar e Footer. */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/criar-os" element={<CriarOsPage />} />
        <Route path="/os/:id" element={<VisualizarOsPage />} />

        {/* Rotas de Administração de Funcionários */}
        <Route path="/admin/funcionarios" element={<GerenciarFuncionariosPage />} />
        <Route path="/admin/funcionarios/listar" element={<ListarFuncionariosPage />} />
        <Route path="/admin/funcionarios/cadastrar" element={<CadastroUsuarioPage />} />

        {/* --- ROTAS DE EQUIPAMENTO --- */}
        <Route path="/admin/equipamentos" element={<EquipamentoMenuPage />} />
        <Route path="/admin/equipamentos/adicionar" element={<AdicionarEquipamentoPage />} />
        <Route path="/admin/equipamentos/gerenciar" element={<GerenciarEquipamentosPage />} />

        {/* --- ROTAS DE LOCAIS (DENTRO DE EQUIPAMENTOS) --- */}
        <Route path="/admin/equipamentos/locais" element={<LocaisListPage />} />
        <Route path="/admin/equipamentos/locais/adicionar" element={<LocalAddPage />} />
      </Route>

      {/* Redirecionamentos padrão */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;