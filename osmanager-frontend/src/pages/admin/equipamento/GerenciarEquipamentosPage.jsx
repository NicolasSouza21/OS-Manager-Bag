import React, { useEffect, useState } from 'react';
import { getEquipamentos, updateEquipamento, deleteEquipamento } from '../../../services/apiService';
import './GerenciarEquipamentosPage.css';

function GerenciarEquipamentosPage() {
  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nome: '', descricao: '' });
  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    carregarEquipamentos();
  }, []);

  function carregarEquipamentos() {
    setLoading(true);
    getEquipamentos()
      .then(resp => setEquipamentos(resp.data))
      .catch(() => setMensagem('Erro ao carregar equipamentos.'))
      .finally(() => setLoading(false));
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (editandoId) {
      updateEquipamento(editandoId, form)
        .then(() => {
          setMensagem('Equipamento atualizado!');
          setEditandoId(null);
          setForm({ nome: '', descricao: '' });
          carregarEquipamentos();
        })
        .catch(() => setMensagem('Erro ao atualizar.'));
    }
  }

  function editarEquipamento(equip) {
    setEditandoId(equip.id);
    setForm({ nome: equip.nome, descricao: equip.descricao });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm({ nome: '', descricao: '' });
  }

  function excluirEquipamento(id) {
    if (window.confirm('Deseja realmente excluir este equipamento?')) {
      deleteEquipamento(id)
        .then(() => {
          setMensagem('Equipamento excluído!');
          carregarEquipamentos();
        })
        .catch(() => setMensagem('Erro ao excluir.'));
    }
  }

  return (
    <div className="equipamentos-page-container">
      <h2 className="equipamentos-title">Gerenciar Equipamentos</h2>

      {editandoId && (
        <form onSubmit={handleSubmit} className="equipamentos-edit-form">
          <h3>Editar Equipamento</h3>
          <label>
            Nome:
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              required
              autoFocus
            />
          </label>
          <label>
            Descrição:
            <input
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              required
            />
          </label>
          <div className="equipamentos-form-actions">
            <button type="submit" className="btn btn-save">Salvar</button>
            <button type="button" onClick={cancelarEdicao} className="btn btn-cancel">Cancelar</button>
          </div>
        </form>
      )}

      {mensagem && <div className="equipamentos-msg">{mensagem}</div>}

      {loading ? (
        <div className="equipamentos-loading">Carregando...</div>
      ) : (
        <div className="equipamentos-table-container">
          <table className="equipamentos-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {equipamentos.map(equip => (
                <tr key={equip.id}>
                  <td>{equip.id}</td>
                  <td>{equip.nome}</td>
                  <td>{equip.descricao}</td>
                  <td>
                    <button onClick={() => editarEquipamento(equip)} className="btn btn-edit">Editar</button>
                    <button onClick={() => excluirEquipamento(equip.id)} className="btn btn-delete">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default GerenciarEquipamentosPage;