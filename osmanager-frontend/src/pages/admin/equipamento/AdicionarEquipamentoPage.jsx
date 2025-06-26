// Local: src/pages/inventario/AdicionarEquipamentoPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEquipamento } from '../../services/apiService'; // Importamos a função correta
import './AdicionarEquipamentoPage.css'; // Importamos o CSS correto

function AdicionarEquipamentoPage() {
  const navigate = useNavigate();

  // Estados apenas para os campos de equipamento
  const [tag, setTag] = useState('');
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [error, setError] = useState(null);

  // Função para submeter os dados do NOVO EQUIPAMENTO
  const handleSubmit = async (evento) => {
    evento.preventDefault();
    setError(null);

    const equipamentoData = {
      tag,
      nome,
      descricao,
    };

    try {
      // Chama a função da API para CRIAR EQUIPAMENTO
      await createEquipamento(equipamentoData);
      alert('Equipamento adicionado com sucesso!');
      navigate('/dashboard'); // Redireciona após o sucesso
    } catch (err) {
      console.error('Erro ao adicionar equipamento:', err);
      setError('Falha ao adicionar o equipamento. Verifique os dados.');
    }
  };

  return (
    <div className="form-container-inventario">
      <form className="inventario-form" onSubmit={handleSubmit}>
        <h1>Adicionar Novo Equipamento</h1>

        {error && <p className="error-message">{error}</p>}
        
        <div className="input-group">
          <label htmlFor="tag">Tag do Equipamento (Ex: T-001)</label>
          <input 
            type="text" 
            id="tag" 
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            required 
          />
        </div>

        <div className="input-group">
          <label htmlFor="nome">Nome do Equipamento</label>
          <input 
            type="text" 
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required 
          />
        </div>

        <div className="input-group">
          <label htmlFor="descricao">Descrição</label>
          <textarea 
            id="descricao" 
            rows="4"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          ></textarea>
        </div>
        
        <button type="submit" className="submit-button">Adicionar Equipamento</button>
      </form>
    </div>
  );
}

export default AdicionarEquipamentoPage;