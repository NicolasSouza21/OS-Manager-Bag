// Local: src/pages/admin/ListarFuncionariosPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
// ✅ CORREÇÃO: Importa o nome correto da função (getAllFuncionarios)
import { getAllFuncionarios, updateFuncionario, deleteFuncionario } from '../../services/apiService';
import './ListarFuncionariosPage.css';

function ListarFuncionariosPage() {
    const [funcionarios, setFuncionarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({ nome: '', email: '', telefone: '', tipoFuncionario: '' });

    const fetchFuncionarios = useCallback(async () => {
        try {
            setLoading(true);
            // ✅ CORREÇÃO: Usa o nome correto da função aqui também
            const response = await getAllFuncionarios();
            setFuncionarios(response.data);
        } catch (err) {
            setError('Falha ao buscar os funcionários.');
            console.error("Erro ao buscar funcionários:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFuncionarios();
    }, [fetchFuncionarios]);

    const handleEditClick = (funcionario) => {
        setEditingId(funcionario.id);
        setEditFormData({ 
            nome: funcionario.nome, 
            email: funcionario.email, 
            telefone: funcionario.telefone || '',
            tipoFuncionario: funcionario.tipoFuncionario 
        });
    };

    const handleCancelClick = () => {
        setEditingId(null);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleUpdateSubmit = async (e, id) => {
        e.preventDefault();
        try {
            await updateFuncionario(id, editFormData);
            alert('Funcionário atualizado com sucesso!');
            
            const updatedFuncionarios = funcionarios.map(func => 
                func.id === id ? { ...func, ...editFormData } : func
            );
            setFuncionarios(updatedFuncionarios);
            
            setEditingId(null);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Falha ao atualizar o funcionário.';
            alert(errorMsg);
            console.error("Erro ao atualizar:", err.response || err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
            try {
                await deleteFuncionario(id);
                alert('Funcionário excluído com sucesso!');
                setFuncionarios(funcionarios.filter(func => func.id !== id));
            } catch (err) {
                const errorMsg = err.response?.data?.message || 'Falha ao excluir o funcionário.';
                alert(errorMsg);
                console.error("Erro ao excluir:", err.response || err);
            }
        }
    };

    if (loading) return <div className="page-container"><p>A carregar funcionários...</p></div>;
    if (error) return <div className="page-container"><p className="error-text">{error}</p></div>;

    return (
        <div className="page-container">
            <header className="list-header">
                <h1>Lista de Funcionários</h1>
                <Link to="/admin/funcionarios/cadastrar" className="btn-new">Cadastrar Novo</Link>
            </header>
            
            <form>
                <table className="funcionarios-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Telefone</th>
                            <th>Cargo</th>
                            <th className="actions-header">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {funcionarios.map((funcionario) => (
                            <React.Fragment key={funcionario.id}>
                                {editingId === funcionario.id ? (
                                    <tr className="editing-row">
                                        <td><input type="text" name="nome" value={editFormData.nome} onChange={handleFormChange} required /></td>
                                        <td><input type="email" name="email" value={editFormData.email} onChange={handleFormChange} required /></td>
                                        <td><input type="text" name="telefone" value={editFormData.telefone} onChange={handleFormChange} /></td>
                                        <td>
                                            <select name="tipoFuncionario" value={editFormData.tipoFuncionario} onChange={handleFormChange} required>
                                                <option value="SOLICITANTE">Solicitante</option>
                                                <option value="MECANICO">Mecânico</option>
                                                <option value="LIDER">Líder</option>
                                                <option value="ENCARREGADO">Encarregado</option>
                                                <option value="ANALISTA_CQ">Analista de Qualidade</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>
                                        </td>
                                        <td className="actions">
                                            <button type="button" className="btn-save" onClick={(e) => handleUpdateSubmit(e, funcionario.id)}>Salvar</button>
                                            <button type="button" className="btn-cancel" onClick={handleCancelClick}>Cancelar</button>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr>
                                        <td>{funcionario.nome}</td>
                                        <td>{funcionario.email}</td>
                                        <td>{funcionario.telefone}</td>
                                        <td>{funcionario.tipoFuncionario}</td>
                                        <td className="actions">
                                            <button type="button" className="btn-edit" onClick={() => handleEditClick(funcionario)}>Editar</button>
                                            <button type="button" className="btn-delete" onClick={() => handleDelete(funcionario.id)}>Excluir</button>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </form>
        </div>
    );
}

export default ListarFuncionariosPage;