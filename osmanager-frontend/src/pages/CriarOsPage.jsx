import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrdemServico, getEquipamentos, getLocais } from '../services/apiService';
import './CriarOsPage.css';

// ✅ 1. FUNÇÃO AUXILIAR PARA FORMATAR A DATA NO PADRÃO yyyy-MM-dd
const formatDateForInput = (date) => {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}

function CriarOsPage() {
    const navigate = useNavigate();

    // --- Estados do Formulário ---
    const [tipoManutencao, setTipoManutencao] = useState('CORRETIVA');
    const [prioridade, setPrioridade] = useState('MEDIA'); // Definindo um valor padrão
    const [solicitante, setSolicitante] = useState('');
    const [descricaoProblema, setDescricaoProblema] = useState('');
    const [observacao, setObservacao] = useState('');
    const [equipamentoId, setEquipamentoId] = useState('');
    const [localId, setLocalId] = useState('');
    const [listaEquipamentos, setListaEquipamentos] = useState([]);
    const [listaLocais, setListaLocais] = useState([]);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // ✅ 2. STATES DAS DATAS DA PREVENTIVA INICIADOS COM VALORES CORRETOS
    const [dataInicioPreventiva, setDataInicioPreventiva] = useState(formatDateForInput(new Date()));
    const [dataFimPreventiva, setDataFimPreventiva] = useState('');

    const equipamentoSelecionado = listaEquipamentos.find(e => e.id === Number(equipamentoId));

    useEffect(() => {
        const carregarDadosIniciais = async () => {
            try {
                const [resEquipamentos, resLocais] = await Promise.all([
                    getEquipamentos(),
                    getLocais()
                ]);
                setListaEquipamentos(resEquipamentos.data);
                setListaLocais(resLocais.data);
            } catch (err) {
                console.error("Erro ao carregar dados", err);
                setError("Não foi possível carregar os dados para o formulário.");
            }
        };
        carregarDadosIniciais();
        setSolicitante(localStorage.getItem('userName') || 'Usuário');
    }, []);

    const handleSubmit = async (evento) => {
        evento.preventDefault();
        setError(null);
        setSubmitting(true);

        // Validações básicas
        if (!prioridade || !equipamentoId || !localId || !descricaoProblema) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            setSubmitting(false);
            return;
        }

        // Validação específica para preventiva
        if (tipoManutencao === 'PREVENTIVA' && (!dataInicioPreventiva || !dataFimPreventiva)) {
            alert('Para manutenção preventiva, as datas de início e fim são obrigatórias.');
            setSubmitting(false);
            return;
        }

        const dadosParaApi = {
            tipoManutencao,
            equipamentoId: Number(equipamentoId),
            localId: Number(localId),
            prioridade,
            solicitante,
            descricaoProblema,
            observacao,
            // Adiciona as datas condicionalmente ao payload
            ...(tipoManutencao === 'PREVENTIVA' && {
                dataInicioPreventiva,
                dataFimPreventiva
            })
        };

        try {
            await createOrdemServico(dadosParaApi);
            alert('Ordem de Serviço criada com sucesso!');
            navigate('/dashboard');
        } catch (err) {
            console.error("Erro ao criar OS:", err)
            alert('Falha ao criar a Ordem de Serviço.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="os-page-container">
            <form className="os-form-container" onSubmit={handleSubmit}>
                <header className="os-form-header">
                    <div className="os-header-title">
                        <h1>ORDEM DE SERVIÇO DE MANUTENÇÃO</h1>
                    </div>
                    <div className="os-number-box">
                        <label>Nº OS:</label>
                        <span>AUTOMÁTICO</span>
                    </div>
                </header>

                <main className="os-form-body">
                    <div className="form-section-title">SOLICITAÇÃO</div>
                    <div className="form-row">
                        <div className="input-group">
                            <label htmlFor="tipoManutencao">TIPO DE MANUTENÇÃO:</label>
                            <select id="tipoManutencao" value={tipoManutencao} onChange={(e) => setTipoManutencao(e.target.value)}>
                                <option value="CORRETIVA">CORRETIVA</option>
                                <option value="PREVENTIVA">PREVENTIVA</option>
                                <option value="PREDITIVA">PREDITIVA</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>DATA DE ABERTURA:</label>
                            <input type="text" value={new Date().toLocaleDateString('pt-BR')} disabled />
                        </div>
                        <div className="input-group">
                            <label>SITUAÇÃO O.S:</label>
                            <input type="text" value="ABERTA" disabled />
                        </div>
                    </div>
                    
                    {tipoManutencao === 'PREVENTIVA' && (
                        <div className="form-row">
                            <div className="input-group">
                                <label htmlFor="dataInicioPreventiva">INÍCIO PREVENTIVA:</label>
                                <input
                                    type="date"
                                    id="dataInicioPreventiva"
                                    value={dataInicioPreventiva}
                                    onChange={(e) => setDataInicioPreventiva(e.target.value)}
                                    required={tipoManutencao === 'PREVENTIVA'}
                                />
                            </div>
                             <div className="input-group">
                                <label htmlFor="dataFimPreventiva">FIM PREVENTIVA:</label>
                                <input
                                    type="date"
                                    id="dataFimPreventiva"
                                    value={dataFimPreventiva}
                                    onChange={(e) => setDataFimPreventiva(e.target.value)}
                                    required={tipoManutencao === 'PREVENTIVA'}
                                />
                            </div>
                        </div>
                    )}


                    <div className="form-row">
                        <div className="input-group">
                            <label htmlFor="equipamento">EQUIPAMENTO:</label>
                            <select id="equipamento" value={equipamentoId} onChange={(e) => setEquipamentoId(e.target.value)} required>
                                <option value="" disabled>Selecione...</option>
                                {listaEquipamentos.map((equip) => (
                                    <option key={equip.id} value={equip.id}>{equip.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Nº EQUIPAMENTO:</label>
                            <input type="text" value={equipamentoSelecionado?.tag || ''} disabled />
                        </div>
                        <div className="input-group">
                            <label htmlFor="local">LOCAL:</label>
                            <select id="local" value={localId} onChange={(e) => setLocalId(e.target.value)} required>
                                <option value="" disabled>Selecione...</option>
                                {listaLocais.map((local) => (
                                    <option key={local.id} value={local.id}>{local.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="input-group full-width">
                            <label htmlFor="descricaoProblema">DESCRIÇÃO DO PROBLEMA/SERVIÇO:</label>
                            <textarea id="descricaoProblema" rows="3" value={descricaoProblema} onChange={(e) => setDescricaoProblema(e.target.value)} required></textarea>
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="input-group">
                            <label htmlFor="criticidade">CRITICIDADE:</label>
                            <select id="criticidade" value={prioridade} onChange={(e) => setPrioridade(e.target.value)} required>
                                <option value="" disabled>Selecione...</option>
                                <option value="BAIXA">Baixa</option>
                                <option value="MEDIA">Média</option>
                                <option value="ALTA">Alta</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>SOLICITANTE:</label>
                            <input type="text" value={solicitante} disabled />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="input-group full-width">
                            <label htmlFor="observacao">OBSERVAÇÃO:</label>
                            <textarea id="observacao" rows="3" value={observacao} onChange={(e) => setObservacao(e.target.value)}></textarea>
                        </div>
                    </div>
                </main>

                <footer className="os-form-footer">
                    <div className="form-actions">
                        <button type="submit" className="button-save" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</button>
                        <button type="button" className="button-cancel" onClick={() => navigate(-1)}>CANCELAR</button>
                    </div>
                    <div className="footer-info">
                        <span>FO 012 - ORDEM DE SERVIÇO DE MANUTENÇÃO</span>
                        <span>REV01</span>
                        <span>DATA: {new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                </footer>
            </form>
        </div>
    );
}

export default CriarOsPage;