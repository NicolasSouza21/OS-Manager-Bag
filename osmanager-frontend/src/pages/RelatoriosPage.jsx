import React, { useState, useEffect } from 'react';
// ✨ ALTERAÇÃO AQUI: Importa a nova função 'getDashboardLider'
import { getDashboardLider } from '../services/apiService'; 
// ✨ ALTERAÇÃO AQUI: Importa 'Bar' e 'Pie' (Pizza)
import { Bar, Pie } from 'react-chartjs-2'; 
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement, // ✨ ALTERAÇÃO AQUI: Necessário para o gráfico de Pizza
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './RelatoriosPage.css';

// Registra os componentes necessários do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement, // ✨ ALTERAÇÃO AQUI: Registra o elemento do gráfico de Pizza
  Title,
  Tooltip,
  Legend
);

// Função para pegar o mês/ano atual no formato "YYYY-MM" (sem alteração)
const getMesAtualFormatado = () => {
    const data = new Date();
    data.setMinutes(data.getMinutes() - data.getTimezoneOffset());
    return data.toISOString().slice(0, 7); // Retorna "YYYY-MM"
};

// ✨ ALTERAÇÃO AQUI: Cores Padrão para os gráficos
const COR_AZUL = 'rgba(54, 162, 235, 0.7)';
const COR_VERMELHO = 'rgba(255, 99, 132, 0.7)';
const COR_VERDE = 'rgba(75, 192, 192, 0.7)';
const COR_LARANJA = 'rgba(255, 159, 64, 0.7)';
const COR_ROXO = 'rgba(153, 102, 255, 0.7)';


function RelatoriosPage() {
    // ✨ ALTERAÇÃO AQUI: 4 estados para os gráficos
    const [chartMecanicos, setChartMecanicos] = useState(null);
    const [chartSaude, setChartSaude] = useState(null);
    const [chartRankingCorretivas, setChartRankingCorretivas] = useState(null);
    const [chartRankingDowntime, setChartRankingDowntime] = useState(null);
    // ✨ ALTERAÇÃO AQUI: Novo estado para os indicadores
    const [indicadores, setIndicadores] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mesSelecionado, setMesSelecionado] = useState(getMesAtualFormatado());

    useEffect(() => {
        const fetchRelatorio = async () => {
            if (!mesSelecionado) {
                setError('Por favor, selecione um mês.');
                return;
            }

            try {
                setLoading(true);
                setError('');
                // Limpa todos os gráficos antigos
                setChartMecanicos(null);
                setChartSaude(null);
                setChartRankingCorretivas(null);
                setChartRankingDowntime(null);
                // ✨ ALTERAÇÃO AQUI: Limpa os indicadores antigos
                setIndicadores(null); 

                const [ano, mes] = mesSelecionado.split('-').map(Number);
                const dataInicio = new Date(ano, mes - 1, 1).toISOString().slice(0, 10);
                const dataFim = new Date(ano, mes, 0).toISOString().slice(0, 10);

                // ✨ ALTERAÇÃO AQUI: Chama a nova função 'getDashboardLider'
                const response = await getDashboardLider(dataInicio, dataFim);
                
                // response.data agora é o DashboardLiderDTO
                const data = response.data; 

                if (!data) {
                    setError(`Nenhum dado encontrado para ${mes}/${ano}.`);
                    setLoading(false); // ✅ CORREÇÃO: Garante que o loading pare
                    return;
                }

                // --- 1. Processar Gráfico de Mecânicos (Gráfico 1) ---
                if (data.relatorioMecanicos && data.relatorioMecanicos.length > 0) {
                    const labels = data.relatorioMecanicos.map(item => item.nomeMecanico);
                    const totalHorasData = data.relatorioMecanicos.map(item => item.totalHorasGastas);
                    const totalOsData = data.relatorioMecanicos.map(item => item.totalOsConcluidas);

                    const limiteHoras = 220;
                    const coresFundo = totalHorasData.map(horas => (horas > limiteHoras ? COR_VERMELHO : COR_AZUL));
                    const coresBorda = totalHorasData.map(horas => (horas > limiteHoras ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)'));

                    setChartMecanicos({
                        labels,
                        datasets: [
                            {
                                label: 'Total de Horas Gastas',
                                data: totalHorasData,
                                backgroundColor: coresFundo,
                                borderColor: coresBorda,
                                borderWidth: 1,
                                yAxisID: 'yHoras',
                            },
                            {
                                label: 'Total de OS Concluídas',
                                data: totalOsData,
                                backgroundColor: COR_VERDE,
                                borderColor: 'rgba(75, 192, 192, 1)',
                                borderWidth: 1,
                                yAxisID: 'yOS',
                            }
                        ]
                    });
                }

                // --- 2. Processar Gráfico de Saúde P/C (Gráfico 4 - Pizza) ---
                if (data.relatorioSaudeManutencao && data.relatorioSaudeManutencao.length > 0) {
                    const labels = data.relatorioSaudeManutencao.map(item => item.tipoManutencao === 'CORRETIVA' ? 'Corretivas' : 'Preventivas');
                    const totais = data.relatorioSaudeManutencao.map(item => item.totalOS);

                    setChartSaude({
                        labels,
                        datasets: [{
                            label: 'Total de OS',
                            data: totais,
                            backgroundColor: [COR_LARANJA, COR_AZUL], // Laranja para Corretiva, Azul para Preventiva
                        }]
                    });
                }
                
                // --- 3. Processar Ranking de Corretivas (Gráfico 2 - Barras Horizontais) ---
                if (data.relatorioRankingCorretivas && data.relatorioRankingCorretivas.length > 0) {
                    const labels = data.relatorioRankingCorretivas.map(item => item.nomeEquipamento);
                    const totais = data.relatorioRankingCorretivas.map(item => item.totalCorretivas);
                    
                    setChartRankingCorretivas({
                        labels,
                        datasets: [{
                            label: 'Total de OS Corretivas',
                            data: totais,
                            backgroundColor: COR_LARANJA,
                            borderColor: 'rgba(255, 159, 64, 1)',
                            borderWidth: 1,
                        }]
                    });
                }

                // --- 4. Processar Ranking de Downtime (Gráfico 3 - Barras Horizontais) ---
                if (data.relatorioRankingDowntime && data.relatorioRankingDowntime.length > 0) {
                     const labels = data.relatorioRankingDowntime.map(item => item.nomeEquipamento);
                     const totais = data.relatorioRankingDowntime.map(item => item.totalHorasDowntime);
                     
                     setChartRankingDowntime({
                        labels,
                        datasets: [{
                            label: 'Total de Horas Paradas (Downtime)',
                            data: totais,
                            backgroundColor: COR_ROXO,
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 1,
                        }]
                    });
                }

                // ✨ ALTERAÇÃO AQUI: Processar os novos indicadores
                // --- 5. Processar Indicadores (MTTR / MTBF) ---
                if (data.relatorioIndicadores) {
                    setIndicadores(data.relatorioIndicadores);
                }

                // Se nenhum dado foi encontrado em nenhum relatório
                // ✨ ALTERAÇÃO AQUI: Adiciona !data.relatorioIndicadores à verificação
                if (!data.relatorioMecanicos && !data.relatorioSaudeManutencao && !data.relatorioRankingCorretivas && !data.relatorioRankingDowntime && !data.relatorioIndicadores) {
                     setError(`Nenhum dado encontrado para ${mes}/${ano}.`);
                }

            } catch (err) {
                console.error("Erro ao buscar relatório:", err);
                if (err.response && err.response.status === 403) {
                     setError('Você não tem permissão para ver este relatório.');
                } else {
                     setError('Erro ao buscar dados do relatório.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchRelatorio();
    }, [mesSelecionado]); // Dependência mantida

    // --- OPÇÕES DOS 4 GRÁFICOS ---

    // Opções Gráfico 1 (Mecânicos)
    const optionsMecanicos = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Produtividade por Mecânico (Horas Úteis)', font: { size: 18 } },
            tooltip: { /* ... (código de tooltip igual ao anterior) ... */ }
        },
        scales: {
            yHoras: {
                type: 'linear', display: true, position: 'left',
                title: { display: true, text: 'Total de Horas' },
                afterBuildTicks: (axis) => { axis.ticks.push({ value: 220, label: 'Limite (220h)' }); },
                grid: {
                    drawOnChartArea: false,
                    color: (context) => (context.tick.value === 220 ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.1)'),
                    lineWidth: (context) => (context.tick.value === 220 ? 2 : 1),
                }
            },
            yOS: {
                type: 'linear', display: true, position: 'right',
                title: { display: true, text: 'Total de OS' },
                grid: { drawOnChartArea: false },
            }
        }
    };

    // Opções Gráfico 2 (Ranking Corretivas - Horizontal)
    const optionsRankingCorretivas = {
        indexAxis: 'y', // <-- Isso torna o gráfico horizontal
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Top 10 Equipamentos (Corretivas)', font: { size: 18 } },
        },
        scales: {
            x: { title: { display: true, text: 'Nº de OS Corretivas' } }
        }
    };
    
    // Opções Gráfico 3 (Ranking Downtime - Horizontal)
    const optionsRankingDowntime = {
        indexAxis: 'y', // <-- Isso torna o gráfico horizontal
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Top 10 Equipamentos (Downtime)', font: { size: 18 } },
        },
        scales: {
            x: { title: { display: true, text: 'Horas Paradas (Corridas)' } } // ✨ ALTERAÇÃO AQUI: Texto atualizado
        }
    };

    // Opções Gráfico 4 (Saúde P/C - Pizza)
    const optionsSaude = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Saúde da Manutenção (P x C)', font: { size: 18 } },
        },
    };

    return (
        <div className="relatorios-container">
            <h1 className="relatorios-title">Dashboard de Manutenção</h1>
            
            <div className="relatorio-filtro">
                <label htmlFor="mesRelatorio">Selecionar Mês:</label>
                <input 
                    type="month" 
                    id="mesRelatorio" 
                    value={mesSelecionado}
                    onChange={(e) => setMesSelecionado(e.target.value)}
                    disabled={loading} 
                />
            </div>

            {/* ✨ ALTERAÇÃO AQUI: Renderização condicional dos 4 gráficos + 2 indicadores */}
            {loading && <p className="relatorio-mensagem">Carregando dados do dashboard...</p>}
            {error && <p className="relatorio-mensagem erro">{error}</p>}
            
            {!loading && !error && (
                <div className="relatorios-grid">
                    
                    {/* Gráfico 1: Mecânicos (Grande) */}
                    {chartMecanicos ? (
                        <div className="relatorio-card large">
                            <div className="chart-wrapper">
                                <Bar options={optionsMecanicos} data={chartMecanicos} />
                            </div>
                        </div>
                    ) : <p className="relatorio-mensagem-small">Sem dados de produtividade.</p>}

                    {/* ✨ ALTERAÇÃO AQUI: Adiciona os cards de indicadores */}
                    {/* Indicador 1: MTTR */}
                    {indicadores ? (
                        <div className="relatorio-card small indicator-card">
                            <h3 className="indicator-title">MTTR (Horas)</h3>
                            <p className="indicator-value">{indicadores.mttr.toFixed(2)}</p>
                            <span className="indicator-desc">Tempo Médio Para Reparo</span>
                        </div>
                    ) : <p className="relatorio-mensagem-small">Sem dados de MTTR.</p>}

                    {/* Indicador 2: MTBF */}
                    {indicadores ? (
                        <div className="relatorio-card small indicator-card">
                            <h3 className="indicator-title">MTBF (Horas)</h3>
                            <p className="indicator-value">{indicadores.mtbf.toFixed(2)}</p>
                            <span className="indicator-desc">Tempo Médio Entre Falhas</span>
                        </div>
                    ) : <p className="relatorio-mensagem-small">Sem dados de MTBF.</p>}
                    {/* Fim da alteração */}


                    {/* Gráfico 4: Saúde (Pequeno) */}
                    {chartSaude ? (
                        <div className="relatorio-card small">
                            <div className="chart-wrapper pie">
                                <Pie options={optionsSaude} data={chartSaude} />
                            </div>
                        </div>
                    ) : <p className="relatorio-mensagem-small">Sem dados de P vs C.</p>}

                    {/* Gráfico 2: Ranking Corretivas (Médio) */}
                    {chartRankingCorretivas ? (
                        <div className="relatorio-card medium">
                            <div className="chart-wrapper">
                                <Bar options={optionsRankingCorretivas} data={chartRankingCorretivas} />
                            </div>
                        </div>
                    ) : <p className="relatorio-mensagem-small">Sem dados de corretivas.</p>}

                    {/* Gráfico 3: Ranking Downtime (Médio) */}
                    {chartRankingDowntime ? (
                        <div className="relatorio-card medium">
                            <div className="chart-wrapper">
                                <Bar options={optionsRankingDowntime} data={chartRankingDowntime} />
                            </div>
                        </div>
                    ) : <p className="relatorio-mensagem-small">Sem dados de downtime.</p>}

                </div>
            )}
        </div>
    );
}

export default RelatoriosPage;