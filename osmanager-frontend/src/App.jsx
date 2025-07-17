import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';

// Componentes de Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Páginas Principais
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import VisualizarOsPage from './pages/VisualizarOsPage';

// ⚠️ REMOVIDO: A página antiga de criar OS não é mais necessária.
// import CriarOsPage from './pages/CriarOsPage';

// ✅ NOVO: Importando as novas páginas para o fluxo de criação de OS.
import EscolherTipoOsPage from './pages/EscolherTipoOsPage';
import CriarOsCorretivaPage from './pages/CriarOsCorretivaPage';
import CriarOsPreventivaPage from './pages/CriarOsPreventivaPage';

// Páginas de Administração de Funcionários
import CadastroUsuarioPage from './pages/admin/CadastroUsuarioPage';
import ListarFuncionariosPage from './pages/admin/ListarFuncionariosPage';
import GerenciarFuncionariosPage from './pages/admin/GerenciarFuncionariosPage';

// Páginas de Administração de Equipamentos e Locais
import AdicionarEquipamentoPage from './pages/admin/equipamento/AdicionarEquipamentoPage';
import GerenciarEquipamentosPage from './pages/admin/equipamento/GerenciarEquipamentosPage';
import EquipamentoMenuPage from './pages/admin/equipamento/EquipamentoMenuPage';
import LocaisListPage from './pages/admin/equipamento/LocaisListPage';
import LocalAddPage from './pages/admin/equipamento/LocalAddPage';

/**
 * Componente de Layout:
 * Define a estrutura visual com Navbar no topo e Footer na base.
 */
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
      {/* Rota de login (sem layout principal) */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rotas que usam o layout principal com Navbar e Footer */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/os/:id" element={<VisualizarOsPage />} />

        {/* ✅ ROTA ATUALIZADA: Agora leva para a página de escolha. */}
        <Route path="/criar-os" element={<EscolherTipoOsPage />} />

        {/* ✅ NOVAS ROTAS: Páginas específicas para cada tipo de OS. */}
        <Route path="/criar-os/corretiva" element={<CriarOsCorretivaPage />} />
        <Route path="/criar-os/preventiva" element={<CriarOsPreventivaPage />} />

        {/* Rotas de Administração de Funcionários */}
        <Route path="/admin/funcionarios" element={<GerenciarFuncionariosPage />} />
        <Route path="/admin/funcionarios/listar" element={<ListarFuncionariosPage />} />
        <Route path="/admin/funcionarios/cadastrar" element={<CadastroUsuarioPage />} />

        {/* Rotas de Administração de Equipamentos */}
        <Route path="/admin/equipamentos" element={<EquipamentoMenuPage />} />
        <Route path="/admin/equipamentos/adicionar" element={<AdicionarEquipamentoPage />} />
        <Route path="/admin/equipamentos/gerenciar" element={<GerenciarEquipamentosPage />} />

        {/* Rotas de Administração de Locais */}
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