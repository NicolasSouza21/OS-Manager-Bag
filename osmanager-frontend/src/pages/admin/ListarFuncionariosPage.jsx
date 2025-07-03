import React, { useState, useEffect } from 'react';
import {
  getFuncionarios,
  cadastrarFuncionario,
  updateFuncionario,
  deleteFuncionario
} from '../../services/apiService';
import './ListarFuncionariosPage.css';

const emptyForm = {
  nome: '',
  email: '',
  telefone: '',
  tipoFuncionario: '',
};

function ListarFuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal e form
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFuncionarios();
    // eslint-disable-next-line
  }, []);

  async function fetchFuncionarios() {
    setLoading(true);
    setError(null);
    try {
      const response = await getFuncionarios();
      setFuncionarios(response.data);

      // Salva os nomes corretamente (usando o campo 'nome')
      const nomes = response.data.map(f => f.nome);
      localStorage.setItem('nomesFuncionarios', JSON.stringify(nomes));
    } catch (err) {
      setError('Falha ao buscar os funcionários. Verifique as permissões.');
      console.error("Erro ao buscar funcionários:", err);
    } finally {
      setLoading(false);
    }
  }

  function openNewModal() {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  }

  function openEditModal(func) {
    setForm({
      nome: func.nome || '',
      email: func.email || '',
      telefone: func.telefone || '',
      tipoFuncionario: func.tipoFuncionario || '',
    });
    setEditId(func.id);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setForm(emptyForm);
    setEditId(null);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await updateFuncionario(editId, form);
      } else {
        await cadastrarFuncionario(form);
      }
      await fetchFuncionarios();
      closeModal();
    } catch (err) {
      alert('Erro ao salvar funcionário.');
    }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("Deseja realmente excluir este funcionário?")) return;
    try {
      await deleteFuncionario(id);
      await fetchFuncionarios();
    } catch (err) {
      alert('Erro ao excluir funcionário');
    }
  }

  if (loading) {
    return <div className="page-container"><p>Carregando funcionários...</p></div>;
  }

  if (error) {
    return <div className="page-container"><p className="error-text">{error}</p></div>;
  }

  return (
    <div className="page-container">
      <h1>Lista de Funcionários</h1>
      <button className="btn-add" onClick={openNewModal}>Adicionar Funcionário</button>
      
      <table className="funcionarios-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Cargo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {funcionarios.map((funcionario) => (
            <tr key={funcionario.id}>
              <td>{funcionario.id}</td>
              <td>{funcionario.nome}</td>
              <td>{funcionario.email}</td>
              <td>{funcionario.telefone || 'N/A'}</td>
              <td>{funcionario.tipoFuncionario}</td>
              <td>
                <button className="btn-edit" onClick={() => openEditModal(funcionario)}>Editar</button>
                <button className="btn-delete" onClick={() => handleDelete(funcionario.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para criar/editar */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editId ? "Editar Funcionário" : "Novo Funcionário"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Nome</label>
                <input name="nome" value={form.nome} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Telefone</label>
                <input name="telefone" value={form.telefone} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Cargo</label>
                <select name="tipoFuncionario" value={form.tipoFuncionario} onChange={handleChange} required>
                  <option value="">Selecione...</option>
                  <option value="ADMIN">Admin</option>
                  <option value="LIDER">Líder</option>
                  <option value="MECANICO">Mecânico</option>
                  <option value="ANALISTA_CQ">Analista CQ</option>
                  {/* Adicione mais cargos conforme necessário */}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeModal}>Cancelar</button>
                <button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListarFuncionariosPage;