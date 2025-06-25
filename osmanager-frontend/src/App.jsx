// Local: src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'; // 👈 1. IMPORTE O Navigate
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Routes>
      {/* 👇 2. ROTA ADICIONADA PARA O REDIRECIONAMENTO 👇 */}
      {/* Se o utilizador aceder a "/", ele será redirecionado para "/login" */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Rota para a página de login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rota para o dashboard */}
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  );
}

export default App;