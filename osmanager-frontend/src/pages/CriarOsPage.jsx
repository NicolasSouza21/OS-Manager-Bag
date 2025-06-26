import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// 1. Importamos as novas funções que buscam os dados da API
import { createOrdemServico, getEquipamentos, getLocais } from '../services/apiService';
import './CriarOsPage.css';

function CriarOsPage() {
  const navigate = useNavigate();

  // --- Estados do Formulário ---
  const [tipoManutencao, setTipoManutencao] = useState('CORRETIVA');
  const [criticidade, setCriticidade] = useState('');
  const [solicitante, setSolicitante] = useState(localStorage.getItem('userName') || '');
  const [descricaoProblema, setDescricaoProblema] = useState('');
  const [observacao, setObservacao] = useState('');
  const [horaAbertura, setHoraAbertura] = useState('');

  // 2. Novos estados para armazenar as listas e os IDs selecionados
  const [listaEquipamentos, setListaEquipamentos] = useState([]);
  const [listaLocais, setListaLocais] = useState([]);
  const [equipamentoId, setEquipamentoId] = useState('');
  const [localId, setLocalId] = useState('');


  // 3. useEffect agora busca os dados dos equipamentos e locais ao carregar a página
  useEffect(() => {
    // Define o nome do solicitante e a hora
    const nomeDoUsuarioLogado = localStorage.getItem('userName');
    if (nomeDoUsuarioLogado) {
      setSolicitante(nomeDoUsuarioLogado);
    }
    const agora = new Date();
    const horaFormatada = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setHoraAbertura(horaFormatada);

    // Função assíncrona para carregar os dados das listas
    const carregarDadosIniciais = async () => {
      try {
        const resEquipamentos = await getEquipamentos();
        setListaEquipamentos(resEquipamentos.data);

        const resLocais = await getLocais();
        setListaLocais(resLocais.data);
      } catch (error) {
        console.error("Erro ao carregar dados de equipamentos ou locais", error);
        // Pode-se adicionar um estado de erro para o carregamento dos dados
      }
    };

    carregarDadosIniciais();
  }, []); // O array vazio [] garante que este efeito rode apenas uma vez.

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSubmit = async (evento) => {
    evento.preventDefault();

    if (!criticidade || !tipoManutencao || !equipamentoId || !localId) {
      alert('Por favor, preencha todos os campos obrigatórios, incluindo Equipamento e Local.');
      return;
    }

    // 4. Objeto de dados alinhado com o NOVO DTO do backend
    const dadosParaApi = {
      tipoManutencao,
      equipamentoId, // Enviamos o ID do equipamento
      localId,       // Enviamos o ID do local
      prioridade: criticidade,
      solicitante,
      descricaoProblema,
      observacao,
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

        {/* ... (seção de campos somente leitura não muda) ... */}
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
            <label>Hora de Abertura</label>
            <input type="text" value={horaAbertura} disabled />
          </div>
           <div className="input-group">
            <label>Situação O.S.</label>
            <input type="text" value="ABERTO" disabled className="status-aberto-input"/>
          </div>
        </section>

        <section className="form-section">
          {/* --- 👇👇 CAMPOS ATUALIZADOS PARA MENUS SUSPENSOS 👇👇 --- */}
          <div className="input-group large-field">
            <label htmlFor="equipamento">Equipamento</label>
            <select id="equipamento" value={equipamentoId} onChange={(e) => setEquipamentoId(e.target.value)} required>
              <option value="" disabled>Selecione um equipamento...</option>
              {listaEquipamentos.map((equip) => (
                <option key={equip.id} value={equip.id}>
                  {equip.tag} - {equip.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="local">Local</label>
            <select id="local" value={localId} onChange={(e) => setLocalId(e.target.value)} required>
              <option value="" disabled>Selecione um local...</option>
              {listaLocais.map((local) => (
                <option key={local.id} value={local.id}>
                  {local.nome}
                </option>
              ))}
            </select>
          </div>
          {/* --- 👆👆 FIM DA ATUALIZAÇÃO DOS MENUS 👆👆 --- */}
          
          <div className="input-group">
            <label htmlFor="tipoManutencao">Tipo de Manutenção</label>
            <select id="tipoManutencao" value={tipoManutencao} onChange={(e) => setTipoManutencao(e.target.value)} required>
              <option value="CORRETIVA">Corretiva</option>
              <option value="PREVENTIVA">Preventiva</option>
            </select>
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
            <input type="text" id="solicitante" value={solicitante} required disabled />
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
