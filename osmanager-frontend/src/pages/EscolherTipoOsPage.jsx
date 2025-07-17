// Local: osmanager-frontend/src/pages/EscolherTipoOsPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './EscolherTipoOsPage.css'; // Criaremos este CSS a seguir

function EscolherTipoOsPage() {
  return (
    <div className="escolher-os-container">
      <h1>Criar Nova Ordem de Serviço</h1>
      <p>Selecione o tipo de manutenção que deseja solicitar.</p>
      <div className="options-container">
        <Link to="/criar-os/corretiva" className="option-card">
          <h2>Manutenção Corretiva</h2>
          <p>Registrar um problema ou falha que precisa de reparo imediato.</p>
        </Link>
        <Link to="/criar-os/preventiva" className="option-card">
          <h2>Manutenção Preventiva</h2>
          <p>Agendar uma manutenção planejada para prevenir futuras falhas.</p>
        </Link>
      </div>
    </div>
  );
}

export default EscolherTipoOsPage;