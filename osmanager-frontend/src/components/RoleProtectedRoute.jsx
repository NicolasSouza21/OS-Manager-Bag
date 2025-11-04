import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Componente para proteger rotas com base no cargo (role) do usuário.
 * @param {Object} props
 * @param {string[]} props.allowedRoles Array de cargos permitidos (ex: ['ADMIN', 'LIDER'])
 */
function RoleProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole'); // ✅ Pega o cargo salvo no login

  // 1. Verifica se está logado
  if (!token) {
    // Se não tem token, manda para o login
    return <Navigate to="/login" replace />;
  }

  // 2. Verifica se o cargo do usuário está na lista de cargos permitidos
  const isAuthorized = allowedRoles && allowedRoles.includes(userRole);

  // 3. Se estiver autorizado, mostra a página. 
  //    Senão, manda para o dashboard (uma página segura que ele pode ver).
  return isAuthorized ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

export default RoleProtectedRoute;