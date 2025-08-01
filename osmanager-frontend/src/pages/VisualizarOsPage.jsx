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

const PrintableOs = React.forwardRef(({ os, equipamento }, ref) => {
    if (!os) return null;

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return { date: '__/__/____', time: '__:__' };
        const date = new Date(dateTimeString);
        return {
            date: date.toLocaleDateString('pt-BR'),
            time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
    };
    
    const dataSolicitacao = formatDateTime(os.dataInicioPreventiva || os.dataSolicitacao);
    const dataInicio = formatDateTime(os.dataExecucao);
    const dataTermino = formatDateTime(os.termino);
    const dataAprovacao = formatDateTime(os.dataVerificacao);

    const isRealizado = ['CONCLUIDA', 'AGUARDANDO_VERIFICACAO'].includes(os.status);
    const isNaoRealizado = os.status === 'CANCELADA';
    const trocouPecas = os.trocaPecas === true;
    const naoTrocouPecas = os.trocaPecas === false && isRealizado;

    return (
        <div className="print-container" ref={ref}>
            <table className="print-main-table">
                <thead>
                    <tr>
                        <th className="header-logo-cell"><strong>CLEANER</strong></th>
                        <th className="header-title-cell">Ordem de Serviço da Manutenção</th>
                        <th className="header-os-number-cell">
                            <div>Nº</div>
                            <div>{os.codigoOs || '0'}</div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan="3" className="no-padding">
                            <table className="info-table">
                                <tbody>
                                    <tr>
                                        <td style={{ width: '50%' }}><strong>Nº Máquina:</strong> {equipamento?.tag || 'N.A.'}</td>
                                        <td style={{ width: '50%' }}><strong>Tipo:</strong> {equipamento?.descricao || 'Monovia'}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Solicitante:</strong> {os.solicitante}</td>
                                        <td><strong>Data:</strong> {dataSolicitacao.date}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr className="section-header">
                        <td colSpan="3">Preenchimento da Manutenção</td>
                    </tr>
                    <tr>
                        <td colSpan="3" className="no-padding">
                            <table className="content-table">
                                <tbody>
                                    <tr>
                                        <td className="desc-cell">
                                            <p><strong>Descrição e Ações Realizadas:</strong> ({os.frequencia ? os.frequencia.nome : os.tipoManutencao?.toLowerCase()})</p>
                                            <p>{os.descricaoProblema}</p>
                                        </td>
                                        <td className="status-cell">
                                            <span>(&nbsp;{isRealizado ? 'X' : ' '}&nbsp;) Realizado</span>
                                            <span>(&nbsp;{isNaoRealizado ? 'X' : ' '}&nbsp;) Não realizado</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="2" className="obs-cell">
                                            <p><strong>Observação:</strong></p>
                                            <p>{os.acaoRealizada || ''}</p>
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
                                       <td colSpan="4"><strong>Executado por:</strong> {os.executadoPorNome || '________________________________'}</td>
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
                                                   ? os.pecasSubstituidas.map(p => `${p.quantidade}x ${p.nome}`).join(', ')
                                                   : ''
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
                                       <td style={{ width: '60%' }}><strong>Aprovado por (Encarregado):</strong> {os.verificadoPorNome || '________________'}</td>
                                       <td style={{ width: '20%' }}><strong>Data:</strong> {dataAprovacao.date}</td>
                                       <td style={{ width: '20%' }}><strong>Verificado CQ:</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr className="footer-row">
                        <td colSpan="3">
                            <span>FO.169 - ORDEM DE SERVIÇO DA MANUTENÇÃO PREVENTIVA</span>
                            <span>REV.00</span>
                            <span>DATA: 03/08/2020</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
});

function VisualizarOsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [ordemServico, setOrdemServico] = useState(null);
    const [equipamento, setEquipamento] = useState(null);
    const [local, setLocal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const userRole = localStorage.getItem('userRole');

    // ✨ ALTERAÇÃO AQUI: Novo estado para controlar a impressão
    const [isPrinting, setIsPrinting] = useState(false);

    const componentRef = useRef();

    // ✨ ALTERAÇÃO AQUI: Lógica de impressão refeita
    const handleTriggerPrint = useReactToPrint({
        content: () => componentRef.current,
        onAfterPrint: () => setIsPrinting(false), // Desativa o modo de impressão depois
    });

    // ✨ ALTERAÇÃO AQUI: useEffect para disparar a impressão
    useEffect(() => {
        // Se o estado 'isPrinting' for verdadeiro e o componente já estiver montado, chama a impressão
        if (isPrinting && componentRef.current) {
            handleTriggerPrint();
        }
    }, [isPrinting, handleTriggerPrint]);

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

    const handleDelete = async () => {
        if (window.confirm('Tem certeza que deseja excluir esta Ordem de Serviço?')) {
            setActionLoading(true);
            try {
                await deleteOrdemServico(id);
                alert('Ordem de Serviço excluída com sucesso!');
                navigate('/dashboard');
            } catch (err) {
                alert('Falha ao excluir a Ordem de Serviço.');
                setActionLoading(false);
            }
        }
    };
    
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
            {/* ✨ ALTERAÇÃO AQUI: O componente de impressão só é renderizado quando isPrinting é true */}
            {isPrinting && (
                <div className="printable-area-wrapper">
                    <PrintableOs ref={componentRef} os={ordemServico} equipamento={equipamento} />
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
                        {/* ✨ ALTERAÇÃO AQUI: O botão agora apenas ativa o estado de impressão */}
                        <button type="button" className="button-print" onClick={() => setIsPrinting(true)}>
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