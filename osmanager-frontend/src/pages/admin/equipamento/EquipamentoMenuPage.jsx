import React from 'react';
import { Link } from 'react-router-dom';
import './EquipamentoMenuPage.css';

function EquipamentoMenuPage() {
  return (
    <div className="equipamento-menu-container">
      <h1>Gerenciar Equipamentos e Planos</h1>
      <p className="equipamento-menu-subtitle">
        Selecione uma das opções abaixo para continuar.
      </p>
      <div className="equipamento-menu-cards">
        <Link to="/admin/equipamentos/gerenciar" className="equipamento-menu-card">
          <h2 className="equipamento-menu-card-title">Gerenciar Equipamentos e Planos</h2>
          <p>Cadastrar equipamentos e configurar seus planos de manutenção preventiva.</p>
        </Link>
        
        <Link to="/admin/equipamentos/servicos" className="equipamento-menu-card">
          <h2 className="equipamento-menu-card-title">Gerenciar Serviços de manutenção</h2>
          <p>Adicionar ou remover os serviços disponíveis para os planos de manutenção.</p>
        </Link>

        <Link to="/admin/frequencias/gerenciar" className="equipamento-menu-card">
          <h2 className="equipamento-menu-card-title">Gerenciar Frequências</h2>
          <p>Adicionar, editar ou remover as frequências de manutenção (diário, semanal, etc.).</p>
        </Link>

        {/* ✨ ALTERAÇÃO AQUI: Card de "Gerenciar Setores" removido */}

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