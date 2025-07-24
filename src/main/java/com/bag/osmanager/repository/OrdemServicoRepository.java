package com.bag.osmanager.repository;

import com.bag.osmanager.model.OrdemServico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query; // 1. ✅ Importe a anotação @Query

import java.util.Optional; // 2. ✅ Importe o Optional

public interface OrdemServicoRepository extends JpaRepository<OrdemServico, Long>, JpaSpecificationExecutor<OrdemServico> {

    boolean existsByEquipamentoId(Long equipamentoId);

    // ✅ --- NOVOS MÉTODOS PARA BUSCAR OS ÚLTIMOS NÚMEROS ---

    /**
     * Encontra o maior valor na coluna 'numero_corretiva'.
     * @return um Optional contendo o maior número, ou vazio se não houver nenhum.
     */
    @Query("SELECT MAX(os.numeroCorretiva) FROM OrdemServico os")
    Optional<Long> findMaxNumeroCorretiva();

    /**
     * Encontra o maior valor na coluna 'numero_preventiva'.
     * @return um Optional contendo o maior número, ou vazio se não houver nenhum.
     */
    @Query("SELECT MAX(os.numeroPreventiva) FROM OrdemServico os")
    Optional<Long> findMaxNumeroPreventiva();

}