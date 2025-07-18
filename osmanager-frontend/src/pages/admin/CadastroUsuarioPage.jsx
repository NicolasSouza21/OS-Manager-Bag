import React, { useState } from 'react';
import { cadastrarFuncionario } from '../../services/apiService';
import './CadastroUsuarioPage.css';

function CadastroUsuarioPage() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    // O valor inicial agora é 'SOLICITANTE', que é o cargo com menos permissões.
    const [tipoFuncionario, setTipoFuncionario] = useState('SOLICITANTE');
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // Adicionado para feedback no botão

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        if (senha.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            setIsSubmitting(false);
            return;
        }

        const novoFuncionario = {
            nome,
            email,
            senha,
            tipoFuncionario,
        };

        try {
            await cadastrarFuncionario(novoFuncionario);
            setSuccess(`Funcionário "${nome}" cadastrado com sucesso!`);
            // Limpa o formulário após o sucesso
            setNome('');
            setEmail('');
            setSenha('');
            setTipoFuncionario('SOLICITANTE');
        } catch (err) {
            console.error('Erro ao cadastrar funcionário:', err);
            setError(err.response?.data?.message || 'Erro ao cadastrar. O email já pode estar em uso.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="cadastro-usuario-page">
            <form className="cadastro-form" onSubmit={handleSubmit}>
                <h1>Cadastrar Novo Usuário</h1>
                <p>Crie contas para novos funcionários acessarem o sistema.</p>

                {error && <div className="form-message error-message">{error}</div>}
                {success && <div className="form-message success-message">{success}</div>}

                <div className="input-group">
                    <label htmlFor="nome">Nome Completo</label>
                    <input
                        id="nome"
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="senha">Senha</label>
                    <input
                        id="senha"
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                        placeholder="Mínimo de 6 caracteres"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="tipoFuncionario">Cargo (Permissão)</label>
                    {/* ✅ LISTA DE CARGOS ATUALIZADA */}
                    <select
                        id="tipoFuncionario"
                        value={tipoFuncionario}
                        onChange={(e) => setTipoFuncionario(e.target.value)}
                    >
                        {/* As opções agora refletem todos os cargos do backend */}
                        <option value="SOLICITANTE">Solicitante</option>
                        <option value="MECANICO">Mecânico</option>
                        <option value="ANALISTA_CQ">Analista de Qualidade</option>
                        <option value="LIDER">Líder</option>
                        <option value="ENCARREGADO">Encarregado</option>
                        <option value="ADMIN">Administrador</option>
                    </select>
                </div>
                <button type="submit" className="button-save" disabled={isSubmitting}>
                    {isSubmitting ? 'Cadastrando...' : 'Cadastrar Usuário'}
                </button>
            </form>
        </div>
    );
}

export default CadastroUsuarioPage;