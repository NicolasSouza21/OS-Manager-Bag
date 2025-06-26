import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrdemServico } from '../services/apiService';
import './CriarOsPage.css';

function CriarOsPage() {
  const navigate = useNavigate();

  // --- Estados do Formulário (Atualizados para o novo design) ---
  const [tipoManutencao, setTipoManutencao] = useState('CORRETIVA'); // Começa com um valor padrão
  const [equipamento, setEquipamento] = useState(''); // O antigo 'tipoMaquina' agora é 'equipamento'
  const [numeroEquipamento, setNumeroEquipamento] = useState(''); // Antigo 'numeroMaquina'
  const [criticidade, setCriticidade] = useState(''); // Antigo 'prioridade'
  const [solicitante, setSolicitante] = useState('');
  const [descricaoProblema, setDescricaoProblema] = useState('');
  const [observacao, setObservacao] = useState(''); // Novo campo, por enquanto apenas visual
  
  // Função para o botão "Cancelar"
  const handleCancel = () => {
    navigate(-1); // Navega para a página anterior
  };

  const handleSubmit = async (evento) => {
    evento.preventDefault();

    if (!criticidade || !tipoManutencao || !equipamento) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Objeto de dados alinhado com o DTO do backend
    const dadosParaApi = {
      tipoManutencao,
      tipoMaquina: equipamento, // Mapeando o nome do frontend para o do backend
      numeroMaquina: numeroEquipamento,
      prioridade: criticidade,
      solicitante,
      descricaoProblema,
      // 'local' e 'observacao' não são enviados pois o DTO não os possui ainda
    };

    try {
      await createOrdemServico(dadosParaApi);
      alert('Ordem de Serviço criada com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao criar a Ordem de Serviço:', error);
      alert('Falha ao criar a Ordem de Serviço. Verifique os dados e tente novamente.');
    }
  };

  return (
    <div className="create-os-page">
      <form className="create-os-form" onSubmit={handleSubmit}>
        <header className="form-header-main">
          <h1>Ordem de Serviço de Manutenção</h1>
        </header>

        <section className="form-section read-only-section">
          <div className="input-group">
            <label>Nº O.S.</label>
            <input type="text" value="Será gerado ao salvar" disabled />
          </div>
          <div className="input-group">
            <label>Data de Abertura</label>
            <input type="text" value={new Date().toLocaleDateString('pt-BR')} disabled />
          </div>
           <div className="input-group">
            <label>Situação O.S.</label>
            <input type="text" value="ABERTO" disabled className="status-aberto-input"/>
          </div>
        </section>

        <section className="form-section">
          <div className="input-group">
            <label htmlFor="tipoManutencao">Tipo de Manutenção</label>
            <select id="tipoManutencao" value={tipoManutencao} onChange={(e) => setTipoManutencao(e.target.value)} required>
              <option value="CORRETIVA">Corretiva</option>
              <option value="PREVENTIVA">Preventiva</option>
            </select>
          </div>

          <div className="input-group large-field">
            <label htmlFor="equipamento">Equipamento</label>
            {/* No futuro, isso pode ser um select vindo da API */}
            <input type="text" id="equipamento" value={equipamento} onChange={(e) => setEquipamento(e.target.value)} required />
          </div>
          <div className="input-group">
            <label htmlFor="numeroEquipamento">Nº Equipamento</label>
            <input type="text" id="numeroEquipamento" value={numeroEquipamento} onChange={(e) => setNumeroEquipamento(e.target.value)} />
          </div>

          <div className="input-group">
            <label htmlFor="criticidade">Criticidade</label>
            <select id="criticidade" value={criticidade} onChange={(e) => setCriticidade(e.target.value)} required>
              <option value="" disabled>Selecione...</option>
              <option value="BAIXA">Baixa</option>
              <option value="MEDIA">Média</option>
              <option value="ALTA">Alta</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="solicitante">Solicitante</label>
            <input type="text" id="solicitante" value={solicitante} onChange={(e) => setSolicitante(e.target.value)} required />
          </div>
           {/* Este campo não será salvo ainda, mas já existe na tela */}
           <div className="input-group">
            <label htmlFor="local">Local</label>
            <input type="text" id="local" value="Não implementado" disabled />
          </div>

          <div className="input-group full-width">
            <label htmlFor="descricaoProblema">Descrição do Problema</label>
            <textarea id="descricaoProblema" rows="4" value={descricaoProblema} onChange={(e) => setDescricaoProblema(e.target.value)} required></textarea>
          </div>
          <div className="input-group full-width">
            <label htmlFor="observacao">Observação</label>
            <textarea id="observacao" rows="4" value={observacao} onChange={(e) => setObservacao(e.target.value)}></textarea>
          </div>
        </section>

        <footer className="form-actions">
          <button type="submit" className="button-save">Salvar</button>
          <button type="button" className="button-cancel" onClick={handleCancel}>Cancelar</button>
        </footer>
      </form>
    </div>
  );
}

export default CriarOsPage;