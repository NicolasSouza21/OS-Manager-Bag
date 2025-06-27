import React, { useState } from 'react';

function LocalAddPage() {
  const [nome, setNome] = useState('');
  const [setor, setSetor] = useState('');
  const [mensagem, setMensagem] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    fetch('/api/locais', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, setor })
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
      .catch(() => setMensagem('Erro ao criar local!'));
  }

  return (
    <div>
      <h2>Adicionar Local</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label>
          <input value={nome} onChange={e => setNome(e.target.value)} required />
        </div>
        <div>
          <label>Setor:</label>
          <input value={setor} onChange={e => setSetor(e.target.value)} required />
        </div>
        <button type="submit">Adicionar</button>
      </form>
      {mensagem && <div>{mensagem}</div>}
    </div>
  );
}

export default LocalAddPage;