import React, { useEffect, useState } from 'react';
import { getEquipamentos } from '../../../services/apiService';

function GerenciarEquipamentosPage() {
  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const carregarEquipamentos = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getEquipamentos();
      setEquipamentos(response.data);
    } catch (err) {
      setError('Erro ao buscar equipamentos. Tente novamente.');
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarEquipamentos();
  }, []);

  return (
    <div className="gerenciar-equipamentos-container">
      <h1>Gerenciar Equipamentos</h1>
      <button onClick={carregarEquipamentos} style={{marginBottom: 16}}>Recarregar Lista</button>
      {loading && <p>Carregando equipamentos...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      {!loading && equipamentos.length === 0 && <p>Nenhum equipamento cadastrado.</p>}
      {!loading && equipamentos.length > 0 && (
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr>
              <th style={{border: '1px solid #ccc', padding: 8}}>ID</th>
              <th style={{border: '1px solid #ccc', padding: 8}}>Tag</th>
              <th style={{border: '1px solid #ccc', padding: 8}}>Nome</th>
              <th style={{border: '1px solid #ccc', padding: 8}}>Descrição</th>
            </tr>
          </thead>
          <tbody>
            {equipamentos.map((eq) => (
              <tr key={eq.id}>
                <td style={{border: '1px solid #ccc', padding: 8}}>{eq.id}</td>
                <td style={{border: '1px solid #ccc', padding: 8}}>{eq.tag}</td>
                <td style={{border: '1px solid #ccc', padding: 8}}>{eq.nome}</td>
                <td style={{border: '1px solid #ccc', padding: 8}}>{eq.descricao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default GerenciarEquipamentosPage;