package com.bag.osmanager.repository;

import com.bag.osmanager.model.OrdemServico;
import org.springframework.data.domain.Sort; // ✨ ALTERAÇÃO AQUI
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List; // ✨ ALTERAÇÃO AQUI
import java.util.Optional;

public interface OrdemServicoRepository extends JpaRepository<OrdemServico, Long>, JpaSpecificationExecutor<OrdemServico> {

    boolean existsByEquipamentoId(Long equipamentoId);

    // ✨ ALTERAÇÃO AQUI: Novo método para buscar o histórico de um equipamento
    /**
     * Encontra todas as Ordens de Serviço para um determinado equipamento, com ordenação.
     * @param equipamentoId O ID do equipamento a ser buscado.
     * @param sort O critério de ordenação.
     * @return Uma lista de Ordens de Serviço.
     */
    List<OrdemServico> findByEquipamentoId(Long equipamentoId, Sort sort);

    /**
     * Encontra o maior valor na coluna 'numero_sequencial' para determinar o próximo número único.
     * @return um Optional contendo o maior número sequencial, ou vazio se a tabela estiver vazia.
     */
    @Query("SELECT MAX(os.numeroSequencial) FROM OrdemServico os")
    Optional<Long> findMaxNumeroSequencial();

}