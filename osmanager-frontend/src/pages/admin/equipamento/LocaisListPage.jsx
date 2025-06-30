import React, { useEffect, useState } from 'react';
import './LocaisListPage.css';

function LocaisListPage() {
  const [locais, setLocais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editNome, setEditNome] = useState('');
  const [editSetor, setEditSetor] = useState('');

  useEffect(() => {
    fetchLocais();
  }, []);

  function fetchLocais() {
    const token = localStorage.getItem('authToken');
    fetch('/api/locais', {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao buscar locais!');
        return res.json();
      })
      .then(data => {
        setLocais(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setLocais([]);
        setLoading(false);
      });
  }

  function handleEdit(local) {
    setEditId(local.id);
    setEditNome(local.nome);
    setEditSetor(local.setor);
  }

  function handleEditCancel() {
    setEditId(null);
    setEditNome('');
    setEditSetor('');
  }

  function handleEditSave(e) {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    fetch(`/api/locais/${editId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ nome: editNome, setor: editSetor }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao atualizar local!');
        return res.json();
      })
      .then(() => {
        fetchLocais();
        handleEditCancel();
      })
      .catch(() => alert('Erro ao atualizar local!'));
  }

  function handleDelete(id) {
    if (!window.confirm('Tem certeza que deseja excluir este local?')) return;
    const token = localStorage.getItem('authToken');
    fetch(`/api/locais/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao excluir local!');
        fetchLocais();
      })
      .catch(() => alert('Erro ao excluir local!'));
  }

  if (loading) return <div className="local-list-card">Carregando...</div>;

  return (
    <div className="local-list-card">
      <h2 className="local-list-title">Gerenciar Locais</h2>
      <div className="local-list-table-wrapper">
        <table className="local-list-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Setor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {locais.map(local =>
              editId === local.id ? (
                <tr key={local.id}>
                  <td>{local.id}</td>
                  <td>
                    <input
                      value={editNome}
                      onChange={e => setEditNome(e.target.value)}
                      className="edit-input"
                    />
                  </td>
                  <td>
                    <input
                      value={editSetor}
                      onChange={e => setEditSetor(e.target.value)}
                      className="edit-input"
                    />
                  </td>
                  <td>
                    <div className="local-action-buttons">
                      <button className="edit-btn" onClick={handleEditSave}>Salvar</button>
                      <button className="delete-btn" onClick={handleEditCancel}>Cancelar</button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={local.id}>
                  <td>{local.id}</td>
                  <td>{local.nome}</td>
                  <td>{local.setor}</td>
                  <td>
                    <div className="local-action-buttons">
                      <button className="edit-btn" onClick={() => handleEdit(local)}>Editar</button>
                      <button className="delete-btn" onClick={() => handleDelete(local.id)}>Excluir</button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LocaisListPage;