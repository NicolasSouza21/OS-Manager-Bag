import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';

import {
    getOsById,
    getEquipamentos,
    getLocais,
    deleteOrdemServico,
    verificarOS,
} from '../services/apiService';
import './VisualizarOsPage.css';
import './VisualizarOsPage.print.css';

const formatFrequencia = (frequencia) => {
    if (!frequencia || !frequencia.nome) return 'N/A';
    const unidade = frequencia.unidadeTempo.toLowerCase() + (frequencia.intervalo > 1 ? 's' : '');
    return `${frequencia.nome} (a cada ${frequencia.intervalo} ${unidade})`;
};

const PrintableOs = React.forwardRef(({ os, equipamento, local }, ref) => {
    if (!os) return null;

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return { date: '__/__/____', time: '__:__' };
        const date = new Date(dateTimeString);
        if (isNaN(date)) return { date: '__/__/____', time: '__:__' };
        return {
            date: date.toLocaleDateString('pt-BR'),
            time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
    };

    const capitalize = (text) => {
        if (!text) return '';
        const lower = text.toLowerCase().replace(/_/g, ' ');
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    }
    
    const dataSolicitacao = formatDateTime(os.dataInicioPreventiva || os.dataSolicitacao);
    const dataInicio = formatDateTime(os.dataExecucao);
    const dataTermino = formatDateTime(os.termino);
    const dataAprovacao = formatDateTime(os.dataVerificacao);
    
    const isRealizado = ['CONCLUIDA', 'AGUARDANDO_VERIFICACAO'].includes(os.status);
    const trocouPecas = os.trocaPecas === true;
    const naoTrocouPecas = os.trocaPecas === false && isRealizado;

    const tituloFooter = `ORDEM DE SERVIÇO DE MANUTENÇÃO`;
    const dataImpressao = new Date().toLocaleDateString('pt-BR');

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

    return (
        <div className="print-container" ref={ref}>
            <table className="print-main-table">
                <thead>
                    <tr>
                        <th className="header-logo-cell"><strong>BagCleaner</strong></th>
                        {/* ✨ ALTERAÇÃO AQUI: Descrição removida do título principal */}
                        <th className="header-title-cell">
                            Ordem de Serviço de Manutenção
                        </th>
                        <th className="header-os-number-cell">
                            <div>Nº</div>
                            <div>{os.codigoOs || 'N/A'}</div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan="3" className="no-padding">
                            <table className="info-table">
                                <tbody>
                                    <tr>
                                        <td><strong>Equipamento:</strong> {equipamento?.nome || 'N/A'}</td>
                                        <td><strong>Tipo de OS:</strong> {capitalize(os.tipoManutencao) || 'Não especificado'}</td>
                                    </tr>
                                    {os.tipoManutencao === 'PREVENTIVA' && (
                                        <tr>
                                            <td colSpan="2"><strong>Frequência:</strong> {os.frequencia?.nome || 'N/A'}</td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td><strong>Local:</strong> {local?.nome || 'N/A'}</td>
                                        <td><strong>Setor:</strong> {local?.setorNome || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Solicitante:</strong> {os.solicitante || 'N/A'}</td>
                                        <td><strong>Data:</strong> {dataSolicitacao.date} <strong>Horas:</strong> {dataSolicitacao.time}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr className="section-header">
                        <td colSpan="3">Preenchimento da Manutenção</td>
                    </tr>
                    {/* ✨ ALTERAÇÃO AQUI: Nova linha criada exclusivamente para a descrição do problema */}
                    <tr>
                        <td colSpan="3" className="problem-desc-cell">
                           <strong>Descrição do Problema/Serviço:</strong> {os.descricaoProblema || 'N/A'}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="3" className="desc-cell no-padding">
                           <p style={{paddingLeft: '5px'}}><strong>Ação Realizada:</strong></p>
                           {renderAcaoRealizadaImpressao()}
                        </td>
                    </tr>
                    <tr>
                       <td colSpan="3" className="no-padding">
                           <table className="info-table">
                               <tbody>
                                   <tr>
                                      <td colSpan="4"><strong>Executado por:</strong> {os.executadoPorNome || 'Aguardando execução...'}</td>
                                   </tr>
                                   <tr>
                                       <td><strong>Início:</strong> Data: {dataInicio.date}</td>
                                       <td>Hora: {dataInicio.time}</td>
                                       <td rowSpan="2" colSpan="2" className="pecas-check-cell">
                                           <strong>Ocorreu troca de peças?</strong>
                                           <div>
                                               (&nbsp;{trocouPecas ? 'X' : ' '}&nbsp;) Sim
                                               (&nbsp;{naoTrocouPecas ? 'X' : ' '}&nbsp;) Não
                                           </div>
                                       </td>
                                   </tr>
                                   <tr>
                                       <td><strong>Término:</strong> Data: {dataTermino.date}</td>
                                       <td>Hora: {dataTermino.time}</td>
                                   </tr>
                                   <tr>
                                       <td colSpan="4" className="pecas-cell">
                                           <strong>Quais?</strong> 
                                           <p>
                                               {os.pecasSubstituidas && os.pecasSubstituidas.length > 0
                                                   ? os.pecasSubstituidas.map(p => `${p.quantidade || 0}x ${p.nome || 'peça'}`).join(', ')
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
                                        <td style={{ width: '60%' }}><strong>Aprovado por :</strong> {'__________________________'}</td>
                                        <td style={{ width: '20%' }}><strong>Data:</strong> {dataAprovacao.date}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr className="footer-row">
                        <td className="footer-cell-left">FO.169 - {tituloFooter}</td>
                        <td className="footer-cell-center">REV.00</td>
                        <td className="footer-cell-right">DATA: {dataImpressao}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
});


function VisualizarOsPage() {
    // ... O resto do componente não precisa de alterações ...
    const { id } = useParams();
    const navigate = useNavigate();
    const [ordemServico, setOrdemServico] = useState(null);
    const [equipamento, setEquipamento] = useState(null);
    const [local, setLocal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const userRole = localStorage.getItem('userRole');
    const componentRef = useRef();

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const osRes = await getOsById(id);
                const osData = osRes.data;
                setOrdemServico(osData);
                const [equipsRes, locaisRes] = await Promise.all([getEquipamentos(), getLocais()]);
                setEquipamento(equipsRes.data.find(e => e.id === osData.equipamentoId) || null);
                setLocal(locaisRes.data.find(l => l.id === osData.localId) || null);
                setError(null);
            } catch (err) {
                setError('Falha ao carregar os detalhes da Ordem de Serviço.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleDelete = async () => { /* ... sua lógica de exclusão ... */ };
    const handleVerificacaoSubmit = async (dadosVerificacao) => { /* ... sua lógica de verificação ... */ };
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return "—";
        return new Date(dateTimeString).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };
    const formatStatusLabel = (status) => {
        if (!status) return 'Pendente';
        return status.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    };

    if (loading) return <div className="loading-details">Carregando...</div>;
    if (error) return <div className="error-details">{error}</div>;
    if (!ordemServico) return <div className="no-data-details">Ordem de Serviço não encontrada.</div>;

    const podeExcluir = userRole === 'ADMIN' || userRole === 'LIDER';

    return (
        <div>
            {!loading && ordemServico && (
                <div className="printable-area-wrapper">
                    <PrintableOs ref={componentRef} os={ordemServico} equipamento={equipamento} local={local} />
                </div>
            )}
            <div className="view-os-page">
                <div className="view-os-form">
                    <header className="form-header-main">
                        <h1>Detalhes da Ordem de Serviço #{ordemServico.codigoOs || ordemServico.id}</h1>
                        <div className={`status-display status-${ordemServico.status?.toLowerCase()}`}>
                            {formatStatusLabel(ordemServico.status)}
                        </div>
                    </header>
                    <section className="form-section">
                        <header><h2>Abertura e Detalhes</h2></header>
                        <div className="grid-container">
                            <div className="input-group"><label>Tipo de Manutenção</label><input type="text" value={formatStatusLabel(ordemServico.tipoManutencao)} disabled /></div>
                            {ordemServico.tipoManutencao === 'PREVENTIVA' && ordemServico.frequencia && (
                                <div className="input-group"><label>Frequência</label><input type="text" value={formatFrequencia(ordemServico.frequencia)} disabled /></div>
                            )}
                            <div className="input-group"><label>Solicitante</label><input type="text" value={ordemServico.solicitante || '—'} disabled /></div>
                            <div className="input-group"><label>Data da Solicitação</label><input type="text" value={formatDateTime(ordemServico.dataSolicitacao)} disabled /></div>
                            <div className="input-group"><label>Equipamento</label><input type="text" value={equipamento?.nome || '—'} disabled /></div>
                            <div className="input-group"><label>Local</label><input type="text" value={local?.nome || '—'} disabled /></div>
                        </div>
                        <div className="input-group full-width" style={{marginTop: '1rem'}}><label>Descrição do Problema/Serviço</label><textarea value={ordemServico.descricaoProblema || 'Nenhuma'} rows="3" disabled></textarea></div>
                    </section>
                    <section className="form-section">
                        <header><h2>Execução do Serviço</h2></header>
                        <div className="grid-container">
                            <div className="input-group"><label>Executado por</label><input type="text" value={ordemServico.executadoPorNome || "Pendente"} disabled /></div>
                            <div className="input-group"><label>Data da Execução</label><input type="text" value={formatDateTime(ordemServico.dataExecucao)} disabled /></div>
                        </div>
                        <div className="input-group full-width" style={{marginTop: '1rem'}}><label>Ação Realizada</label><textarea value={ordemServico.acaoRealizada || 'Aguardando preenchimento no Dashboard.'} rows="3" disabled></textarea></div>
                    </section>
                    <footer className="form-actions">
                        <button type="button" className="button-print" onClick={handlePrint}>
                            Imprimir
                        </button>
                        <button type="button" className="button-cancel" onClick={() => navigate(-1)}>
                            Voltar
                        </button>
                        {podeExcluir && (
                            <button type="button" className="button-delete" onClick={handleDelete} disabled={actionLoading}>
                                {actionLoading ? 'Excluindo...' : 'Excluir OS'}
                            </button>
                        )}
                    </footer>
                </div>
            </div>
        </div>
    );
}

export default VisualizarOsPage;