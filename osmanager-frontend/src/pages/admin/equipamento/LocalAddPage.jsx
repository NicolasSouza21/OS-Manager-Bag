import React, { useState } from 'react';
import './LocalAddPage.css';

function LocalAddPage() {
  const [nome, setNome] = useState('');
  const [setor, setSetor] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setErro(false);
    const token = localStorage.getItem('authToken');
    fetch('/api/locais', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ nome, setor }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao criar!');
        return res.json();
      })
      .then(data => {
        setMensagem('Local criado com sucesso!');
        setNome('');
        setSetor('');
      })
      .catch(() => {
        setMensagem('Erro ao criar local!');
        setErro(true);
      });
  }

  return (
    <div className="local-add-card">
      <h2 className="local-add-title">Adicionar Local</h2>
      <form className="local-add-form" onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label>
          <input
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
            type="text"
          />
        </div>
        <div>
          <label>Setor:</label>
          <input
            value={setor}
            onChange={e => setSetor(e.target.value)}
            required
            type="text"
          />
        </div>
        <button className="local-add-btn" type="submit">Adicionar</button>
      </form>
      {mensagem && (
        <div className={`local-add-message${erro ? ' error' : ''}`}>
          {mensagem}
        </div>
      )}
    </div>
  );
}

export default LocalAddPage;