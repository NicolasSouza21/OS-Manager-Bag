package com.bag.osmanager.repository;

import com.bag.osmanager.model.OrdemServico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface OrdemServicoRepository extends JpaRepository<OrdemServico, Long>, JpaSpecificationExecutor<OrdemServico> {

    boolean existsByEquipamentoId(Long equipamentoId);

    // ✨ ALTERAÇÃO AQUI: O método antigo foi removido e substituído por este.
    /**
     * Encontra o maior valor na coluna 'numero_sequencial' para determinar o próximo número único.
     * @return um Optional contendo o maior número sequencial, ou vazio se a tabela estiver vazia.
     */
    @Query("SELECT MAX(os.numeroSequencial) FROM OrdemServico os")
    Optional<Long> findMaxNumeroSequencial();

}