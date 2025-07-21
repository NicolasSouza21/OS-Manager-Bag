import React, { useEffect, useState } from 'react';
import { 
    getEquipamentos, createEquipamento, updateEquipamento, deleteEquipamento,
    getTiposServico, 
    getPlanosPorEquipamento, adicionarPlano, deletarPlano,
    // ✅ Novas importações da API
    listarServicosPorEquipamento, associarServico, desassociarServico
} from '../../../services/apiService';
import './GerenciarEquipamentosPage.css';

const FREQUENCIA_OPTIONS = [ 'UNICA', 'DIARIO', 'BIDIARIO', 'SEMANAL', 'QUINZENAL', 'MENSAL', 'BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL' ];

// ✅ NOVO COMPONENTE: Modal para associar serviços
const ModalAssociarServicos = ({ equipamento, catalogoServicos, onClose, onUpdate }) => {
    const [servicosAssociados, setServicosAssociados] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        listarServicosPorEquipamento(equipamento.id)
            .then(resp => setServicosAssociados(resp.data))
            .finally(() => setLoading(false));
    }, [equipamento.id]);

    const isAssociado = (servicoId) => servicosAssociados.some(s => s.id === servicoId);

    const handleToggleAssociacao = (servico) => {
        const jaAssociado = isAssociado(servico.id);
        const apiCall = jaAssociado 
            ? desassociarServico(equipamento.id, servico.id) 
            : associarServico(equipamento.id, servico.id);

        apiCall.then(() => {
            setServicosAssociados(prev => 
                jaAssociado 
                    ? prev.filter(s => s.id !== servico.id) 
                    : [...prev, servico]
            );
            onUpdate(); // Atualiza a lista de serviços na página principal
        });
    };

    if (loading) return <div className="modal-overlay"><p>Carregando...</p></div>;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Serviços para {equipamento.nome}</h2>
                <p>Marque os serviços que se aplicam a este equipamento.</p>
                <div className="lista-servicos-modal">
                    {catalogoServicos.map(servico => (
                        <div key={servico.id} className="servico-item-modal">
                            <label>
                                <input 
                                    type="checkbox"
                                    checked={isAssociado(servico.id)}
                                    onChange={() => handleToggleAssociacao(servico)}
                                />
                                {servico.nome}
                            </label>
                        </div>
                    ))}
                </div>
                <button onClick={onClose} className="btn-fechar-modal">Fechar</button>
            </div>
        </div>
    );
};


function GerenciarEquipamentosPage() {
    // ... (Seus estados existentes: equipamentos, loading, novoEquipamento, etc.)
    const [equipamentos, setEquipamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editandoId, setEditandoId] = useState(null);
    const [formEdicao, setFormEdicao] = useState({ nome: '', descricao: '' });
    const [novoEquipamento, setNovoEquipamento] = useState({ tag: '', nome: '', descricao: '' });
    
    const [tiposServico, setTiposServico] = useState([]);
    const [selectedEquip, setSelectedEquip] = useState(null);
    const [planos, setPlanos] = useState([]);
    const [loadingPlanos, setLoadingPlanos] = useState(false);
    const [novoPlano, setNovoPlano] = useState({ tipoServicoId: '', frequencia: 'MENSAL', toleranciaDias: 0 });

    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
    
    // ✅ Novo estado para controlar o modal
    const [isModalServicosOpen, setIsModalServicosOpen] = useState(false);

    useEffect(() => {
        carregarEquipamentos();
        carregarTiposServico();
    }, []);
    
    // ... (Suas funções existentes: carregarEquipamentos, carregarTiposServico, etc.)
    const carregarEquipamentos = () => { /* ... */ };
    const carregarTiposServico = () => { /* ... */ };
    const carregarPlanos = (equipamentoId) => {
        // ✅ Agora, a lista de serviços para o dropdown vem dos serviços associados ao equipamento
        listarServicosPorEquipamento(equipamentoId)
            .then(resp => {
                const equipamentoAtualizado = equipamentos.find(e => e.id === equipamentoId);
                if (equipamentoAtualizado) {
                    equipamentoAtualizado.servicosDisponiveis = resp.data;
                    setEquipamentos([...equipamentos]);
                }
            });
        
        setLoadingPlanos(true);
        getPlanosPorEquipamento(equipamentoId)
            .then(resp => setPlanos(resp.data))
            .finally(() => setLoadingPlanos(false));
    };

    const handleSelectEquipamento = (equip) => {
        if (selectedEquip?.id === equip.id) {
            setSelectedEquip(null);
            setPlanos([]);
        } else {
            setSelectedEquip(equip);
            carregarPlanos(equip.id);
        }
    };
    // ... (O resto das suas funções handle... continuam aqui)

    return (
        <div className="gerenciar-equipamentos-container">
            {/* ... Formulário de Cadastrar Equipamento ... */}
            
            <div className="lista-card">
                <h2>Equipamentos Cadastrados</h2>
                {/* ... */}
                <table className="equipamentos-table">
                    {/* ... thead ... */}
                    <tbody>
                        {equipamentos.map(equip => (
                            <tr key={equip.id} onClick={() => handleSelectEquipamento(equip)} className={selectedEquip?.id === equip.id ? 'selected-row' : ''}>
                                <td>{equip.tag}</td>
                                <td>{equip.nome}</td>
                                <td onClick={(e) => e.stopPropagation()}>
                                    {/* ✅ Novo botão para associar serviços */}
                                    <button onClick={() => setIsModalServicosOpen(true)} className="btn-associar">Serviços</button>
                                    <button onClick={() => editarEquipamento(equip)} className="btn-editar">Editar</button>
                                    <button onClick={() => excluirEquipamento(equip.id)} className="btn-excluir">Excluir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedEquip && (
                <div className="planos-preventiva-card">
                    <h2>Plano de Manutenção para: {selectedEquip.nome}</h2>
                    <form onSubmit={handleAdicionarPlanoSubmit} className="form-plano">
                        {/* ✅ Dropdown agora usa os serviços específicos do equipamento */}
                        <select name="tipoServicoId" value={novoPlano.tipoServicoId} onChange={handleNovoPlanoChange} required>
                            <option value="">Selecione um Serviço...</option>
                            {selectedEquip.servicosDisponiveis?.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                        </select>
                        {/* ... resto do formulário do plano ... */}
                    </form>
                    {/* ... tabela de planos ... */}
                </div>
            )}
            
            {/* ✅ Renderização do novo modal */}
            {isModalServicosOpen && selectedEquip && (
                <ModalAssociarServicos 
                    equipamento={selectedEquip}
                    catalogoServicos={tiposServico}
                    onClose={() => setIsModalServicosOpen(false)}
                    onUpdate={() => carregarPlanos(selectedEquip.id)}
                />
            )}
        </div>
    );
}

export default GerenciarEquipamentosPage;