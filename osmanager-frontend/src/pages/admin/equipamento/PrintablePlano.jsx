// Local: osmanager-frontend/src/pages/admin/equipamento/PrintablePlano.jsx
import React from 'react';

// Função de formatação duplicada para manter o componente isolado
const formatTempoPadrao = (tempo) => {
    if (!tempo) return 'N/A';
    if (tempo.includes(':')) {
        return tempo;
    }
    try {
      const minutos = parseInt(tempo, 10);
      if (isNaN(minutos)) return tempo;
      const h = Math.floor(minutos / 60).toString().padStart(2, '0');
      const m = (minutos % 60).toString().padStart(2, '0');
      return `${h}:${m}:00`;
    } catch (e) {
      return tempo;
    }
};

const PrintablePlano = React.forwardRef(({ equipamento, programacao, planosRaw }, ref) => {
  const dataImpressao = new Date().toLocaleDateString('pt-BR');

  // Função para formatar a Frequência como na planilha
  const formatFreq = (freq) => {
    if (!freq) return 'N/A';
    if (freq.unidadeTempo === 'SEMANA' && freq.intervalo === 1) return 'semanalmente';
    if (freq.unidadeTempo === 'DIA') return freq.intervalo.toString();
    if (freq.unidadeTempo === 'MES') return (freq.intervalo * 30).toString(); // Aproximação
    if (freq.unidadeTempo === 'ANO') return (freq.intervalo * 365).toString();
    return freq.nome; // Fallback
  };

  return (
    <div ref={ref} className="printable-container">
      <div className="print-header-simple">
          <h2>Programação de Manutenção Preventiva - {equipamento?.nome || 'N/A'}</h2>
          <span>FO - 106 REV.01</span>
      </div>
      <table className="print-table plano"> {/* Adiciona a classe 'plano' */}
        <thead>
          <tr>
            <th style={{ width: '20%' }}>Equipamento</th>
            <th style={{ width: '35%' }}>Serviços</th>
            <th style={{ width: '10%' }}>Frêq./Dia</th>
            <th style={{ width: '15%' }}>Tempo Padrão</th>
            <th style={{ width: '20%' }}>MANUTENTOR</th>
          </tr>
        </thead>
        <tbody>
          {/* Itera sobre 'planosRaw' que tem a frequência detalhada */}
          {Array.isArray(planosRaw) && planosRaw.map((plano, index) => {
              // Encontra o "último manutentor" correspondente no array 'programacao'
              const progInfo = programacao.find(p => p.servico === plano.tipoServicoNome);
              const ultimoManutentor = progInfo ? progInfo.ultimoManutentor : 'N/A';

              return (
                <tr key={plano.id}>
                  {/* Célula do Equipamento (só na primeira linha) */}
                  {index === 0 && (
                    <td className="equipamento-cell" rowSpan={planosRaw.length}>
                      {equipamento?.nome || 'N/A'}
                    </td>
                  )}
                  {/* Células de dados */}
                  <td>{plano.tipoServicoNome}</td>
                  <td style={{ textAlign: 'center' }}>{formatFreq(plano.frequencia)}</td>
                  <td style={{ textAlign: 'center' }}>{formatTempoPadrao(plano.tempoPadrao)}</td>
                  <td>{ultimoManutentor}</td>
                </tr>
              );
          })}
        </tbody>
        <tfoot>
            {/* Você pode adicionar um rodapé de "TOTAL" aqui se precisar no futuro */}
        </tfoot>
      </table>
    </div>
  );
});

export default PrintablePlano;