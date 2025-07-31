package com.bag.osmanager.repository;

import com.bag.osmanager.model.OrdemServico;
import com.bag.osmanager.model.enums.TipoManutencao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface OrdemServicoRepository extends JpaRepository<OrdemServico, Long>, JpaSpecificationExecutor<OrdemServico> {

    boolean existsByEquipamentoId(Long equipamentoId);

    // ✅ --- NOVOS MÉTODOS PARA BUSCAR OS ÚLTIMOS NÚMEROS ---

    /**
     * Encontra o maior valor na coluna 'numero_corretiva' para o tipo CORRETIVA.
     * @param tipoManutencao Tipo de manutenção (CORRETIVA)
     * @return um Optional contendo o maior número, ou vazio se não houver nenhum.
     */
    @Query("SELECT MAX(os.numeroCorretiva) FROM OrdemServico os WHERE os.tipoManutencao = :tipoManutencao")
    Optional<Long> findMaxNumeroCorretivaByTipoManutencao(TipoManutencao tipoManutencao);

    /**
     * Encontra o maior valor na coluna 'numero_preventiva' para o tipo PREVENTIVA.
     * @param tipoManutencao Tipo de manutenção (PREVENTIVA)
     * @return um Optional contendo o maior número, ou vazio se não houver nenhum.
     */
    @Query("SELECT MAX(os.numeroPreventiva) FROM OrdemServico os WHERE os.tipoManutencao = :tipoManutencao")
    Optional<Long> findMaxNumeroPreventivaByTipoManutencao(TipoManutencao tipoManutencao);

    // Métodos originais, se desejar manter:
    // @Query("SELECT MAX(os.numeroCorretiva) FROM OrdemServico os")
    // Optional<Long> findMaxNumeroCorretiva();

    // @Query("SELECT MAX(os.numeroPreventiva) FROM OrdemServico os")
    // Optional<Long> findMaxNumeroPreventiva();
}