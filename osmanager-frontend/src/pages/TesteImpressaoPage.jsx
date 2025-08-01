// src/pages/TesteImpressaoPage.jsx

import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

// 1. Componente que será impresso
const ComponenteParaImprimir = React.forwardRef((props, ref) => {
  return (
    <div ref={ref} style={{ padding: '20px', color: 'black' }}>
      <h1>Página de Teste de Impressão</h1>
      <p>Se você pode ler isso, o componente foi referenciado corretamente.</p>
      <p>Data e Hora do Teste: {new Date().toLocaleString('pt-BR')}</p>
    </div>
  );
});

// 2. Página que contém o botão e a lógica
function TesteImpressaoPage() {
  const componentRef = useRef();
  
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Teste de Sanidade da Impressão</h1>
      <p>
        Este componente é 100% isolado. Se ele funcionar, o problema está na
        complexidade da página 'VisualizarOsPage'. Se ele falhar com o mesmo erro,
        o problema é 100% o ambiente/dependências (React 19).
      </p>
      
      <button 
        onClick={handlePrint} 
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
      >
        Imprimir Teste
      </button>

      {/* Área de impressão escondida */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <ComponenteParaImprimir ref={componentRef} />
      </div>
    </div>
  );
}

export default TesteImpressaoPage;