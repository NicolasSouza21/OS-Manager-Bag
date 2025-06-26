// Local: src/pages/admin/ListarFuncionariosPage.jsx
import React, { useState, useEffect } from 'react';
import { getFuncionarios } from '../../services/apiService'; // Importa a função da API
import './ListarFuncionariosPage.css'; // Importa o nosso ficheiro de estilos

function ListarFuncionariosPage() {
  // Estados para guardar a lista, o carregamento e os erros
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect para buscar os dados quando a página carrega
  useEffect(() => {
    const fetchFuncionarios = async () => {
      try {
        const response = await getFuncionarios();
        setFuncionarios(response.data); // A API de funcionários retorna a lista diretamente
      } catch (err) {
        setError('Falha ao buscar os funcionários. Verifique as permissões.');
        console.error("Erro ao buscar funcionários:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFuncionarios();
  }, []); // O array vazio [] garante que rode apenas uma vez

  // Renderização condicional
  if (loading) {
    return <div className="page-container"><p>A carregar funcionários...</p></div>;
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
              <td>{funcionario.telefone}</td>
              <td>{funcionario.tipoFuncionario}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ListarFuncionariosPage;