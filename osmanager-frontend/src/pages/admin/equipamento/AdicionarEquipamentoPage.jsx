import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEquipamento } from '../../../services/apiService';
import './AdicionarEquipamentoPage.css';

function AdicionarEquipamentoPage() {
  const [tag, setTag] = useState('');
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
        await createEquipamento({ tag, nome, descricao });
        setSuccess('Equipamento cadastrado com sucesso!');
      setTag('');
      setNome('');
      setDescricao('');
      setTimeout(() => navigate('/admin/equipamentos/gerenciar'), 1200);
    } catch (err) {
      setError('Erro ao cadastrar equipamento. Tente novamente.');
    }
  };

  return (
    <div className="add-equipamento-container">
      <h1 className="add-equipamento-title">Cadastrar Novo Equipamento</h1>
      <p className="add-equipamento-subtitle">Preencha os dados abaixo para adicionar um novo equipamento ao inventário.</p>
      <form className="add-equipamento-card" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="tag">Tag do Equipamento</label>
          <input
            id="tag"
            type="text"
            value={tag}
            onChange={e => setTag(e.target.value)}
            placeholder="Ex: EQP-001"
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="nome">Nome do Equipamento</label>
          <input
            id="nome"
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Ex: Impressora HP"
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="descricao">Descrição</label>
          <textarea
            id="descricao"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            placeholder="Detalhes, localização, etc."
            rows={3}
          />
        </div>
        <button className="add-equipamento-btn" type="submit">Cadastrar Equipamento</button>
        {success && <div className="add-equipamento-success">{success}</div>}
        {error && <div className="add-equipamento-error">{error}</div>}
      </form>
    </div>
  );
}

export default AdicionarEquipamentoPage;