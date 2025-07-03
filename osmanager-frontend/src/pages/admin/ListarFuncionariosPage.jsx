import React, { useState, useEffect } from 'react';
import { getFuncionarios } from '../../services/apiService';
import './ListarFuncionariosPage.css';

function ListarFuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFuncionarios() {
      try {
        const response = await getFuncionarios();
        setFuncionarios(response.data);

        // Salva os nomes corretamente (usando o campo 'nome')
        const nomes = response.data.map(f => f.nome); // ✅ CAMPO CERTO!
localStorage.setItem('nomesFuncionarios', JSON.stringify(nomes));
      } catch (err) {
        setError('Falha ao buscar os funcionários. Verifique as permissões.');
        console.error("Erro ao buscar funcionários:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFuncionarios();
  }, []);

  if (loading) {
    return <div className="page-container"><p>Carregando funcionários...</p></div>;
  }

  if (error) {
    return <div className="page-container"><p className="error-text">{error}</p></div>;
  }

  return (
    <div className="page-container">
      <h1>Lista de Funcionários</h1>
      
      <table className="funcionarios-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Cargo</th>
          </tr>
        </thead>
        <tbody>
          {funcionarios.map((funcionario) => (
            <tr key={funcionario.id}>
              <td>{funcionario.id}</td>
              <td>{funcionario.nome}</td>
              <td>{funcionario.email}</td>
              {/* Se telefone não existir no objeto, mostra 'N/A' */}
              <td>{funcionario.telefone || 'N/A'}</td>
              <td>{funcionario.tipoFuncionario}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ListarFuncionariosPage;