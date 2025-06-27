import React, { useEffect, useState } from 'react';

function LocaisListPage() {
  const [locais, setLocais] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/locais')
      .then(res => res.json())
      .then(data => {
        setLocais(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h2>Lista de Locais</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Setor</th>
          </tr>
        </thead>
        <tbody>
          {locais.map(local => (
            <tr key={local.id}>
              <td>{local.id}</td>
              <td>{local.nome}</td>
              <td>{local.setor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LocaisListPage;