// Local: src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
  // Verifica se o token de autenticação existe no localStorage
  const token = localStorage.getItem('authToken');

  // Se o token existe, renderiza o componente da rota solicitada.
  // O <Outlet /> é um placeholder para a página que queremos proteger (ex: Dashboard).
  if (token) {
    return <Outlet />;
  }

  // Se o token não existe, redireciona o utilizador para a página de login.
  return <Navigate to="/login" />;
}

export default ProtectedRoute; 