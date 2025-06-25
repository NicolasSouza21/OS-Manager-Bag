// Local: src/pages/CriarOsPage.jsx
import './CriarOsPage.css';

function CriarOsPage() {
  // No próximo passo, vamos adicionar os 'useState' para controlar os campos

  const handleSubmit = (evento) => {
    evento.preventDefault();
    alert('Formulário enviado! (Ainda não conectado à API)');
  };

  return (
    <div className="form-container">
      <form className="os-form" onSubmit={handleSubmit}>
        <h1>Criar Nova Ordem de Serviço</h1>

        <div className="form-grid">
          {/* Linha 1 */}
          <div className="input-group">
            <label htmlFor="numeroMaquina">Nº da Máquina</label>
            <input type="text" id="numeroMaquina" required />
          </div>
          <div className="input-group">
            <label htmlFor="tipoMaquina">Tipo de Máquina</label>
            <input type="text" id="tipoMaquina" required />
          </div>

          {/* Linha 2 */}
          <div className="input-group">
            <label htmlFor="prioridade">Prioridade</label>
            <select id="prioridade" required>
              <option value="">Selecione...</option>
              <option value="ALTA">Alta</option>
              <option value="MEDIA">Média</option>
              <option value="BAIXA">Baixa</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="tipoManutencao">Tipo de Manutenção</label>
            <select id="tipoManutencao" required>
              <option value="">Selecione...</option>
              <option value="PREVENTIVA">Preventiva</option>
              <option value="CORRETIVA">Corretiva</option>
            </select>
          </div>

          {/* Linha 3 */}
          <div className="input-group">
            <label htmlFor="turno">Turno</label>
            <select id="turno" required>
              <option value="">Selecione...</option>
              <option value="PRIMEIRO">Primeiro</option>
              <option value="SEGUNDO">Segundo</option>
              <option value="TERCEIRO">Terceiro</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="solicitante">Solicitante</label>
            <input type="text" id="solicitante" required />
          </div>
        </div>

        {/* Campo de Descrição */}
        <div className="input-group">
          <label htmlFor="descricaoProblema">Descrição do Problema</label>
          <textarea id="descricaoProblema" rows="5" required></textarea>
        </div>

        <button type="submit" className="submit-button">Criar OS</button>
      </form>
    </div>
  );
}

export default CriarOsPage;