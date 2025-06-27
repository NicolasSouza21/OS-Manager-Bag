import React from 'react';
import { Link } from 'react-router-dom';
import './EquipamentoMenuPage.css';

function EquipamentoMenuPage() {
  return (
    <div className="equipamento-menu-container">
      <h1>Gerenciar Equipamentos</h1>
      <p className="equipamento-menu-subtitle">
        Selecione uma das opções abaixo para continuar.
      </p>
      <div className="equipamento-menu-cards">
        <Link to="/admin/equipamentos/gerenciar" className="equipamento-menu-card">
          <h2 className="equipamento-menu-card-title">Listar Equipamentos</h2>
          <p>Visualizar, editar e remover equipamentos existentes.</p>
        </Link>
        <Link to="/admin/equipamentos/adicionar" className="equipamento-menu-card">
          <h2 className="equipamento-menu-card-title">Cadastrar Novo Equipamento</h2>
          <p>Adicionar um novo equipamento ao inventário.</p>
        </Link>
        <Link to="/admin/equipamentos/locais" className="equipamento-menu-card">
          <h2 className="equipamento-menu-card-title">Listar Locais</h2>
          <p>Visualize todos os locais cadastrados.</p>
        </Link>
        <Link to="/admin/equipamentos/locais/adicionar" className="equipamento-menu-card">
          <h2 className="equipamento-menu-card-title">Cadastrar Novo Local</h2>
          <p>Adicione um novo local para equipamentos.</p>
        </Link>
      </div>
    </div>
  );
}

export default EquipamentoMenuPage;