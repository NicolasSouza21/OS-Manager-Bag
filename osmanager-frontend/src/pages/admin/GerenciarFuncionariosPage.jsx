// Local: src/pages/admin/GerenciarFuncionariosPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './GerenciarFuncionariosPage.css';

function GerenciarFuncionariosPage() {
  return (
    <div className="manage-container">
      <h1>Gerenciar Funcionários</h1>
      <p>Selecione uma das opções abaixo para continuar.</p>
      <div className="options-container">
        <Link to="/admin/funcionarios/listar" className="option-card">
          <h2>Listar Funcionários</h2>
          <p>Visualizar, editar e remover funcionários existentes.</p>
        </Link>
        <Link to="/admin/funcionarios/cadastrar" className="option-card">
          <h2>Cadastrar Novo Funcionário</h2>
          <p>Adicionar um novo membro à equipe.</p>
        </Link>
      </div>
    </div>
  );
}

export default GerenciarFuncionariosPage;