import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
// ✅ Reimporta ReactDOM
import ReactDOM from 'react-dom';

import {
    getOsById,
    getEquipamentos,
    deleteOrdemServico,
    verificarOS, // Mantido caso seja necessário no futuro
} from '../services/apiService';
import './VisualizarOsPage.css';
import './VisualizarOsPage.print.css'; // Essencial para formatar a tabela na impressão

// formatFrequencia (sem alterações)
const formatFrequencia = (frequencia) => {
    if (!frequencia || !frequencia.nome) return 'N/A';
    const unidade = frequencia.unidadeTempo.toLowerCase() + (frequencia.intervalo > 1 ? 's' : '');
    return `${frequencia.nome} (a cada ${frequencia.intervalo} ${unidade})`;
};

// --- COMPONENTE DE IMPRESSÃO ---
const PrintableOs = React.forwardRef(({ os, equipamento }, ref) => {
    // Verificação robusta para 'os'
    if (!os || typeof os !== 'object') {
        console.error("PrintableOs recebeu 'os' inválido:", os);
        return <div ref={ref} style={{ padding: '20px', color: 'red' }}>Erro: Dados da OS indisponíveis para impressão.</div>;
    }

    // Funções auxiliares (com tratamento de erro básico)
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return { date: '__/__/____', time: '__:__' };
        try {
            const date = new Date(dateTimeString);
            if (isNaN(date.getTime())) {
                console.warn("Data inválida recebida em formatDateTime:", dateTimeString);
                return { date: 'Inválido', time: '' };
            }
            return {
                date: date.toLocaleDateString('pt-BR'),
                time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            };
        } catch (e) {
            console.error("Erro ao formatar data:", dateTimeString, e);
            return { date: 'Erro', time: '' };
        }
    };

    const capitalize = (text) => {
        if (!text || typeof text !== 'string') return '';
        const lower = text.toLowerCase().replace(/_/g, ' ');
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    };

    const renderAcaoRealizadaImpressao = () => {
        const acao = os.acaoRealizada;
        if (os.tipoManutencao === 'PREVENTIVA' && acao && acao.includes(':')) {
            const servicos = acao.split('\n').filter(line => line.trim() !== '');
            return (
                <div className="checklist-impressao">
                    {servicos.map((servico, index) => {
                        const partes = servico.split(':');
                        const nome = partes[0]?.replace('-', '').trim();
                        const status = partes[1]?.trim().toUpperCase();
                        const checkRealizado = status === 'REALIZADO' ? 'X' : ' ';
                        const checkNaoRealizado = status === 'NÃO REALIZADO' ? 'X' : ' ';
                        return (
                            <div key={index} className="checklist-item-impressao">
                                <span className="checklist-nome-impressao">{nome}:</span>
                                <span className="checklist-status-impressao">(&nbsp;{checkRealizado}&nbsp;) Realizado</span>
                                <span className="checklist-status-impressao">(&nbsp;{checkNaoRealizado}&nbsp;) Não realizado</span>
                            </div>
                        );
                    })}
                </div>
            );
        }
        return <p>{acao || 'Nenhuma ação realizada informada.'}</p>;
    };

    const {
        dataInicioPreventiva, dataSolicitacao, dataExecucao, termino, dataVerificacao,
        status, trocaPecas, codigoOs, tipoManutencao, localNome, setorNome,
        frequencia, solicitante, descricaoProblema, executadoPorNome, pecasSubstituidas, acaoRealizada,
        prioridade
    } = os ?? {};

    const dataSolicitacaoFormatada = formatDateTime(dataInicioPreventiva || dataSolicitacao);
    const dataInicioFormatada = formatDateTime(dataExecucao);
    const dataTerminoFormatada = formatDateTime(termino);
    const dataAprovacaoFormatada = formatDateTime(dataVerificacao);
    const isRealizado = ['CONCLUIDA', 'AGUARDANDO_VERIFICACAO'].includes(status);
    const trocouPecasBool = trocaPecas === true;
    const naoTrocouPecasBool = trocaPecas === false && isRealizado;
    const tituloFooter = `ORDEM DE SERVIÇO DE MANUTENÇÃO`;
    const dataImpressao = new Date().toLocaleDateString('pt-BR');

    return (
        <div ref={ref} className="print-container">
            <table className="print-main-table">
                <thead>
                        <tr>
                            <th className="header-logo-cell">
                                {/* ✨ ALTERAÇÃO AQUI: Substitua '/img/logo.png' se o nome ou local for diferente na pasta public */}
                                <img src="/img/logo.png" alt="Logo BagCleaner" style={{ maxWidth: '120px', height: 'auto', display: 'block', margin: 'auto' }} />
                            </th>
                            <th className="header-title-cell">Ordem de Serviço de Manutenção</th>
                            <th className="header-os-number-cell">
                                {/* ✨ ALTERAÇÃO AQUI: Conteúdo da célula do número da OS adicionado */}
                                <div>Nº</div>
                                <div>{codigoOs || 'N/A'}</div> {/* Exibe o codigoOs ou 'N/A' se não existir */}
                            </th>
                        </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan="3" className="no-padding">
                            <table className="info-table">
                                <tbody>
                                    <tr>
                                        {/* ✨ ALTERAÇÃO AQUI: Sempre mostra Equipamento e Nº Ativo na primeira linha */}
                                        <td><strong>Equipamento:</strong> {equipamento?.nome || 'N/A'}</td>
                                        <td><strong>Nº Ativo:</strong> {equipamento?.tag || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        {/* ✨ ALTERAÇÃO AQUI: Mostra Tipo OS na segunda linha */}
                                        <td><strong>Tipo de OS:</strong> {capitalize(tipoManutencao) || 'Não especificado'}</td>
                                        {/* ✨ ALTERAÇÃO AQUI: Mostra Prioridade (se Corretiva) ou Frequência (se Preventiva) */}
                                        {tipoManutencao === 'CORRETIVA' ? (
                                            <td><strong>Prioridade:</strong> {capitalize(prioridade) || 'N/A'}</td>
                                        ) : (
                                            <td><strong>Frequência:</strong> {frequencia?.nome || 'N/A'}</td>
                                        )}
                                    </tr>
                                    {localNome && (
                                        <tr>
                                            <td><strong>Local:</strong> {localNome}</td>
                                            <td><strong>Setor:</strong> {setorNome}</td>
                                        </tr>
                                    )}
                                    {/* ✨ ALTERAÇÃO AQUI: Modificado para usar "Data Programada" ou "Solicitante/Data" */}
                                    {tipoManutencao === 'PREVENTIVA' ? (
                                        <tr>
                                            {/* ✨ ALTERAÇÃO AQUI: Label mudado para "Data Programada" */}
                                            <td colSpan="2"><strong>Data Programada:</strong> {dataSolicitacaoFormatada.date}</td>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <td><strong>Solicitante:</strong> {solicitante || 'N/A'}</td>
                                            <td><strong>Data:</strong> {dataSolicitacaoFormatada.date} <strong>Horas:</strong> {dataSolicitacaoFormatada.time}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    {/* Restante da tabela (Preenchimento, Execução, Footer) permanece igual */}
                    <tr className="section-header">
                        <td colSpan="3">Preenchimento da Manutenção</td>
                    </tr>
                    <tr>
                        <td colSpan="3" className="problem-desc-cell">
                            <strong>Descrição do Problema/Serviço:</strong> {descricaoProblema || 'N/A'}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="3" className="desc-cell no-padding">
                            <p style={{ paddingLeft: '5px' }}><strong>Ação Realizada:</strong></p>
                            {renderAcaoRealizadaImpressao()}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="3" className="no-padding">
                            <table className="info-table">
                                <tbody>
                                    <tr>
                                        <td colSpan="4"><strong>Executado por:</strong> {executadoPorNome || 'Aguardando execução...'}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Início:</strong> {dataInicioFormatada.date}</td>
                                        <td>Hora: {dataInicioFormatada.time}</td>
                                        <td rowSpan="2" colSpan="2" className="pecas-check-cell">
                                            <strong>Ocorreu troca de peças?</strong>
                                            <div>
                                                (&nbsp;{trocouPecasBool ? 'X' : ' '}&nbsp;) Sim
                                                (&nbsp;{naoTrocouPecasBool ? 'X' : ' '}&nbsp;) Não
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><strong>Término:</strong> {dataTerminoFormatada.date}</td>
                                        <td>Hora: {dataTerminoFormatada.time}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="4" className="pecas-cell">
                                            <strong>Quais?</strong>
                                            <p>
                                                {pecasSubstituidas && pecasSubstituidas.length > 0
                                                    ? pecasSubstituidas.map(p => `${p.quantidade || 0}x ${p.nome || 'peça'}`).join(', ')
                                                    : 'Nenhuma peça substituída.'
                                                }
                                            </p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="3" className="no-padding">
                            <table className="info-table">
                                <tbody>
                                    <tr>
                                        <td style={{ width: '60%' }}><strong>Aprovado por :</strong> __________________________</td>
                                        <td style={{ width: '20%' }}><strong>Data:</strong> {dataAprovacaoFormatada.date} Horas: ___ / ___</td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr className="footer-row">
                        <td className="footer-cell-left">FO.012 - {tituloFooter}</td>
                        <td className="footer-cell-center">REV.01</td>
                        <td className="footer-cell-right">DATA: {dataImpressao}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
});


// --- COMPONENTE PRINCIPAL ---
function VisualizarOsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ordemServico, setOrdemServico] = useState(null);
    const [equipamento, setEquipamento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const userRole = localStorage.getItem('userRole');
    const componentRef = useRef();
    const [isPrinting, setIsPrinting] = useState(false);

    // useReactToPrint hook (sem alterações)
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        onBeforeGetContent: () => new Promise(resolve => { setIsPrinting(true); setTimeout(resolve, 50); }),
        onAfterPrint: () => setIsPrinting(false),
        pageStyle: `@page { size: A4 portrait; margin: 15mm; } @media print { body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } .print-main-table { width: 100%; border-collapse: collapse; } .print-main-table th, .print-main-table td { border: 1px solid #ccc; padding: 4px; font-size: 9pt; color: black; } thead { display: table-header-group; } tfoot { display: table-footer-group; } }`,
    });

    // useEffect para buscar dados (sem alterações na lógica principal)
    useEffect(() => {
        const fetchData = async () => {
            if (!id) { setError("ID da OS inválido."); setLoading(false); return; }
            setLoading(true); setError(null);
            try {
                const osRes = await getOsById(id);
                const osData = osRes.data;
                if (!osData || typeof osData !== 'object') {
                    throw new Error("API retornou dados de OS inválidos ou vazios.");
                }
                setOrdemServico(osData);

                const equipsRes = await getEquipamentos();
                if (!equipsRes.data) {
                    console.warn("API retornou lista de equipamentos vazia ou inválida.");
                    setEquipamento(null);
                } else {
                    const equip = osData.equipamentoId ? equipsRes.data.find(e => e.id === osData.equipamentoId) : null;
                    setEquipamento(equip || null);
                }
                setError(null);
            } catch (err) {
                console.error('ERRO DETALHADO em fetchData:', err);
                setError(`Falha ao carregar os detalhes da OS: ${err.message || 'Erro desconhecido'}`);
                setOrdemServico(null); setEquipamento(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Funções auxiliares (sem alterações)
    const handleDelete = async () => {
        if (window.confirm('Tem certeza que deseja excluir esta Ordem de Serviço?')) {
            setActionLoading(true);
            try {
                await deleteOrdemServico(id);
                alert('Ordem de Serviço excluída com sucesso!');
                navigate('/dashboard');
            } catch (err) {
                console.error("Erro ao excluir OS:", err);
                alert(err.response?.data?.message || 'Falha ao excluir a Ordem de Serviço.');
            } finally {
                setActionLoading(false);
            }
        }
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return "—";
        try {
            const date = new Date(dateTimeString);
            if (isNaN(date.getTime())) {
                console.warn("Data inválida recebida:", dateTimeString);
                return "Data inválida";
            }
            return date.toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch (e) {
            console.error("Erro ao formatar data:", dateTimeString, e);
            return "Erro na data";
        }
    };

    const formatStatusLabel = (status) => {
        if (!status || typeof status !== 'string') return 'Desconhecido';
        return status.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    };

    // Retornos condicionais (sem alterações)
    if (loading) return <div className="loading-details">Carregando...</div>;
    if (error) return <div className="error-details">{error}</div>;
    if (!ordemServico || typeof ordemServico !== 'object') return <div className="no-data-details">Dados da Ordem de Serviço indisponíveis ou inválidos.</div>;

    const podeExcluir = userRole && (userRole.includes('ADMIN') || userRole.includes('LIDER'));
    // JSX Principal (sem alterações significativas, pois a lógica está no PrintableOs)
    return (
        <>
            {isPrinting && ordemServico && equipamento &&
                ReactDOM.createPortal(
                    <div className="print-portal-wrapper">
                        <PrintableOs
                            ref={componentRef}
                            os={ordemServico}
                            equipamento={equipamento}
                        />
                    </div>,
                    document.body
                )
            }
            <div className="view-os-page">
                <div className="view-os-form">
                    <header className="form-header-main">
                        <h1>Detalhes da Ordem de Serviço #{ordemServico.codigoOs || ordemServico.id}</h1>
                        <div className={`status-display status-${(ordemServico.status || '').toLowerCase()}`}>
                            {formatStatusLabel(ordemServico.status)}
                        </div>
                    </header>
                    <section className="form-section">
                        <header><h2>Abertura e Detalhes</h2></header>
                        <div className="grid-container">
                            <div className="input-group"><label>Tipo de Manutenção</label><input type="text" value={formatStatusLabel(ordemServico.tipoManutencao || '')} disabled /></div>
                            {ordemServico.tipoManutencao === 'PREVENTIVA' && ordemServico.frequencia && (
                                <div className="input-group"><label>Frequência</label><input type="text" value={formatFrequencia(ordemServico.frequencia)} disabled /></div>
                            )}
                            <div className="input-group"><label>Solicitante</label><input type="text" value={ordemServico.solicitante || ''} disabled /></div>
                            <div className="input-group"><label>Data da Solicitação</label><input type="text" value={formatDateTime(ordemServico.dataSolicitacao)} disabled /></div>
                            <div className="input-group"><label>Equipamento</label><input type="text" value={equipamento?.nome || ''} disabled /></div>
                            <div className="input-group"><label>Local</label><input type="text" value={ordemServico.localNome || ''} disabled /></div>
                            <div className="input-group"><label>Setor</label><input type="text" value={ordemServico.setorNome || ''} disabled /></div>
                        </div>
                        <div className="input-group full-width" style={{ marginTop: '1rem' }}><label>Descrição do Problema/Serviço</label><textarea value={ordemServico.descricaoProblema || ''} rows="3" disabled></textarea></div>
                    </section>
                    <section className="form-section">
                        <header><h2>Execução do Serviço</h2></header>
                        <div className="grid-container">
                            <div className="input-group"><label>Executado por</label><input type="text" value={ordemServico.executadoPorNome || 'Pendente'} disabled /></div>
                            <div className="input-group"><label>Data da Execução</label><input type="text" value={formatDateTime(ordemServico.dataExecucao)} disabled /></div>
                        </div>
                        <div className="input-group full-width" style={{ marginTop: '1rem' }}><label>Ação Realizada</label><textarea value={ordemServico.acaoRealizada || 'Aguardando preenchimento.'} rows="3" disabled></textarea></div>
                    </section>
                    <footer className="form-actions">
                        <button type="button" className="button-print" onClick={handlePrint}>Imprimir</button>
                        <button type="button" className="button-cancel" onClick={() => navigate(-1)}>Voltar</button>
                        {podeExcluir && (
                            <button type="button" className="button-delete" onClick={handleDelete} disabled={actionLoading}>
                                {actionLoading ? 'Excluindo...' : 'Excluir OS'}
                            </button>
                        )}
                    </footer>
                </div>
            </div>
        </>
    );
}

export default VisualizarOsPage;