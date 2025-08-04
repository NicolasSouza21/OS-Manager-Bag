import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';

// Componentes de Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Páginas Principais
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import VisualizarOsPage from './pages/VisualizarOsPage';
import CalendarioPage from './pages/CalendarioPage'; 
import CriarOsPage from './pages/CriarOsPage';

// Páginas de Administração
import GerenciarFuncionariosPage from './pages/admin/GerenciarFuncionariosPage';
import CadastroUsuarioPage from './pages/admin/CadastroUsuarioPage';
import ListarFuncionariosPage from './pages/admin/ListarFuncionariosPage';
import EquipamentoMenuPage from './pages/admin/equipamento/EquipamentoMenuPage';
import GerenciarEquipamentosPage from './pages/admin/equipamento/GerenciarEquipamentosPage';
import GerenciarTiposServicoPage from './pages/admin/equipamento/GerenciarTiposServicoPage';
import GerenciarFrequenciasPage from './pages/admin/equipamento/GerenciarFrequenciasPage';

// ✨ ALTERAÇÃO AQUI: Import para a nova página unificada
import GerenciarLocaisPage from './pages/admin/equipamento/GerenciarLocaisPage'; 

// ✨ ALTERAÇÃO AQUI: Imports das páginas antigas removidos
// import LocaisListPage from './pages/admin/equipamento/LocaisListPage';
// import LocalAddPage from './pages/admin/equipamento/LocalAddPage';


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
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/os/:id" element={<VisualizarOsPage />} />
        <Route path="/calendario" element={<CalendarioPage />} />
        <Route path="/criar-os" element={<CriarOsPage />} />

        {/* Rotas de Administração */}
        <Route path="/admin/funcionarios" element={<GerenciarFuncionariosPage />} />
        <Route path="/admin/funcionarios/listar" element={<ListarFuncionariosPage />} />
        <Route path="/admin/funcionarios/cadastrar" element={<CadastroUsuarioPage />} />

        <Route path="/admin/equipamentos" element={<EquipamentoMenuPage />} />
        <Route path="/admin/equipamentos/gerenciar" element={<GerenciarEquipamentosPage />} />
        <Route path="/admin/equipamentos/servicos" element={<GerenciarTiposServicoPage />} />
        
        <Route path="/admin/frequencias/gerenciar" element={<GerenciarFrequenciasPage />} />

        {/* ✨ ALTERAÇÃO AQUI: Rota unificada para gerenciar setores e locais */}
        <Route path="/admin/locais/gerenciar" element={<GerenciarLocaisPage />} />
        
        {/* ✨ REMOÇÃO AQUI: Rotas antigas foram removidas */}
        {/* <Route path="/admin/equipamentos/locais" element={<LocaisListPage />} /> */}
        {/* <Route path="/admin/equipamentos/locais/adicionar" element={<LocalAddPage />} /> */}
      </Route>

      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;