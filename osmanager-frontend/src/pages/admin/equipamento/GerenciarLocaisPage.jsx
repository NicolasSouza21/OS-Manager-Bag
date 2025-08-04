import React, { useState, useEffect, useCallback } from 'react';
import { 
    getSetores, createSetor, updateSetor, deleteSetor,
    getLocais, createLocal, updateLocal, deleteLocal
} from '../../../services/apiService';
import './GerenciarLocaisPage.css';

// Componente para gerenciar Setores
function CardSetores({ setores, carregarDados, setMensagem }) {
    const [novoSetorNome, setNovoSetorNome] = useState('');
    const [editandoId, setEditandoId] = useState(null);
    const [editandoNome, setEditandoNome] = useState('');

    const handleCriar = (e) => {
        e.preventDefault();
        createSetor({ nome: novoSetorNome })
            .then(() => {
                // ✅ CORREÇÃO AQUI
                setMensagem('Setor criado com sucesso!', 'sucesso');
                setNovoSetorNome('');
                carregarDados();
            })
            .catch(err => setMensagem(err.response?.data?.message || 'Erro ao criar setor.', 'erro'));
    };

    const handleDeletar = (id) => {
        if (window.confirm('Deseja realmente excluir este setor? Todos os locais associados serão afetados.')) {
            deleteSetor(id)
                .then(() => {
                    // ✅ CORREÇÃO AQUI
                    setMensagem('Setor excluído com sucesso!', 'sucesso');
                    carregarDados();
                })
                .catch(err => setMensagem(err.response?.data?.message || 'Erro ao excluir setor.', 'erro'));
        }
    };

    const handleSalvar = (id) => {
        updateSetor(id, { nome: editandoNome })
            .then(() => {
                // ✅ CORREÇÃO AQUI
                setMensagem('Setor atualizado com sucesso!', 'sucesso');
                setEditandoId(null);
                carregarDados();
            })
            .catch(err => setMensagem(err.response?.data?.message || 'Erro ao atualizar setor.', 'erro'));
    };

    return (
        <div className="card">
            <h2>Gerenciar Setores</h2>
            <form onSubmit={handleCriar} className="form-cadastro">
                <input 
                    type="text" 
                    value={novoSetorNome}
                    onChange={(e) => setNovoSetorNome(e.target.value)}
                    placeholder="Nome do novo setor"
                    required 
                />
                <button type="submit">Adicionar</button>
            </form>
            <table className="lista-table">
                <thead>
                    <tr>
                        <th>Nome do Setor</th>
                        <th style={{width: '1%'}}>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {setores.map(setor => (
                        <tr key={setor.id}>
                            {editandoId === setor.id ? (
                                <>
                                    <td><input type="text" value={editandoNome} onChange={(e) => setEditandoNome(e.target.value)} /></td>
                                    <td className="actions-cell">
                                        <button className="btn-save" onClick={() => handleSalvar(setor.id)}>Salvar</button>
                                        <button className="btn-cancel" onClick={() => setEditandoId(null)}>Cancelar</button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td>{setor.nome}</td>
                                    <td className="actions-cell">
                                        <button className="btn-edit" onClick={() => { setEditandoId(setor.id); setEditandoNome(setor.nome); }}>Editar</button>
                                        <button className="btn-delete" onClick={() => handleDeletar(setor.id)}>Excluir</button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Componente para gerenciar Locais
function CardLocais({ locais, setores, carregarDados, setMensagem }) {
    const [novoLocal, setNovoLocal] = useState({ nome: '', setorId: '' });
    const [editandoId, setEditandoId] = useState(null);
    const [formEdicao, setFormEdicao] = useState({ nome: '', setorId: '' });

    const handleCriar = (e) => {
        e.preventDefault();
        if (!novoLocal.setorId) {
            setMensagem('Por favor, selecione um setor.', 'erro');
            return;
        }
        createLocal(novoLocal)
            .then(() => {
                // ✅ CORREÇÃO AQUI
                setMensagem('Local criado com sucesso!', 'sucesso');
                setNovoLocal({ nome: '', setorId: '' });
                carregarDados();
            })
            .catch(err => setMensagem(err.response?.data?.message || 'Erro ao criar local.', 'erro'));
    };

    const handleDeletar = (id) => {
        if (window.confirm('Deseja realmente excluir este local?')) {
            deleteLocal(id)
                .then(() => {
                    // ✅ CORREÇÃO AQUI
                    setMensagem('Local excluído com sucesso!', 'sucesso');
                    carregarDados();
                })
                .catch(err => setMensagem(err.response?.data?.message || 'Erro ao excluir local.', 'erro'));
        }
    };
    
    const handleSalvar = (id) => {
        updateLocal(id, formEdicao)
            .then(() => {
                // ✅ CORREÇÃO AQUI
                setMensagem('Local atualizado com sucesso!', 'sucesso');
                setEditandoId(null);
                carregarDados();
            })
            .catch(err => setMensagem(err.response?.data?.message || 'Erro ao atualizar local.', 'erro'));
    };

    return (
        <div className="card">
            <h2>Gerenciar Locais</h2>
            <form onSubmit={handleCriar} className="form-cadastro">
                <input 
                    type="text" 
                    value={novoLocal.nome}
                    onChange={(e) => setNovoLocal(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome do novo local"
                    required 
                />
                <select 
                    value={novoLocal.setorId}
                    onChange={(e) => setNovoLocal(prev => ({ ...prev, setorId: e.target.value }))}
                    required
                >
                    <option value="" disabled>Selecione um Setor</option>
                    {setores.map(setor => <option key={setor.id} value={setor.id}>{setor.nome}</option>)}
                </select>
                <button type="submit">Adicionar</button>
            </form>
            <table className="lista-table">
                <thead>
                    <tr>
                        <th>Nome do Local</th>
                        <th>Setor</th>
                        <th style={{width: '1%'}}>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {locais.map(local => (
                        <tr key={local.id}>
                            {editandoId === local.id ? (
                                <>
                                    <td><input type="text" value={formEdicao.nome} onChange={(e) => setFormEdicao(prev => ({ ...prev, nome: e.target.value }))} /></td>
                                    <td>
                                        <select value={formEdicao.setorId} onChange={(e) => setFormEdicao(prev => ({ ...prev, setorId: e.target.value }))}>
                                            {setores.map(setor => <option key={setor.id} value={setor.id}>{setor.nome}</option>)}
                                        </select>
                                    </td>
                                    <td className="actions-cell">
                                        <button className="btn-save" onClick={() => handleSalvar(local.id)}>Salvar</button>
                                        <button className="btn-cancel" onClick={() => setEditandoId(null)}>Cancelar</button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td>{local.nome}</td>
                                    <td>{local.setorNome}</td>
                                    <td className="actions-cell">
                                        <button className="btn-edit" onClick={() => { setEditandoId(local.id); setFormEdicao({ nome: local.nome, setorId: local.setorId }); }}>Editar</button>
                                        <button className="btn-delete" onClick={() => handleDeletar(local.id)}>Excluir</button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Componente principal da página
function GerenciarLocaisPage() {
    const [setores, setSetores] = useState([]);
    const [locais, setLocais] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

    const exibeMensagemTemporaria = useCallback((texto, tipo = 'sucesso') => {
        setMensagem({ tipo, texto });
        setTimeout(() => setMensagem({ tipo: '', texto: '' }), 4000);
    }, []);

    const carregarDados = useCallback(() => {
        // Agora carrega ambos em paralelo para otimizar
        Promise.all([getSetores(), getLocais()])
            .then(([resSetores, resLocais]) => {
                setSetores(resSetores.data);
                setLocais(resLocais.data);
            })
            .catch(() => exibeMensagemTemporaria('Erro ao carregar dados da página.', 'erro'))
            .finally(() => setLoading(false));
    }, [exibeMensagemTemporaria]);
    
    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    if (loading) return <p style={{textAlign: 'center', padding: '2rem'}}>Carregando...</p>;

    return (
        <div className="gerenciar-locais-container">
            {mensagem.texto && <div className={`mensagem-feedback ${mensagem.tipo}`}>{mensagem.texto}</div>}
            <CardSetores setores={setores} carregarDados={carregarDados} setMensagem={exibeMensagemTemporaria} />
            <CardLocais locais={locais} setores={setores} carregarDados={carregarDados} setMensagem={exibeMensagemTemporaria} />
        </div>
    );
}

export default GerenciarLocaisPage;